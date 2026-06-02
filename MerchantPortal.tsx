import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCatalog, CatalogProduct } from "@/context/CatalogContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Tag, Package } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const orders = [
  { id: "ORD-7023", customer: "Sarah Jenkins", product: "BASE 1", amount: 18, status: "Completed" },
  { id: "ORD-7024", customer: "Michael Chang", product: "BASE 2 + Molho Booster", amount: 28, status: "Processing" },
  { id: "ORD-7025", customer: "Emma Roberts", product: "Kimchi Fermentado", amount: 8, status: "Shipped" },
];

const CATEGORY_LABELS: Record<string, string> = {
  base: "BASE Foods",
  booster: "Boosters",
  party: "Party/Event",
  fermentados: "Fermentados",
  molhos: "Molhos",
  "cafe-cha": "Cafe & Cha",
  suplementos: "Suplementos",
  equipamento: "Equipamento",
  drinks: "Drinks",
  desserts: "Desserts",
};

function ProductPriceRow({ product }: { product: CatalogProduct }) {
  const { updateProductPrice } = useCatalog();
  const { formatPrice } = useLocale();
  const [editPrice, setEditPrice] = useState(product.price.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const parsed = parseFloat(editPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      updateProductPrice(product.id, parsed);
      setIsEditing(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium text-sm">{product.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs rounded-sm font-normal">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </Badge>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            className="h-8 w-24 text-sm"
          />
        ) : (
          <span className="text-sm">{formatPrice(product.price)}</span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs rounded-sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsEditing(false); setEditPrice(product.price.toString()); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm" onClick={() => setIsEditing(true)}>
            Edit Price
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function MerchantPortal() {
  const { user } = useAuth();
  const { products, discounts, addDiscount, removeDiscount } = useCatalog();
  const { formatPrice } = useLocale();
  const [newCode, setNewCode] = useState("");
  const [newPercent, setNewPercent] = useState("10");

  const handleAddDiscount = () => {
    const percent = parseFloat(newPercent);
    if (newCode.trim() && !isNaN(percent)) {
      addDiscount(newCode, percent);
      setNewCode("");
      setNewPercent("10");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">Admin Merchant Dashboard</h1>
        <p className="text-muted-foreground font-light">{t("admin.signedInAs")} {user?.email}</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="rounded-sm">
          <TabsTrigger value="orders" className="rounded-sm">Orders</TabsTrigger>
          <TabsTrigger value="discounts" className="rounded-sm">
            <Tag className="h-3.5 w-3.5 mr-1.5" /> Manage Discounts
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-sm">
            <Package className="h-3.5 w-3.5 mr-1.5" /> Product Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Customer Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                      <TableCell>{formatPrice(order.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal rounded-sm text-xs">
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Manage Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono font-medium uppercase">{d.code}</TableCell>
                      <TableCell>{d.percentOff}% off</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeDiscount(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t border-border/50 pt-6 space-y-4">
                <h4 className="text-sm font-medium">Add New Discount Code</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Code (e.g. verao2026)"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="sm:flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="% off"
                    value={newPercent}
                    onChange={(e) => setNewPercent(e.target.value)}
                    className="sm:w-28"
                  />
                  <Button onClick={handleAddDiscount} className="rounded-sm shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Add Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Product Manager</CardTitle>
              <p className="text-sm text-muted-foreground">Edit prices dynamically — changes reflect across the storefront instantly.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <ProductPriceRow key={product.id} product={product} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
