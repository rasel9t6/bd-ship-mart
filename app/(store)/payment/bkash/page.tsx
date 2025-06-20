"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from "react-hot-toast";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/ui/alert";

interface OrderDetails {
  orderId: string;
  products: Array<{
    totalPrice: {
      bdt: number;
      usd: number;
      cny: number;
    };
  }>;
  totalAmount?: {
    bdt: number;
    usd: number;
    cny: number;
  };
  paymentCurrency: string;
}

export default function BkashPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [bkashNumber, setBkashNumber] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        toast.error("Order ID is missing");
        router.push("/orders");
        return;
      }

      try {
        setIsFetching(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch order details");
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load order details",
        );
        router.push("/orders");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  const handleBkashPayment = async () => {
    if (!bkashNumber.match(/^01[3-9]\d{8}$/)) {
      toast.error("Please enter a valid bKash number");
      return;
    }

    if (!orderId || !orderDetails) {
      toast.error("Invalid order information");
      return;
    }

    const amount =
      orderDetails.totalAmount?.bdt ||
      orderDetails.products.reduce(
        (sum, product) => sum + product.totalPrice.bdt,
        0,
      );

    if (!amount) {
      toast.error("Invalid order amount");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        amount: amount,
        orderId,
        currency: "BDT",
        bkashNumber,
      };

      console.log("Sending bKash payment request:", payload);

      const response = await fetch("/api/payment/bkash/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("bKash payment error:", data);
        throw new Error(data.message || "Failed to initiate bKash payment");
      }

      if (!data.paymentUrl) {
        console.error("No payment URL in response:", data);
        throw new Error("Invalid response from payment server");
      }

      // Store the payment URL in sessionStorage for the callback
      sessionStorage.setItem("bkashPaymentUrl", data.paymentUrl);
      sessionStorage.setItem("orderId", orderId);

      // Redirect to bKash payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error("bKash payment error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process bKash payment. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load order details</p>
          <Button onClick={() => router.push("/orders")} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const amount =
    orderDetails.totalAmount?.bdt ||
    orderDetails.products.reduce(
      (sum, product) => sum + product.totalPrice.bdt,
      0,
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">bKash Payment</h2>
              <p className="text-gray-600 mt-2">
                Complete your payment securely
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                By proceeding with bKash payment, you agree to save your bKash
                account for future transactions with us. Your account details
                will be securely stored by bKash.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="bkashNumber">bKash Number</Label>
              <Input
                id="bkashNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                maxLength={11}
                pattern="^01[3-9]\d{8}$"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the bKash number you want to pay from
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="font-bold text-lg">
                  ৳{amount.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleBkashPayment}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Pay with bKash"}
            </Button>

            <div className="text-xs text-gray-500 space-y-2">
              <p className="text-center">
                You will be redirected to bKash payment page
              </p>
              <p className="text-center">
                For any issues, please contact bKash Customer Care at 16247
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
