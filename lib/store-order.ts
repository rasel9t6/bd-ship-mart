import { OrderType } from "@/types/next-utils";
import toast from "react-hot-toast";

const STORE_API_URL = process.env.STORE_API_URL;
const STORE_API_KEY = process.env.STORE_API_KEY;

export async function updateStoreUserOrder(
  userId: string,
  orderId: string,
  orderData: OrderType,
) {

  try {
    const response = await fetch(
      `${STORE_API_URL}/users/${userId}/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${STORE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        `Store API returned ${response.status}: ${JSON.stringify(errorData)}`,
      );
    }

 
    return true;
  } catch (apiError) {
    console.error(
      "[store_order_update]",
      apiError instanceof Error ? apiError.message : String(apiError),
    );
    toast.error("Failed to update order");
    return false;
  }
}

export async function updateOrderInStore(orderId: string, userId: string) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order");
    }

    toast.success(
      `Updated order ${orderId} in store system for user ${userId}`,
    );
  } catch (error) {
    toast.error("Failed to update order");
    throw error;
  }
}
