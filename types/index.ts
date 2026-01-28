export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description: string | null;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
};

export const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Digital Wallet",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CATEGORIES = [
  { name: "Food & Dining", icon: "🍔", color: "bg-orange-500" },
  { name: "Transportation", icon: "🚗", color: "bg-blue-500" },
  { name: "Entertainment", icon: "🎮", color: "bg-purple-500" },
  { name: "Housing/Rent", icon: "🏠", color: "bg-red-500" },
  { name: "Utilities", icon: "💡", color: "bg-yellow-500" },
  { name: "Shopping", icon: "🛒", color: "bg-pink-500" },
  { name: "Healthcare", icon: "🏥", color: "bg-green-500" },
  { name: "Education", icon: "📚", color: "bg-indigo-500" },
  { name: "Travel", icon: "✈️", color: "bg-cyan-500" },
  { name: "Other", icon: "💼", color: "bg-gray-500" },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

