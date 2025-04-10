import { getCategories } from "@/lib/actions/actions";
import SidebarContent from "../_components/SidebarContent";
import { Suspense } from "react";

export default async function LeftSidebar() {
  const categories = await getCategories();
  console.log(categories);
  return (
    <aside className="custom-scrollbar sticky top-0 h-screen w-64 border-r border-custom-gray/20 bg-white pr-6 pt-28 max-md:hidden">
      <Suspense fallback="Category loading...">
        <SidebarContent categories={categories} />
      </Suspense>
    </aside>
  );
}
