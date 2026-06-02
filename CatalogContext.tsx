import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type ProductCategory =
  | "base"
  | "booster"
  | "party"
  | "fermentados"
  | "molhos"
  | "cafe-cha"
  | "suplementos"
  | "equipamento"
  | "drinks"
  | "desserts";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description?: string;
  gradient?: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  percentOff: number;
};

const DEFAULT_PRODUCTS: CatalogProduct[] = [
  { id: "base-1", name: "BASE 1", price: 18, category: "base", description: "Essential performance plate", gradient: "from-green-100 to-emerald-50" },
  { id: "base-2", name: "BASE 2", price: 25, category: "base", description: "Elevated nutrition plate", gradient: "from-amber-100 to-yellow-50" },
  { id: "base-3", name: "BASE 3", price: 50, category: "base", description: "Premium athlete plate", gradient: "from-purple-100 to-fuchsia-50" },
  { id: "booster-molho", name: "Molho Booster", price: 3, category: "booster", description: "Custom performance sauce add-on", gradient: "from-orange-100 to-red-50" },
  { id: "party-custom", name: "Custom Party/Event Order", price: 0, category: "party", description: "Tailored group orders — price on request", gradient: "from-rose-100 to-pink-50" },
  { id: "ferm-kimchi", name: "Kimchi Fermentado", price: 8, category: "fermentados", gradient: "from-red-100 to-orange-50" },
  { id: "ferm-kombucha", name: "Kombucha Artesanal", price: 6, category: "fermentados", gradient: "from-teal-100 to-cyan-50" },
  { id: "ferm-sauerkraut", name: "Chucrute Tradicional", price: 7, category: "fermentados", gradient: "from-lime-100 to-green-50" },
  { id: "molho-verde", name: "Molho Verde Performance", price: 5, category: "molhos", gradient: "from-green-100 to-emerald-50" },
  { id: "molho-turmeric", name: "Molho Turmeric Gold", price: 5.5, category: "molhos", gradient: "from-yellow-100 to-amber-50" },
  { id: "molho-chili", name: "Molho Chili Boost", price: 5, category: "molhos", gradient: "from-red-100 to-orange-50" },
  { id: "cafe-matcha", name: "Matcha Latte", price: 4.5, category: "cafe-cha", gradient: "from-green-100 to-teal-50" },
  { id: "cafe-espresso", name: "Espresso Single Origin", price: 2.5, category: "cafe-cha", gradient: "from-stone-200 to-stone-100" },
  { id: "cha-ginger", name: "Chá Gengibre & Limão", price: 3, category: "cafe-cha", gradient: "from-amber-100 to-yellow-50" },
  { id: "supp-protein", name: "Plant Protein Blend", price: 32, category: "suplementos", gradient: "from-blue-100 to-indigo-50" },
  { id: "supp-omega", name: "Omega-3 Complex", price: 28, category: "suplementos", gradient: "from-cyan-100 to-blue-50" },
  { id: "supp-vitd", name: "Vitamin D3 + K2", price: 18, category: "suplementos", gradient: "from-orange-100 to-amber-50" },
  { id: "equip-pan", name: "Stainless Steel Pan 28cm", price: 45, category: "equipamento", gradient: "from-slate-200 to-slate-100" },
  { id: "equip-bottle", name: "Insulated Shaker Bottle", price: 22, category: "equipamento", gradient: "from-gray-100 to-gray-50" },
  { id: "drink-smoothie", name: "Green Power Smoothie", price: 5, category: "drinks", gradient: "from-lime-100 to-green-50" },
  { id: "drink-juice", name: "Cold-Pressed Juice", price: 4, category: "drinks", gradient: "from-orange-100 to-yellow-50" },
  { id: "dessert-granola", name: "Protein Granola Bar", price: 3.5, category: "desserts", gradient: "from-amber-100 to-orange-50" },
  { id: "dessert-brownie", name: "Avocado Brownie", price: 4, category: "desserts", gradient: "from-brown-100 to-amber-50" },
];

const DEFAULT_DISCOUNTS: DiscountCode[] = [
  { id: "disc-estudante", code: "estudante", percentOff: 30 },
];

type CatalogContextType = {
  products: CatalogProduct[];
  discounts: DiscountCode[];
  updateProductPrice: (id: string, price: number) => void;
  addDiscount: (code: string, percentOff: number) => void;
  updateDiscount: (id: string, code: string, percentOff: number) => void;
  removeDiscount: (id: string) => void;
  getProduct: (id: string) => CatalogProduct | undefined;
  validateDiscount: (code: string) => DiscountCode | null;
  getProductsByCategory: (category: ProductCategory) => CatalogProduct[];
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(DEFAULT_PRODUCTS);
  const [discounts, setDiscounts] = useState<DiscountCode[]>(DEFAULT_DISCOUNTS);

  const updateProductPrice = useCallback((id: string, price: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: Math.max(0, price) } : p))
    );
  }, []);

  const addDiscount = useCallback((code: string, percentOff: number) => {
    const normalized = code.trim().toLowerCase();
    if (!normalized || percentOff <= 0 || percentOff > 100) return;
    setDiscounts((prev) => {
      if (prev.some((d) => d.code === normalized)) return prev;
      return [...prev, { id: `disc-${Date.now()}`, code: normalized, percentOff }];
    });
  }, []);

  const updateDiscount = useCallback((id: string, code: string, percentOff: number) => {
    const normalized = code.trim().toLowerCase();
    if (!normalized || percentOff <= 0 || percentOff > 100) return;

    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === id ? { ...discount, code: normalized, percentOff } : discount
      )
    );
  }, []);

  const removeDiscount = useCallback((id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const validateDiscount = useCallback(
    (code: string): DiscountCode | null => {
      const normalized = code.trim().toLowerCase();
      return discounts.find((d) => d.code === normalized) ?? null;
    },
    [discounts]
  );

  const getProductsByCategory = useCallback(
    (category: ProductCategory) => products.filter((p) => p.category === category),
    [products]
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        discounts,
        updateProductPrice,
        addDiscount,
        updateDiscount,
        removeDiscount,
        getProduct,
        validateDiscount,
        getProductsByCategory,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within CatalogProvider");
  return context;
}
