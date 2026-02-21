import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars missing in middleware")
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { pathname } = request.nextUrl
  const publicRoutes = ["/", "/login", "/signup", "/pricing", "/auth/callback"]
  const isPublicRoute = publicRoutes.includes(pathname)

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const url = request.nextUrl.clone()
    if (pathname === "/dashboard") {
      url.pathname = "/app"
    } else if (pathname.startsWith("/dashboard/issues/")) {
      url.pathname = pathname.replace("/dashboard/issues", "/issues")
    } else {
      url.pathname = "/app"
    }
    return NextResponse.redirect(url)
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
      const url = request.nextUrl.clone()
      url.pathname = "/app"
      return NextResponse.redirect(url)
    }
  } catch (err) {
    console.error("Middleware auth error:", err)
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  return response
}
