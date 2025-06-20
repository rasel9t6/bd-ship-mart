import { ProductType } from '@/types/next-utils';
import { generateProductStructuredData } from '@/lib/seo';

interface ProductJsonLdProps {
  product: ProductType;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = generateProductStructuredData(product);

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
