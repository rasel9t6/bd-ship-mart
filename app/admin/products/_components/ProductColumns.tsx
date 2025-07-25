"use client";
import { ProductType } from "@/types/next-utils";
import Delete from "@/ui/custom/Delete";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";

interface Category {
  _id: string;
  name: string;
  title: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id: string;
  name: string;
  title: string;
  slug: string;
  category: string;
}

interface ExtendedProductType extends ProductType {
  categories: Category[];
  subcategories: Subcategory[];
}

const CurrencySelector = ({
  value,
  onChange,
}: {
  value: "cny" | "usd" | "bdt";
  onChange: (value: "cny" | "usd" | "bdt") => void;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as "cny" | "usd" | "bdt")}
      className="text-sm p-1 border rounded"
    >
      <option value="cny">CNY (¥)</option>
      <option value="usd">USD ($)</option>
      <option value="bdt">BDT (৳)</option>
    </select>
  );
};

const PriceDisplay = ({ product }: { product: ProductType }) => {
  const [currency, setCurrency] = useState<"cny" | "usd" | "bdt">("bdt");

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "cny":
        return "¥";
      case "usd":
        return "$";
      case "bdt":
        return "৳";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <CurrencySelector value={currency} onChange={setCurrency} />
      <span>
        {product.price?.[currency] !== undefined
          ? `${getCurrencySymbol(currency)} ${product.price[currency].toFixed(2)}`
          : "N/A"}
      </span>
    </div>
  );
};

const ExpenseDisplay = ({ product }: { product: ProductType }) => {
  const [currency, setCurrency] = useState<"cny" | "usd" | "bdt">("bdt");

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "cny":
        return "¥";
      case "usd":
        return "$";
      case "bdt":
        return "৳";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <CurrencySelector value={currency} onChange={setCurrency} />
      <span>
        {product.expense?.[currency] !== undefined
          ? `${getCurrencySymbol(currency)} ${product.expense[currency].toFixed(2)}`
          : "N/A"}
      </span>
    </div>
  );
};

export const columns: ColumnDef<ExtendedProductType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/admin/products/${row.original.slug}`}
        className="hover:text-red-1"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
 
      // Get the first category and subcategory from the arrays
      const category = row.original.categories?.[0];
      const subcategory = row.original.subcategories?.[0];

      const categoryName = category?.name || "N/A";
      const subcategoryName = subcategory?.name || "N/A";

      return (
        <div>
          <p>
            <strong>Category:</strong> {categoryName}
          </p>
          <p>
            <strong>Subcategory:</strong> {subcategoryName}
          </p>
        </div>
      );
    },
  },
  {
    header: "Price",
    cell: ({ row }) => <PriceDisplay product={row.original} />,
  },
  {
    header: "Expense",
    cell: ({ row }) => <ExpenseDisplay product={row.original} />,
  },
  {
    header: "Action",
    id: "actions",
    cell: ({ row }) => <Delete item="product" id={row.original.slug} />,
  },
];
