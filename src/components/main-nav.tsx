"use client";

import { cn } from "@/lib/utils";
import { Category } from "@/types";
import Link from "next/link";
import { useLoading } from "@/providers/loading-provider";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface MainNavProps {
  data: Category[];
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { setLoading } = useLoading();
  const prevPath = useRef<string>(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(false); // hilangkan loading segera setelah route berubah
      prevPath.current = pathname;
    }
  }, [pathname, setLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = data.map((route) => ({
    href: `/category/${route.id}`,
    label: route.name,
    active: pathname === `/category/${route.id}`,
  }));

  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 overflow-x-auto flex-nowrap whitespace-nowrap">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-neutral-100 flex-shrink-0 inline-block",
            // only apply active styling after client mount to match server HTML
            mounted && route.active
              ? "text-white font-bold"
              : "text-neutral-400"
          )}
          onClick={() => {
            setLoading(true); // loading langsung muncul saat klik
          }}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
