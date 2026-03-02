const UNAUTHORIZED_PATH = "/unauthorized"
const PUBLIC_PATH_PREFIXES = [
  UNAUTHORIZED_PATH,
  "/assets/",
  "/favicon.ico",
  "/vite.svg",
]

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))

export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url)

  if (isPublicPath(url.pathname)) {
    return undefined
  }

  const configuredKey = process.env.MERAVIGLIA_ACCESS_KEY
  const providedKey = url.searchParams.get("key")

  if (configuredKey && providedKey === configuredKey) {
    return undefined
  }

  return Response.redirect(new URL(UNAUTHORIZED_PATH, request.url))
}
