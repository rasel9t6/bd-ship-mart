import { FaPlus } from "react-icons/fa6";

import Link from "next/link";
import DataTable from "@/ui/custom/DataTable";
import { Separator } from "@radix-ui/react-separator";
import { columns } from "../categories/_components/CategoryColumns";
import { Button } from "@/ui/button";

export default async function ProductPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");

  const { products } = await res.json();
  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Products</p>

        <Link href="/products/new" className="">
          <Button>
            <FaPlus className="mr-2 size-4" />
            Create Product
          </Button>
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
}
