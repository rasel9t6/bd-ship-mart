"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { toast } from "react-hot-toast";
import { BkashPayment } from "../orders/_components/BkashPayment";
import Image from "next/image";

interface Order {
  _id: string;
  orderId: string;
  totalAmount: {
    bdt: number;
    usd: number;
    cny: number;
  };
  paymentDetails: {
    status: string;
    transactions: Array<{
      amount: {
        bdt: number;
        usd: number;
        cny: number;
      };
      transactionId: string;
      paymentDate: string;
      notes: string;
    }>;
  };
  products: Array<{
    product: {
      title: string;
      images: string[];
    };
    quantity: number;
    unitPrice: {
      bdt: number;
      usd: number;
      cny: number;
    };
  }>;
  createdAt: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    const fetchPendingOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/orders/pending", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load orders",
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to load orders",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [session, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Pending Orders</h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have any orders waiting for payment.
            </p>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.map((order) => (
            <Card
              key={order._id}
              className={`cursor-pointer transition-all ${
                selectedOrder?._id === order._id
                  ? "ring-2 ring-blue-500"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{order.orderId}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold">
                        ৳{(order.totalAmount?.bdt || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p
                        className={`font-semibold ${
                          order.paymentDetails?.status === "pending"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {(order.paymentDetails?.status || "pending")
                          .charAt(0)
                          .toUpperCase() +
                          (order.paymentDetails?.status || "pending").slice(1)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Products</p>
                    <div className="space-y-2">
                      {order.products.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-2 bg-gray-50 rounded"
                        >
                          <Image
                            height={16}
                            width={16}
                            src={item.product?.images?.[0] || "/k2b-logo.png"}
                            alt={item.product?.title || "Product image"}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">
                              {item.product?.title || "Untitled Product"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ৳
                              {(item.unitPrice?.bdt || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="text-2xl font-bold">
                      ৳{(selectedOrder.totalAmount?.bdt || 0).toLocaleString()}
                    </p>
                  </div>
                  <BkashPayment order={selectedOrder} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-600 text-center">
                  Select an order to proceed with payment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
