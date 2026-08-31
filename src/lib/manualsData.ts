export interface CommandSnippet {
  label?: string;
  language?: string;
  code: string;
}

export interface ManualSubsection {
  title: string;
  description?: string;
  note?: string;
  tabs?: string[];
  snippets?: { [key: string]: CommandSnippet } | CommandSnippet[];
  code?: string;
}

export interface ManualPost {
  id: string;
  slug: string;
  title: string;
  category: 'SETUP' | 'COMMANDS' | 'HARDWARE' | 'TUTORIALS' | 'TROUBLESHOOTING';
  categoryLabel: string;
  breadcrumbs: string[];
  summary: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  sections: {
    title: string;
    description?: string;
    note?: string;
    image_url?: string;
    subsections?: ManualSubsection[];
    code?: string;
    language?: string;
  }[];
}

export const manualCategories = [
  { id: 'SETUP', label: 'SETUP' },
  { id: 'COMMANDS', label: 'USEFUL COMMANDS' },
  { id: 'HARDWARE', label: 'HARDWARE & EMBEDDED' },
  { id: 'TUTORIALS', label: 'TUTORIALS' },
  { id: 'TROUBLESHOOTING', label: 'TROUBLESHOOTING' },
];

// Initial data cleared so manuals are created and managed by Admin in Supabase
export const initialManuals: ManualPost[] = [];
