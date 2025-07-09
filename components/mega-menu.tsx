// "use client"
// import Link from "next/link"
// import { useEffect, useState } from "react"

// interface Cat { id: string; name: string; slug: string; children?: Cat[] }

// export default function MegaMenu() {
//   const [cats, setCats] = useState<Cat[]>([])
//   useEffect(() => {
//     fetch("/api/categories")
//       .then(r => r.json())
//       .then(data => {
//         console.log("🔥 cats:", data)
//         if (Array.isArray(data)) setCats(data)
//       })
//       .catch(err => console.error(err))
//   }, [])

//   return (
//     <nav className="hidden md:flex space-x-6">
//       {cats.map(c => (
//         <div key={c.id} className="group relative">
//           <Link href={`/category/${c.slug}`} className="uppercase hover:text-primary">{c.name}</Link>
//           {c.children?.length ? (
//             <div className="absolute left-0 top-full hidden group-hover:block bg-white p-4 shadow min-w-[200px]">
//               <ul className="space-y-1">
//                 {c.children.map(s => (
//                   <li key={s.id}><Link href={`/category/${s.slug}`} className="hover:text-primary block">{s.name}</Link></li>
//                 ))}
//               </ul>
//             </div>
//           ) : null}
//         </div>
//       ))}
//     </nav>
//   )
// }
