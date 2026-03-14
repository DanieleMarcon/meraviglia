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
  lib: new Set(["infra"])
}

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
const deterministicForbiddenPatterns = [
  /\bDate\.now\s*\(/,
  /\bnew\s+Date\s*\(/,
  /\bMath\.random\s*\(/,
  /\bperformance\.now\s*\(/,
  /\bcrypto\.randomUUID\s*\(/
]

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
      const resolvedImport = resolveImport(filePath, specifier)
      if (!resolvedImport) continue

      const targetLayer = findLayer(resolvedImport)
      if (!targetLayer) {
        const targetSurface = path.relative(srcRoot, resolvedImport).split(path.sep)[0]
        const allowedSurfaceSources = surfaceAccessPolicy[targetSurface]
        if (allowedSurfaceSources && !allowedSurfaceSources.has(sourceLayer)) {
          violations.push({
            type: "surface",
            filePath,
            message: `forbidden import surface: ${sourceLayer} -> ${targetSurface}`,
            detail: `import '${specifier}'`
          })
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
        violations.push({
          type: "dependency",
          filePath,
          message: `forbidden dependency direction: ${sourceLayer} -> ${targetLayer}`,
          detail: `import '${specifier}'`
        })
      }
    }

    if (filePath.startsWith(deterministicFolder) && !isTestFile(filePath)) {
      for (const pattern of deterministicForbiddenPatterns) {
        if (pattern.test(sourceText)) {
          violations.push({
            type: "determinism",
            filePath,
            message: "forbidden nondeterministic API in engine source",
            detail: pattern.toString()
          })
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`✖ Governance check failed with ${violations.length} violation(s):`)
    for (const violation of violations) {
      const relativeFile = path.relative(projectRoot, violation.filePath)
      console.error(`  - ${relativeFile}: ${violation.message} (${violation.detail})`)
    }
    process.exit(1)
  }

  console.log("✔ Governance check passed: dependency directions and deterministic engine API guards are compliant.")
}

main()
