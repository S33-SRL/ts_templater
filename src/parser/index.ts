// src/parser/index.ts

import { TemplateData, IParserContext } from '../utils/types';
import { CacheManager } from '../cache';
import { FunctionManager } from '../functions';
import { escape, arrayFirstByField, safeToString } from '../utils';

/**
 * Parser principale per TsTemplater
 * Gestisce il parsing dei template e la risoluzione delle espressioni
 */
export class Parser implements IParserContext {
  private formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/;
  private cacheManager: CacheManager;
  private functionManager: FunctionManager;

  constructor(cacheManager: CacheManager, functionManager: FunctionManager) {
    this.cacheManager = cacheManager;
    this.functionManager = functionManager;
  }

  /**
   * Trova ricorsivamente le corrispondenze tra delimitatori aperti e chiusi
   */
  public matchRecursive(str: string, format: string): string[] {
    const p = this.formatParts.exec(format);
    if (!p) throw new Error("format must include start and end tokens separated by '...'");
    if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

    const opener = p[1];
    const closer = p[2];
    const iterator: any = new RegExp(
      format.length == 5 
        ? "[" + escape(opener + closer) + "]" 
        : escape(opener) + "|" + escape(closer), 
      "g"
    );
    const results = [];
    let openTokens, matchStartIndex, match;

    do {
      openTokens = 0;
      while (match = iterator.exec(str)) {
        if (match[0] == opener) {
          if (!openTokens)
            matchStartIndex = iterator.lastIndex;
          openTokens++;
        } else if (openTokens) {
          openTokens--;
          if (!openTokens)
            results.push(str.slice(matchStartIndex, match.index));
        }
      }
    } while (openTokens && (iterator.lastIndex = matchStartIndex));

    return results;
  }

  /**
   * Parsa un template sostituendo i placeholder con i valori dai dati
   */
  public parse(template: string, data: any, otherData: any = null, selectorOpen = '{', selectorClose = '}'): any {
    let result = template + '';
    const array = this.matchRecursive(result, `${selectorOpen}...${selectorClose}`);
    
    (array || []).forEach(x => {
      try {
        let value = null;
        let change: string = x || '';
        
        // Gestione funzione !@ (con accesso ai dati)
        if (change.indexOf('!@') === 0 && change.indexOf('|') > 0) {
          const parameters = change.split('|');
          const functionName = parameters[0].substr(2);
          const func = this.functionManager.getFunction(functionName);
          
          if (func) {
            value = (func as any)(data, parameters.slice(1));
          } else {
            console.warn(`Function ${functionName} not found for expression: ${change}`);
            value = selectorOpen + change + selectorClose;
          }
        } else {
          // Controlla se stiamo gestendo una funzione che elabora array (#@, ##@)
          const isArrayFunction = (change.indexOf('#@') === 0 && change.indexOf('|') > 0) ||
                                (change.indexOf('##@') === 0 && change.indexOf('|') > 0);
          
          // Parsa ricorsivamente se necessario
          if (change.indexOf(selectorOpen) >= 0 && !isArrayFunction) {
            change = this.parse(x, data, null, selectorOpen, selectorClose);
          }
          
          // Gestione funzione @ (semplice)
          if (change.indexOf('@') === 0 && change.indexOf('|') > 0) {
            const parameters = change.split('|');
            const functionName = parameters[0].substr(1);
            const func = this.functionManager.getFunction(functionName);
            
            if (func) {
              value = (func as any)(parameters.slice(1));
            } else {
              console.warn(`Function ${functionName} not found for expression: ${change}`);
              value = selectorOpen + change + selectorClose;
            }
          }
          // Gestione funzione #@ (con accesso ai dati)
          else if (change.indexOf('#@') === 0 && change.indexOf('|') > 0) {
            const parameters = change.split('|');
            const functionName = parameters[0].substr(2);
            const func = this.functionManager.getFunction(functionName);
            
            if (func) {
              value = (func as any)(data, parameters.slice(1));
            } else {
              console.warn(`Function ${functionName} not found for expression: ${change}`);
              value = selectorOpen + change + selectorClose;
            }
          }
          // Gestione funzione ##@ (con otherData e data)
          else if (change.indexOf('##@') === 0 && change.indexOf('|') > 0) {
            const parameters = change.split('|');
            const functionName = parameters[0].substr(3);
            const func = this.functionManager.getFunction(functionName);
            
            if (func) {
              value = (func as any)(otherData, data, parameters.slice(1));
            } else {
              console.warn(`Function ${functionName} not found for expression: ${change}`);
              value = selectorOpen + change + selectorClose;
            }
          }
          else {
            value = this.parserWithFunction(data, change);
          }
        }

        // Converti il valore in stringa per il templating
        value = safeToString(value);

        const replaceString = selectorOpen + x + selectorClose;
        result = replaceString == result ? value : result.replace(replaceString, value);
      } catch (error) {
        console.error("parse :" + template, error);
      }
    });
    
    return result;
  }

  /**
   * Parsa una stringa sostituendo i placeholder con parentesi graffe
   */
  private parserString(str: string, data: any): any {
    return str.replace(/\{ *([\w_.:,'|\-\[\]]+) *\}/g, (str, key) => {
      let value = this.parserWithFunction(data, key);
      value = safeToString(value);
      return value;
    });
  }

  /**
   * Gestisce il parsing con funzioni speciali come 'exist'
   */
  private parserWithFunction(data: any, key: string): string {
    let result: any = null;
    const colonsIndexStart = key.indexOf('|');
    
    if (colonsIndexStart >= 0) {
      switch (key.substr(0, colonsIndexStart).toLowerCase()) {
        case 'exist': {
          const paramsStr = key.substr(colonsIndexStart + 1, key.length - colonsIndexStart);
          const params = paramsStr.split(",");
          
          if (params.length === 3) {
            const value = this.fromContext(data, params[0]);
            let strData = '';
            
            if (value) {
              strData = params[1];
            } else {
              strData = params[2];
            }
            
            if (strData[0] == '"' || strData[0] == "'") {
              result = this.parserString(strData.substr(1, strData.length - 2), data);
            } else {
              result = this.fromContext(data, strData);
            }
          }
        }
        break;
      }
    } else {
      result = this.fromContext(data, key);
    }
    
    return result;
  }

  /**
   * Risolve un valore dal contesto dei dati usando un percorso chiave
   * Supporta notazione punto e accesso array
   */
  public fromContext(data: any, key: string): any {
    if (!data) return null;

    // Se la cache è disabilitata, esegui direttamente senza cache
    if (!this.cacheManager.isCacheEnabled()) {
      return this.fromContextWithoutCache(data, key);
    }

    // Costruisce una chiave di cache unica
    const dataId = this.cacheManager.getDataIdentity(data);
    const fullCacheKey = `${dataId}:${key}`;
    
    // Controlla se il risultato è già in cache
    if (this.cacheManager.has(fullCacheKey)) {
      return this.cacheManager.get(fullCacheKey);
    }

    // Esegue la risoluzione
    const result = this.fromContextWithoutCache(data, key);
    
    // Salva il risultato in cache
    this.cacheManager.set(fullCacheKey, result);
    
    return result;
  }

  /**
   * Implementazione di fromContext senza cache
   */
  private fromContextWithoutCache(data: any, key: string): any {
    if (!data) return null;
    
    let prefix = key;
    let dotIndex = key.indexOf('.');
    let arrayIndexStart = key.indexOf('[');
    let arrayIndexEnd = key.indexOf(']');

    if (dotIndex >= 0) {
      prefix = key.substr(0, dotIndex);
    } else if (arrayIndexStart >= 0 && arrayIndexEnd > 0) {
      prefix = key.substr(0, arrayIndexStart);
    }

    let result = null;
    if (arrayIndexStart > 0 && arrayIndexStart < dotIndex) {
      result = this.fromContextWithoutCache(data, prefix);
    } else {
      result = data[prefix];
    }
    
    if (dotIndex >= 0 && result) {
      result = this.fromContextWithoutCache(result, key.substr(dotIndex + 1));
    } else if (arrayIndexStart >= 0 && arrayIndexEnd > 0 && result) {
      if (Array.isArray(result)) {
        const length = arrayIndexEnd - arrayIndexStart;
        const position = key.substr(arrayIndexStart + 1, length - 1);
        
        if (position.indexOf(',') >= 0) {
          const filters = position.split(',');
          result = arrayFirstByField(result, filters[0], filters.slice(1));
        } else {
          switch (position) {
            case 'first': {
              result = result[0];
            }
            break;
            case 'last': {
              result = result[result.length - 1];
            }
            break;
            default: {
              const index = +position;
              if (index >= 0) {
                result = result[index];
              } else {
                result = null;
              }
            }
            break;
          }
        }
      } else {
        result = null;
      }
    }
    
    return result;
  }
}

// Re-export dei tipi
export * from './types';
export { Evaluator } from './evaluator';