export type IconKey =
  | "gauge"
  | "users"
  | "layers"
  | "bookOpen"
  | "barChart"
  | "building2"
  | "userSquare2"
  | "contact"
  | "briefcaseBusiness"
  | "waypoints"
  | "shieldCheck"
  | "folderCog"
  | "serverCog";

export interface SidebarItem {
  href: string;
  label: string;
  icon: IconKey;
}

export interface SidebarGroup {
  id: string;
  title?: string;
  items: SidebarItem[];
}
