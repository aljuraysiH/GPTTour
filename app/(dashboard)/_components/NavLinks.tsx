/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const closeDrawer = () => {
    // Get the drawer toggle input element
    const drawerToggle: any = document.getElementById("my-drawer-2");
    // If it exists and it's checked, uncheck it to close the drawer
    if (drawerToggle && drawerToggle?.checked) {
      drawerToggle.checked = false;
    }
  };

  return (
    <ul className="menu text-base-content">
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <li key={link.href}>
            <Link href={link.href} className={`capitalize ${isActive ? "font-bold !text-primary-content !bg-primary" : ""}`} onClick={closeDrawer}>
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default NavLinks;
