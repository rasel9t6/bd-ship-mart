"use client";

import { useSession, signIn } from "next-auth/react";
import { Search, Menu, CircleUserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa6";
import { HiShoppingBag, HiShoppingCart } from "react-icons/hi2";
import { Session } from "next-auth";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import useCart from "@/hooks/useCart";

// Navigation links data
const NAV_LINKS = [
  { path: "/wishlist", icon: <FaHeart size={24} />, label: "Wishlist" },
  {
    path: (userId: string) => `/profile/${userId}?tab=orders`,
    icon: <HiShoppingBag size={24} />,
    label: "Orders",
  },
];

const SearchBar = ({
  query,
  setQuery,
  onSearch,
}: {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSearch();
    }}
    className="flex items-center gap-3 rounded-full bg-white px-3 py-1 w-full max-w-xs sm:max-w-md md:max-w-lg transition-all duration-300 focus-within:shadow-md"
  >
    <input
      className="px-3 py-1 outline-none w-full bg-transparent"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
    <button
      type="submit"
      disabled={query === ""}
      className="p-2 rounded-full hover:bg-bondi-blue-100 focus:bg-bondi-blue-200 transition-colors"
    >
      <Search className="size-6 cursor-pointer text-bondi-blue-600 transition-colors duration-300 hover:text-bondi-blue-400" />
    </button>
  </form>
);

const NavLinks = ({
  pathname,
  session,
  onClick,
  className = "",
  mobile = false,
}: {
  pathname: string;
  session: Session | null;
  onClick?: () => void;
  className?: string;
  mobile?: boolean;
}) => (
  <nav
    className={`flex flex-col gap-4 ${!mobile ? "lg:flex-row lg:items-center lg:gap-2" : ""} ${className}`.trim()}
  >
    {NAV_LINKS.map(({ path, icon, label }) => (
      <Link
        key={typeof path === "function" ? "orders" : path}
        href={
          typeof path === "function" ? path(session?.user?.userId || "") : path
        }
        className={
          mobile
            ? `flex items-center gap-2 text-bondi-blue-600 font-medium rounded-md px-2 py-2 hover:text-bondi-blue-400 transition` // mobile style
            : `flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10 ${pathname === (typeof path === "function" ? path(session?.user?.userId || "") : path) ? "text-white font-semibold underline underline-offset-4" : ""}` // desktop style
        }
        onClick={onClick}
      >
        {icon}
        <span className="lg:hidden">{label}</span>
      </Link>
    ))}
  </nav>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    const searchQuery = new URLSearchParams({ q: query }).toString();
    router.push(`/search?${searchQuery}`);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-bondi-blue-500 shadow-md">
      <div className="grid grid-cols-3 items-center px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
        {/* Logo (left aligned) */}
        <div className="flex items-center justify-self-start">
          <Link href="/" className="flex items-center gap-2 min-w-[60px]">
            <Image
              src="/k2b-logo-2.png"
              width={48}
              height={48}
              alt="Logo"
              className="w-10 h-10 sm:w-[60px] sm:h-[60px] lg:w-[75px] lg:h-[75px] object-contain"
            />
            <span className="hidden sm:inline text-white font-semibold text-xs sm:text-base">
              K2B EXPRESS
            </span>
          </Link>
        </div>
        {/* Search bar: always centered in grid */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-full lg:hidden">
            <SearchBar
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
            />
          </div>
          <div className="hidden lg:block w-full max-w-xl mx-auto">
            <SearchBar
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>
        {/* Hamburger menu or nav (right aligned) */}
        <div className="flex items-center justify-self-end">
          {/* Desktop nav & icons */}
          <div className="hidden lg:flex items-center gap-4">
            <NavLinks
              pathname={pathname}
              session={session}
              className="space-x-2"
            />
            <div className="relative">
              <Link
                title="Cart"
                href="/cart"
                className="flex items-center rounded-md px-2 py-2 font-medium text-white hover:bg-bondi-blue-400/20 transition"
              >
                <HiShoppingCart className="size-6" />
              </Link>
              {mounted &&
                cart.products.reduce(
                  (sum: number, p: { variants: { quantity: number }[] }) =>
                    sum +
                    p.variants.reduce(
                      (vSum: number, v: { quantity: number }) =>
                        vSum + v.quantity,
                      0,
                    ),
                  0,
                ) > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-blaze-orange-500 text-white text-center text-xs font-bold w-5 h-5">
                    {cart.products.reduce(
                      (sum: number, p: { variants: { quantity: number }[] }) =>
                        sum +
                        p.variants.reduce(
                          (vSum: number, v: { quantity: number }) =>
                            vSum + v.quantity,
                          0,
                        ),
                      0,
                    )}
                  </span>
                )}
            </div>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-0">
                    <Avatar>
                      <AvatarImage
                        src={
                          session.user?.profilePicture ||
                          session.user?.image ||
                          undefined
                        }
                        alt={session.user?.name || "User"}
                      />
                      <AvatarFallback>
                        {session.user?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md"
                  >
                    <Link href={`/profile/${session.user?.userId}`}>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md"
                  >
                    <Link href={`/profile/${session.user?.userId}?tab=orders`}>
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md"
                  >
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition-colors duration-200 rounded-md"
                    onClick={() =>
                      signIn("google", { callbackUrl: "/auth/login" })
                    }
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2 border-white text-white hover:bg-white hover:text-bondi-blue-600 transition font-medium px-4 py-2 "
              >
                <Link href="/auth/login">
                  <CircleUserRound />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-2 text-white hover:text-bondi-blue-400"
                aria-label="Open menu"
              >
                <Menu className="size-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <Image
                      src="/k2b-logo-2.png"
                      width={40}
                      height={40}
                      alt="Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-semibold text-bondi-blue-600">
                      K2B EXPRESS
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 flex flex-col gap-2">
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  onSearch={handleSearch}
                />
                <NavLinks
                  pathname={pathname}
                  session={session}
                  mobile={true}
                  className="gap-2"
                />
                <Link
                  title="Cart"
                  href="/cart"
                  className="flex items-center gap-2 rounded-md px-2 py-2 font-medium text-bondi-blue-600 hover:text-bondi-blue-400 transition"
                >
                  <HiShoppingCart className="size-6" />
                  <span>Cart</span>
                  {mounted &&
                    cart.products.reduce(
                      (sum: number, p: { variants: { quantity: number }[] }) =>
                        sum +
                        p.variants.reduce(
                          (vSum: number, v: { quantity: number }) =>
                            vSum + v.quantity,
                          0,
                        ),
                      0,
                    ) > 0 && (
                      <span className="ml-2 flex items-center justify-center rounded-full bg-blaze-orange-500 text-center text-xs font-bold w-5 h-5 text-white">
                        {cart.products.reduce(
                          (
                            sum: number,
                            p: { variants: { quantity: number }[] },
                          ) =>
                            sum +
                            p.variants.reduce(
                              (vSum: number, v: { quantity: number }) =>
                                vSum + v.quantity,
                              0,
                            ),
                          0,
                        )}
                      </span>
                    )}
                </Link>
                {session ? (
                  <div className="flex flex-col items-start gap-3 w-full mb-4">
                    <Link
                      href={`/profile/${session.user?.userId}`}
                      className="flex items-center gap-3 w-full rounded-md px-2 py-2 font-medium text-bondi-blue-700 hover:bg-bondi-blue-50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            session.user?.profilePicture ||
                            session.user?.image ||
                            undefined
                          }
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback>
                          {session.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-semibold truncate">
                        {session.user?.name}
                      </span>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full border-bondi-blue-200 text-bondi-blue-700 hover:bg-bondi-blue-50 hover:text-bondi-blue-700 transition font-medium px-4 py-2"
                      onClick={() =>
                        signIn("google", { callbackUrl: "/auth/login" })
                      }
                    >
                      <CircleUserRound />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    className="flex items-center gap-2 rounded-md px-2 py-2 font-medium hover:text-accent transition bg-accent text-white hover:font-semibold"
                  >
                    <Link href="/auth/login">
                      <CircleUserRound />
                      <span>Sign In</span>
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
