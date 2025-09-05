import type { SidebarSection } from "@/types/sidebar";

export const sidebarSections: SidebarSection[] = [
  {
    id: "internal",
    label: "INTERNAL",
    groups: [
            {
        id: "org",
        title: "MOD Organization",
        items: [
          { href: "/org/teams", label: "Teams", icon: "layers" },
          { href: "/org/users", label: "Users", icon: "users" },
        ],
      },
      {
        id: "metrics",
        title: "MOD Metrics",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: "gauge" },
          { href: "/org/reports", label: "Reporting Tools", icon: "barChart" },
        ],
      },
      {
        id: "knowledge",
        title: "MOD Knowledge Base",
        items: [
          { href: "/org/documentation", label: "Documentation", icon: "bookOpen" },
        ],
      },
    ],
  },
  {
    id: "external",
    label: "EXTERNAL",
    groups: [
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
    ],
  },
];
