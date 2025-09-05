import type { SidebarGroup } from "@/types/sidebar";

export const sidebarGroups: SidebarGroup[] = [
  {
    id: "root",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "gauge" },
    ],
  },
  {
    id: "org",
    title: "MOD Organization",
    items: [
      { href: "/org/teams", label: "Teams", icon: "layers" },
      { href: "/org/users", label: "Users", icon: "users" },
      { href: "/org/training", label: "Training Materials", icon: "bookOpen" },
      { href: "/org/reports", label: "Reporting Tools", icon: "barChart" },
    ],
  },
  {
    id: "clients",
    title: "MOD Clients",
    items: [
      { href: "/clients", label: "Clients", icon: "building2" },
      { href: "/clients/users", label: "Users", icon: "userSquare2" },
      { href: "/clients/contacts", label: "Contacts", icon: "contact" },
    ],
  },
  {
    id: "counterparties",
    title: "MOD Counterparties",
    items: [
      { href: "/counterparties/prime-brokers", label: "Prime Brokers", icon: "briefcaseBusiness" },
      { href: "/counterparties/executing-brokers", label: "Executing Brokers", icon: "waypoints" },
      { href: "/counterparties/custodians", label: "Custodians", icon: "shieldCheck" },
      { href: "/counterparties/fund-administrators", label: "Fund Administrators", icon: "folderCog" },
      { href: "/counterparties/data-vendors", label: "Data Vendors", icon: "serverCog" },
    ],
  },
];
