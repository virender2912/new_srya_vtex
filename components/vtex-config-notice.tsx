import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function VtexConfigNotice() {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>VTEX Configuration Required</AlertTitle>
      <AlertDescription>
        To connect to your VTEX store, please configure the following environment variables:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <code>NEXT_PUBLIC_VTEX_ACCOUNT</code> - Your VTEX account name
          </li>
          <li>
            <code>NEXT_PUBLIC_VTEX_ENVIRONMENT</code> - Your VTEX environment (usually "vtexcommercestable")
          </li>
          <li>
            <code>VTEX_APP_KEY</code> - Your VTEX app key (optional for public APIs)
          </li>
          <li>
            <code>VTEX_APP_TOKEN</code> - Your VTEX app token (optional for public APIs)
          </li>
        </ul>
        <p className="mt-2">Currently showing sample data for demonstration purposes.</p>
      </AlertDescription>
    </Alert>
  )
}
