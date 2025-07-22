// src/index.ts

import dayjs from 'dayjs';
import { CacheManager } from './cache';
import { FunctionManager } from './functions';
import { Parser, Evaluator } from './parser';
import { TemplateData, IParserContext, IFunctionContext } from './utils/types';

/**
 * TsTemplater - A flexible TypeScript library for dynamic string templating
 * 
 * @example
 * const templater = new TsTemplater();
 * const result = templater.parse('Hello {name}!', { name: 'World' });
 * // Result: "Hello World!"
 */
export class TsTemplater {
  private cacheManager: CacheManager;
  private functionManager: FunctionManager;
  private parser: Parser;
  private evaluator: Evaluator;
  private currentLang: string | undefined = undefined;

  /**
   * Crea una nuova istanza di TsTemplater
   * @param lang Lingua per la localizzazione (default: 'en')
   * @param enableCache Abilita il sistema di cache (default: true)
   */
  constructor(lang: string = 'en', enableCache: boolean = true) {
    // Inizializza i manager
    this.cacheManager = new CacheManager(enableCache);
    
    // Crea il contesto per le funzioni
    const functionContext: IFunctionContext = {
      parser: {} as IParserContext, // Verrà popolato dopo
      currentLang: lang
    };
    
    this.functionManager = new FunctionManager(functionContext);
    
    // Inizializza il parser
    this.parser = new Parser(this.cacheManager, this.functionManager);
    
    // Aggiorna il contesto con il parser reale
    functionContext.parser = this.parser;
    this.functionManager.updateContext(functionContext);
    
    // Inizializza l'evaluator
    this.evaluator = new Evaluator(this.parser, this.functionManager);
    
    // Imposta la lingua
    this.currentLang = lang;
    this.changeDayjsLocale(lang);
  }

  /**
   * Cambia la lingua di dayjs per la formattazione delle date
   * @param lang Codice lingua (es. 'it', 'en', 'fr')
   */
  changeDayjsLocale(lang: string) {
    try {
      this.currentLang = lang;
      // Imposta il locale se è già stato caricato
      dayjs.locale(lang);
      
      // Aggiorna il contesto delle funzioni
      this.functionManager.updateContext({ currentLang: lang });
    } catch (error) {
      console.error(`Error setting locale ${lang} for dayjs`, error);
    }
  }

  /**
   * Parsa un template sostituendo i placeholder con i valori dai dati
   * @param template Template con placeholder (es. "Hello {name}")
   * @param data Oggetto con i dati per la sostituzione
   * @param otherData Dati secondari (usati da ##@)
   * @param selectorOpen Carattere di apertura placeholder (default: '{')
   * @param selectorClose Carattere di chiusura placeholder (default: '}')
   * @returns Template parsato come stringa
   */
  public parse(template: string, data: any, otherData: any = null, selectorOpen = '{', selectorClose = '}'): any {
    return this.parser.parse(template, data, otherData, selectorOpen, selectorClose);
  }

  /**
   * Valuta un'espressione preservando il tipo originale
   * A differenza di parse() che ritorna sempre stringhe, evaluate() mantiene i tipi
   * 
   * @param expression Espressione da valutare (es. "user.age", "@Math|+|2|3")
   * @param data Contesto dati principale
   * @param otherData Contesto dati secondario
   * @returns Risultato con il tipo originale preservato
   */
  public evaluate(expression: string, data: any, otherData: any = null): any {
    return this.evaluator.evaluate(expression, data, otherData);
  }

  /**
   * Imposta funzioni custom
   * @param func Oggetto con le funzioni custom da aggiungere
   */
  public setFunctions(func: any) {
    this.functionManager.setFunctions(func);
  }

  // === Metodi Cache (per retrocompatibilità) ===

  /**
   * Pulisce completamente la cache
   */
  public cleanCache() {
    this.cacheManager.cleanCache();
  }

  /**
   * Verifica se la cache è attualmente attiva
   */
  public isCacheEnabled(): boolean {
    return this.cacheManager.isCacheEnabled();
  }

  /**
   * Ottiene il numero di entry nella cache
   */
  public getCacheSize(): number {
    return this.cacheManager.getCacheSize();
  }

  /**
   * Ottiene le chiavi della cache (utile per debugging)
   */
  public getCacheKeys(): string[] {
    return this.cacheManager.getCacheKeys();
  }

  /**
   * Disabilita la cache completamente
   */
  public disableCache(): void {
    this.cacheManager.disableCache();
  }

  /**
   * Riabilita la cache (se era stata disabilitata)
   */
  public enableCache(): void {
    this.cacheManager.enableCache();
  }
}

// Export dei moduli per import diretti
export { CacheManager } from './cache';
export { FunctionManager } from './functions';
export { Parser, Evaluator } from './parser';

// Export dei tipi principali
export type { 
  TemplateData, 
  FunctionParams, 
  TemplaterFunction, 
  FunctionRegistry,
  ParserOptions,
  IParserContext
} from './utils/types';

export type {
  ICacheManager,
  CacheStorage
} from './cache/types';

export type {
  IFunctionContext,
  FunctionFactory,
  FunctionType,
  FunctionMetadata
} from './functions/types';