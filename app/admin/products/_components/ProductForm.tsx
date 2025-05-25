"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import MultiSelect from "@/ui/custom/MultiSelect";
import MediaUpload, { MediaType } from "@/ui/custom/MediaUpload";
import MultiText from "@/ui/custom/MultiText";
import { Plus, Trash2 } from "lucide-react";
import slugify from "slugify";

// Updated form schema to match the model structure
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  categories: z.array(z.string()).optional(), // Changed to array
  subcategories: z.array(z.string()).optional(),
  inputCurrency: z.enum(["CNY", "USD"]),
  price: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  expense: z.object({
    cny: z.number().min(0).optional(),
    usd: z.number().min(0).optional(),
    bdt: z.number().min(0).optional(),
  }),
  currencyRates: z.object({
    usdToBdt: z.number().min(0),
    cnyToBdt: z.number().min(0),
  }),
  minimumOrderQuantity: z.number().min(1),
  media: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(["image"]),
    }),
  ),
  colors: z.array(
    z.object({
      url: z.string().url(),
      type: z.enum(["image", "video"]),
    }),
  ),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  quantityPricing: z.object({
    ranges: z
      .array(
        z.object({
          minQuantity: z.number().min(1),
          maxQuantity: z.number().min(1).optional(),
          price: z.object({
            cny: z.number().min(0).optional(),
            usd: z.number().min(0).optional(),
            bdt: z.number().min(0).optional(),
          }),
        }),
      )
      .optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Subcategory {
  _id: string;
  name: string;
  title: string;
  description?: string;
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  icon: string;
  thumbnail: string;
  products: string[];
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  title: string;
  description?: string;
  subcategories: Subcategory[];
  products: string[];
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface ProductFormType {
  _id: string;
  title: string;
  description?: string;
  sku: string;
  slug?: string;
  categories?: string[];
  subcategories?: string[];
  inputCurrency: "CNY" | "USD";
  price: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  expense: {
    cny?: number;
    usd?: number;
    bdt?: number;
  };
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  minimumOrderQuantity: number;
  media: MediaItem[];
  colors?: MediaItem[];
  tags?: string[];
  sizes?: string[];
  quantityPricing?: {
    ranges: Array<{
      minQuantity: number;
      maxQuantity?: number;
      price: {
        cny?: number;
        usd?: number;
        bdt?: number;
      };
    }>;
  };
}

interface MediaItem {
  url: string;
  type: "image";
}

interface Props {
  initialData?: ProductFormType;
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    Subcategory[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      sku: initialData?.sku || "",
      categories: initialData?.categories || [],
      subcategories: initialData?.subcategories || [],
      inputCurrency: (initialData?.inputCurrency as "CNY" | "USD") || "CNY",
      price: {
        cny: initialData?.price?.cny || 0,
        usd: initialData?.price?.usd || 0,
        bdt: initialData?.price?.bdt || 0,
      },
      expense: {
        cny: initialData?.expense?.cny || 0,
        usd: initialData?.expense?.usd || 0,
        bdt: initialData?.expense?.bdt || 0,
      },
      currencyRates: {
        usdToBdt: initialData?.currencyRates?.usdToBdt || 121.5,
        cnyToBdt: initialData?.currencyRates?.cnyToBdt || 17.5,
      },
      minimumOrderQuantity: initialData?.minimumOrderQuantity || 1,
      media: initialData?.media || [],
      colors: initialData?.colors || [],
      tags: initialData?.tags || [],
      sizes: initialData?.sizes || [],
      quantityPricing: {
        ranges: initialData?.quantityPricing?.ranges || [],
      },
    },
  });

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);

        if (!categoriesRes.ok || !subcategoriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const categoriesData: Category[] = await categoriesRes.json();
        const subcategoriesData: Subcategory[] = await subcategoriesRes.json();

        setCategories(categoriesData);
        setAllSubcategories(subcategoriesData);

        console.log("Fetched categories:", categoriesData);
        console.log("Fetched subcategories:", subcategoriesData);

        // Initialize selected values from initial data
        if (initialData) {
          if (initialData.categories && initialData.categories.length > 0) {
            setSelectedCategories(initialData.categories);
            // Filter subcategories by selected categories
            const filteredSubcategories = subcategoriesData.filter((sub) =>
              initialData.categories?.includes(sub.category),
            );
            setAvailableSubcategories(filteredSubcategories);
          } else if (
            initialData.subcategories &&
            initialData.subcategories.length > 0
          ) {
            setSelectedSubcategories(initialData.subcategories);
            // Show all subcategories when subcategories are selected
            setAvailableSubcategories(subcategoriesData);
          } else {
            // No selection, show all subcategories
            setAvailableSubcategories(subcategoriesData);
          }
        } else {
          // New product, show all subcategories
          setAvailableSubcategories(subcategoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories and subcategories");
      }
    };
    fetchData();
  }, [initialData]);

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    console.log("Category selected:", categoryId);

    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    form.setValue("categories", newCategories);

    // If categories are selected, filter subcategories by selected categories
    if (newCategories.length > 0) {
      const filteredSubcategories = allSubcategories.filter((sub) =>
        newCategories.includes(sub.category),
      );
      setAvailableSubcategories(filteredSubcategories);
      setSelectedSubcategories([]);
      form.setValue("subcategories", []);
    } else {
      // If no categories selected, show all subcategories
      setAvailableSubcategories(allSubcategories);
    }
  };

  const handleCategoryRemove = (categoryId: string) => {
    console.log("Removing category:", categoryId);
    const newCategories = selectedCategories.filter((id) => id !== categoryId);
    setSelectedCategories(newCategories);
    form.setValue("categories", newCategories);

    // Update available subcategories based on remaining categories
    if (newCategories.length > 0) {
      const filteredSubcategories = allSubcategories.filter((sub) =>
        newCategories.includes(sub.category),
      );
      setAvailableSubcategories(filteredSubcategories);
    } else {
      setAvailableSubcategories(allSubcategories);
    }
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (subcategoryId: string) => {
    console.log("Subcategory selected:", subcategoryId);

    const newSubcategories = selectedSubcategories.includes(subcategoryId)
      ? selectedSubcategories.filter((id) => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];

    setSelectedSubcategories(newSubcategories);
    form.setValue("subcategories", newSubcategories);

    // If subcategories are selected, clear categories
    if (newSubcategories.length > 0) {
      setSelectedCategories([]);
      form.setValue("categories", []);
    }
  };

  const handleSubcategoryRemove = (subcategoryId: string) => {
    console.log("Removing subcategory:", subcategoryId);
    const newSubcategories = selectedSubcategories.filter(
      (id) => id !== subcategoryId,
    );
    setSelectedSubcategories(newSubcategories);
    form.setValue("subcategories", newSubcategories);
  };

  // Debug effect
  useEffect(() => {
    console.log("Current state:", {
      selectedCategories,
      selectedSubcategories,
      availableSubcategories: availableSubcategories.length,
      formCategories: form.getValues("categories"),
      formSubcategories: form.getValues("subcategories"),
    });
  }, [selectedCategories, selectedSubcategories, availableSubcategories, form]);

  // Handle currency conversion
  const handleCurrencyChange = (values: FormValues) => {
    const { inputCurrency, price, expense, currencyRates } = values;
    const { usdToBdt, cnyToBdt } = currencyRates;

    // Handle price conversion
    if (inputCurrency === "CNY") {
      if (price.cny) {
        form.setValue("price.bdt", price.cny * cnyToBdt);
        form.setValue("price.usd", price.cny / 7); // Assuming 1 USD = 7 CNY
      } else {
        form.setValue("price.bdt", 0);
        form.setValue("price.usd", 0);
      }
    } else if (inputCurrency === "USD") {
      if (price.usd) {
        form.setValue("price.bdt", price.usd * usdToBdt);
        form.setValue("price.cny", price.usd * 7);
      } else {
        form.setValue("price.bdt", 0);
        form.setValue("price.cny", 0);
      }
    }

    // Handle expense conversion
    if (inputCurrency === "CNY") {
      if (expense.cny) {
        form.setValue("expense.bdt", expense.cny * cnyToBdt);
        form.setValue("expense.usd", expense.cny / 7);
      } else {
        form.setValue("expense.bdt", 0);
        form.setValue("expense.usd", 0);
      }
    } else if (inputCurrency === "USD") {
      if (expense.usd) {
        form.setValue("expense.bdt", expense.usd * usdToBdt);
        form.setValue("expense.cny", expense.usd * 7);
      } else {
        form.setValue("expense.bdt", 0);
        form.setValue("expense.cny", 0);
      }
    }
  };

  // Handle media upload
  const handleMediaChange = (url: string, type: MediaType) => {
    if (type === "image") {
      form.setValue("media", [{ url, type }]);
    }
  };

  const handleMediaRemove = () => {
    form.setValue("media", []);
  };

  // Handle color variant images
  const handleColorChange = (url: string, type: MediaType) => {
    const currentColors = form.getValues("colors") || [];
    form.setValue("colors", [...currentColors, { url, type }]);
  };

  const handleColorRemove = (urlToRemove: string) => {
    const currentColors = form.getValues("colors") || [];
    form.setValue(
      "colors",
      currentColors.filter((color) => color.url !== urlToRemove),
    );
  };

  // Add handlers for sizes and tags
  const handleSizeChange = (size: string) => {
    const currentSizes = form.getValues("sizes") || [];
    form.setValue("sizes", [...currentSizes, size]);
  };

  const handleSizeRemove = (sizeToRemove: string) => {
    const currentSizes = form.getValues("sizes") || [];
    form.setValue(
      "sizes",
      currentSizes.filter((size) => size !== sizeToRemove),
    );
  };

  const handleTagChange = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", [...currentTags, tag]);
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  // Add handlers for quantity pricing
  const handleAddRange = () => {
    const currentRanges = form.getValues("quantityPricing.ranges") || [];
    const newRange = {
      minQuantity: 1,
      maxQuantity: undefined,
      price: {
        cny: 0,
        usd: 0,
        bdt: 0,
      },
    };
    form.setValue("quantityPricing.ranges", [...currentRanges, newRange]);
  };

  const handleRemoveRange = (index: number) => {
    const currentRanges = form.getValues("quantityPricing.ranges") || [];
    form.setValue(
      "quantityPricing.ranges",
      currentRanges.filter((_, i) => i !== index),
    );
  };

  const handleRangeChange = (
    index: number,
    field: "minQuantity" | "maxQuantity" | "price",
    value: number | undefined,
  ) => {
    const currentRanges = form.getValues("quantityPricing.ranges") || [];
    const updatedRanges = [...currentRanges];

    if (field === "price") {
      const currency = form.getValues("inputCurrency").toLowerCase() as
        | "cny"
        | "usd";
      updatedRanges[index] = {
        ...updatedRanges[index],
        price: {
          ...updatedRanges[index].price,
          [currency]: value,
        },
      };

      // Calculate other currencies
      const { usdToBdt, cnyToBdt } = form.getValues("currencyRates");
      if (currency === "cny" && value) {
        updatedRanges[index].price.bdt = value * cnyToBdt;
        updatedRanges[index].price.usd = value / 7;
      } else if (currency === "usd" && value) {
        updatedRanges[index].price.bdt = value * usdToBdt;
        updatedRanges[index].price.cny = value * 7;
      }
    } else {
      updatedRanges[index] = {
        ...updatedRanges[index],
        [field]: value,
      };
    }

    form.setValue("quantityPricing.ranges", updatedRanges);
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Ensure we only send categories OR subcategories, not both
      const submitData = {
        ...values,
        // If categories are selected, clear subcategories
        subcategories:
          values.categories && values.categories.length > 0
            ? []
            : values.subcategories,
        // If subcategories are selected, clear categories
        categories:
          values.subcategories && values.subcategories.length > 0
            ? []
            : values.categories,
        slug:
          initialData?.slug ||
          slugify(values.title, { lower: true, strict: true }),
      };

      const endpoint = initialData?._id
        ? `/api/products/${initialData.slug}`
        : "/api/products";
      const method = initialData?._id ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      toast.success(
        initialData?._id
          ? "Product updated successfully"
          : "Product created successfully",
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Add form error handler
  const onError = (errors: FieldErrors<FormValues>) => {
    // Get the first error message
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Product SKU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Categories</FormLabel>
            <MultiSelect
              placeholder="Select categories"
              categories={categories.map((cat) => ({
                _id: cat._id,
                name: cat.name,
              }))}
              value={selectedCategories}
              onChange={handleCategoryChange}
              onRemove={handleCategoryRemove}
            />
          </FormItem>

          <FormItem>
            <FormLabel>Subcategories</FormLabel>
            <MultiSelect
              placeholder="Select subcategories"
              categories={availableSubcategories.map((sub) => ({
                _id: sub._id,
                name: sub.name,
              }))}
              value={selectedSubcategories}
              onChange={handleSubcategoryChange}
              onRemove={handleSubcategoryRemove}
            />
          </FormItem>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currencyRates.cnyToBdt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNY to BDT Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                      handleCurrencyChange(form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currencyRates.usdToBdt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>USD to BDT Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                      handleCurrencyChange(form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="inputCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Currency</FormLabel>
                <Select
                  onValueChange={(value: "CNY" | "USD") => {
                    field.onChange(value);
                    handleCurrencyChange({
                      ...form.getValues(),
                      inputCurrency: value,
                    });
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ({form.getValues("inputCurrency")})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Enter price in ${form.getValues("inputCurrency")}`}
                    value={
                      field.value[
                        form.getValues("inputCurrency").toLowerCase() as
                          | "cny"
                          | "usd"
                      ] || ""
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const currency = form
                        .getValues("inputCurrency")
                        .toLowerCase() as "cny" | "usd";
                      field.onChange({
                        ...field.value,
                        [currency]: value,
                      });
                      handleCurrencyChange({
                        ...form.getValues(),
                        price: {
                          ...form.getValues("price"),
                          [currency]: value,
                        },
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>BDT Price (Calculated)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="BDT Price"
                value={form.watch("price.bdt") || ""}
                disabled
                className="bg-muted"
              />
            </FormControl>
          </FormItem>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="expense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expense ({form.getValues("inputCurrency")})
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Enter expense in ${form.getValues("inputCurrency")}`}
                    value={
                      field.value[
                        form.getValues("inputCurrency").toLowerCase() as
                          | "cny"
                          | "usd"
                      ] || ""
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const currency = form
                        .getValues("inputCurrency")
                        .toLowerCase() as "cny" | "usd";
                      field.onChange({
                        ...field.value,
                        [currency]: value,
                      });
                      handleCurrencyChange({
                        ...form.getValues(),
                        expense: {
                          ...form.getValues("expense"),
                          [currency]: value,
                        },
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>BDT Expense (Calculated)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="BDT Expense"
                value={form.watch("expense.bdt") || ""}
                disabled
                className="bg-muted"
              />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="minimumOrderQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="media"
          render={() => (
            <FormItem>
              <FormLabel>Media</FormLabel>
              <FormControl>
                <MediaUpload
                  value={form.watch("media") || []}
                  onChange={handleMediaChange}
                  onRemove={handleMediaRemove}
                  multiple={false}
                  accept={["image"]}
                  folderId="products"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>Colors</FormLabel>
              <FormControl>
                <MediaUpload
                  value={form.watch("colors") || []}
                  onChange={handleColorChange}
                  onRemove={handleColorRemove}
                  multiple={true}
                  accept={["image", "video"]}
                  folderId="products/variants"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sizes</FormLabel>
              <FormControl>
                <MultiText
                  placeholder="Add sizes (e.g., S, M, L)"
                  value={field.value || []}
                  onChange={handleSizeChange}
                  onRemove={handleSizeRemove}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiText
                  placeholder="Add tags (e.g., summer, casual)"
                  value={field.value || []}
                  onChange={handleTagChange}
                  onRemove={handleTagRemove}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Quantity Pricing (Optional)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRange}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Range
            </Button>
          </div>

          {form.watch("quantityPricing.ranges")?.map((range, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Range {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRange(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormItem>
                  <FormLabel>Min Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      value={range.minQuantity || ""}
                      onChange={(e) =>
                        handleRangeChange(
                          index,
                          "minQuantity",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Max Quantity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      value={range.maxQuantity || ""}
                      onChange={(e) =>
                        handleRangeChange(
                          index,
                          "maxQuantity",
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>
                    Price ({form.getValues("inputCurrency")})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        range.price[
                          form.getValues("inputCurrency").toLowerCase() as
                            | "cny"
                            | "usd"
                        ] || ""
                      }
                      onChange={(e) =>
                        handleRangeChange(
                          index,
                          "price",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>BDT Price (Calculated)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={range.price.bdt || ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : initialData?._id
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
