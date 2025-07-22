// src/functions/types.ts

import { TemplateData, FunctionParams, IParserContext } from '../utils/types';

/**
 * Contesto fornito alle funzioni per evitare dipendenze circolari
 */
export interface IFunctionContext {
  parser: IParserContext;
  currentLang?: string;
}

/**
 * Factory per creare funzioni built-in con accesso al parser
 */
export type FunctionFactory = (context: IFunctionContext) => Record<string, any>;

/**
 * Tipi di funzioni supportate nel sistema
 */
export enum FunctionType {
  /** @Function - Funzione semplice con parametri */
  Simple = '@',
  /** !@Function - Funzione con accesso ai dati (legacy) */
  DataLegacy = '!@',
  /** #@Function - Funzione con accesso ai dati */
  DataAware = '#@',
  /** ##@Function - Funzione con accesso a otherData e data */
  DualData = '##@'
}

/**
 * Metadata per le funzioni built-in
 */
export interface FunctionMetadata {
  name: string;
  description: string;
  minParams?: number;
  maxParams?: number;
  examples?: string[];
}