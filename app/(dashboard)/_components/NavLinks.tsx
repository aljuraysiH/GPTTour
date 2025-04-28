"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/chat", label: "المحادثة" },
  { href: "/tours", label: "الرحلات" },
  { href: "/tours/new-tour", label: "رحلة جديدة" },
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <ul className="menu text-base-content">
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <li key={link.href}>
            <Link href={link.href} className={`capitalize ${isActive ? "font-bold !text-primary-content !bg-primary" : ""}`}>
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavLinks;
