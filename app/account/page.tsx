"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Heart, LogOut, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Layout } from "@/components/layout"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useTranslation } from "@/hooks/use-translation"
export default function AccountPage() {
    const { t } = useTranslation()
  const { state: authState, logout } = useAuth()
  const { state: cartState } = useCart()
  const { state: wishlistState } = useWishlist()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

useEffect(() => {
  const getUserFromCookies = () => {
    if (typeof document === "undefined") return null
    const cookieObj = Object.fromEntries(
      document.cookie.split("; ").map(c => {
        const [key, ...v] = c.split("=")
        return [key, decodeURIComponent(v.join("="))]
      })
    )
    const fullName = cookieObj.customerName || ""
    const email = cookieObj.customerEmail || ""
    const [firstName, ...rest] = fullName.split(" ")
    const lastName = rest.join(" ")

    if (email && fullName) {
      return {
        firstName,
        lastName,
        email,
        phone: "", // You can pull this from VTEX API if needed
      }
    }

    return null
  }

  if (!authState.isLoading && !authState.isAuthenticated) {
    const cookieUser = getUserFromCookies()
    if (cookieUser) {
      setFormData(cookieUser)
      localStorage.setItem("vtexUser", JSON.stringify(cookieUser))
    } else {
      const storedUser = localStorage.getItem("vtexUser")
      if (storedUser) {
        setFormData(JSON.parse(storedUser))
      } else {
        router.push("/login")
      }
    }
  } else if (authState.user) {
    setFormData({
      firstName: authState.user.firstName,
      lastName: authState.user.lastName,
      email: authState.user.email,
      phone: authState.user.phone || "",
    })
  }
}, [authState, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Here you would typically make an API call to update user data
    console.log("Saving user data:", formData)
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (authState.isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }
const storedUser =
  typeof window !== "undefined" ? localStorage.getItem("vtexUser") : null
const user =
  authState.user ||
  (storedUser ? JSON.parse(storedUser) : null)

if (!user) {
  return null
}

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
      <p className="text-muted-foreground">
  {t('Welcome Back')}, {user.firstName} {user.lastName}
</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('Logout')}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">{t('Orders')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wishlistState.totalItems}</p>
                  <p className="text-sm text-muted-foreground">{t('Wishlist Items')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cartState.totalItems}</p>
                  <p className="text-sm text-muted-foreground">{t('Cart Items')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{t('Profile')}</TabsTrigger>
            <TabsTrigger value="orders">{t('Orders')}</TabsTrigger>
            <TabsTrigger value="wishlist">{t('Wishlist')}</TabsTrigger>
            <TabsTrigger value="settings">{t('Settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('Profile Information')}</CardTitle>
                    <CardDescription>{t('Manage your personal information')}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('First Name')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('Last Name')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('Email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('Phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave}>{t('Save Changes')}</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      {t('Cancel')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{t('Order History')}</CardTitle>
                <CardDescription>{t('View your past orders and track current ones')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('No orders yet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('When you place your first order, it will appear here.')}</p>
                  <Button asChild>
                    <a href="/products">{t('Start Shopping')}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>{t('Wishlist')}</CardTitle>
                <CardDescription>{t("Items you've saved for later")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('Your wishlist is empty')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('Save items you love to your wishlist for easy access later.')}
                  </p>
                  <Button asChild>
                    <a href="/products">{t('Browse Products')}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{t('Account Settings')}</CardTitle>
                <CardDescription>{t('Manage your account preferences')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">{t('Email Notifications')}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">{t('Order updates')}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">{t('Promotional emails')}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">{t('Newsletter')}</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Privacy</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">{t('Allow data collection for personalization')}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">{t('Share data with partners')}</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 text-destructive">{t('Danger Zone')}</h4>
                  <Button variant="destructive" size="sm">
                    {t('Delete Account')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
