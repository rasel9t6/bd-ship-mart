import { getProduct } from "@/lib/actions/actions";
import ProductForm from "../_components/ProductForm";
type Params = Promise<{ productId: string }>;
export default async function ProductPage({ params }: { params: Params }) {
  const { productId } = await params;
  const productDetails = await getProduct({ productId });

  return (
    <>
      <ProductForm initialData={productDetails} />
    </>
  );
}
