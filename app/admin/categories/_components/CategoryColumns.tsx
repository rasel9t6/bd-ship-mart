"use client";

import { CollectionType } from "@/lib/types";
import Delete from "@/ui/custom/Delete";
import { ColumnDef } from "@tanstack/react-table";

import Link from "next/link";

export const columns: ColumnDef<CollectionType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/admin/categories/${row.original.slug}`}
        className="hover:text-blue-1"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => <p>{row.original.products?.length}</p>,
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => <Delete id={row.original._id} item="collection" />,
  },
];
