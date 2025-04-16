import { getProduct } from "@/lib/actions/actions";
import ProductForm from "../_components/ProductForm";
type Params = Promise<{ productSlug: string }>;
export default async function ProductPage({ params }: { params: Params }) {
  const { productSlug } = await params;
  const productDetails = await getProduct({ productSlug });

  return (
    <>
      <ProductForm initialData={productDetails} />
    </>
  );
}
