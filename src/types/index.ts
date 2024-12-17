export interface ProcessingRule {
  id: string;
  pattern: string;
  replacement: string;
  description: string;
  enabled: boolean;
  global: boolean;
  extractOnly: boolean;
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

export interface LayoutSizeProps {
  min: number;
  default: number;
  max: number;
}
export interface LayoutSizes {
  siderWidthPercent: number;
  editorWidthPercent: number;
  outputWidthPercent: number;
}

