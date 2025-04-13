import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormData,
  productFormSchema,
  ProductFormValues,
} from "@/lib/type";
import { SubcategoryType } from "@/types/next-utils";

export const useProductForm = (initialData?: Partial<ProductFormData>) => {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    title: "",
    description: "",
    media: [],
    category: {
      name: "",
      subcategories: [],
    },
    tags: [],
    sizes: [],
    colors: [],
    minimumOrderQuantity: 1,
    inputCurrency: "CNY",
    price: {
      cny: 0,
      usd: 0,
      bdt: 0,
    },
    expense: {
      cny: 0,
      usd: 0,
      bdt: 0,
    },
    currencyRates: {
      usdToBdt: 0,
      cnyToBdt: 0,
    },
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: initialData?.sku || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      media: initialData?.media || [],
      category: {
        name: initialData?.category?.name || "",
        subcategories: Array.isArray(initialData?.category?.subcategories)
          ? initialData.category.subcategories
          : initialData?.category?.subcategories
            ? [
                {
                  name: (initialData.category.subcategories as SubcategoryType)
                    .name,
                },
              ]
            : [],
      },
      tags: initialData?.tags || [],
      sizes: initialData?.sizes || [],
      colors: initialData?.colors || [],
      minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
      inputCurrency: initialData?.inputCurrency || "CNY",
      price: initialData?.price || {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
      expense: initialData?.expense || {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
      currencyRates: initialData?.currencyRates || {
        usdToBdt: 0,
        cnyToBdt: 0,
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        category: {
          name: initialData.category?.name || prev.category.name,
          subcategories: Array.isArray(initialData.category?.subcategories)
            ? initialData.category.subcategories
            : initialData.category?.subcategories
              ? [
                  {
                    name: (
                      initialData.category.subcategories as SubcategoryType
                    ).name,
                  },
                ]
              : prev.category.subcategories,
        },
      }));
    }
  }, [initialData]);

  const updateFormData = (data: Partial<ProductFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      category: data.category
        ? {
            name: data.category.name || prev.category.name,
            subcategories: Array.isArray(data.category.subcategories)
              ? data.category.subcategories
              : data.category.subcategories
                ? [
                    {
                      name: (data.category.subcategories as SubcategoryType)
                        .name,
                    },
                  ]
                : prev.category.subcategories,
          }
        : prev.category,
    }));
  };

  return {
    formData,
    updateFormData,
    form,
  };
};
