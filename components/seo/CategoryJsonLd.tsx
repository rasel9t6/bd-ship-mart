import { CategoryType } from '@/types/next-utils';
import { generateCategoryStructuredData } from '@/lib/seo';

interface CategoryJsonLdProps {
  category: CategoryType;
}

export default function CategoryJsonLd({ category }: CategoryJsonLdProps) {
  const data = generateCategoryStructuredData(category);

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
