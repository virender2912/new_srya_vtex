import { NextResponse } from 'next/server';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI!;

export async function GET() {
  const state = 'secureRandomToken'; // Optional: CSRF protection

  const facebookAuthUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=${state}&scope=email,public_profile`;

  return NextResponse.redirect(facebookAuthUrl);
}
