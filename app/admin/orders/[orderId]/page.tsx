"use client";

import { useState, useEffect, use } from "react";
import { format } from "date-fns";
import { ArrowLeft, Printer, Send } from "lucide-react";
import { Button } from "@/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/ui/table";

import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import Heading from "@/ui/custom/Heading";
import { Badge } from "@/ui/badge";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Define types based on your Order schema
type Currency = {
  cny: number;
  usd: number;
  bdt: number;
};

type OrderProduct = {
  product: string;
  title: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: Currency;
  totalPrice: Currency;
};

type Transaction = {
  amount: Currency;
  transactionId: string;
  paymentDate: Date;
  receiptUrl: string;
  notes: string;
};

type TrackingEvent = {
  status: string;
  timestamp: Date;
  location: string;
  notes: string;
};

type Order = {
  _id: string;
  orderId: string;
  customerId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    customerType: "regular" | "wholesale" | "vip";
  };
  products: OrderProduct[];
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInformation: {
    email: string;
    phone: string;
  };
  shippingMethod: string;
  deliveryType: string;
  shippingRate: Currency;
  totalDiscount: Currency;
  totalAmount: Currency;
  subTotal: Currency;
  estimatedDeliveryDate: Date;
  paymentMethod: string;
  paymentCurrency: "CNY" | "USD" | "BDT";
  paymentDetails: {
    status:
      | "pending"
      | "paid"
      | "failed"
      | "refunded"
      | "partially_refunded"
      | "partially_paid";
    transactions: Transaction[];
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "in-transit"
    | "out-for-delivery"
    | "delivered"
    | "canceled"
    | "returned";
  trackingHistory: TrackingEvent[];
  notes: {
    text: string;
    createdBy: string;
    isInternal: boolean;
    createdAt: Date;
  }[];
  metadata: {
    source: string;
    tags: string[];
    campaign: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error(" Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const updateOrderStatus = async (status: string, location?: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          location: location || `Status updated to ${status}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const data = await response.json();
      setOrder(data.order);

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "secondary";
      case "processing":
        return "info";
      case "shipped":
        return "secondary";
      case "in-transit":
        return "secondary";
      case "out-for-delivery":
        return "primary";
      case "delivered":
        return "success";
      case "canceled":
      case "returned":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <p>Order not found</p>
        <Button onClick={() => router.push("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  // Format the full address
  const formattedAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/orders")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Heading
              title={`Order ${order.orderId}`}
              description={`Placed on ${format(new Date(order.createdAt), "MMMM d, yyyy")}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    variant={
                      order.paymentDetails.status === "paid"
                        ? "success"
                        : "warning"
                    }
                  >
                    {order.paymentDetails.status.charAt(0).toUpperCase() +
                      order.paymentDetails.status.slice(1).replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Payment Currency
                  </span>
                  <span>{order.paymentCurrency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping Method</span>
                  <span>{order.shippingMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery Type</span>
                  <span>{order.deliveryType}</span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Est. Delivery Date
                    </span>
                    <span>
                      {format(
                        new Date(order.estimatedDeliveryDate),
                        "MMM d, yyyy",
                      )}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={
                        order.status === "pending" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("pending")}
                      disabled={updating}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "confirmed" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("confirmed")}
                      disabled={updating}
                    >
                      Confirmed
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "processing" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("processing")}
                      disabled={updating}
                    >
                      Processing
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "shipped" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("shipped")}
                      disabled={updating}
                    >
                      Shipped
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "delivered" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("delivered")}
                      disabled={updating}
                    >
                      Delivered
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "canceled" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("canceled")}
                      disabled={updating}
                    >
                      Canceled
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{order.customerInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.customerInfo.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerInfo.phone}
                  </p>
                  <Badge className="mt-1">
                    {order.customerInfo.customerType}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {formattedAddress}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <p className="text-sm">
                    Email: {order.contactInformation.email}
                  </p>
                  <p className="text-sm">
                    Phone: {order.contactInformation.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU / Color / Size</TableHead>
                  <TableHead className="text-right">
                    Price ({order.paymentCurrency})
                  </TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">
                    Total ({order.paymentCurrency})
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.title || "Product"}
                    </TableCell>
                    <TableCell>
                      {item.sku && <div>{item.sku}</div>}
                      {item.color && <div>Color: {item.color}</div>}
                      {item.size && <div>Size: {item.size}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        item.unitPrice[
                          order.paymentCurrency.toLowerCase() as keyof Currency
                        ],
                        order.paymentCurrency,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        item.totalPrice[
                          order.paymentCurrency.toLowerCase() as keyof Currency
                        ],
                        order.paymentCurrency,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      order.subTotal[
                        order.paymentCurrency.toLowerCase() as keyof Currency
                      ],
                      order.paymentCurrency,
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Shipping Fee
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      order.shippingRate[
                        order.paymentCurrency.toLowerCase() as keyof Currency
                      ],
                      order.paymentCurrency,
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Discount
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      order.totalDiscount[
                        order.paymentCurrency.toLowerCase() as keyof Currency
                      ],
                      order.paymentCurrency,
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      order.totalAmount[
                        order.paymentCurrency.toLowerCase() as keyof Currency
                      ],
                      order.paymentCurrency,
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tracking History */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.trackingHistory.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  {order.trackingHistory.map((event, index) => (
                    <div key={index} className="relative pl-10 pb-8">
                      <div className="absolute left-3 -translate-x-1/2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(event.timestamp),
                            "MMM d, yyyy - h:mm a",
                          )}
                        </p>
                        <p className="text-sm">{event.location}</p>
                        {event.notes && (
                          <p className="text-sm italic">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tracking information available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Transactions */}
        {order.paymentDetails.transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.paymentDetails.transactions.map(
                    (transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(transaction.paymentDate),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            transaction.amount[
                              order.paymentCurrency.toLowerCase() as keyof Currency
                            ],
                            order.paymentCurrency,
                          )}
                        </TableCell>
                        <TableCell>{transaction.notes}</TableCell>
                        <TableCell>
                          {transaction.receiptUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(transaction.receiptUrl, "_blank")
                              }
                            >
                              View Receipt
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Order Notes */}
        {order.notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.notes.map((note, index) => (
                  <div key={index} className="bg-muted p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{note.createdBy}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(note.createdAt),
                            "MMM d, yyyy - h:mm a",
                          )}
                        </p>
                      </div>
                      {note.isInternal && (
                        <Badge variant="outline">Internal</Badge>
                      )}
                    </div>
                    <p className="mt-2">{note.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
