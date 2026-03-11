import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type UserRole = "admin" | "comprador" | "gestora" | "requisitante";

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/admin",
  comprador: "/comprador",
  gestora: "/gestora",
  requisitante: "/requisitante",
};

const PROTECTED_PREFIXES: UserRole[] = ["admin", "comprador", "gestora", "requisitante"];

function getRoleRoute(role?: string | null): string {
  if (role && role in ROLE_ROUTES) {
    return ROLE_ROUTES[role as UserRole];
  }
  return ROLE_ROUTES.requisitante;
}

function getRoleFromPath(pathname: string): UserRole | null {
  for (const role of PROTECTED_PREFIXES) {
    if (pathname.startsWith(`/${role}`)) {
      return role;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const requestedRole = getRoleFromPath(pathname);
  const isPrivateRoute = Boolean(requestedRole);

  if (!user && isPrivateRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const shouldResolveProfile = pathname === "/" || pathname === "/login" || isPrivateRoute;

    if (shouldResolveProfile) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("perfil")
        .eq("id", user.id)
        .single();

      const userRole = (profileData?.perfil as UserRole | undefined) ?? "requisitante";
      const roleHome = getRoleRoute(userRole);

      if (pathname === "/" || pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = roleHome;
        return NextResponse.redirect(url);
      }

      if (requestedRole && requestedRole !== userRole) {
        const url = request.nextUrl.clone();
        url.pathname = roleHome;
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
