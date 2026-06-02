import { useMemo, useState } from "react";
import { useEffect } from "react";
import type { FormEvent } from "react";
import ProductShowcase from "@/components/ProductShowcase";
import { Article, Product, ProductSection, UserProfile, WellnessGoal, useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { useLocale } from "@/context/LocaleContext";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  price: 0,
  imageUrl: "",
  category: "Base",
  inStock: true,
  waitlistEmails: [],
  accentColor: "#4A5D4E",
  sectionColor: "#F4F5F0",
};

const EMPTY_ARTICLE: Omit<Article, "id" | "comments"> = {
  title: "",
  category: "Nutrition",
  content: "",
  imageUrl: "",
};

type AdminTab = "orders" | "homepage" | "sections" | "products" | "waitlist" | "knowledge" | "discounts" | "clients";

export default function AdminPortal() {
  const {
    user,
    users,
    products,
    setProducts,
    productSections,
    setProductSections,
    orders,
    articles,
    setArticles,
    homepageContent,
    setHomepageContent,
    updateClientProfile,
  } = useAuth();
  const { discounts, addDiscount, updateDiscount, removeDiscount } = useCatalog();
  const { t } = useLocale();

  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [isCustomerMode, setIsCustomerMode] = useState(false);

  const [productDraft, setProductDraft] = useState<Omit<Product, "id">>(EMPTY_PRODUCT);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const [sectionNameDraft, setSectionNameDraft] = useState("");
  const [sectionSubtitleDraft, setSectionSubtitleDraft] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [articleDraft, setArticleDraft] = useState<Omit<Article, "id" | "comments">>(EMPTY_ARTICLE);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [discountCodeDraft, setDiscountCodeDraft] = useState("");
  const [discountPercentDraft, setDiscountPercentDraft] = useState("10");
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);

  const [homepageBioDraft, setHomepageBioDraft] = useState(homepageContent.bio);
  const [homepageGalleryDraft, setHomepageGalleryDraft] = useState(homepageContent.galleryImages.join("\n"));
  const [homepageInstagramDraft, setHomepageInstagramDraft] = useState(homepageContent.instagram);
  const [homepagePhoneDraft, setHomepagePhoneDraft] = useState(homepageContent.phone);

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [challengeDraft, setChallengeDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");

  const selectedClient = users.find((client) => client.id === selectedClientId) || null;

  useEffect(() => {
    setHomepageBioDraft(homepageContent.bio);
    setHomepageGalleryDraft(homepageContent.galleryImages.join("\n"));
    setHomepageInstagramDraft(homepageContent.instagram);
    setHomepagePhoneDraft(homepageContent.phone);
  }, [homepageContent]);

  const filteredClients = useMemo(() => {
    const search = clientSearch.trim().toLowerCase();
    if (!search) return users;
    return users.filter((client) =>
      `${client.name} ${client.usertag}`.toLowerCase().includes(search)
    );
  }, [clientSearch, users]);

  const resetProductForm = () => {
    setProductDraft({ ...EMPTY_PRODUCT, category: productSections[0]?.name || "Base" });
    setEditingProductId(null);
    setIsProductFormOpen(false);
  };

  const openProductEditor = (product: Product) => {
    setProductDraft({
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      inStock: product.inStock,
      waitlistEmails: product.waitlistEmails ?? [],
      accentColor: product.accentColor || "#4A5D4E",
      sectionColor: product.sectionColor || "#F4F5F0",
    });
    setEditingProductId(product.id);
    setIsProductFormOpen(true);
  };

  const saveProduct = (event: FormEvent) => {
    event.preventDefault();
    if (!productDraft.name.trim()) return;

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? { ...product, ...productDraft, price: Number(productDraft.price) || 0 }
            : product
        )
      );
    } else {
      setProducts((current) => [
        ...current,
        {
          ...productDraft,
          id: `product-${Date.now()}`,
          price: Number(productDraft.price) || 0,
        },
      ]);
    }

    resetProductForm();
  };

  const handleToggleProductStock = (product: Product) => {
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  const resetSectionForm = () => {
    setSectionNameDraft("");
    setSectionSubtitleDraft("");
    setEditingSectionId(null);
  };

  const openSectionEditor = (section: ProductSection) => {
    setEditingSectionId(section.id);
    setSectionNameDraft(section.name);
    setSectionSubtitleDraft(section.subtitle);
  };

  const saveSection = (event: FormEvent) => {
    event.preventDefault();
    const nextName = sectionNameDraft.trim();
    if (!nextName) return;

    if (editingSectionId) {
      const currentSection = productSections.find((section) => section.id === editingSectionId);
      setProductSections((current) =>
        current.map((section) =>
          section.id === editingSectionId
            ? { ...section, name: nextName, subtitle: sectionSubtitleDraft.trim() }
            : section
        )
      );

      if (currentSection && currentSection.name !== nextName) {
        setProducts((current) =>
          current.map((product) =>
            product.category === currentSection.name ? { ...product, category: nextName } : product
          )
        );
      }
    } else {
      setProductSections((current) => {
        if (current.some((section) => section.name.toLowerCase() === nextName.toLowerCase())) return current;
        return [
          ...current,
          {
            id: `section-${Date.now()}`,
            name: nextName,
            subtitle: sectionSubtitleDraft.trim() || "Curated Labdaivone products",
          },
        ];
      });
    }

    resetSectionForm();
  };

  const deleteSection = (section: ProductSection) => {
    setProductSections((current) => current.filter((item) => item.id !== section.id));
    setProducts((current) => current.filter((product) => product.category !== section.name));
    if (editingSectionId === section.id) resetSectionForm();
  };

  const resetArticleForm = () => {
    setArticleDraft(EMPTY_ARTICLE);
    setEditingArticleId(null);
  };

  const saveArticle = (event: FormEvent) => {
    event.preventDefault();
    if (!articleDraft.title.trim() || !articleDraft.content.trim()) return;

    if (editingArticleId) {
      setArticles((current) =>
        current.map((article) =>
          article.id === editingArticleId ? { ...article, ...articleDraft } : article
        )
      );
    } else {
      setArticles((current) => [
        {
          ...articleDraft,
          id: `article-${Date.now()}`,
          comments: [],
        },
        ...current,
      ]);
    }

    resetArticleForm();
  };

  const resetDiscountForm = () => {
    setDiscountCodeDraft("");
    setDiscountPercentDraft("10");
    setEditingDiscountId(null);
  };

  const saveDiscount = (event: FormEvent) => {
    event.preventDefault();
    const percent = Number(discountPercentDraft);
    if (!discountCodeDraft.trim() || Number.isNaN(percent)) return;

    if (editingDiscountId) {
      updateDiscount(editingDiscountId, discountCodeDraft, percent);
    } else {
      addDiscount(discountCodeDraft, percent);
    }

    resetDiscountForm();
  };

  const saveHomepage = (event: FormEvent) => {
    event.preventDefault();
    setHomepageContent({
      bio: homepageBioDraft,
      galleryImages: homepageGalleryDraft
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      instagram: homepageInstagramDraft.trim(),
      phone: homepagePhoneDraft.trim(),
    });
  };

  const openClientWorkspace = (client: UserProfile) => {
    setSelectedClientId(client.id);
    setChallengeDraft(client.currentChallenge);
    setGoalDraft("");
  };

  const updateSelectedClient = (updater: (client: UserProfile) => UserProfile) => {
    if (!selectedClientId) return;
    updateClientProfile(selectedClientId, updater);
  };

  const addGoal = () => {
    const text = goalDraft.trim();
    if (!text) return;
    updateSelectedClient((client) => ({
      ...client,
      goals: [...client.goals, { id: `goal-${Date.now()}`, text, completed: false }],
    }));
    setGoalDraft("");
  };

  const updateGoal = (goalId: string, updater: (goal: WellnessGoal) => WellnessGoal) => {
    updateSelectedClient((client) => ({
      ...client,
      goals: client.goals.map((goal) => (goal.id === goalId ? updater(goal) : goal)),
      goalCompleted: client.goals.every((goal) => (goal.id === goalId ? updater(goal).completed : goal.completed)),
    }));
  };

  const deleteGoal = (goalId: string) => {
    updateSelectedClient((client) => {
      const goals = client.goals.filter((goal) => goal.id !== goalId);
      return { ...client, goals, goalCompleted: goals.length > 0 && goals.every((goal) => goal.completed) };
    });
  };

  if (isCustomerMode) {
    return (
      <div className="min-h-screen bg-[#F4F5F0] font-sans">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{t("admin.customerSandbox")}</p>
              <h1 className="font-serif text-2xl font-bold text-[#4A5D4E]">Labdaivone Storefront</h1>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomerMode(false)}
              className="rounded-full bg-[#4A5D4E] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#3b4c3e]"
            >
              🔧 {t("admin.adminEditMode")}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8">
          <ProductShowcase products={products} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F0] px-4 py-8 font-sans text-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4A5D4E]/60">{t("admin.signedInAs")} {user?.email || user?.name}</p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#4A5D4E]">{t("admin.dashboardTitle")}</h1>
              <p className="mt-2 text-sm text-gray-500">{t("admin.dashboardSubtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomerMode(true)}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-amber-600"
            >
              👁️ {t("admin.viewAsCustomerMode")}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-white/70 bg-white p-4 shadow-sm">
            {[
              ["orders", t("admin.tabs.orders")],
              ["homepage", t("admin.tabs.homepage")],
              ["sections", t("admin.tabs.sections")],
              ["products", t("admin.tabs.products")],
              ["waitlist", t("admin.tabs.waitlist")],
              ["knowledge", t("admin.tabs.knowledge")],
              ["discounts", t("admin.tabs.discounts")],
              ["clients", t("admin.tabs.clients")],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as AdminTab)}
                className={`mb-2 w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  activeTab === id ? "bg-[#4A5D4E] text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </aside>

          <main className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm md:p-8">
            {activeTab === "orders" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.orders.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.orders.subtitle")}</p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-200">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">{t("admin.orders.empty")}</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="border-b border-gray-100 p-5 last:border-b-0">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-mono text-lg font-black text-[#4A5D4E]">{order.id}</h3>
                              <span className={`rounded-full px-3 py-1 text-xs font-black ${
                                order.status === "Pending Payment" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {order.customerName}{order.customerEmail ? ` · ${order.customerEmail}` : ""}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#F8F8F5] p-4 text-sm lg:min-w-64">
                            <p className="font-black text-gray-800">{t("admin.orders.paymentMethod")}: {order.paymentMethod}</p>
                            <p className="mt-1 text-gray-600">{t("admin.orders.total")}: €{order.total.toFixed(2)}</p>
                            {order.mbWayPhone && <p className="mt-1 text-gray-600">MB WAY: {order.mbWayPhone}</p>}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{t("admin.orders.items")}</p>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {order.items.map((item) => (
                              <li key={`${order.id}-${item.id}`} className="flex justify-between gap-4">
                                <span>{item.name} x{item.quantity}</span>
                                <span>€{(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {order.adminNotification && (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                            {order.adminNotification}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "homepage" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.homepage.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.homepage.subtitle")}</p>
                </div>

                <form onSubmit={saveHomepage} className="space-y-5 rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5">
                  <label className="block space-y-1 text-sm font-bold">
                    {t("admin.homepage.bio")}
                    <textarea
                      value={homepageBioDraft}
                      onChange={(event) => setHomepageBioDraft(event.target.value)}
                      className="min-h-52 w-full rounded-xl border p-3 font-normal"
                    />
                  </label>

                  <label className="block space-y-1 text-sm font-bold">
                    {t("admin.homepage.galleryUrls")}
                    <textarea
                      value={homepageGalleryDraft}
                      onChange={(event) => setHomepageGalleryDraft(event.target.value)}
                      className="min-h-36 w-full rounded-xl border p-3 font-mono text-xs font-normal"
                      placeholder={t("admin.homepage.galleryPlaceholder")}
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.homepage.instagram")}
                      <input
                        value={homepageInstagramDraft}
                        onChange={(event) => setHomepageInstagramDraft(event.target.value)}
                        className="w-full rounded-xl border p-3 font-normal"
                      />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.homepage.phone")}
                      <input
                        value={homepagePhoneDraft}
                        onChange={(event) => setHomepagePhoneDraft(event.target.value)}
                        className="w-full rounded-xl border p-3 font-normal"
                      />
                    </label>
                  </div>

                  <button type="submit" className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                    {t("admin.homepage.save")}
                  </button>
                </form>

                <div className="rounded-3xl border border-[#4A5D4E]/10 bg-white p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#4A5D4E]/60">{t("admin.homepage.preview")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {homepageGalleryDraft
                      .split("\n")
                      .map((url) => url.trim())
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((url, index) => (
                        <img key={`${url}-${index}`} src={url} alt="" className="h-28 w-full rounded-2xl object-cover" />
                      ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "sections" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.sections.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.sections.subtitle")}</p>
                </div>

                <form onSubmit={saveSection} className="grid grid-cols-1 gap-4 rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                  <label className="space-y-1 text-sm font-bold">
                    {t("admin.sections.name")}
                    <input
                      value={sectionNameDraft}
                      onChange={(event) => setSectionNameDraft(event.target.value)}
                      className="w-full rounded-xl border p-3 font-normal"
                      placeholder="Base"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-bold">
                    {t("admin.sections.subtitleLabel")}
                    <input
                      value={sectionSubtitleDraft}
                      onChange={(event) => setSectionSubtitleDraft(event.target.value)}
                      className="w-full rounded-xl border p-3 font-normal"
                      placeholder={t("admin.sections.subtitlePlaceholder")}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                      {editingSectionId ? t("admin.sections.save") : t("admin.sections.create")}
                    </button>
                    {editingSectionId && (
                      <button type="button" onClick={resetSectionForm} className="rounded-xl border px-4 py-3 text-sm font-bold">
                        {t("admin.cancel")}
                      </button>
                    )}
                  </div>
                </form>

                <div className="overflow-hidden rounded-3xl border border-gray-200">
                  {productSections.map((section) => {
                    const productCount = products.filter((product) => product.category === section.name).length;

                    return (
                      <div key={section.id} className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-black text-[#4A5D4E]">{section.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{section.subtitle}</p>
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                            {productCount} {t("admin.sections.products")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openSectionEditor(section)}
                            className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                          >
                            {t("admin.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSection(section)}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === "products" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{t("admin.products.title")}</h2>
                    <p className="text-sm text-gray-500">{t("admin.products.subtitle")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductDraft({ ...EMPTY_PRODUCT, category: productSections[0]?.name || "Base" });
                      setEditingProductId(null);
                      setIsProductFormOpen(true);
                    }}
                    className="rounded-full bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-[#3b4c3e]"
                  >
                    {t("admin.products.addNew")}
                  </button>
                </div>

                {isProductFormOpen && (
                  <form onSubmit={saveProduct} className="grid grid-cols-1 gap-4 rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5 md:grid-cols-2">
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.name")}
                      <input className="w-full rounded-xl border p-3 font-normal" value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.price")}
                      <input className="w-full rounded-xl border p-3 font-normal" type="number" step="0.01" min="0" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: Number(event.target.value) })} />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.destination")}
                      <select className="w-full rounded-xl border p-3 font-normal" value={productDraft.category} onChange={(event) => setProductDraft({ ...productDraft, category: event.target.value })}>
                        {productSections.map((section) => <option key={section.id} value={section.name}>{section.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.imageUrl")}
                      <input className="w-full rounded-xl border p-3 font-normal" value={productDraft.imageUrl} onChange={(event) => setProductDraft({ ...productDraft, imageUrl: event.target.value })} />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border bg-white p-3 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={productDraft.inStock}
                        onChange={(event) => setProductDraft({ ...productDraft, inStock: event.target.checked })}
                        className="h-4 w-4 accent-[#4A5D4E]"
                      />
                      {t("admin.products.inStockToggle")}
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.accentColor")}
                      <input className="h-12 w-full rounded-xl border p-1" type="color" value={productDraft.accentColor} onChange={(event) => setProductDraft({ ...productDraft, accentColor: event.target.value })} />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.products.sectionTint")}
                      <input className="h-12 w-full rounded-xl border p-1" type="color" value={productDraft.sectionColor} onChange={(event) => setProductDraft({ ...productDraft, sectionColor: event.target.value })} />
                    </label>
                    <div className="flex gap-3 md:col-span-2">
                      <button type="submit" className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                        {editingProductId ? t("admin.products.saveChanges") : t("admin.products.create")}
                      </button>
                      <button type="button" onClick={resetProductForm} className="rounded-xl border px-5 py-3 text-sm font-bold text-gray-600 hover:bg-white">
                        {t("admin.cancel")}
                      </button>
                    </div>
                  </form>
                )}

                <ProductShowcase
                  products={products}
                  editorMode
                  onEditProduct={openProductEditor}
                  onDeleteProduct={(id) => setProducts((current) => current.filter((product) => product.id !== id))}
                  onToggleStock={handleToggleProductStock}
                />
              </section>
            )}

            {activeTab === "waitlist" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.waitlist.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.waitlist.subtitle")}</p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-200">
                  {products.filter((product) => !product.inStock).length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">{t("admin.waitlist.empty")}</div>
                  ) : (
                    products
                      .filter((product) => !product.inStock)
                      .map((product) => (
                        <div key={product.id} className="border-b border-gray-100 p-5 last:border-b-0">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-black text-[#4A5D4E]">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                              {product.waitlistEmails?.length || 0} {t("admin.waitlist.emails")}
                            </span>
                          </div>

                          {(product.waitlistEmails?.length || 0) === 0 ? (
                            <p className="mt-4 rounded-2xl bg-[#F8F8F5] p-4 text-sm text-gray-500">{t("admin.waitlist.noEmails")}</p>
                          ) : (
                            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                              {product.waitlistEmails.map((email) => (
                                <li key={`${product.id}-${email}`} className="rounded-xl border bg-white px-3 py-2 text-sm text-gray-700">
                                  {email}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "knowledge" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.knowledge.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.knowledge.subtitle")}</p>
                </div>

                <form onSubmit={saveArticle} className="space-y-4 rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.knowledge.articleTitle")}
                      <input className="w-full rounded-xl border p-3 font-normal" value={articleDraft.title} onChange={(event) => setArticleDraft({ ...articleDraft, title: event.target.value })} />
                    </label>
                    <label className="space-y-1 text-sm font-bold">
                      {t("admin.knowledge.category")}
                      <select className="w-full rounded-xl border p-3 font-normal" value={articleDraft.category} onChange={(event) => setArticleDraft({ ...articleDraft, category: event.target.value })}>
                        <option>Nutrition</option>
                        <option>Mindset</option>
                        <option>Fitness</option>
                      </select>
                    </label>
                  </div>
                  <label className="block space-y-1 text-sm font-bold">
                    {t("admin.knowledge.content")}
                    <textarea className="min-h-36 w-full rounded-xl border p-3 font-normal" value={articleDraft.content} onChange={(event) => setArticleDraft({ ...articleDraft, content: event.target.value })} />
                  </label>
                  <label className="block space-y-1 text-sm font-bold">
                    {t("admin.knowledge.imageUrl")}
                    <input className="w-full rounded-xl border p-3 font-normal" value={articleDraft.imageUrl || ""} onChange={(event) => setArticleDraft({ ...articleDraft, imageUrl: event.target.value })} />
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                      {editingArticleId ? t("admin.knowledge.update") : t("admin.knowledge.publish")}
                    </button>
                    {editingArticleId && (
                      <button type="button" onClick={resetArticleForm} className="rounded-xl border px-5 py-3 text-sm font-bold text-gray-600">
                        {t("admin.knowledge.cancelEdit")}
                      </button>
                    )}
                  </div>
                </form>

                <div className="overflow-hidden rounded-3xl border border-gray-200">
                  {articles.map((article) => (
                    <div key={article.id} className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="rounded-full bg-[#4A5D4E]/10 px-3 py-1 text-xs font-bold text-[#4A5D4E]">{article.category}</span>
                        <h3 className="mt-2 text-lg font-black">{article.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{article.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticleId(article.id);
                            setArticleDraft({
                              title: article.title,
                              category: article.category,
                              content: article.content,
                              imageUrl: article.imageUrl || "",
                            });
                          }}
                          className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                        >
                          {t("admin.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticles((current) => current.filter((item) => item.id !== article.id))}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "clients" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.clients.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.clients.subtitle")}</p>
                </div>

                <input
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder={t("admin.clients.search")}
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8F8F5] p-4 text-sm outline-none focus:border-[#4A5D4E]"
                />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => openClientWorkspace(client)}
                      className="rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black">{client.name}</h3>
                          <p className="text-sm text-gray-500">{client.usertag} · {client.email}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${client.goalCompleted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {client.goalCompleted ? t("admin.clients.completed") : t("admin.clients.pending")}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-[#F4F5F0] p-3">
                          <p className="text-xs font-bold uppercase text-gray-400">{t("admin.clients.currentStreak")}</p>
                          <p className="text-xl font-black text-[#4A5D4E]">{client.streak} {t("admin.clients.days")}</p>
                        </div>
                        <div className="rounded-2xl bg-[#F4F5F0] p-3">
                          <p className="text-xs font-bold uppercase text-gray-400">{t("admin.clients.goals")}</p>
                          <p className="text-xl font-black text-[#4A5D4E]">{client.goals.filter((goal) => goal.completed).length}/{client.goals.length}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "discounts" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black">{t("admin.discounts.title")}</h2>
                  <p className="text-sm text-gray-500">{t("admin.discounts.subtitle")}</p>
                </div>

                <form onSubmit={saveDiscount} className="grid grid-cols-1 gap-4 rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5 md:grid-cols-[1fr_160px_auto] md:items-end">
                  <label className="space-y-1 text-sm font-bold">
                    {t("admin.discounts.code")}
                    <input
                      className="w-full rounded-xl border p-3 font-normal uppercase"
                      value={discountCodeDraft}
                      onChange={(event) => setDiscountCodeDraft(event.target.value)}
                      placeholder="ESTUDANTE"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-bold">
                    {t("admin.discounts.percentOff")}
                    <input
                      className="w-full rounded-xl border p-3 font-normal"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={discountPercentDraft}
                      onChange={(event) => setDiscountPercentDraft(event.target.value)}
                    />
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                      {editingDiscountId ? t("admin.save") : t("admin.add")}
                    </button>
                    {editingDiscountId && (
                      <button type="button" onClick={resetDiscountForm} className="rounded-xl border px-4 py-3 text-sm font-bold">
                        {t("admin.cancel")}
                      </button>
                    )}
                  </div>
                </form>

                <div className="overflow-hidden rounded-3xl border border-gray-200">
                  {discounts.map((discount) => (
                    <div key={discount.id} className="flex flex-col gap-4 border-b border-gray-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-mono text-lg font-black uppercase text-[#4A5D4E]">{discount.code}</p>
                        <p className="text-sm text-gray-500">{discount.percentOff}% {t("admin.discounts.checkoutOff")}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDiscountId(discount.id);
                            setDiscountCodeDraft(discount.code);
                            setDiscountPercentDraft(String(discount.percentOff));
                          }}
                          className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50"
                        >
                          {t("admin.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeDiscount(discount.id);
                            if (editingDiscountId === discount.id) resetDiscountForm();
                          }}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4 border-b pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4A5D4E]/60">{t("admin.clients.focusedWorkspace")}</p>
                <h3 className="mt-1 text-2xl font-black">{selectedClient.name}</h3>
                <p className="text-sm text-gray-500">{selectedClient.usertag} · {selectedClient.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedClientId(null)} className="rounded-full border px-3 py-1 text-sm font-bold hover:bg-gray-50">
                {t("admin.clients.close")}
              </button>
            </div>

            <div className="space-y-8">
              <section className="rounded-3xl border border-gray-200 bg-[#F8F8F5] p-5">
                <h4 className="text-lg font-black">{t("admin.clients.dailyChallenge")}</h4>
                <p className="mt-1 text-sm text-gray-500">{t("admin.clients.currentChallenge")} {selectedClient.currentChallenge}</p>
                <textarea
                  value={challengeDraft}
                  onChange={(event) => setChallengeDraft(event.target.value)}
                  className="mt-4 min-h-28 w-full rounded-2xl border bg-white p-3 text-sm"
                  placeholder={t("admin.clients.challengePlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => updateSelectedClient((client) => ({ ...client, currentChallenge: challengeDraft }))}
                  className="mt-3 rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white"
                >
                  {t("admin.clients.modifyChallenge")}
                </button>
              </section>

              <section className="rounded-3xl border border-gray-200 p-5">
                <h4 className="text-lg font-black">{t("admin.clients.coreGoals")}</h4>
                <div className="mt-4 space-y-3">
                  {selectedClient.goals.map((goal) => (
                    <div key={goal.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className={`text-sm font-bold ${goal.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>{goal.text}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateGoal(goal.id, (item) => ({ ...item, completed: !item.completed }))}
                          className="rounded-xl border px-3 py-2 text-xs font-black hover:bg-gray-50"
                        >
                          {goal.completed ? t("admin.clients.markPending") : t("admin.clients.markComplete")}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGoal(goal.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={goalDraft}
                    onChange={(event) => setGoalDraft(event.target.value)}
                    placeholder={t("admin.clients.addGoalPlaceholder")}
                    className="flex-1 rounded-xl border p-3 text-sm"
                  />
                  <button type="button" onClick={addGoal} className="rounded-xl bg-[#4A5D4E] px-5 py-3 text-sm font-black text-white">
                    {t("admin.clients.addGoal")}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
