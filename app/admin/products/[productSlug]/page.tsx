import { getProduct } from '@/lib/actions/actions';
import ProductForm from '../_components/ProductForm';
type Params = Promise<{ productSlug: string }>;
export default async function ProductPage({ params }: { params: Params }) {
  const { productSlug } = await params;
  const productDetails = await getProduct({ productSlug });
  console.log('productDetails', productDetails);
  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-8 text-3xl font-bold'>Edit Product</h1>
      <ProductForm initialData={productDetails} />
    </div>
  );
}
