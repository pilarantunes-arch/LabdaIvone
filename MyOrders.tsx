import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function MyOrders() {
  const { user, orders } = useAuth();
  const { t, formatPrice } = useLocale();

  const userOrders = orders.filter((order) => {
    if (!user) return false;
    if (user.role === "guest") return order.customerName === user.name;
    return "email" in user && user.email ? order.customerEmail === user.email : false;
  });

  return (
    <div className="min-h-screen bg-[#F4F5F0] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-[#4A5D4E]">{t("orders.myOrdersTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("orders.myOrdersSubtitle")}</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {userOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">{t("orders.empty")}</div>
          ) : (
            userOrders.map((order) => (
              <div key={order.id} className="border-b border-gray-100 p-5 last:border-b-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-mono text-lg font-black text-[#4A5D4E]">{order.id}</h2>
                    <p className="mt-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#4A5D4E]/10 px-3 py-1 text-xs font-black text-[#4A5D4E]">
                      {order.paymentMethod}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${
                      order.status === "Pending Payment" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.id}`} className="flex justify-between gap-4">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm font-black">
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
