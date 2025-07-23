// app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    NEXT_PUBLIC_VTEX_ACCOUNT,
    VTEX_API_APP_KEY,
    VTEX_API_APP_TOKEN,
  } = process.env;

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl.origin));

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_REDIRECT_URI ||
    !NEXT_PUBLIC_VTEX_ACCOUNT ||
    !VTEX_API_APP_KEY ||
    !VTEX_API_APP_TOKEN
  ) {
    return redirectTo("/login?error=missing_env");
  }

  if (!code) {
    return redirectTo("/login?error=missing_code");
  }

  try {
    // 🔄 Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return redirectTo("/login?error=token_error");
    }

    // 📥 Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();
    const { email, name } = userData;

    if (!email || !name) {
      return redirectTo("/login?error=invalid_user_data");
    }

    const vtexUserSearchUrl = `https://${NEXT_PUBLIC_VTEX_ACCOUNT}.vtexcommercestable.com.br/api/dataentities/CL/search?email=${encodeURIComponent(email)}&_fields=id,email,firstName,lastName`;

    const existingRes = await fetch(vtexUserSearchUrl, {
      headers: {
        "X-VTEX-API-AppKey": VTEX_API_APP_KEY,
        "X-VTEX-API-AppToken": VTEX_API_APP_TOKEN,
      },
    });

    const existingUsers = await existingRes.json();

    if (existingUsers.length === 0) {
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ") || "User";

      await fetch(`https://${NEXT_PUBLIC_VTEX_ACCOUNT}.vtexcommercestable.com.br/api/dataentities/CL/documents`, {
        method: "POST",
        headers: {
          "X-VTEX-API-AppKey": VTEX_API_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_API_APP_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          isNewsletterOptIn: false,
        }),
      });
    }

    // ✅ Save user info in cookie
    const response = redirectTo("/account");
    response.cookies.set("customerEmail", email, {
      path: "/",
      httpOnly: false, // Set to true in production for security
    });
    response.cookies.set("customerName", name, {
      path: "/",
      httpOnly: false,
    });

    return response;

  } catch (err) {
    console.error("OAuth Callback Error:", err);
    return redirectTo("/login?error=server_error");
  }
}
