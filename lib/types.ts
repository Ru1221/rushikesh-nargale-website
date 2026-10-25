export type Kind = "page" | "block" | "service" | "category" | "industry" | "team" | "project" | "post" | "faq" | "nav";
export type Status = "draft" | "published" | "archived";

export interface Item {
  id: number;
  kind: Kind;
  slug: string;
  status: Status;
  sort: number;
  featured: boolean;
  data: Record<string, any>;
  updated_at?: string;
}

export interface Section {
  id: string;
  type: string;
  hidden?: boolean;
  [k: string]: any;
}
