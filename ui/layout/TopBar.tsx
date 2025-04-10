"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/constant";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Button } from "../button";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

export default function TopBar() {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm lg:hidden">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo */}
        <Link href="/admin" className="flex items-center">
          <Image
            src="/bd-ship-mart-logo.svg"
            alt="Wave Mart Logo"
            width={50}
            height={60}
            className="h-10 w-auto"
          />
        </Link>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-4">
          {/* Mobile Dropdown Menu */}
          <DropdownMenu open={dropdownMenu} onOpenChange={setDropdownMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {dropdownMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navLinks.map((item, i) => (
                <DropdownMenuItem key={i} asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center w-full ${
                      pathname === item.url ? "text-primary" : ""
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="User avatar"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
