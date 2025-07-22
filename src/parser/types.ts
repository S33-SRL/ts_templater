// src/parser/types.ts

import { TemplateData } from '../utils/types';

/**
 * Risultato del parsing ricorsivo
 */
export interface ParseResult {
  value: any;
  isTemplate: boolean;
}

/**
 * Opzioni per il metodo evaluate
 */
export interface EvaluateOptions {
  preserveType?: boolean;
  defaultValue?: any;
}

/**
 * Contesto per il parsing delle espressioni
 */
export interface ParseContext {
  data: TemplateData;
  otherData?: TemplateData;
  selectorOpen: string;
  selectorClose: string;
}

/**
 * Pattern per il matching ricorsivo
 */
export interface RecursiveMatchPattern {
  opener: string;
  closer: string;
  format: RegExp;
}