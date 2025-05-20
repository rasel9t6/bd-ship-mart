"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import {
  Loader,
  Search,
  User,
  Package,
  MapPin,
  Upload,
  CreditCard,
  MessageSquare,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { OrderType, UserType } from "@/types/next-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { ScrollArea } from "@/ui/scroll-area";
import Image from "next/image";
import { useMediaStore } from "@/hooks/useMediaStore";
import { Progress } from "@/ui/progress";
import { getUserData } from "@/lib/actions/actions";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { motion } from "motion/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState<UserType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { uploadMedia } = useMediaStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Fetch user data
  const fetchUser = async () => {
    try {
      const data = await getUserData();
      setUser(data);
      setOrders(data.orders || []);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zipCode: data.address?.zipCode || "",
          country: data.address?.country || "",
        },
      });
      setLoading(false);
    } catch (error) {
      console.error("[FETCH_USER_ERROR]", error);
      toast.error("Failed to load user data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUser();
    }
  }, [session]);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      setUploading(true);
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 500);

        const uploadedUrls = await uploadMedia([file], "profile-pictures");
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadedUrls && uploadedUrls.length > 0) {
          // Update the preview with the uploaded image URL
          setPreviewUrl(uploadedUrls[0]);

          // Automatically update profile with new image
          const res = await fetch("/api/users/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              profilePicture: uploadedUrls[0],
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to update profile");
          }

          const updatedUser = await res.json();
          setUser(updatedUser);
          toast.success("Profile picture updated successfully");
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        toast.error("Failed to upload image. Please try again.");
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: previewUrl || user?.profilePicture,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setPreviewUrl(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("[UPDATE_PROFILE_ERROR]", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader className="h-8 w-8 animate-spin text-bondi-blue" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6  rounded-lg shadow-sm mt-14"
    >
      <h1 className="mb-8 text-3xl font-bold text-bondi-blue-700">
        My Profile
      </h1>

      <Tabs defaultValue="personal" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-[400px] h-full grid-cols-2 bg-bondi-blue-50/30 p-2 rounded-lg shadow-sm gap-2">
            <TabsTrigger
              value="personal"
              className="flex items-center justify-center gap-2 data-[state=active]:!bg-bondi-blue data-[state=active]:!text-white hover:!bg-bondi-blue-50/50 transition-all duration-200 rounded-md py-2.5 border data-[state=active]:!border-bondi-blue-50 data-[state=active]:!shadow-md !border-bondi-blue !text-bondi-blue-700"
            >
              <User className="size-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center justify-center gap-2 data-[state=active]:!bg-bondi-blue data-[state=active]:!text-white hover:!bg-bondi-blue-50/50 transition-all duration-200 rounded-md py-2.5 border data-[state=active]:!border-bondi-blue-50 data-[state=active]:!shadow-md !border-bondi-blue !text-bondi-blue-700 "
            >
              <Package className="size-4" />
              Orders
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-bondi-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-bondi-blue-700">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <Label className="text-bondi-blue-700">
                      Profile Picture
                    </Label>
                    <div className="flex items-center gap-6">
                      <div className="relative size-24 overflow-hidden rounded-full border-2 border-dashed border-bondi-blue-200 hover:border-bondi-blue transition-colors duration-200">
                        {previewUrl || user?.profilePicture ? (
                          <Image
                            src={previewUrl || user?.profilePicture || ""}
                            alt="Profile"
                            className="size-full object-cover"
                            width={96}
                            height={96}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-bondi-blue-50">
                            <User className="h-8 w-8 text-bondi-blue-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={uploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("profile-picture")?.click()
                          }
                          className="flex items-center gap-2 hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200"
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4" />
                          {uploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                        <p className="text-xs text-bondi-blue-600">
                          Max file size: 10MB
                        </p>
                        {uploading && (
                          <div className="w-full space-y-2">
                            <Progress
                              value={uploadProgress}
                              className="h-2 bg-bondi-blue-100"
                            />
                            <p className="text-xs text-bondi-blue-600">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-bondi-blue-700">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-bondi-blue-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-bondi-blue-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-bondi-blue-700">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-bondi-blue-700">
                        User ID
                      </Label>
                      <Input
                        id="userId"
                        value={user?.userId}
                        disabled
                        className="bg-bondi-blue-50/50"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <div className="flex items-center  gap-2">
                      <MapPin className="size-5 text-bondi-blue-600" />
                      <h3 className="text-lg font-medium text-bondi-blue-700 leading-none my-0">
                        Address
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="street" className="text-bondi-blue-700">
                          Street
                        </Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                street: e.target.value,
                              },
                            })
                          }
                          className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-bondi-blue-700">
                          City
                        </Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                city: e.target.value,
                              },
                            })
                          }
                          className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-bondi-blue-700">
                          State
                        </Label>
                        <Input
                          id="state"
                          value={formData.address.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                state: e.target.value,
                              },
                            })
                          }
                          className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="zipCode"
                          className="text-bondi-blue-700"
                        >
                          Postal Code
                        </Label>
                        <Input
                          id="zipCode"
                          value={formData.address.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                zipCode: e.target.value,
                              },
                            })
                          }
                          className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="text-bondi-blue-700"
                        >
                          Country
                        </Label>
                        <Input
                          id="country"
                          value={formData.address.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                country: e.target.value,
                              },
                            })
                          }
                          className="focus:border-bondi-blue focus:ring-bondi-blue/20"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full md:w-auto bg-bondi-blue hover:bg-bondi-blue-600 transition-colors duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="orders">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-bondi-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-bondi-blue-700">
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  {/* Search Orders */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bondi-blue-400" />
                    <Input
                      type="text"
                      placeholder="Search orders by ID or status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 focus:border-bondi-blue focus:ring-bondi-blue/20"
                    />
                  </div>

                  {/* Status Filters */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-bondi-blue-700">
                        Order Status
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="focus:border-bondi-blue focus:ring-bondi-blue/20">
                          <SelectValue placeholder="Filter by order status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="in-transit">In Transit</SelectItem>
                          <SelectItem value="out-for-delivery">
                            Out for Delivery
                          </SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-bondi-blue-700">
                        Payment Status
                      </Label>
                      <Select
                        value={paymentStatusFilter}
                        onValueChange={setPaymentStatusFilter}
                      >
                        <SelectTrigger className="focus:border-bondi-blue focus:ring-bondi-blue/20">
                          <SelectValue placeholder="Filter by payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="partially_refunded">
                            Partially Refunded
                          </SelectItem>
                          <SelectItem value="partially_paid">
                            Partially Paid
                          </SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {orders && orders.length > 0 ? (
                      (() => {
                        const filteredOrders = orders.filter(
                          (order: OrderType) => {
                            const matchesSearch =
                              (order?.orderId?.toLowerCase() || "").includes(
                                searchQuery.toLowerCase(),
                              ) ||
                              (order?.status?.toLowerCase() || "").includes(
                                searchQuery.toLowerCase(),
                              );

                            const matchesStatus =
                              statusFilter === "all" ||
                              order?.status?.toLowerCase() ===
                                statusFilter.toLowerCase();

                            const matchesPaymentStatus =
                              paymentStatusFilter === "all" ||
                              order?.paymentDetails?.status?.toLowerCase() ===
                                paymentStatusFilter.toLowerCase();

                            return (
                              matchesSearch &&
                              matchesStatus &&
                              matchesPaymentStatus
                            );
                          },
                        );

                        if (filteredOrders.length === 0) {
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col items-center justify-center p-8 text-center"
                            >
                              <Package className="mb-4 h-12 w-12 text-bondi-blue-300" />
                              <h3 className="mb-2 text-lg font-medium text-bondi-blue-700">
                                No Orders Found
                              </h3>
                              <p className="text-sm text-bondi-blue-600">
                                {searchQuery ||
                                statusFilter !== "all" ||
                                paymentStatusFilter !== "all"
                                  ? "Try adjusting your filters or search query"
                                  : "You haven&apos;t placed any orders yet"}
                              </p>
                              {(searchQuery ||
                                statusFilter !== "all" ||
                                paymentStatusFilter !== "all") && (
                                <Button
                                  variant="outline"
                                  className="mt-4 hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200"
                                  onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setPaymentStatusFilter("all");
                                  }}
                                >
                                  Clear Filters
                                </Button>
                              )}
                            </motion.div>
                          );
                        }

                        return filteredOrders.map((order: OrderType) => (
                          <motion.div
                            key={order?.orderId || Math.random()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="border-bondi-blue-100 hover:shadow-md transition-shadow duration-200">
                              <CardContent className="p-4 space-y-4">
                                {/* Order Header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      Order #{order?.orderId || "N/A"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order?.createdAt
                                        ? format(
                                            new Date(order.createdAt),
                                            "PPP",
                                          )
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={
                                      order?.status === "delivered"
                                        ? "success"
                                        : order?.status === "pending"
                                          ? "warning"
                                          : "default"
                                    }
                                  >
                                    {order?.status || "N/A"}
                                  </Badge>
                                </div>

                                {/* Order Details */}
                                <div className="grid gap-4 md:grid-cols-2">
                                  {/* Payment Details */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <CreditCard className="h-4 w-4" />
                                      Payment Details
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <p>
                                        Method: {order?.paymentMethod || "N/A"}
                                      </p>
                                      <p>
                                        Status:{" "}
                                        {order?.paymentDetails?.status || "N/A"}
                                      </p>
                                      <p>
                                        Currency:{" "}
                                        {order?.paymentCurrency || "N/A"}
                                      </p>
                                      <p className="font-medium">
                                        Total: {order?.totalAmount?.bdt || 0}{" "}
                                        BDT
                                      </p>
                                    </div>
                                  </div>

                                  {/* Shipping Details */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <Truck className="h-4 w-4" />
                                      Shipping Details
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <p>
                                        Method: {order?.shippingMethod || "N/A"}
                                      </p>
                                      <p>
                                        Type: {order?.deliveryType || "N/A"}
                                      </p>
                                      {order?.estimatedDeliveryDate && (
                                        <p>
                                          Est. Delivery:{" "}
                                          {format(
                                            new Date(
                                              order.estimatedDeliveryDate,
                                            ),
                                            "PPP",
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Tracking History */}
                                {order?.trackingHistory &&
                                  order.trackingHistory.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <Package className="h-4 w-4" />
                                        Tracking History
                                      </div>
                                      <div className="space-y-2">
                                        {order.trackingHistory.map(
                                          (track, index) => (
                                            <div
                                              key={index}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                              <div>
                                                <p className="font-medium">
                                                  {track.status}
                                                </p>
                                                <p className="text-muted-foreground">
                                                  {format(
                                                    new Date(track.timestamp),
                                                    "PPP p",
                                                  )}
                                                </p>
                                                {track.location && (
                                                  <p className="text-muted-foreground">
                                                    Location: {track.location}
                                                  </p>
                                                )}
                                                {track.notes && (
                                                  <p className="text-muted-foreground">
                                                    {track.notes}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Notes */}
                                {order?.notes && order.notes.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <MessageSquare className="h-4 w-4" />
                                      Notes
                                    </div>
                                    <div className="space-y-2">
                                      {order.notes.map((note, index) => (
                                        <div
                                          key={index}
                                          className="rounded-lg bg-muted p-3 text-sm"
                                        >
                                          <p>{note.text}</p>
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            {note.createdBy} -{" "}
                                            {format(
                                              new Date(note.createdAt),
                                              "PPP p",
                                            )}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ));
                      })()
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center p-8 text-center"
                      >
                        <Package className="mb-4 h-12 w-12 text-bondi-blue-300" />
                        <h3 className="mb-2 text-lg font-medium text-bondi-blue-700">
                          No Orders Found
                        </h3>
                        <p className="text-sm text-bondi-blue-600">
                          You haven&apos;t placed any orders yet
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export const dynamic = "force-dynamic";
