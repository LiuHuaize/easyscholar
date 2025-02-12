export interface Author {
  name: string;
  id?: string;
}

export interface Paper {
  paperId: string;
  title: string;
  abstract?: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  url?: string;
  keywords?: string[];
}

export interface MarkdownComponentProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
} 