"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Heart, LogOut, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import Link from "next/link";

export default function AccountPage() {
  const { state: authState, logout } = useAuth();
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [orders, setOrders] = useState<any[]>([]); // store fetched orders
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const getUserFromCookies = () => {
      if (typeof document === "undefined") return null;
      const cookieObj = Object.fromEntries(
        document.cookie.split("; ").map((c) => {
          const [key, ...v] = c.split("=");
          return [key, decodeURIComponent(v.join("="))];
        })
      );
      const fullName = cookieObj.customerName || "";
      const email = cookieObj.customerEmail || "";
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ");

      if (email && fullName) {
        return {
          firstName,
          lastName,
          email,
          phone: "", // You can pull this from VTEX API if needed
        };
      }

      return null;
    };

    if (!authState.isLoading && !authState.isAuthenticated) {
      const cookieUser = getUserFromCookies();
      if (cookieUser) {
        setFormData(cookieUser);
        localStorage.setItem("vtexUser", JSON.stringify(cookieUser));
      } else {
        const storedUser = localStorage.getItem("vtexUser");
        if (storedUser) {
          setFormData(JSON.parse(storedUser));
        } else {
          router.push("/login");
        }
      }
    } else if (authState.user) {
      setFormData({
        firstName: authState.user.firstName,
        lastName: authState.user.lastName,
        email: authState.user.email,
        phone: authState.user.phone || "",
      });
    }
  }, [authState, router]);

  // code for order history by email
  const users = authState.user?.email;
  console.log(users);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        if (!users) return; // ensure users is defined

        const res = await fetch(
          `/api/getorders?email=${encodeURIComponent(users)}`
        );
        console.log("res", res);

        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        console.log("VTEX orders:", data.list);
        setOrders(data.list); // `data.list` usually contains the orders array
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update user data
    console.log("Saving user data:", formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
    );
  }
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("vtexUser") : null;
  const user = authState.user || (storedUser ? JSON.parse(storedUser) : null);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName} {user.lastName} 
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
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
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
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
                  <p className="text-2xl font-bold">
                    {wishlistState.totalItems}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wishlist Items
                  </p>
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
                  <p className="text-sm text-muted-foreground">Cart Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="phone">Phone</Label>
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
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View your past orders and track current ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                  <ul className="space-y-4">
                    {orders.map((d) => (
                      <li key={d.orderId} className="border p-4 rounded">
                        <p>
                          <strong>Order ID:</strong> {d.orderId}{" "}
                        </p>
                        <p>
                          <strong>Status:</strong> {d.status}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {new Date(d.creationDate).toLocaleString()}
                        </p>
                        <p>
                          <strong>Total:</strong> {d.totalValue}{" "}
                          {d.currencyCode}
                        </p>
                        <Link
                          href={`/orders/${d.orderId}`}
                          target="blank"
                          className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          View Order
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      When you place your first order, it will appear here.
                    </p>
                    <Button asChild>
                      <a href="/products">Start Shopping</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Save items you love to your wishlist for easy access later.
                  </p>
                  <Button asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Email Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Order updates</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Promotional emails</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Newsletter</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Privacy</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">
                        Allow data collection for personalization
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Share data with partners</span>
                    </label>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 text-destructive">
                    Danger Zone
                  </h4>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
