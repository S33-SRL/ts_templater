// src/cache/index.ts

import { CacheStorage, ICacheManager } from './types';

/**
 * Gestore della cache per TsTemplater
 * Implementa un sistema di cache intelligente per migliorare le performance
 * durante l'accesso ricorsivo agli oggetti
 */
export class CacheManager implements ICacheManager {
  private cache: CacheStorage;

  constructor(enableCache: boolean = true) {
    this.cache = enableCache ? {} : undefined;
  }

  /**
   * Pulisce completamente la cache
   */
  public cleanCache(): void {
    if (this.cache !== undefined) {
      this.cache = {};
    }
  }

  /**
   * Verifica se la cache è attualmente attiva
   */
  public isCacheEnabled(): boolean {
    return this.cache !== undefined;
  }

  /**
   * Ottiene il numero di entry nella cache
   */
  public getCacheSize(): number {
    return this.cache ? Object.keys(this.cache).length : 0;
  }

  /**
   * Ottiene le chiavi della cache (utile per debugging)
   */
  public getCacheKeys(): string[] {
    return this.cache ? Object.keys(this.cache) : [];
  }

  /**
   * Disabilita la cache completamente
   */
  public disableCache(): void {
    this.cache = undefined;
  }

  /**
   * Riabilita la cache (se era stata disabilitata)
   */
  public enableCache(): void {
    if (this.cache === undefined) {
      this.cache = {};
    }
  }

  /**
   * Ottiene un valore dalla cache
   */
  public get(key: string): any | undefined {
    if (this.cache === undefined) return undefined;
    return this.cache[key];
  }

  /**
   * Imposta un valore nella cache
   */
  public set(key: string, value: any): void {
    if (this.cache !== undefined) {
      this.cache[key] = value;
    }
  }

  /**
   * Verifica se una chiave esiste nella cache
   */
  public has(key: string): boolean {
    if (this.cache === undefined) return false;
    return this.cache[key] !== undefined;
  }

  /**
   * Genera un ID univoco per un oggetto dati
   * Questo approccio funziona meglio per oggetti simili ma distinti
   */
  public getDataIdentity(data: any): string {
    if (data === null || data === undefined) {
      return 'null';
    }
    
    if (typeof data === 'object') {
      // Per array, creiamo un ID basato su lunghezza e primo elemento
      if (Array.isArray(data)) {
        return `array_${data.length}_${JSON.stringify(data[0] || null)}`;
      } else {
        // Per oggetti, utilizziamo una combinazione di alcune proprietà chiave
        try {
          const keys = Object.keys(data).slice(0, 3).sort();
          const keyValues = keys.map(k => {
            const value = data[k];
            // Gestisci i tipi non serializzabili
            if (typeof value === 'symbol') {
              return `${k}:symbol`;
            } else if (typeof value === 'function') {
              return `${k}:function`;
            } else if (typeof value === 'bigint') {
              return `${k}:bigint_${value.toString()}`;
            } else if (typeof value === 'object' && value !== null) {
              return `${k}:object`;
            } else {
              return `${k}:${value}`;
            }
          }).join('|');
          return `object_${keyValues}`;
        } catch (error) {
          // Fallback per oggetti che non possono essere elaborati
          return `object_unprocessable_${Date.now()}`;
        }
      }
    }
    
    return `primitive_${typeof data}_${data}`;
  }
}