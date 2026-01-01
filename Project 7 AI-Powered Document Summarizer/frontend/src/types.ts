export type Priority = 'high' | 'medium' | 'low';

export interface ActionItem {
  item: string;
  priority: Priority;
  owner_hint: string | null;
}

export interface SummaryData {
  document_type: string;
  title: string;
  page_count: number;
  word_count: number;
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
  compliance_flags: string[];
  chunked: boolean;
}

export interface ApiResponse {
  success: boolean;
  data: SummaryData | null;
  message: string;
}

export const DOC_TYPES = [
  'auto',
  'SOP',
  'Validation Protocol',
  'Audit Report',
  'Technical Manual',
  'Report',
] as const;

export type DocType = (typeof DOC_TYPES)[number];
