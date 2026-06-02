import React, { createContext, useContext, useEffect, useState } from 'react';

export type ProductPartition = string;

export interface ProductSection {
  id: string;
  name: string;
  subtitle: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: ProductPartition;
  inStock: boolean;
  waitlistEmails: string[];
  accentColor?: string;
  sectionColor?: string;
}

export type PaymentMethod = 'Card' | 'Apple Pay' | 'Cash' | 'MB WAY';
export type OrderStatus = 'Paid' | 'Pending Payment';

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  mbWayPhone?: string;
  adminNotification?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl?: string;
  comments: string[];
}

export interface HomepageContent {
  bio: string;
  galleryImages: string[];
  instagram: string;
  phone: string;
}

export interface WellnessGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  usertag: string;
  email: string;
  password?: string;
  role?: 'customer' | 'admin' | 'guest';
  streak: number;
  goalCompleted: boolean;
  currentChallenge: string;
  goals: WellnessGoal[];
}

interface AuthContextType {
  user: UserProfile | { id: string; name: string; role: 'admin' | 'guest'; email?: string } | null;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productSections: ProductSection[];
  setProductSections: React.Dispatch<React.SetStateAction<ProductSection[]>>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  homepageContent: HomepageContent;
  setHomepageContent: React.Dispatch<React.SetStateAction<HomepageContent>>;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: any) => { success: boolean; error?: string };
  continueAsGuest: () => void;
  logout: () => void;
  updateClientProfile: (id: string, updater: (profile: UserProfile) => UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'labdaivone@gmail.com';
const ADMIN_PASSWORD = 'Timpete4!';
const HOMEPAGE_STORAGE_KEY = 'labdaivone-homepage-content';
const PRODUCT_SECTIONS_STORAGE_KEY = 'labdaivone-product-sections';
const PRODUCTS_STORAGE_KEY = 'labdaivone-products';
const ORDERS_STORAGE_KEY = 'labdaivone-orders';

const DEFAULT_PRODUCT_SECTIONS: ProductSection[] = [
  { id: 'section-base', name: 'Base', subtitle: 'Premium signature formulations and elixirs' },
  { id: 'section-mercearia', name: 'Mercearia', subtitle: 'Living ferments, organic sauces, cafe, supplements, and equipment' },
  { id: 'section-fermentados', name: 'Fermentados', subtitle: 'Living ferments and digestive wellness staples' },
  { id: 'section-molhos', name: 'Molhos', subtitle: 'Organic sauces and booster pairings' },
  { id: 'section-cafe-cha', name: 'Café & Chá', subtitle: 'Focused cafe rituals, teas, and warm drinks' },
  { id: 'section-suplementos', name: 'Suplementos', subtitle: 'Targeted daily support for performance and recovery' },
  { id: 'section-equipamento', name: 'Equipamento', subtitle: 'Kitchen and wellness tools for everyday routines' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Base Elixir',
    price: 14.99,
    category: 'Base',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    inStock: true,
    waitlistEmails: [],
    accentColor: '#4A5D4E',
    sectionColor: '#F4F5F0',
  },
  {
    id: 'p2',
    name: 'Premium Fermented Kombucha',
    price: 4.5,
    category: 'Fermentados',
    imageUrl: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800',
    inStock: true,
    waitlistEmails: [],
    accentColor: '#7A4F2A',
    sectionColor: '#FFF7ED',
  },
  {
    id: 'p3',
    name: 'Molho Verde Performance',
    price: 5,
    category: 'Molhos',
    imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800',
    inStock: true,
    waitlistEmails: [],
    accentColor: '#4A5D4E',
    sectionColor: '#ECFDF5',
  },
];

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  bio: "Labdaivone is a wellness ecosystem built around intentional food, fermented staples, performance rituals, and a slower relationship with everyday nourishment. We design each experience to feel personal, practical, and beautiful enough to become part of your routine.",
  galleryImages: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=900',
  ],
  instagram: '@labdaivone',
  phone: '+351 900 000 000',
};

function loadHomepageContent(): HomepageContent {
  try {
    const raw = localStorage.getItem(HOMEPAGE_STORAGE_KEY);
    if (!raw) return DEFAULT_HOMEPAGE_CONTENT;

    return { ...DEFAULT_HOMEPAGE_CONTENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

function normalizeProductCategory(category: string) {
  return category === 'Faz-te Good' ? 'Base' : category;
}

function normalizeProductName(name: string) {
  return name.replace(/^Faz-te Good/, 'Base');
}

function loadProductSections(): ProductSection[] {
  try {
    const raw = localStorage.getItem(PRODUCT_SECTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCT_SECTIONS;

    const sections = (JSON.parse(raw) as ProductSection[]).map((section) => ({
      ...section,
      name: normalizeProductCategory(section.name),
    }));
    return sections.filter(
      (section, index, allSections) =>
        allSections.findIndex((item) => item.name.toLowerCase() === section.name.toLowerCase()) === index
    );
  } catch {
    return DEFAULT_PRODUCT_SECTIONS;
  }
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const products = raw ? (JSON.parse(raw) as Product[]) : DEFAULT_PRODUCTS;
    return products.map((product) => ({
      ...product,
      name: normalizeProductName(product.name),
      category: normalizeProductCategory(product.category),
      inStock: product.inStock ?? true,
      waitlistEmails: product.waitlistEmails ?? [],
    }));
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: '1',
      name: 'Ana Silva',
      usertag: '@anasilva',
      email: 'ana@example.com',
      role: 'customer',
      streak: 12,
      goalCompleted: true,
      currentChallenge: 'Drink 3L of water and complete a 20-minute walk.',
      goals: [
        { id: 'ana-g1', text: 'Hit 25g protein at breakfast', completed: true },
        { id: 'ana-g2', text: 'Complete three mobility sessions this week', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Carlos Santos',
      usertag: '@carloss',
      email: 'carlos@example.com',
      role: 'customer',
      streak: 4,
      goalCompleted: false,
      currentChallenge: 'Log one fermented food and take a 10-minute mindful pause.',
      goals: [
        { id: 'carlos-g1', text: 'Reduce afternoon sugar snacks', completed: false },
        { id: 'carlos-g2', text: 'Walk 8,000 steps on weekdays', completed: false },
      ],
    },
  ]);

  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [productSections, setProductSections] = useState<ProductSection[]>(loadProductSections);
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const [articles, setArticles] = useState<Article[]>([
    {
      id: 'a1',
      title: 'Unlocking Metabolic Efficiency',
      category: 'Nutrition',
      content: 'Optimizing your dietary schedule can improve baseline recovery metrics, gut comfort, and steady cognitive energy throughout the day.',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
      comments: ['I tried this with a lighter dinner and felt better in the morning.'],
    },
    {
      id: 'a2',
      title: 'Mindset Rituals for Consistent Wellness',
      category: 'Mindset',
      content: 'Small daily rituals are easier to repeat when they are specific, visible, and connected to a reward loop you already care about.',
      imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
      comments: [],
    },
  ]);

  const [homepageContent, setHomepageContent] = useState<HomepageContent>(loadHomepageContent);

  useEffect(() => {
    localStorage.setItem(HOMEPAGE_STORAGE_KEY, JSON.stringify(homepageContent));
  }, [homepageContent]);

  useEffect(() => {
    localStorage.setItem(PRODUCT_SECTIONS_STORAGE_KEY, JSON.stringify(productSections));
  }, [productSections]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const savedOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [savedOrder, ...current]);
    return savedOrder;
  };

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setUser({ id: 'admin', name: 'Admin Labdaivone', email: ADMIN_EMAIL, role: 'admin' });
      return { success: true };
    }

    const matchingClient = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === password
    );

    if (matchingClient) {
      setUser(matchingClient);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = (data: any) => {
    if (!data.email || !data.password) {
      return { success: false, error: 'Please enter a valid email and password' };
    }
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: data.name || 'Labdaivone Client',
      usertag: data.usertag || `@client${Date.now()}`,
      email: data.email,
      password: data.password,
      role: 'customer',
      streak: 0,
      goalCompleted: false,
      currentChallenge: 'Complete today’s Labdaivone wellness check-in.',
      goals: [
        { id: `goal-${Date.now()}`, text: 'Build a consistent daily nutrition routine', completed: false },
      ],
    };
    setUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    return { success: true };
  };

  const continueAsGuest = () => {
    setUser({ id: 'guest', name: 'Guest User', role: 'guest' });
  };

  const logout = () => {
    setUser(null);
  };

  const updateClientProfile = (id: string, updater: (profile: UserProfile) => UserProfile) => {
    setUsers((prev) => prev.map((profile) => (profile.id === id ? updater(profile) : profile)));
    setUser((current) => {
      if (!current || current.id !== id || current.role === 'admin' || current.role === 'guest') return current;
      return updater(current as UserProfile);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        setUsers,
        products,
        setProducts,
        productSections,
        setProductSections,
        orders,
        addOrder,
        articles,
        setArticles,
        homepageContent,
        setHomepageContent,
        login,
        register,
        continueAsGuest,
        logout,
        updateClientProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}