import { getOrders } from "@/lib/actions/actions";
import DataTable from "@/ui/custom/DataTable";
import { columns } from "./_components/OrderColumns";
import { Button } from "@/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const orders = (await getOrders()) || [];
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/admin/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Link>
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
