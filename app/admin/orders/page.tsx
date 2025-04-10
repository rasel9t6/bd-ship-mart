"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/ui/button";
import DataTable from "@/ui/custom/DataTable";
import Heading from "@/ui/custom/Heading";
import { Badge } from "@/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Define the order type
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  customer: string;
  email: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  isPaid: boolean;
}

// Sample data for demonstration
const orders: Order[] = [
  {
    id: "1",
    customer: "John Doe",
    email: "john@example.com",
    createdAt: "2025-04-01T10:00:00Z",
    totalAmount: 99.99,
    status: "pending",
    isPaid: false,
  },
  {
    id: "2",
    customer: "Jane Smith",
    email: "jane@example.com",
    createdAt: "2025-04-02T14:30:00Z",
    totalAmount: 149.99,
    status: "shipped",
    isPaid: true,
  },
  {
    id: "3",
    customer: "Bob Johnson",
    email: "bob@example.com",
    createdAt: "2025-04-03T09:15:00Z",
    totalAmount: 79.5,
    status: "delivered",
    isPaid: true,
  },
  {
    id: "4",
    customer: "Alice Williams",
    email: "alice@example.com",
    createdAt: "2025-04-04T16:45:00Z",
    totalAmount: 199.99,
    status: "pending",
    isPaid: true,
  },
  {
    id: "5",
    customer: "Carlos Rodriguez",
    email: "carlos@example.com",
    createdAt: "2025-04-05T11:20:00Z",
    totalAmount: 129.99,
    status: "cancelled",
    isPaid: false,
  },
  // Add more sample data as needed
  {
    id: "6",
    customer: "Emma Wilson",
    email: "emma@example.com",
    createdAt: "2025-04-06T13:10:00Z",
    totalAmount: 89.99,
    status: "shipped",
    isPaid: true,
  },
  {
    id: "7",
    customer: "Michael Brown",
    email: "michael@example.com",
    createdAt: "2025-04-07T08:30:00Z",
    totalAmount: 249.99,
    status: "pending",
    isPaid: false,
  },
  {
    id: "8",
    customer: "Sophia Garcia",
    email: "sophia@example.com",
    createdAt: "2025-04-08T15:45:00Z",
    totalAmount: 179.5,
    status: "delivered",
    isPaid: true,
  },
];

export default function OrdersPage() {
  const router = useRouter();

  // Define columns for the DataTable
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM dd, yyyy"),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => `$${row.original.totalAmount.toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeVariant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | "success"
          | "warning" = "default";

        switch (status) {
          case "pending":
            badgeVariant = "warning";
            break;
          case "shipped":
            badgeVariant = "secondary";
            break;
          case "delivered":
            badgeVariant = "success";
            break;
          case "cancelled":
            badgeVariant = "destructive";
            break;
          default:
            badgeVariant = "default";
        }

        return <Badge variant={badgeVariant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "isPaid",
      header: "Payment",
      cell: ({ row }) => (
        <Badge variant={row.original.isPaid ? "success" : "destructive"}>
          {row.original.isPaid ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(order.id)}
                >
                  Copy order ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading title="Orders" description="Manage customer orders" />
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={orders}
          searchKey="customer"
          searchPlaceholder="Search by customer name..."
        />
      </div>
    </div>
  );
}
