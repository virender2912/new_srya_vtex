import { NextResponse } from "next/server"

const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "iamtechiepartneruae"
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"
const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`

export async function GET() {
  try {
    const level = 3 // fetch 3 levels deep
    const res = await fetch(`${BASE_URL}/api/catalog_system/pub/category/tree/${level}`)
    const tree = await res.json()

    const mapCategories = (cats: any[], parentSlug = "", parentPath = "") => {
      return cats.map((cat) => {
        const slug = parentSlug ? `${parentSlug}/${slugify(cat.name)}` : slugify(cat.name)
        const idPath = parentPath ? `${parentPath}/${cat.id}` : `${cat.id}`

        return {
          id: cat.id.toString(),
          name: cat.name,
          slug,
          idPath,
          children: cat.children ? mapCategories(cat.children, slug, idPath) : []
        }
      })
    }

    const slugify = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const categories = mapCategories(tree)
    return NextResponse.json(categories)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
