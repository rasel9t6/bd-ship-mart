import { Metadata } from "next";
import { ProductType, CategoryType } from "@/types/next-utils";

// Base site configuration
export const siteConfig = {
  name: "K2B EXPRESS",
  description:
    "Premium e-commerce platform for shipping and logistics products in Bangladesh",
  url: "https://k2bexpress.com",
  ogImage: "/og-image.jpg",
  twitterHandle: "@k2bexpress",
  keywords: [
    "shipping",
    "logistics",
    "e-commerce",
    "bangladesh",
    "import",
    "export",
  ],
  author: "K2B EXPRESS",
  creator: "K2B EXPRESS",
  publisher: "K2B EXPRESS",
};

// Generate base metadata
export function generateBaseMetadata(): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
  };
}

// Generate product metadata
export function generateProductMetadata(product: ProductType): Metadata {
  const productUrl = `${siteConfig.url}/products/${product.slug}`;
  const productImage = product.media?.[0]?.url || siteConfig.ogImage;

  return {
    title: product.title,
    description:
      product.description ||
      `Buy ${product.title} at the best price. Fast shipping and secure payment.`,
    keywords: [
      product.title,
      ...(product.tags || []),
      ...(product.categories?.map((cat) => cat.name) || []),
      "buy online",
      "shipping",
      "bangladesh",
    ],
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: product.title,
      description:
        product.description || `Buy ${product.title} at the best price.`,
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description:
        product.description || `Buy ${product.title} at the best price.`,
      images: [productImage],
    },
    other: {
      "product:price:amount": product.price?.bdt?.toString() || "0",
      "product:price:currency": "BDT",
      "product:availability": "in stock",
      "product:condition": "new",
    },
  };
}

// Generate category metadata
export function generateCategoryMetadata(category: CategoryType): Metadata {
  const categoryUrl = `${siteConfig.url}/categories/${category.slug}`;
  const categoryImage = category.thumbnail || siteConfig.ogImage;

  return {
    title: `${category.title} Collection`,
    description:
      category.description ||
      `Explore our ${category.title} collection. Quality products with fast shipping.`,
    keywords: [
      category.title,
      category.name,
      "collection",
      "products",
      "shipping",
      "bangladesh",
    ],
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      type: "website",
      url: categoryUrl,
      title: `${category.title} Collection`,
      description:
        category.description || `Explore our ${category.title} collection.`,
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: category.title,
        },
      ],
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} Collection`,
      description:
        category.description || `Explore our ${category.title} collection.`,
      images: [categoryImage],
    },
  };
}

// Generate search metadata
export function generateSearchMetadata(
  query: string,
  resultCount: number,
): Metadata {
  const searchUrl = `${siteConfig.url}/search/${encodeURIComponent(query)}`;

  return {
    title: `Search Results for "${query}"`,
    description: `Found ${resultCount} results for "${query}". Browse our collection of shipping and logistics products.`,
    keywords: [query, "search", "products", "shipping", "bangladesh"],
    alternates: {
      canonical: searchUrl,
    },
    robots: {
      index: false, // Don't index search pages
      follow: true,
    },
    openGraph: {
      type: "website",
      url: searchUrl,
      title: `Search Results for "${query}"`,
      description: `Found ${resultCount} results for "${query}".`,
      siteName: siteConfig.name,
    },
  };
}

// Breadcrumb types
export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

// Generate breadcrumbs for products
export function generateProductBreadcrumbs(
  product: ProductType,
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
  ];

  // Add category breadcrumbs if available
  if (product.categories && product.categories.length > 0) {
    const mainCategory = product.categories[0];
    breadcrumbs.push({
      name: mainCategory.name,
      href: `/categories/${mainCategory.slug}`,
    });
  }

  // Add product as current
  breadcrumbs.push({
    name: product.title,
    href: `/products/${product.slug}`,
    current: true,
  });

  return breadcrumbs;
}

// Generate breadcrumbs for categories
export function generateCategoryBreadcrumbs(
  categoryPath: string[],
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
  ];

  // Build category path
  let currentPath = "";
  categoryPath.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      name:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: `/categories${currentPath}`,
      current: index === categoryPath.length - 1,
    });
  });

  return breadcrumbs;
}

// Generate breadcrumbs for search
export function generateSearchBreadcrumbs(query: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Search", href: "/search" },
    {
      name: `"${query}"`,
      href: `/search/${encodeURIComponent(query)}`,
      current: true,
    },
  ];

  return breadcrumbs;
}

// Generate structured data for products
export function generateProductStructuredData(product: ProductType) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: product.categories?.[0]?.name,
    image: product.media?.map((item) => item.url) || [],
    offers: {
      "@type": "Offer",
      price: product.price?.bdt || 0,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "100",
    },
  };

  return structuredData;
}

// Generate structured data for categories
export function generateCategoryStructuredData(category: CategoryType) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: `${siteConfig.url}/categories/${category.slug}`,
    image: category.thumbnail,
    mainEntity: {
      "@type": "ItemList",
      itemListElement:
        category.products?.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: typeof product === "string" ? product : "Product",
            url: `${siteConfig.url}/products/${typeof product === "string" ? product : "product"}`,
          },
        })) || [],
    },
  };

  return structuredData;
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[],
) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };

  return structuredData;
}

// Generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/k2b-logo-2.png`,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
      addressLocality: "Dhaka",
      addressRegion: "Dhaka",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+880-XXX-XXX-XXXX",
      contactType: "customer service",
    },
    sameAs: [
      "https://facebook.com/k2bexpress",
      "https://twitter.com/k2bexpress",
      "https://linkedin.com/company/k2bexpress",
    ],
  };
}

// Generate website structured data
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
