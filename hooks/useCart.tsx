// hooks/useCart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProductVariant {
  color: string;
  size: string;
  quantity: number;
  unitPrice: {
    cny: number;
    usd: number;
    bdt: number;
  };
  totalPrice: {
    cny: number;
    usd: number;
    bdt: number;
  };
}

export interface CartProduct {
  product: string; // Product ObjectId as string
  variants: CartProductVariant[];
}

export interface CartState {
  products: CartProduct[];
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
  deliveryType: string;
  shippingRate: {
    cny: number;
    usd: number;
    bdt: number;
  };
  totalAmount: {
    cny: number;
    usd: number;
    bdt: number;
  };
  totalDiscount: {
    cny: number;
    usd: number;
    bdt: number;
  };
  subTotal: {
    cny: number;
    usd: number;
    bdt: number;
  };
  estimatedDeliveryDate?: Date;
  paymentMethod: "cash" | "card" | "bkash";
  paymentCurrency: "CNY" | "USD" | "BDT";
  // Cart actions
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: string, variantIndex?: number) => void;
  updateProduct: (product: CartProduct) => void;
  clearCart: () => void;
  setOrderDetails: (
    details: Partial<
      Omit<
        CartState,
        | "products"
        | "addProduct"
        | "removeProduct"
        | "updateProduct"
        | "clearCart"
        | "setOrderDetails"
      >
    >,
  ) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      products: [],
      currencyRates: { usdToBdt: 121.5, cnyToBdt: 17.5 },
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      shippingMethod: "",
      deliveryType: "",
      shippingRate: { cny: 0, usd: 0, bdt: 0 },
      totalAmount: { cny: 0, usd: 0, bdt: 0 },
      totalDiscount: { cny: 0, usd: 0, bdt: 0 },
      subTotal: { cny: 0, usd: 0, bdt: 0 },
      paymentMethod: "cash",
      paymentCurrency: "BDT",
      estimatedDeliveryDate: undefined,

      addProduct: (newProduct) =>
        set((state) => {
          // Check if product already exists
          const existingProductIndex = state.products.findIndex(
            (p) => p.product === newProduct.product,
          );
          if (existingProductIndex !== -1) {
            // Merge variants (by color+size)
            const existingProduct = state.products[existingProductIndex];
            const updatedVariants = [...existingProduct.variants];
            newProduct.variants.forEach((newVariant) => {
              const matchIndex = updatedVariants.findIndex(
                (v) =>
                  v.color === newVariant.color && v.size === newVariant.size,
              );
              if (matchIndex !== -1) {
                // Update quantity and price
                const mergedQuantity =
                  updatedVariants[matchIndex].quantity + newVariant.quantity;
                updatedVariants[matchIndex] = {
                  ...newVariant,
                  quantity: mergedQuantity,
                  totalPrice: {
                    bdt: newVariant.unitPrice.bdt * mergedQuantity,
                    usd: newVariant.unitPrice.usd * mergedQuantity,
                    cny: newVariant.unitPrice.cny * mergedQuantity,
                  },
                };
              } else {
                updatedVariants.push(newVariant);
              }
            });
            const updatedProduct = {
              ...existingProduct,
              variants: updatedVariants,
            };
            return {
              ...state,
              products: state.products.map((p, i) =>
                i === existingProductIndex ? updatedProduct : p,
              ),
            };
          } else {
            // Add new product
            return {
              ...state,
              products: [...state.products, newProduct],
            };
          }
        }),
      removeProduct: (productId, variantIndex) =>
        set((state) => {
          const productIndex = state.products.findIndex(
            (p) => p.product === productId,
          );
          if (productIndex === -1) return state;
          if (typeof variantIndex === "number") {
            // Remove only the variant
            const updatedVariants = state.products[
              productIndex
            ].variants.filter((_, i) => i !== variantIndex);
            if (updatedVariants.length === 0) {
              // Remove the whole product if no variants left
              return {
                ...state,
                products: state.products.filter((_, i) => i !== productIndex),
              };
            } else {
              return {
                ...state,
                products: state.products.map((p, i) =>
                  i === productIndex ? { ...p, variants: updatedVariants } : p,
                ),
              };
            }
          } else {
            // Remove the whole product
            return {
              ...state,
              products: state.products.filter((p) => p.product !== productId),
            };
          }
        }),
      updateProduct: (updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.product === updatedProduct.product ? updatedProduct : p,
          ),
        })),
      clearCart: () =>
        set((state) => ({
          ...state,
          products: [],
        })),
      setOrderDetails: (details) =>
        set((state) => ({
          ...state,
          ...details,
        })),
    }),
    { name: "k2b-cart-storage" },
  ),
);

export default useCart;
