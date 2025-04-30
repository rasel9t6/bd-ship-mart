import { ProductType } from "@/types/next-utils";
import ProductCard from "../products/_components/ProductCard";
import { getProducts } from "@/lib/actions/actions";

export default async function ProductList() {
  const products = await getProducts();
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 sm:px-5 py-8">
        <h2 className="text-heading1-bold text-bondi-blue">
          Featured Products
        </h2>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-body-bold text-gray-600">No products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 sm:px-5 py-8">
      <h2 className="text-heading1-bold text-bondi-blue">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {products.map((product: ProductType) => (
          <div key={product._id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
