"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/ui/button";
import { Card, CardContent, CardFooter } from "@/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Separator } from "@/ui/separator";

import { useCart, CartProduct, CartProductVariant } from "@/hooks/useCart";

import toast from "react-hot-toast";
import EditCartItemModal from "./_components/EditCartItemModal";
import React from "react";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedCurrency] = useState<"BDT" | "USD" | "CNY">("BDT");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CartProduct | null>(
    null,
  );
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null,
  );

  const { products, removeProduct, updateProduct } = useCart();

  // Flatten all variants for summary and modal
  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, product: p.product })),
  );

  const itemCount = allVariants.reduce((sum, v) => sum + v.quantity, 0);
  const hasItems = products.length > 0;

  // Calculate subtotal
  const subtotal = allVariants.reduce(
    (sum, variant) => sum + variant.totalPrice.bdt,
    0,
  );

  // Currency symbols
  const currencySymbols = {
    BDT: "৳",
    USD: "$",
    CNY: "¥",
  };

  const handleCheckout = () => {
    if (!hasItems) return; // Prevent checkout if cart is empty

    if (!session) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Navigate to checkout route
    router.push("/checkout");
  };


  if (!hasItems) {
    return (
      <div className="container mx-auto py-16 px-4 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart className="w-20 h-20 mx-auto text-blue-500 mb-8" />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Link href="/">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 pt-32 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="flex items-center hover:bg-gray-100 border-gray-300 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {products.map((product) => (
                        <React.Fragment key={product.product}>
                          <TableRow className="bg-blue-50">
                            <TableCell
                              colSpan={5}
                              className="font-bold text-lg text-blue-900 py-4"
                            >
                              Product: {product.product}
                            </TableCell>
                          </TableRow>
                          {product.variants.map((variant, variantIdx) => (
                            <TableRow
                              key={variantIdx}
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <TableCell className="py-6">
                                <div className="flex items-center space-x-4">
                                  <div className="relative h-16 w-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
                                    {variant.color && (
                                      <Image
                                        src={
                                          variant.color.startsWith("http")
                                            ? variant.color
                                            : `/api/media/${variant.color}`
                                        }
                                        alt="Color variant"
                                        fill
                                        className="object-cover w-full h-full"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                      <span className="font-medium">
                                        Size: {variant.size}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-700 font-medium">
                                ৳{variant.unitPrice.bdt}
                              </TableCell>
                              <TableCell>
                                <span className="w-8 text-center font-medium text-gray-900">
                                  {variant.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900">
                                ৳{variant.totalPrice.bdt}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setEditingVariantIndex(variantIdx);
                                    setEditModalOpen(true);
                                  }}
                                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden bg-white sticky top-32">
              <CardContent className="pt-6 px-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({itemCount})</span>
                    <span className="font-medium text-gray-900">
                      {currencySymbols[selectedCurrency]}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-700">
                      Calculated at checkout
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-semibold text-xl pt-2">
                    <span className="text-gray-900">Subtotal</span>
                    <span className="text-gray-900">
                      {currencySymbols[selectedCurrency]}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 px-6 py-6 bg-gray-50 border-t border-gray-200">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!hasItems}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>

            {!session && (
              <Alert className="mt-4 bg-amber-50 border-amber-200 rounded-lg shadow-sm">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-semibold">
                  Login Required
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  You need to be logged in to complete your purchase.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal for a variant */}
      {editingProduct && editingVariantIndex !== null && (
        <EditCartItemModal
          open={editModalOpen}
          item={editingProduct.variants[editingVariantIndex]}
          onClose={() => setEditModalOpen(false)}
          onUpdate={(updatedVariant: CartProductVariant) => {
            const updatedVariants = [...editingProduct.variants];
            updatedVariants[editingVariantIndex] = updatedVariant;
            updateProduct({ ...editingProduct, variants: updatedVariants });
            setEditModalOpen(false);
          }}
          onDelete={() => {
            removeProduct(editingProduct.product, editingVariantIndex);
            setEditModalOpen(false);
          }}
          onMinQty={() =>
            toast.error("Cannot go below minimum order quantity!")
          }
        />
      )}
    </div>
  );
}
