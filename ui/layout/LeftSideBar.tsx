"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/constant";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

export default function LeftSideBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col bg-white shadow-lg max-lg:hidden">
      <div className="flex flex-col p-6">
        {/* Logo */}
        <Link href="/admin" className="mb-10 flex justify-center">
          <Image
            src="/bd-ship-mart-logo.svg"
            alt="logo"
            width={120}
            height={80}
            className="h-16 w-auto"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <TooltipProvider>
            {navLinks.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.url}
                    className={`group flex items-center rounded-md p-3 transition-all hover:bg-accent ${
                      pathname === link.url
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Profile Section */}
        <div className="mt-auto border-t pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="User avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">Edit Profile</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
