// src/cache/types.ts

/**
 * Tipo per il sistema di cache
 * undefined indica che la cache è disabilitata
 */
export type CacheStorage = Record<string, any> | undefined;

/**
 * Interfaccia per il gestore della cache
 */
export interface ICacheManager {
  /**
   * Pulisce completamente la cache
   */
  cleanCache(): void;

  /**
   * Verifica se la cache è attualmente attiva
   */
  isCacheEnabled(): boolean;

  /**
   * Ottiene il numero di entry nella cache
   */
  getCacheSize(): number;

  /**
   * Ottiene le chiavi della cache (utile per debugging)
   */
  getCacheKeys(): string[];

  /**
   * Disabilita la cache completamente
   */
  disableCache(): void;

  /**
   * Riabilita la cache (se era stata disabilitata)
   */
  enableCache(): void;

  /**
   * Ottiene un valore dalla cache
   */
  get(key: string): any | undefined;

  /**
   * Imposta un valore nella cache
   */
  set(key: string, value: any): void;

  /**
   * Verifica se una chiave esiste nella cache
   */
  has(key: string): boolean;

  /**
   * Genera un ID univoco per un oggetto dati
   * Usato per evitare conflitti nella cache
   */
  getDataIdentity(data: any): string;
}