"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import Heading from "@/ui/custom/Heading";
import { Badge } from "@/ui/badge";

// Define types
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  isPaid: boolean;
  paymentMethod: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the order data from an API
    // For this example, we'll simulate loading a specific order
    const fetchOrder = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock order data
      const mockOrder: Order = {
        id: params.id,
        customer: "John Doe",
        email: "john@example.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Anytown, ST 12345",
        createdAt: "2025-04-01T10:00:00Z",
        items: [
          {
            id: "1",
            name: "Premium T-Shirt",
            price: 29.99,
            quantity: 2,
          },
          {
            id: "2",
            name: "Designer Jeans",
            price: 79.99,
            quantity: 1,
          },
        ],
        subtotal: 139.97,
        shippingFee: 9.99,
        tax: 8.4,
        totalAmount: 158.36,
        status: "pending",
        isPaid: false,
        paymentMethod: "Credit Card",
      };

      setOrder(mockOrder);
      setLoading(false);
    };

    fetchOrder();
  }, [params.id]);

  const updateOrderStatus = (newStatus: OrderStatus) => {
    if (order) {
      setOrder({ ...order, status: newStatus });
      // In a real app, you would make an API call here to update the status
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <p>Loading order details...</p>
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "warning";
      case "shipped":
        return "secondary";
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

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
              title={`Order #${order.id}`}
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
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant={order.isPaid ? "success" : "destructive"}>
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
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
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "shipped" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("shipped")}
                    >
                      Shipped
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "delivered" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("delivered")}
                    >
                      Delivered
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.status === "cancelled" ? "default" : "outline"
                      }
                      onClick={() => updateOrderStatus("cancelled")}
                    >
                      Cancelled
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
                  <h3 className="font-medium">{order.customer}</h3>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.address}
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
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Shipping
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.shippingFee.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Tax
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.tax.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
