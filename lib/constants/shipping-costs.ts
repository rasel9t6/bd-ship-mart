export interface SubCategory {
  name: string;
  cost: number;
}

export interface Category {
  name: string;
  cost: null;
  subcategories: Record<string, SubCategory>;
}

export const shippingCosts: Record<string, Category> = {
  jewelry: {
    name: "Jewelry",
    cost: null,
    subcategories: {
      chain: { name: "Chain", cost: 750 },
      ring: { name: "Ring", cost: 800 },
      bracelet: { name: "Bracelet", cost: 700 },
      necklace: { name: "Necklace", cost: 850 },
    },
  },
  electronics: {
    name: "Electronics",
    cost: null,
    subcategories: {
      smartphone: { name: "Smartphone", cost: 500 },
      laptop: { name: "Laptop", cost: 1000 },
    },
  },
};
