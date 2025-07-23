import { NextRequest, NextResponse } from 'next/server'

const accountName = process.env.VTEX_ACCOUNT || 'iamtechiepartneruae'
const environment = process.env.VTEX_ENV || 'vtexcommercestable.com.br'
const appKey = 'vtexappkey-iamtechiepartneruae-WJLMGP'
const appToken = 'YLIDXHBJGBSLWCHRBJPMBTWLSYPNISXCCCYXOIMOYUCCMOCOYHQQLOBFYTBPIKBYLRUBFYMKLHFKNCRMBJKZWDTLYJLKKXQUBIEGCBGCJMWQHXNKKBOREKKRGHCUDPJL'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, token, code } = body

    console.log("body email", email)
    console.log("body auth", token)
    console.log("body otp", code)

    if (!token || !email || !code) {
      return NextResponse.json(
        { error: 'Token, email, and OTP are required' },
        { status: 400 }
      )
    }

    // Step 1: Validate OTP
    const validateUrl = `https://${accountName}.${environment}/api/vtexid/pub/authentication/accesskey/validate`
    const formData = new URLSearchParams()
    formData.append('authenticationToken', token)
    formData.append('login', email)
    formData.append('accesskey', code)

    const validateRes = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const validateData = await validateRes.json()

    if (validateData?.authStatus !== 'Success') {
      return NextResponse.json(
        {
          error: 'OTP validation failed',
          details: validateData,
        },
        { status: 401 }
      )
    }

    // Step 2: Get Customer Data from Master Data (CL)
    const customerUrl = `https://api.vtex.com/${accountName}/dataentities/CL/search?email=${encodeURIComponent(email)}&_fields=id,email,firstName,lastName,document,documentType,homePhone,isCorporate,corporateDocument,tradeName,stateRegistration,isNewsletterOptIn,localeDefault,approved`

    const customerRes = await fetch(customerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
        'Accept':'application/vnd.vtex.ds.v10+json'
      },
    })

    const customerData = await customerRes.json()
console.log("customerData",customerData);

    if (!Array.isArray(customerData) || customerData.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found in Master Data' },
        { status: 404 }
      )
    }

    // Success: return customer data
    return NextResponse.json({
      step: 'OTP validated & customer fetched',
      customer: customerData[0], // return first matched customer
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
