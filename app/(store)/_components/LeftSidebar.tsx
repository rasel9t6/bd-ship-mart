"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/actions/actions";
import SidebarContent from "../_components/SidebarContent";
import { CategoryType } from "@/types/next-utils";

export default function LeftSidebar() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <aside className="custom-scrollbar sticky top-0 h-screen w-64 border-r border-bondi-blue-50/80 bg-white pr-6 max-md:hidden">
        <div className="flex size-full flex-col gap-2 p-3 bg-white mt-24 lg:mt-28">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="custom-scrollbar sticky top-0 h-screen w-64 border-r border-bondi-blue-50/70 bg-white pr-6 max-md:hidden">
      <SidebarContent categories={categories} />
    </aside>
  );
}
