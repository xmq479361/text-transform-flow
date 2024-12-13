export interface ProcessingRule {
  id: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
  global: boolean;
  caseSensitive: boolean;
}

export interface ProcessingFlow {
  id: string;
  name: string;
  rules: ProcessingRule[];
}

export interface EditorContent {
  text: string;
  language: string;
}
