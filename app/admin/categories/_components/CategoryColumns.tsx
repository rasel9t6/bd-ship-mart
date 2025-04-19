"use client";

import { CategoryType } from "@/types/next-utils";
import Delete from "@/ui/custom/Delete";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export const columns: ColumnDef<CategoryType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/admin/categories/${row.original.slug}`}
        className="hover:text-blue-1 font-medium"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "subcategories",
    header: "Subcategories",
    cell: ({ row }) => {
      const subcategories = row.original.subcategories || [];

      // If we have more than 3 subcategories, show the count instead of names
      if (subcategories.length > 3) {
        return <p>{subcategories.length} subcategories</p>;
      }

      // If we have 0-3 subcategories, show their names
      return subcategories.length ? (
        <div className="space-y-1">
          {subcategories.map((sub) => (
            <div key={sub.slug} className="text-sm text-gray-600">
              {sub.name}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">None</p>
      );
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => (
      <p className="font-medium">{row.original.products?.length || 0}</p>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.isActive ? (
          <div className="flex items-center text-green-600">
            <Eye size={16} className="mr-1" />
            <span>Active</span>
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <EyeOff size={16} className="mr-1" />
            <span>Inactive</span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "sortOrder",
    header: "Order",
    cell: ({ row }) => (
      <p className="text-center">{row.original.sortOrder || 0}</p>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Link
          href={`/admin/categories/${row.original.slug}`}
          className="mr-2 text-blue-600 hover:text-blue-800"
        >
          Edit
        </Link>
        <Delete id={row.original.slug} item="category" />
      </div>
    ),
  },
];
