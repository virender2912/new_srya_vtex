import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  // if (!email) {
  //   return NextResponse.json({ error: "Email is required" }, { status: 400 });
  // }

  const accountName = "iamtechiepartneruae";
  const environment = "vtexcommercestable.com.br";

  try {
    // Step 1: Start authentication
    const startUrl = `https://${accountName}.${environment}/api/vtexid/pub/authentication/start?callbackUrl=https://${accountName}.${environment}/api/vtexid/pub/authentication/finish&scope=${accountName}&user=&locale=en&accountName=${accountName}&returnUrl=/&appStart=true`;

    const startRes = await fetch(startUrl);
    const startText = await startRes.text();

    // VTEX sometimes returns HTML instead of JSON (e.g., error in HTML format)
    try {
      const startData = JSON.parse(startText);
      const authenticationToken = startData.authenticationToken;

      if (!authenticationToken) {
        return NextResponse.json(
          { error: "Failed to get authentication token" },
          { status: 500 }
        );
      }

      // Step 2: Send OTP
      const sendOtpUrl = `https://${accountName}.${environment}/api/vtexid/pub/authentication/accesskey/send`;
      const formData = new URLSearchParams();
      formData.append("authenticationToken", authenticationToken);
      formData.append("email", email);

      const sendOtpRes = await fetch(sendOtpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const sendOtpText = await sendOtpRes.text();

      // Try to parse response as JSON, fallback to raw text
      let sendOtpData;
      try {
        sendOtpData = JSON.parse(sendOtpText);
      } catch {
        sendOtpData = { rawResponse: sendOtpText };
      }

      return NextResponse.json({
        step: "OTP sent",
        authenticationToken,
        sendOtpResponse: sendOtpData,
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: "Failed to parse start response",
          raw: startText,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
