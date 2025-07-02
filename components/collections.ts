import type { NextApiRequest, NextApiResponse } from "next"

const BASE_URL = "https://iamtechiepartneruae.vtexcommercestable.com.br"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${BASE_URL}/api/catalog_system/pvt/collection/search`, {
      headers: {
        "Content-Type": "application/json",
        "X-VTEX-API-AppKey": process.env.VTEX_APP_KEY || '',
        "X-VTEX-API-AppToken": process.env.VTEX_APP_TOKEN || '',
      },
    })

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch VTEX collections" })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) { 
    return res.status(500).json({ error: "Unexpected error" })
  }
}
