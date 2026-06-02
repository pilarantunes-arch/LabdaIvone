import { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, LogOut, Globe, CreditCard } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { CartProvider, useCart } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { TrackerProvider } from "@/context/TrackerContext";

import Shop from "@/pages/Shop";
import AboutUs from "@/pages/AboutUs";
import KnowledgeHub from "@/pages/KnowledgeHub";
import AdminPortal from "@/pages/AdminPortal";
import DailyTracker from "@/pages/DailyTracker";
import Login from "@/pages/Login";
import MyOrders from "@/pages/MyOrders";
import LegalPage from "@/pages/LegalPage";

const queryClient = new QueryClient();

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function CartDrawer() {
  const {
    isCartOpen, setIsCartOpen, items, updateQuantity, removeItem,
    subtotal, total, clearCart, discountCode, setDiscountCode,
    applyDiscountCode, discountPercent, discountAmount, appliedDiscountCode, clearDiscount,
  } = useCart();
  const { user, addOrder } = useAuth();
  const { t, formatPrice } = useLocale();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "mbway" | null>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [mbWayPhone, setMbWayPhone] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const handleApplyDiscount = () => {
    const result = applyDiscountCode();
    setDiscountMessage(result.message);
  };

  const handleCheckout = (overrideMethod?: "card" | "cash" | "mbway" | "apple-pay") => {
    const method = overrideMethod || paymentMethod || "card";
    setPaymentError("");

    if (method === "mbway" && mbWayPhone.trim().length < 9) {
      setPaymentError(t("cart.mbWayPhoneError"));
      return;
    }

    const paymentLabel =
      method === "cash" ? "Cash" :
      method === "mbway" ? "MB WAY" :
      method === "apple-pay" ? "Apple Pay" :
      "Card";

    const status = method === "cash" ? "Pending Payment" : "Paid";
    const adminNotification = method === "cash"
      ? t("cart.cashAdminNotification")
      : method === "mbway"
        ? `${t("cart.mbWaySimulatedAdminNote")} ${mbWayPhone}`
        : undefined;

    addOrder({
      customerName: user?.name || t("nav.guest"),
      customerEmail: user && "email" in user ? user.email : undefined,
      items,
      total,
      paymentMethod: paymentLabel,
      status,
      mbWayPhone: method === "mbway" ? mbWayPhone : undefined,
      adminNotification,
    });

    setSuccessMessage(
      method === "cash"
        ? t("cart.cashSuccess")
        : method === "mbway"
          ? t("cart.mbWaySuccess")
          : t("cart.thankYou")
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      clearCart();
      setIsCartOpen(false);
      setDiscountMessage("");
      setSuccessMessage("");
      setPaymentError("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setMbWayPhone("");
      setPaymentMethod("card");
    }, 3000);
  };

  const handleApplePay = () => {
    handleCheckout("apple-pay");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col border-l border-border"
          >
            <div className="p-6 flex items-center justify-between border-b border-border/50">
              <h2 className="text-xl font-serif">{t("cart.title")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-serif">{t("cart.orderConfirmed")}</h3>
                  <p className="text-muted-foreground">{successMessage || t("cart.thankYou")}</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground">{t("cart.empty")}</p>
                  <Button variant="outline" onClick={() => setIsCartOpen(false)} className="mt-4 rounded-sm">
                    {t("cart.continueShopping")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                        {item.price > 0 && (
                          <div className="text-muted-foreground text-sm">{formatPrice(item.price)}</div>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center border border-border rounded-sm">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-destructive px-0 h-auto" onClick={() => removeItem(item.id)}>
                            {t("cart.remove")}
                          </Button>
                        </div>
                      </div>
                      {item.price > 0 && (
                        <div className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</div>
                      )}
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t("cart.discountCode")}</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("cart.discountPlaceholder")}
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 h-10 text-sm"
                      />
                      <Button variant="outline" className="rounded-sm shrink-0" onClick={handleApplyDiscount}>
                        {t("cart.apply")}
                      </Button>
                    </div>
                    {discountMessage && (
                      <p className={`text-xs ${appliedDiscountCode ? "text-green-600" : "text-destructive"}`}>
                        {discountMessage}
                      </p>
                    )}
                    {appliedDiscountCode && (
                      <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground" onClick={() => { clearDiscount(); setDiscountMessage(""); }}>
                        {t("cart.removeDiscount")}
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t("cart.payment")}</Label>
                    <Button
                      onClick={handleApplePay}
                      className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-md font-medium flex items-center justify-center gap-2"
                    >
                      <ApplePayIcon />
                      Apple Pay
                    </Button>
                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-border/50" />
                      <span className="flex-shrink mx-3 text-xs text-muted-foreground">{t("cart.orPayWith")}</span>
                      <div className="flex-grow border-t border-border/50" />
                    </div>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className="w-full h-10 rounded-sm flex items-center gap-2"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="h-4 w-4" />
                      {t("cart.creditCard")}
                    </Button>
                    {paymentMethod === "card" && (
                      <div className="space-y-3 pt-1">
                        <Input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="h-10 text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="h-10 text-sm" />
                          <Input placeholder="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="h-10 text-sm" />
                        </div>
                      </div>
                    )}
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      className="w-full h-10 rounded-sm flex items-center justify-center gap-2"
                      onClick={() => setPaymentMethod("cash")}
                    >
                      {t("cart.payWithCash")}
                    </Button>
                    {paymentMethod === "cash" && (
                      <p className="rounded-md bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                        {t("cart.cashInstructions")}
                      </p>
                    )}
                    <Button
                      variant={paymentMethod === "mbway" ? "default" : "outline"}
                      className="w-full h-10 rounded-sm flex items-center justify-center gap-2"
                      onClick={() => setPaymentMethod("mbway")}
                    >
                      {t("cart.mbWay")}
                    </Button>
                    {paymentMethod === "mbway" && (
                      <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
                        <Label className="text-xs">{t("cart.mbWayPhone")}</Label>
                        <Input
                          type="tel"
                          placeholder={t("cart.mbWayPhonePlaceholder")}
                          value={mbWayPhone}
                          onChange={(e) => setMbWayPhone(e.target.value)}
                          className="h-10 text-sm bg-background"
                        />
                        <p className="text-xs text-muted-foreground">{t("cart.mbWayDevelopmentNote")}</p>
                      </div>
                    )}
                    {paymentError && <p className="text-xs text-destructive">{paymentError}</p>}
                  </div>
                </div>
              )}
            </div>

            {items.length > 0 && !isSuccess && (
              <div className="p-6 border-t border-border/50 bg-muted/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t("cart.discount")} ({discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("cart.shipping")}</span>
                  <span>{t("cart.shippingValue")}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end">
                  <span className="font-medium">{t("cart.total")}</span>
                  <span className="text-xl font-serif">{formatPrice(total)}</span>
                </div>
                <Button className="w-full rounded-sm h-12 text-base font-medium" onClick={() => handleCheckout()}>
                  {t("cart.placeOrder")}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [activeTab, setActiveTab] = useState("about");
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    if (user?.role === "admin") {
      setActiveTab("merchant");
    } else {
      setActiveTab("about");
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  const tabs =
    user.role === "admin"
      ? [{ id: "merchant", label: t("nav.merchant") }]
      : [
          { id: "about", label: t("nav.about") },
          { id: "shop", label: t("nav.shop") },
          { id: "orders", label: t("nav.myOrders") },
          { id: "knowledge", label: t("nav.knowledge") },
          { id: "tracker", label: t("nav.tracker") },
        ];

  const showCart = user.role === "customer" || user.role === "guest";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="font-serif text-xl font-bold tracking-tight">Labdaivone</div>
            <nav className="hidden md:flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user.role === "guest" && (
              <Badge variant="secondary" className="hidden sm:inline-flex text-xs rounded-sm">
                {t("nav.guest")}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 rounded-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {locale === "en" ? t("language.english") : t("language.portuguesePortugal")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => setLocale("en")} className="text-xs">{t("language.english")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("pt-PT")} className="text-xs">{t("language.portuguesePortugal")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showCart && (
              <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setIsCartOpen(true)} data-testid="button-cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full bg-primary text-primary-foreground border-none">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={logout} className="rounded-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">
                {user.role === "guest" ? t("login.signIn") : t("nav.signout")}
              </span>
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t border-border/40 overflow-x-auto scrollbar-none flex px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1">
        {activeTab === "about" && <AboutUs />}
        {activeTab === "shop" && <Shop onNavigateLegal={setActiveTab as (page: "terms" | "privacy") => void} />}
        {activeTab === "orders" && <MyOrders />}
        {activeTab === "knowledge" && <KnowledgeHub />}
        {activeTab === "tracker" && <DailyTracker />}
        {activeTab === "terms" && <LegalPage type="terms" />}
        {activeTab === "privacy" && <LegalPage type="privacy" />}
        {activeTab === "merchant" && <AdminPortal />}
      </main>

      {showCart && <CartDrawer />}
    </div>
  );
}

function AppProviders() {
  return (
    <CatalogProvider>
      <TrackerProvider>
        <AuthProvider>
          <CartProvider>
            <MainLayout />
          </CartProvider>
        </AuthProvider>
      </TrackerProvider>
    </CatalogProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <AppProviders />
          <Toaster />
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
