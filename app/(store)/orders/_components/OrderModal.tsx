import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

import CustomerInfoForm from "./CustomerInfoForm";
import DeliveryOptions from "./DeliveryOptions";
import OrderSummary from "./OrderSummary";
import PaymentMethodSelector from "./PaymentMethodSelector";
import ShippingAddressForm from "./ShippingAddressForm";
import { OrderItem, ProductInfoType, ICurrency } from "@/types/next-utils";

interface AddressType {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerInfoType {
  name: string;
  email: string;
  phone: string;
  customerType?: "regular" | "wholesale" | "vip";
  address: AddressType;
}

interface FormData {
  customerInfo: CustomerInfoType;
  shippingAddress: AddressType;
  shippingMethod: "air" | "sea";
  deliveryType: "door-to-door" | "warehouse";
  paymentMethod:
    | "bkash"
    | "nogod"
    | "rocket"
    | "card"
    | "bank-transfer"
    | "cash";
  paymentCurrency: "CNY" | "USD" | "BDT";
}

type OrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  totalQuantity: number;
  selectedPrice: number;
  totalDiscount: number;
  productInfo: ProductInfoType;
};

export default function OrderModal({
  isOpen,
  onClose,
  orderItems,
  totalQuantity,
  selectedPrice,
  totalDiscount,
  productInfo,
}: OrderModalProps) {
  const { data: session } = useSession();
  const [previousOrders, setPreviousOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial form state with empty fields
  const [formData, setFormData] = useState<FormData>({
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      customerType: "regular",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    shippingMethod: "air",
    deliveryType: "door-to-door",
    paymentMethod: "bkash",
    paymentCurrency: "BDT",
  });

  // Fetch user's previous orders when component mounts
  useEffect(() => {
    async function fetchUserOrders() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/orders`);
          if (response.ok) {
            const orders = await response.json();
            setPreviousOrders(orders);
          }
        } catch (error) {
          console.error("Error fetching previous orders:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    fetchUserOrders();
  }, [session]);

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const userData = await response.json();

            // Populate form with user data
            setFormData((prevData) => ({
              ...prevData,
              customerInfo: {
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                customerType: userData.customerType || "regular",
                address: {
                  street: userData.address?.street || "",
                  city: userData.address?.city || "",
                  state: userData.address?.state || "",
                  postalCode: userData.address?.postalCode || "",
                  country: userData.address?.country || "",
                },
              },
              shippingAddress: {
                street: userData.address?.street || "",
                city: userData.address?.city || "",
                state: userData.address?.state || "",
                postalCode: userData.address?.postalCode || "",
                country: userData.address?.country || "",
              },
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    }

    fetchUserProfile();
  }, [session]);

  // Populate form data from previous orders if available
  useEffect(() => {
    if (previousOrders.length > 0 && !isLoading) {
      // Get the most recent order
      const latestOrder = previousOrders[0];

      setFormData((prevData) => ({
        ...prevData,
        customerInfo: {
          name: latestOrder.customer?.name || prevData.customerInfo.name,
          email: latestOrder.customer?.email || prevData.customerInfo.email,
          phone: latestOrder.customer?.phone || prevData.customerInfo.phone,
          customerType:
            (latestOrder.customer?.customerType as
              | "regular"
              | "wholesale"
              | "vip") || prevData.customerInfo.customerType,
          address: {
            street: prevData.customerInfo.address.street,
            city: prevData.customerInfo.address.city,
            state: prevData.customerInfo.address.state,
            postalCode: prevData.customerInfo.address.postalCode,
            country: prevData.customerInfo.address.country,
          },
        },
        shippingAddress: {
          street: prevData.shippingAddress.street,
          city: prevData.shippingAddress.city,
          state: prevData.shippingAddress.state,
          postalCode: prevData.shippingAddress.postalCode,
          country: prevData.shippingAddress.country,
        },
        shippingMethod:
          (latestOrder.shippingMethod as "air" | "sea") ||
          prevData.shippingMethod,
        deliveryType:
          (latestOrder.deliveryType as "door-to-door" | "warehouse") ||
          prevData.deliveryType,
        paymentMethod: prevData.paymentMethod,
      }));
    }
  }, [previousOrders, isLoading]);

  // Handle form data changes
  const handleFormDataChange = (
    field: keyof FormData,
    value: FormData[keyof FormData],
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Calculate Order Totals according to the schema
  const shippingCost = formData.shippingMethod === "air" ? 1500 : 1000;
  const subtotal = totalQuantity * selectedPrice;
  const totalAmount = subtotal + shippingCost - totalDiscount;

  // Create a currency object
  const createCurrencyObject = (bdtValue: number): ICurrency => {
    const usdToBdt = 121.5;
    const cnyToBdt = 17.5;

    return {
      bdt: bdtValue,
      usd: Number((bdtValue / usdToBdt).toFixed(2)),
      cny: Number((bdtValue / cnyToBdt).toFixed(2)),
    };
  };

  // Function to create an order
  const createOrder = async (orderData: {
    customerId: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      customerType: "regular" | "wholesale" | "vip";
    };
    products: Array<{
      product: string | undefined;
      title: string;
      sku: string;
      color: string;
      size: string;
      quantity: number;
      unitPrice: ICurrency;
      totalPrice: ICurrency;
    }>;
    currencyRates: {
      usdToBdt: number;
      cnyToBdt: number;
    };
    shippingAddress: AddressType;
    contactInformation: {
      email: string;
      phone: string;
    };
    shippingMethod: "air" | "sea";
    deliveryType: "door-to-door" | "warehouse";
    shippingRate: ICurrency;
    totalDiscount: ICurrency;
    subTotal: ICurrency;
    totalAmount: ICurrency;
    estimatedDeliveryDate: Date;
    paymentMethod:
      | "bkash"
      | "nogod"
      | "rocket"
      | "card"
      | "bank-transfer"
      | "cash";
    paymentCurrency: "CNY" | "USD" | "BDT";
    paymentDetails: {
      status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "partially_paid";
      transactions: Array<{
        amount: ICurrency;
        transactionId: string;
        paymentDate: Date;
        receiptUrl?: string;
        notes?: string;
      }>;
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
    trackingHistory: Array<{
      status: string;
      timestamp: Date;
      location: string;
      notes: string;
    }>;
    notes: Array<{
      text: string;
      createdBy: string;
      isInternal: boolean;
      createdAt: Date;
    }>;
    metadata: {
      source: string;
      tags: string[];
    };
  }) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error creating order:", error);
      return { success: false, error: (error as Error).message };
    }
  };

  // Handle Order Submission
  const handleOrder = async () => {
    try {
      // Check if user is authenticated
      if (!session || !session.user) {
        toast.error("Please sign in to place an order");
        return;
      }

      // Validate required fields
      if (
        !formData.customerInfo.name ||
        !formData.customerInfo.email ||
        !formData.customerInfo.phone
      ) {
        toast.error("Please fill in all required customer information");
        return;
      }

      // Validate shipping address if door-to-door delivery
      if (formData.deliveryType === "door-to-door") {
        const { street, city, state, postalCode, country } =
          formData.shippingAddress;
        if (!street || !city || !state || !postalCode || !country) {
          toast.error("Please fill in all required shipping address fields");
          return;
        }
      }

      // Create currency objects for pricing
      const subtotalCurrency = createCurrencyObject(subtotal);
      const shippingRateCurrency = createCurrencyObject(shippingCost);
      const totalDiscountCurrency = createCurrencyObject(totalDiscount);
      const totalAmountCurrency = createCurrencyObject(totalAmount);

      // Create order object based on schema
      const orderData = {
        customerId: session.user.id,
        customerInfo: {
          name: formData.customerInfo.name,
          email: formData.customerInfo.email,
          phone: formData.customerInfo.phone,
          customerType: formData.customerInfo.customerType || "regular",
        },
        products: orderItems.map((item) => ({
          product: item._id,
          title: item.products[0]?.title || "",
          sku: item.products[0]?.sku || "",
          color: item.products[0]?.color || "",
          size: item.products[0]?.size || "",
          quantity: item.quantity || 1,
          unitPrice: createCurrencyObject(item.unitPrice.bdt),
          totalPrice: item.totalAmount,
        })),
        currencyRates: {
          usdToBdt: 121.5,
          cnyToBdt: 17.5,
        },
        shippingAddress: formData.shippingAddress,
        contactInformation: {
          email: formData.customerInfo.email,
          phone: formData.customerInfo.phone,
        },
        shippingMethod: formData.shippingMethod,
        deliveryType: formData.deliveryType,
        shippingRate: shippingRateCurrency,
        totalDiscount: totalDiscountCurrency,
        subTotal: subtotalCurrency,
        totalAmount: totalAmountCurrency,
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        paymentMethod: formData.paymentMethod,
        paymentCurrency: formData.paymentCurrency,
        paymentDetails: {
          status: "pending" as
            | "pending"
            | "paid"
            | "failed"
            | "refunded"
            | "partially_refunded"
            | "partially_paid",
          transactions: [],
        },
        status: "pending" as
          | "pending"
          | "confirmed"
          | "processing"
          | "shipped"
          | "in-transit"
          | "out-for-delivery"
          | "delivered"
          | "canceled"
          | "returned",
        trackingHistory: [
          {
            status: "pending",
            timestamp: new Date(),
            location: "Order Processing Center",
            notes: "Order received and pending processing",
          },
        ],
        notes: [
          {
            text: "Order placed through website",
            createdBy: "system",
            isInternal: true,
            createdAt: new Date(),
          },
        ],
        metadata: {
          source: "website",
          tags: ["online"],
        },
      };

      // Send the order to the API
      const result = await createOrder(orderData);

      if (!result.success) {
        throw new Error(result.error || "Failed to place order");
      }

      toast.success("Your order has been placed successfully!");
      onClose();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        (error as Error).message ||
          "An error occurred while placing your order",
      );
    }
  };

  // Define if shipping address is required based on delivery type
  const requireShippingAddress = formData.deliveryType === "door-to-door";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold">Complete Your Order</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Order Summary */}
        <div className="mt-4 space-y-2">
          <p>
            <strong>Product:</strong> {productInfo.name}
          </p>
          <p>
            <strong>Total Quantity:</strong> {totalQuantity} units
          </p>
          <p>
            <strong>Price Per Unit:</strong> ৳ {selectedPrice}
          </p>
          {totalDiscount > 0 && (
            <p className="text-green-600">
              <strong>Total Discount:</strong> ৳ {totalDiscount}
            </p>
          )}
        </div>

        {/* Order Items */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Ordered Items</h3>
          <ul className="mt-2 rounded-lg border p-3">
            {orderItems.map((item, index) => (
              <li
                key={index}
                className="flex justify-between border-b py-2 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  {item.products[0]?.title}{" "}
                  {item.products[0]?.color && (
                    <span className="flex items-center gap-2">
                      <Image
                        src={item.products[0].color}
                        alt="Color Variant"
                        width={50}
                        height={50}
                        className="rounded-lg"
                      />
                    </span>
                  )}
                  {item.products[0]?.size && `(${item.products[0].size})`}
                </div>
                <span>
                  {item.quantity} × ৳{item.unitPrice.bdt} = ৳
                  {item.totalAmount.bdt}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Loading indicator when fetching data */}
        {isLoading ? (
          <div className="my-4 flex justify-center">
            <span className="text-gray-600">Loading your information...</span>
          </div>
        ) : (
          <>
            {/* Customer Info Form */}
            <CustomerInfoForm
              customerInfo={formData.customerInfo}
              onChange={(field: string, value: string) => {
                const updatedCustomerInfo = {
                  ...formData.customerInfo,
                  [field]: value,
                };
                handleFormDataChange("customerInfo", updatedCustomerInfo);
              }}
              onAddressChange={(field: string, value: string) => {
                const updatedAddress = {
                  ...formData.customerInfo.address,
                  [field]: value,
                };
                const updatedCustomerInfo = {
                  ...formData.customerInfo,
                  address: updatedAddress,
                };
                handleFormDataChange("customerInfo", updatedCustomerInfo);
              }}
              session={session}
            />

            {/* Shipping Address - Only show if door-to-door */}
            {requireShippingAddress && (
              <ShippingAddressForm
                shippingAddress={formData.shippingAddress}
                onChange={(field, value) => {
                  const updatedShippingAddress = {
                    ...formData.shippingAddress,
                    [field]: value,
                  };
                  handleFormDataChange(
                    "shippingAddress",
                    updatedShippingAddress,
                  );
                }}
              />
            )}

            {/* Delivery Options */}
            <DeliveryOptions
              deliveryType={formData.deliveryType}
              shippingMethod={formData.shippingMethod}
              onChange={(delivery: string, location: string) => {
                if (delivery === "deliveryType") {
                  handleFormDataChange(
                    "deliveryType",
                    location as "door-to-door" | "warehouse",
                  );
                } else if (delivery === "shippingMethod") {
                  handleFormDataChange(
                    "shippingMethod",
                    location as "air" | "sea",
                  );
                }
              }}
            />

            {/* Payment Method */}
            <PaymentMethodSelector
              paymentMethod={formData.paymentMethod}
              onChange={(p: string) => {
                handleFormDataChange(
                  "paymentMethod",
                  p as
                    | "bkash"
                    | "nogod"
                    | "rocket"
                    | "card"
                    | "bank-transfer"
                    | "cash",
                );
              }}
            />

            {/* Payment Currency */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Payment Currency</h3>
              <div className="flex gap-4">
                {["BDT", "USD", "CNY"].map((currency) => (
                  <label key={currency} className="flex items-center">
                    <input
                      type="radio"
                      name="paymentCurrency"
                      value={currency}
                      checked={formData.paymentCurrency === currency}
                      onChange={() =>
                        handleFormDataChange(
                          "paymentCurrency",
                          currency as "CNY" | "USD" | "BDT",
                        )
                      }
                      className="mr-2"
                    />
                    {currency}
                  </label>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <OrderSummary
              subtotal={subtotal}
              shippingCost={shippingCost}
              totalDiscount={totalDiscount}
              totalAmount={totalAmount}
            />
          </>
        )}

        {/* Order Button */}
        <div className="mt-6 flex justify-end border-t pt-4">
          <button
            onClick={handleOrder}
            className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            disabled={isLoading}
          >
            Place Order
          </button>
        </div>
      </motion.div>
    </div>
  );
}
