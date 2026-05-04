"use client";

import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <RouterLink className="flex items-center gap-1" to="/">
            <Logo />
            <p className="font-bold text-foreground">Archivio</p>
          </RouterLink>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <ThemeSwitch />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitch />
          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-separator sm:hidden">
          <ul className="flex flex-col gap-2 px-4 py-4">
            {siteConfig.navItems.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <RouterLink
                  className="block py-2 text-lg text-foreground hover:text-primary transition-colors no-underline"
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </RouterLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};
