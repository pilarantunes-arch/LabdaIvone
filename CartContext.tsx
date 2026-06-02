import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useCatalog } from "./CatalogContext";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountPercent: number;
  discountAmount: number;
  total: number;
  applyDiscountCode: () => { success: boolean; message: string };
  clearDiscount: () => void;
  appliedDiscountCode: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { validateDiscount } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    if (newItem.price <= 0 && newItem.id === "party-custom") {
      setIsCartOpen(true);
      return;
    }
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscountCode(null);
    setDiscountPercent(0);
    setDiscountCode("");
  };

  const applyDiscountCode = useCallback((): { success: boolean; message: string } => {
    const match = validateDiscount(discountCode);
    if (!match) {
      setAppliedDiscountCode(null);
      setDiscountPercent(0);
      return { success: false, message: "Invalid discount code." };
    }
    setAppliedDiscountCode(match.code);
    setDiscountPercent(match.percentOff);
    return { success: true, message: `${match.percentOff}% discount applied!` };
  }, [discountCode, validateDiscount]);

  const clearDiscount = () => {
    setAppliedDiscountCode(null);
    setDiscountPercent(0);
    setDiscountCode("");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discountCode,
        setDiscountCode,
        discountPercent,
        discountAmount,
        total,
        applyDiscountCode,
        clearDiscount,
        appliedDiscountCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
