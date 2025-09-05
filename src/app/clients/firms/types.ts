export type Firm = {
  id: string;
  name: string;
  contact_email: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string | null;
};

export type FirmRow = Firm & {
  roles: string[];         // from firm_roles
  projects_count: number;  // from client_projects
};

export type Option = { id: string; label: string };
