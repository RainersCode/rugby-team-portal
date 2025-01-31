"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  };

  const mainNavItems = [
    { href: "/", label: "Home" },
    { href: "/team", label: "Team" },
    { href: "/matches", label: "Matches" },
    { href: "/news", label: "News" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/players", label: "Players" },
    { href: "/admin/matches", label: "Matches" },
    { href: "/admin/articles", label: "Articles" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-background border-r">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="text-left text-lg font-bold">
            Navigation
          </SheetTitle>
        </SheetHeader>
        <div className="px-1">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="main-nav" className="border-none">
              <AccordionTrigger className="py-2 text-sm">
                Main Navigation
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-2 py-1.5 text-sm transition-colors hover:text-primary ${
                        pathname === item.href
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {isAdmin && (
              <AccordionItem value="admin-nav" className="border-none">
                <AccordionTrigger className="py-2 text-sm">
                  Admin Panel
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-2 py-1.5 text-sm transition-colors hover:text-primary ${
                          pathname === item.href
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
