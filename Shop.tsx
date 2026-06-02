import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import ProductShowcase from '@/components/ProductShowcase';

type ShopProps = {
  onNavigateLegal?: (page: "terms" | "privacy") => void;
};

export default function Shop({ onNavigateLegal }: ShopProps) {
  const { products } = useAuth();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F4F5F0] font-sans">
      {/* Brand Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span className="text-2xl font-serif font-bold text-[#4A5D4E] tracking-tight">Labdaivone Storefront</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("shop.searchPlaceholder")}
            className="w-full rounded-full border border-gray-200 bg-[#F8F8F5] px-4 py-2 text-sm outline-none transition focus:border-[#4A5D4E] md:max-w-sm"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductShowcase products={filteredProducts || []} />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-24 py-8 text-center text-xs text-gray-400 space-y-3">
        <div>© {new Date().getFullYear()} Labdaivone Ecosystem. All rights reserved. Deliberately engineered wellness.</div>
        <div className="flex justify-center gap-4">
          <button type="button" onClick={() => onNavigateLegal?.("terms")} className="hover:text-[#4A5D4E]">
            {t("legal.termsTitle")}
          </button>
          <button type="button" onClick={() => onNavigateLegal?.("privacy")} className="hover:text-[#4A5D4E]">
            {t("legal.privacyTitle")}
          </button>
        </div>
      </footer>
    </div>
  );
}