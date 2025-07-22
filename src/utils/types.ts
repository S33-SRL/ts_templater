// src/utils/types.ts

/**
 * Tipo generico per i dati del template
 */
export type TemplateData = Record<string, any>;

/**
 * Tipo per i parametri delle funzioni
 */
export type FunctionParams = any[];

/**
 * Tipo per le funzioni del templater
 * Usa una signature generica per supportare diversi pattern di chiamata
 */
export type TemplaterFunction = (...args: any[]) => any;

/**
 * Registro delle funzioni custom e built-in
 */
export type FunctionRegistry = Record<string, TemplaterFunction>;

/**
 * Opzioni di configurazione per il parser
 */
export interface ParserOptions {
  selectorOpen?: string;
  selectorClose?: string;
}

/**
 * Interfaccia per il parser context
 * Usata per evitare dipendenze circolari
 */
export interface IParserContext {
  parse(template: string, data: TemplateData, otherData?: TemplateData, selectorOpen?: string, selectorClose?: string): string;
  fromContext(data: any, key: string): any;
}

// Re-export dell'interfaccia IFunctionContext da functions/types
export type { IFunctionContext } from '../functions/types';