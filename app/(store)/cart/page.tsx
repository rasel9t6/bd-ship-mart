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
import OrderModal from "../orders/_components/OrderModal";

import toast from "react-hot-toast";
import EditCartItemModal from "./_components/EditCartItemModal";
import React from "react";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
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
  const subTotal = {
    bdt: allVariants.reduce((sum, v) => sum + (v.totalPrice?.bdt || 0), 0),
    usd: allVariants.reduce((sum, v) => sum + (v.totalPrice?.usd || 0), 0),
    cny: allVariants.reduce((sum, v) => sum + (v.totalPrice?.cny || 0), 0),
  };
  const hasItems = products.length > 0;

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

  // Fix orderData for OrderModal
  const orderData = {
    products: allVariants.map((v) => ({
      product: v.product,
      color: [v.color],
      size: [v.size],
      quantity: v.quantity,
      unitPrice: v.unitPrice,
      totalPrice: v.totalPrice,
    })),
    subTotal,
  };
  console.log(
    "Cart items>>",
    products.map((item) => item.product),
  );
  if (!hasItems) {
    return (
      <div className="container mx-auto py-16 px-4 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 pt-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center hover:bg-gray-100"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {products.map((product) => (
                        <React.Fragment key={product.product}>
                          <TableRow className="bg-gray-50">
                            <TableCell
                              colSpan={5}
                              className="font-bold text-lg"
                            >
                              Product: {product.product}
                            </TableCell>
                          </TableRow>
                          {product.variants.map((variant, variantIdx) => (
                            <TableRow
                              key={variantIdx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="relative h-10 w-10 rounded bg-gray-100 overflow-hidden border border-gray-200">
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
                                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                      <span>Size: {variant.size}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-700">
                                ৳{variant.unitPrice.bdt}
                              </TableCell>
                              <TableCell>
                                <span className="w-8 text-center font-medium">
                                  {variant.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
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
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardContent className="pt-6 px-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({itemCount})</span>
                    <span className="font-medium">
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as "bdt" | "usd" | "cny"
                      ].toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-700">
                      Calculated at checkout
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span className="text-gray-900">Subtotal</span>
                    <span className="text-gray-900">
                      {currencySymbols[selectedCurrency]}
                      {subTotal[
                        selectedCurrency.toLowerCase() as "bdt" | "usd" | "cny"
                      ].toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 px-6 py-6 bg-gray-50 border-t border-gray-200">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!hasItems}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>

            {!session && (
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">
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

      {session?.user && (
        <OrderModal
          open={orderModalOpen}
          onOpenChange={setOrderModalOpen}
          userId={session.user.id}
          orderData={orderData}
        />
      )}

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
