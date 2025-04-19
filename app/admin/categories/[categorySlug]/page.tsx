import CategoryForm from "../_components/CategoryForm";
import { getCategory } from "@/lib/actions/actions";

// // Metadata generator
// const generateCategoryMetadata = (category: CategoryType): Metadata => ({
//   title: category?.title || 'Category Not Found',
//   description: category?.description,
//   keywords: category?.name,
//   openGraph: category
//     ? {
//         title: category.title,
//         description: category.description,
//         images: [category.thumbnail],
//       }
//     : undefined,
// });
type Params = Promise<{ categorySlug: string }>;

// Page component
export default async function CategoryDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { categorySlug } = await params;
  const category = await getCategory(categorySlug);
  return <CategoryForm initialData={category} />;
}
