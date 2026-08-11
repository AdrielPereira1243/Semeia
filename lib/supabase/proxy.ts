import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { getSupabaseEnv, isSupabaseConfigured } from "./env";

function isPublicPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/auth/");
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next({ request });

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("erro", "configuracao");
    return NextResponse.redirect(url);
  }

  if (
    request.nextUrl.pathname === "/" &&
    (request.nextUrl.searchParams.has("code") || request.nextUrl.searchParams.has("token_hash"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const publicPath = isPublicPath(request.nextUrl.pathname);

  if (!isAuthenticated && !publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
