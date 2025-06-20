import { ProductType } from '@/types/next-utils';
import Gallery from '../_components/Gallery';
import ProductCard from '../_components/ProductCard';
import ProductInfo from '../_components/ProductInfo';
import { getProduct, getRelatedProducts } from '@/lib/actions/actions';
import { notFound } from 'next/navigation';
import {
  generateProductMetadata,
  generateProductBreadcrumbs,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from '@/lib/seo';
import Breadcrumb from '@/ui/custom/Breadcrumb';
import StructuredData from '@/ui/custom/StructuredData';

type Params = Promise<{ productSlug: string }>;

// Generate metadata for the product page
export async function generateMetadata({ params }: { params: Params }) {
  const { productSlug } = await params;
  const product = await getProduct({ productSlug });

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return generateProductMetadata(product);
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { productSlug } = await params;
  const productDetails = await getProduct({ productSlug });

  if (!productDetails) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts({ productSlug });
  const breadcrumbs = generateProductBreadcrumbs(productDetails);

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={generateProductStructuredData(productDetails)} />
      <StructuredData data={generateBreadcrumbStructuredData(breadcrumbs)} />

      <main className='mt-16 pt-4 md:mt-20'>
        {/* Breadcrumbs */}
        <div className='container mx-auto px-4 py-4'>
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* Product details section */}
        <div className='container mx-auto px-4 py-8'>
          <div className='mx-auto max-w-7xl'>
            <div className='flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start'>
              {/* Gallery component - will take up half width on desktop */}
              <div className='w-full lg:w-1/2'>
                <Gallery
                  productMedia={productDetails.media}
                  colorImages={productDetails.colors}
                />
              </div>

              {/* Product info component - will take up half width on desktop */}
              <div className='w-full lg:w-1/2'>
                <ProductInfo productInfo={productDetails} />
              </div>
            </div>
          </div>
        </div>

        {/* Related products section */}
        <div className='container mx-auto px-4 pb-16'>
          <div className='flex w-full flex-col items-center'>
            <h2 className='mb-8 text-heading3-bold text-gray-900'>
              Related Products
            </h2>
            <div className='flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8'>
              {relatedProducts && relatedProducts.length > 0 ? (
                relatedProducts.map((product: ProductType) => (
                  <div
                    key={product.slug}
                    className='min-w-[200px] max-w-[250px] flex-1'
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p className='text-gray-500'>No related products found</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
