export interface Skill {
  id: string;
  name: string;
  cat: string;
  desc: string;
  check: string;
  added: string;
}
export interface Role {
  id: string;
  company: string;
  title: string;
  level: string;
  exp: string;
  mode: string;
  source: string[];
  url: string;
  must: string[];
  nice: string[];
  note?: string;
}
export interface Source {
  id: string;
  title: string;
  modified: string;
  status: string;
  note?: string;
}
export interface Data {
  baseline: string;
  lastChecked: string;
  folderId: string;
  skills: Skill[];
  roles: Role[];
  sources: Source[];
  changelog: { date: string; text: string }[];
}
export interface Progress {
  done: boolean;
  note: string;
  at: number;
}
export type ProgressMap = Record<string, Progress>;
export type Demand = Record<string, { must: Role[]; nice: Role[] }>;
