export type Team = {
  id: string;
  name: string;
  created_at: string | null;
  firm_id: string | null;
};

export type TeamEdge = {
  child_id: string;
  parent_id: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
};

export type TeamNode = Team & {
  parent_id: string | null;
  members: User[];
  children: TeamNode[];
};

export type Option = { id: string; label: string };
