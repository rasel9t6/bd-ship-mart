"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { format } from "date-fns";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { OrderItem } from "@/types/next-utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "in-transit"
  | "out-for-delivery"
  | "delivered"
  | "canceled"
  | "returned";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  "in-transit": "bg-cyan-100 text-cyan-800",
  "out-for-delivery": "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  confirmed: <CheckCircle className="h-5 w-5" />,
  processing: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  "in-transit": <Truck className="h-5 w-5" />,
  "out-for-delivery": <Truck className="h-5 w-5" />,
  delivered: <CheckCircle className="h-5 w-5" />,
  canceled: <XCircle className="h-5 w-5" />,
  returned: <XCircle className="h-5 w-5" />,
};

export default function ProfilePage() {
  const params = useParams();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/user/${params.userId}`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.userId) {
      fetchOrders();
    }
  }, [params.userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blaze-orange"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Track and manage your orders here</p>
      </motion.div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg bg-gray-50 p-8 text-center"
        >
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders yet
          </h3>
          <p className="mt-1 text-gray-500">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status as OrderStatus]}`}
                  >
                    <div className="flex items-center gap-1">
                      {statusIcons[order.status as OrderStatus]}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900">Ordered Items</h4>
                <div className="mt-2 space-y-4">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {product.product.media?.[0] && (
                        <Image
                          src={
                            typeof product.product.media[0] === "string"
                              ? product.product.media[0]
                              : product.product.media[0].url
                          }
                          alt={product.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {product.title}
                        </h5>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          {product.color && (
                            <span className="flex items-center gap-1">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: product.color }}
                              />
                              {product.color}
                            </span>
                          )}
                          {product.size && <span>Size: {product.size}</span>}
                          <span>Qty: {product.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ৳{product.totalPrice.bdt}
                        </p>
                        <p className="text-sm text-gray-500">
                          ৳{product.unitPrice.bdt} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.trackingHistory && order.trackingHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900">
                    Tracking History
                  </h4>
                  <div className="mt-2 space-y-2">
                    {order.trackingHistory.map((tracking, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blaze-orange"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {tracking.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(tracking.timestamp),
                              "MMM d, yyyy HH:mm",
                            )}
                          </p>
                          {tracking.location && (
                            <p className="text-xs text-gray-500">
                              Location: {tracking.location}
                            </p>
                          )}
                          {tracking.notes && (
                            <p className="text-xs text-gray-500">
                              Note: {tracking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">Shipping Method</p>
                  <p className="font-medium text-gray-900">
                    {order.shippingMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ৳{order.totalAmount.bdt}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
