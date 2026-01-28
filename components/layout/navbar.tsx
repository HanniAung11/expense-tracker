"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/expenses", label: "Expenses" },
    { href: "/recurring", label: "Recurring" },
    { href: "/budgets", label: "Budgets" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-emerald-500/20 bg-gradient-to-r from-white/95 via-white/80 to-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-fuchsia-500/15 px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/30 backdrop-blur-xl"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-sky-400 to-fuchsia-400 text-white shadow-lg shadow-emerald-500/40">
                <Wallet className="h-4 w-4" />
                <span className="absolute inset-0 rounded-full bg-white/30 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-60" />
              </div>
              <span className="text-base font-semibold tracking-tight">
                Expense<span className="text-emerald-500">Flow</span>
              </span>
            </Link>
            <div className="hidden gap-4 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-emerald-500/80 to-sky-500/80 text-white shadow-md shadow-emerald-500/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-emerald-500/10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 md:flex">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      <div className="border-t border-slate-200 md:hidden">
        <div className="flex flex-col space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.href
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

