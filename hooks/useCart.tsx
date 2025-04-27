// hooks/useCart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  item: {
    _id: string;
    title: string;
    description?: string;
    media?: Array<{ url: string; type: string }>;
    colors?: Array<{ url: string; type: string }>;
    sizes?: string[];
    minimumOrderQuantity?: number;
    price?: {
      cny: number;
      usd: number;
      bdt: number;
    };
    quantityPricing?: {
      ranges: Array<{
        minQuantity: number;
        maxQuantity?: number;
        price: {
          cny: number;
          usd: number;
          bdt: number;
        };
      }>;
    };
  };
  quantity: number;
  color: string;
  size: string;
  totalPrice: {
    cny: number;
    usd: number;
    bdt: number;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubTotal: () => {
    cny: number;
    usd: number;
    bdt: number;
  };
  getItemCount: () => number;
}

const calculateTotalPrice = (item: CartItem) => {
  // If unitPrice is undefined, return default values
  if (!item.item.price) {
    return {
      cny: 0,
      usd: 0,
      bdt: 0,
    };
  }
  return {
    cny: item.item.price.cny * item.quantity,
    usd: item.item.price.usd * item.quantity,
    bdt: item.item.price.bdt * item.quantity,
  };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Check if the item already exists in the cart
          const existingItemIndex = state.items.findIndex(
            (item) => item.item._id === newItem.item._id
          );

          if (existingItemIndex !== -1) {
            // If item exists, update its quantity and total price
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            updatedItems[existingItemIndex].totalPrice = calculateTotalPrice(
              updatedItems[existingItemIndex]
            );
            return { items: updatedItems };
          } else {
            // Calculate totalPrice for the new item before adding it
            const itemWithTotalPrice = {
              ...newItem,
              totalPrice: calculateTotalPrice(newItem),
            };
            return { items: [...state.items, itemWithTotalPrice] };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (product) => product.productId !== productId
          ),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((product) => {
            if (product.productId === productId) {
              const updatedItem = { ...product, quantity };
              updatedItem.totalPrice = calculateTotalPrice(updatedItem);
              return updatedItem;
            }
            return product;
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubTotal: () => {
        const items = get().items;
        return items.reduce(
          (total, product) => {
            // Calculate totalPrice if it's undefined or if unitPrice is undefined
            const itemTotalPrice =
              product.totalPrice || calculateTotalPrice(product);
            return {
              cny: total.cny + (itemTotalPrice?.cny || 0),
              usd: total.usd + (itemTotalPrice?.usd || 0),
              bdt: total.bdt + (itemTotalPrice?.bdt || 0),
            };
          },
          { cny: 0, usd: 0, bdt: 0 }
        );
      },

      getItemCount: () => {
        return get().items.reduce(
          (count, product) => count + product.quantity,
          0
        );
      },
    }),
    {
      name: 'k2b-cart-storage',
      skipHydration: typeof window === 'undefined',
    }
  )
);

export default useCart;
