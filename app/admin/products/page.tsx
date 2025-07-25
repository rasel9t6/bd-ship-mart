import { FaPlus } from "react-icons/fa6";
import Link from "next/link";
import DataTable from "@/ui/custom/DataTable";
import { Separator } from "@radix-ui/react-separator";

import { Button } from "@/ui/button";
import { columns } from "./_components/ProductColumns";
import { getProducts } from "@/lib/actions/actions";

// Prevent static generation
export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const products = await getProducts();

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <h1 className="text-heading2-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <FaPlus className="mr-2 size-4" />
            Create Product
          </Button>
        </Link>
      </div>
      <Separator className="my-4 bg-gray-1" />
      <DataTable
        columns={columns}
        data={products}
        searchKey="title"
        searchPlaceholder="Search by product by title"
      />
    </div>
  );
}
