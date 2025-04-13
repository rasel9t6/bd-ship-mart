import { ProductType } from "@/types/next-utils";
import ProductCard from "../../products/_components/ProductCard";
type Params = Promise<{ query: string }>;
export default async function SearchPage({ params }: { params: Params }) {
  const { query } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${query}`);
  const searchedProducts = await res.json();
  const decodedQuery = decodeURIComponent(query);
  return (
    <div className="px-10 py-5">
      <p className="my-10 text-heading3-bold">
        Search results for {decodedQuery}
      </p>
      {!searchedProducts ||
        (searchedProducts.length === 0 && (
          <p className="my-5 text-body-bold">No search result found</p>
        ))}
      <div className="flex flex-wrap justify-between gap-16">
        {searchedProducts?.map((product: ProductType) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
