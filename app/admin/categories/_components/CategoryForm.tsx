"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/ui/button";
import MediaUpload from "@/ui/custom/MediaUpload";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Delete from "@/ui/custom/Delete";
import { Checkbox } from "@/ui/checkbox";

// Types matching MongoDB Schema
type Subcategory = {
  shippingCharge: {
    byAir: { min: number; max: number };
    bySea: { min: number; max: number };
  };
  name: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
  category: string;
};

interface CategoryFormProps {
  initialData?: {
    shippingCharge: {
      byAir: { min: number; max: number };
      bySea: { min: number; max: number };
    };
    _id: string;
    slug: string;
    name: string;
    title: string;
    description?: string;
    icon: string;
    thumbnail: string;
    isActive: boolean;
    sortOrder: number;
    subcategories: Subcategory[];
  } | null;
}

// Schemas matching MongoDB requirements
const subcategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  category: z.string().optional(),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, "Min shipping charge must be positive")
          .default(0),
        max: z
          .number()
          .min(0, "Max shipping charge must be positive")
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, "Min shipping charge must be positive")
          .default(0),
        max: z
          .number()
          .min(0, "Max shipping charge must be positive")
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  shippingCharge: z
    .object({
      byAir: z.object({
        min: z
          .number()
          .min(0, "Min shipping charge must be positive")
          .default(0),
        max: z
          .number()
          .min(0, "Max shipping charge must be positive")
          .default(0),
      }),
      bySea: z.object({
        min: z
          .number()
          .min(0, "Min shipping charge must be positive")
          .default(0),
        max: z
          .number()
          .min(0, "Max shipping charge must be positive")
          .default(0),
      }),
    })
    .default({
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    }),
  subcategories: z.array(subcategorySchema).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryForm = ({ initialData }: CategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [isSubcategoryVisible, setIsSubcategoryVisible] = useState(
    initialData &&
      Array.isArray(initialData.subcategories) &&
      initialData.subcategories.length > 0,
  );

  // Make sure subcategories is always an array
  const safeSubcategories =
    initialData && initialData.subcategories
      ? Array.isArray(initialData.subcategories)
        ? initialData.subcategories
        : []
      : [];

  // Format subcategories for the form
  const formattedSubcategories = safeSubcategories.map((sub) => ({
    ...sub,
    category: initialData?._id || "",
    shippingCharge: sub.shippingCharge || {
      byAir: { min: 0, max: 0 },
      bySea: { min: 0, max: 0 },
    },
  }));

  // Prepare default values for the form
  const defaultValues = initialData
    ? {
        ...initialData,
        shippingCharge: initialData.shippingCharge || {
          byAir: { min: 0, max: 0 },
          bySea: { min: 0, max: 0 },
        },
        subcategories: formattedSubcategories,
      }
    : {
        name: "",
        title: "",
        description: "",
        icon: "",
        thumbnail: "",
        isActive: true,
        sortOrder: 0,
        shippingCharge: {
          byAir: { min: 0, max: 0 },
          bySea: { min: 0, max: 0 },
        },
        subcategories: [],
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  // If needed, fetch subcategories data from API
  useEffect(() => {
    // Only run if we have initialData but fields are empty
    if (
      initialData?._id &&
      fields.length === 0 &&
      formattedSubcategories.length > 0
    ) {
      // Use setValue instead of replace to avoid errors
      form.setValue("subcategories", formattedSubcategories);
    }
  }, [initialData, fields.length, form, formattedSubcategories]);

  // Debug logging
  useEffect(() => {
    if (initialData) {
      console.log("Initial subcategories:", formattedSubcategories);
      console.log("Current fields:", fields);
    }
  }, [initialData, fields, formattedSubcategories]);

  const handleFormSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Format the data for the API
      const formattedData = {
        ...values,
        subcategories: values.subcategories.map((sub, index) => ({
          ...sub,
          sortOrder: index,
          category: initialData?._id || "", // Will be set by API for new categories
        })),
      };

      const url = initialData
        ? `/api/categories/${initialData.slug}`
        : "/api/categories";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save category");
      }

      toast.success(
        `Category ${initialData ? "updated" : "created"} successfully`,
      );
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
      console.error("Category submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {initialData ? "Edit Category" : "Create Category"}
        </CardTitle>
        {initialData && <Delete id={initialData.slug} item="category" />}
      </CardHeader>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6 pt-6">
            {/* Main Category Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category title..." {...field} />
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
                    <Textarea
                      placeholder="Describe your category..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shipping Charge Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Charge (BDT)</h2>

              {/* By Air */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingCharge.byAir.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>By Air - Min</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Min charge for Air..."
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCharge.byAir.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>By Air - Max</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Max charge for Air..."
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* By Sea */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingCharge.bySea.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>By Sea - Min</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Min charge for Sea..."
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCharge.bySea.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>By Sea - Max</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Max charge for Sea..."
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <MediaUpload
                        value={
                          field.value
                            ? [{ url: field.value, type: "image" }]
                            : []
                        }
                        onChange={(url) => form.setValue("icon", url)}
                        onRemove={() => form.setValue("icon", "")}
                        folderId="icons"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <MediaUpload
                        value={
                          field.value
                            ? [{ url: field.value, type: "image" }]
                            : []
                        }
                        onChange={(url) => form.setValue("thumbnail", url)}
                        onRemove={() => form.setValue("thumbnail", "")}
                        folderId="thumbnails"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter sort order..."
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>Active Status</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Subcategories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Subcategories</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setIsSubcategoryVisible(!isSubcategoryVisible)
                    }
                  >
                    {isSubcategoryVisible ? "Hide" : "Show"} Subcategories
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsSubcategoryVisible(true);
                      append({
                        name: "",
                        title: "",
                        description: "",
                        icon: "",
                        thumbnail: "",
                        isActive: true,
                        sortOrder: fields.length,
                        category: initialData?._id || "",
                        shippingCharge: {
                          byAir: { min: 0, max: 0 },
                          bySea: { min: 0, max: 0 },
                        },
                      });
                    }}
                  >
                    Add Subcategory
                  </Button>
                </div>
              </div>

              {isSubcategoryVisible &&
                fields.map((field, index) => (
                  <Card key={field.id} className="border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <h3 className="text-lg font-medium">
                        Subcategory {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`subcategories.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter subcategory name..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subcategories.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter subcategory title..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subcategories.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your subcategory..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Media Upload for Subcategory */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.icon`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <FormControl>
                                <MediaUpload
                                  value={
                                    field.value
                                      ? [{ url: field.value, type: "image" }]
                                      : []
                                  }
                                  onChange={(url) =>
                                    form.setValue(
                                      `subcategories.${index}.icon`,
                                      url,
                                    )
                                  }
                                  onRemove={() =>
                                    form.setValue(
                                      `subcategories.${index}.icon`,
                                      "",
                                    )
                                  }
                                  folderId="icons"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`subcategories.${index}.thumbnail`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thumbnail</FormLabel>
                              <FormControl>
                                <MediaUpload
                                  value={
                                    field.value
                                      ? [{ url: field.value, type: "image" }]
                                      : []
                                  }
                                  onChange={(url) =>
                                    form.setValue(
                                      `subcategories.${index}.thumbnail`,
                                      url,
                                    )
                                  }
                                  onRemove={() =>
                                    form.setValue(
                                      `subcategories.${index}.thumbnail`,
                                      "",
                                    )
                                  }
                                  folderId="thumbnails"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Shipping Charge Section for Subcategory */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Shipping Charge
                        </h3>

                        {/* By Air */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`subcategories.${index}.shippingCharge.byAir.min`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>By Air - Min</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`subcategories.${index}.shippingCharge.byAir.max`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>By Air - Max</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* By Sea */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`subcategories.${index}.shippingCharge.bySea.min`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>By Sea - Min</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`subcategories.${index}.shippingCharge.bySea.max`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>By Sea - Max</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name={`subcategories.${index}.isActive`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <FormLabel>Active Status</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`subcategories.${index}.sortOrder`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sort Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter sort order..."
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>

          <CardFooter className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : `Save ${initialData ? "Changes" : "Category"}`}
            </Button>
            <Link href="/admin/categories">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CategoryForm;
