"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";

import { useUser } from "@/app/hooks/useUser";

export default function Header() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Testimonials", link: "#testimonials" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, displayName, isLoading } = useUser();

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />

        <div className="flex items-center gap-4">
          {isLoading ? (
            <NavbarButton variant="secondary" className="cursor-default">
              Loading...
            </NavbarButton>
          ) : user ? (
            <NavbarButton variant="primary" href="/dashboard">
              {displayName  }
            </NavbarButton>
          ) : (
            <NavbarButton variant="primary" href="/login">
              Login
            </NavbarButton>
          )}
        </div>
      </NavBody>
      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}

          <div className="flex w-full flex-col gap-4 mt-4">
            {isLoading ? (
              <NavbarButton
                variant="secondary"
                className="w-full cursor-default"
                disabled
              >
                Loading...
              </NavbarButton>
            ) : user ? (
              <NavbarButton
                variant="primary"
                className="w-full"
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {displayName}
              </NavbarButton>
            ) : (
              <NavbarButton
                variant="primary"
                className="w-full"
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </NavbarButton>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
