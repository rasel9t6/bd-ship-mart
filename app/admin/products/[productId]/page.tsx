import { getProduct } from '@/lib/actions/actions';
import ProductForm from '../_components/ProductForm';

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = params;
  const productDetails = await getProduct({ productId });

  return (
    <>
      <ProductForm initialData={productDetails} />
    </>
  );
}
