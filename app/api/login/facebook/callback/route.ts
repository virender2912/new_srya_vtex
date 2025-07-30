import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code returned from Facebook' }, { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`
  );

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
  }

  const userRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
  );

  const user = await userRes.json();

  // Here you can: create session, save user to DB, or integrate with VTEX Master Data

  return NextResponse.redirect(`http://localhost:3000/login-success?name=${user.name}`);
}
