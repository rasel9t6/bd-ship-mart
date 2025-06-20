import { generateOrganizationStructuredData } from '@/lib/seo';

export default function OrganizationJsonLd() {
  const data = generateOrganizationStructuredData();

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
