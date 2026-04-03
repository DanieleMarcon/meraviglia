#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const projectRoot = process.cwd()
const srcRoot = path.join(projectRoot, "src")

const governedLayers = new Set([
  "ui",
  "application",
  "domain",
  "repository",
  "infra",
  "engine",
  "state",
  "auth",
  "assets"
])

// Frozen dependency matrix from Architecture Freeze v1.
// Keep this map strict and explicit so governance drift is visible in code review.
const allowedDependencies = {
  ui: new Set(["application"]),
  application: new Set(["domain", "repository", "engine"]),
  domain: new Set([]),
  repository: new Set([]),
  infra: new Set(["repository"]),
  engine: new Set(["domain"]),
  state: new Set(["ui", "application"]),
  auth: new Set(["application", "repository"]),
  assets: new Set(["ui"])
}

const surfaceAccessPolicy = {
  lib: new Set(["infra"]),
  shared: new Set(["ui", "application", "infra", "engine"])
}

// Narrowly-governed exception: composition root is the only application seam
// allowed to wire runtime infra adapters. This must not expand to service logic.
const dependencyExceptions = [
  {
    from: "application",
    to: "infra",
    filePattern: /src\/application\/composition\//,
    reason: "composition-root wiring exception"
  }
]

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const deterministicFolder = path.join(srcRoot, "engine")
const uiFolder = path.join(srcRoot, "ui")
const supabaseClientPath = path.join(srcRoot, "lib", "supabaseClient.ts")
// Engine determinism guardrails ban known nondeterministic runtime APIs.
// These patterns are intentionally frozen to catch regressions early.
const deterministicForbiddenPatterns = [
  /\bDate\.now\s*\(/,
  /\bnew\s+Date\s*\(/,
  /\bMath\.random\s*\(/,
  /\bperformance\.now\s*\(/,
  /\bcrypto\.randomUUID\s*\(/
]

const sensitiveLogPattern = /\bconsole\.(?:log|info|warn|error|debug)\s*\([^\n)]*(?:token|secret|password|authorization|api[_-]?key|bearer|jwt|session[^a-z])/i
const unsafeUiErrorRenderPattern = /\{\s*[^}\n]*\b(?:error|err)\.(?:message|stack)\b[^}\n]*\}/
const imgTagMissingAltPattern = /<img\b(?![^>]*\balt=)[^>]*>/i
const autoFocusPattern = /<[^>]+\bautoFocus\b[^>]*>/

function walk(dir, output = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(absolutePath, output)
      continue
    }

    if (!sourceExtensions.has(path.extname(entry.name))) continue
    output.push(absolutePath)
  }

  return output
}

function findLayer(absolutePath) {
  const relativePath = path.relative(srcRoot, absolutePath)
  if (relativePath.startsWith("..")) return null
  const [firstSegment] = relativePath.split(path.sep)
  return governedLayers.has(firstSegment) ? firstSegment : null
}

function resolveImport(filePath, specifier) {
  if (!specifier.startsWith(".")) return null

  const directory = path.dirname(filePath)
  const basePath = path.resolve(directory, specifier)
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.mjs`,
    `${basePath}.cjs`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js"),
    path.join(basePath, "index.jsx")
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate
    }
  }

  return null
}

// Regex import parsing is a fast governance heuristic, not a full parser.
// It is intentionally conservative and backed by review when syntax evolves.
function parseImports(sourceText) {
  const imports = []
  const importRegex = /(?:^|\n)\s*import\s+(?:type\s+)?(?:[^"'\n]+?\s+from\s+)?["']([^"']+)["']/g
  const exportRegex = /(?:^|\n)\s*export\s+[^"'\n]*?from\s+["']([^"']+)["']/g

  for (const regex of [importRegex, exportRegex]) {
    let match
    while ((match = regex.exec(sourceText)) !== null) {
      imports.push(match[1])
    }
  }

  return imports
}

function isTestFile(filePath) {
  return /(?:^|\/)__tests__\//.test(filePath) || /\.test\.[cm]?[jt]sx?$/.test(filePath)
}

function addViolation(violations, filePath, type, message, detail) {
  violations.push({ type, filePath, message, detail })
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    console.error("✖ src folder not found. Run this script from the project root.")
    process.exit(1)
  }

  const files = walk(srcRoot)
  const violations = []

  for (const filePath of files) {
    const sourceLayer = findLayer(filePath)
    if (!sourceLayer) continue

    const sourceText = fs.readFileSync(filePath, "utf8")
    const imports = parseImports(sourceText)

    for (const specifier of imports) {
      if (specifier === "@supabase/supabase-js" && filePath !== supabaseClientPath) {
        addViolation(
          violations,
          filePath,
          "security",
          "forbidden direct @supabase/supabase-js usage outside lib/supabaseClient",
          `import '${specifier}'`
        )
      }

      const resolvedImport = resolveImport(filePath, specifier)
      if (!resolvedImport) continue

      if (resolvedImport === supabaseClientPath && sourceLayer !== "infra") {
        addViolation(
          violations,
          filePath,
          "security",
          "forbidden direct supabase client dependency outside infra",
          `import '${specifier}'`
        )
      }

      const targetLayer = findLayer(resolvedImport)
      if (!targetLayer) {
        const targetSurface = path.relative(srcRoot, resolvedImport).split(path.sep)[0]
        const allowedSurfaceSources = surfaceAccessPolicy[targetSurface]
        if (allowedSurfaceSources && !allowedSurfaceSources.has(sourceLayer)) {
          addViolation(
            violations,
            filePath,
            "surface",
            `forbidden import surface: ${sourceLayer} -> ${targetSurface}`,
            `import '${specifier}'`
          )
        }
        continue
      }

      if (targetLayer === sourceLayer) continue

      const isAllowed = allowedDependencies[sourceLayer]?.has(targetLayer) ?? false
      const hasException = dependencyExceptions.some(
        (exception) =>
          exception.from === sourceLayer
          && exception.to === targetLayer
          && exception.filePattern.test(filePath)
      )

      if (!isAllowed && !hasException) {
        addViolation(
          violations,
          filePath,
          "dependency",
          `forbidden dependency direction: ${sourceLayer} -> ${targetLayer}`,
          `import '${specifier}'`
        )
      }
    }

    if (sensitiveLogPattern.test(sourceText) && !isTestFile(filePath)) {
      addViolation(
        violations,
        filePath,
        "security",
        "forbidden sensitive console logging pattern",
        sensitiveLogPattern.toString()
      )
    }

    if (filePath.startsWith(uiFolder) && (path.extname(filePath) === ".tsx" || path.extname(filePath) === ".jsx")) {
      if (unsafeUiErrorRenderPattern.test(sourceText)) {
        addViolation(
          violations,
          filePath,
          "security",
          "forbidden raw error.message/error.stack render in UI",
          unsafeUiErrorRenderPattern.toString()
        )
      }

      if (imgTagMissingAltPattern.test(sourceText)) {
        addViolation(
          violations,
          filePath,
          "accessibility",
          "img elements must include an alt attribute",
          imgTagMissingAltPattern.toString()
        )
      }

      if (autoFocusPattern.test(sourceText)) {
        addViolation(
          violations,
          filePath,
          "accessibility",
          "autoFocus is forbidden to preserve predictable keyboard focus",
          autoFocusPattern.toString()
        )
      }
    }

    // Deterministic API bans apply to engine production source only; tests remain
    // free to use runtime clocks/randomness for harness behavior when needed.
    if (filePath.startsWith(deterministicFolder) && !isTestFile(filePath)) {
      for (const pattern of deterministicForbiddenPatterns) {
        if (pattern.test(sourceText)) {
          addViolation(
            violations,
            filePath,
            "determinism",
            "forbidden nondeterministic API in engine source",
            pattern.toString()
          )
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`✖ Governance check failed with ${violations.length} violation(s):`)
    for (const violation of violations) {
      const relativeFile = path.relative(projectRoot, violation.filePath)
      console.error(`  - ${relativeFile}: [${violation.type}] ${violation.message} (${violation.detail})`)
    }
    process.exit(1)
  }

  console.log("✔ Governance check passed: layer dependencies, deterministic engine APIs, and lightweight security/privacy/accessibility guardrails are compliant.")
}

main()
