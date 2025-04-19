"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderType } from "@/types/next-utils";
import DataTable from "@/ui/custom/DataTable";
import { columns } from "./_components/OrderColumns";
import { Button } from "@/ui/button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blaze-orange"></div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push("/admin/orders/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={orders}
          searchKey="orderId"
          searchPlaceholder="Search by order ID..."
        />
      </div>
    </div>
  );
}
