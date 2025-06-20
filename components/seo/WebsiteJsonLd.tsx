import { generateWebsiteStructuredData } from '@/lib/seo';

export default function WebsiteJsonLd() {
  const data = generateWebsiteStructuredData();
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
