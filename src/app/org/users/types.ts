export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  avatar_url: string | null;
  roles: string[];
  roles_ids: string[];
  teams: string[];
  teams_ids: string[];
  created_at: string | null;      // null-safe
  created_at_label: string;
};
