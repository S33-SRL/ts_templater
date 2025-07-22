// src/functions/array.ts

import BigNumber from 'bignumber.js';
import { FunctionFactory, IFunctionContext } from './types';
import { FunctionParams, TemplateData } from '../utils/types';

/**
 * Factory per le funzioni di manipolazione array e JSON
 */
export const arrayFunctions: FunctionFactory = (context: IFunctionContext) => {
  
  /**
   * Concatena elementi di un array usando un template
   * @param data Dati del contesto
   * @param params [0]: nome dell'array
   *               [1+]: template da applicare a ogni elemento
   * @returns Stringa concatenata
   */
  const intArrayConcat = (data: TemplateData, params: FunctionParams) => {
    if (!params || params.length < 2) return null;
    
    const array = data[params[0]];
    let result = '';
    
    if (Array.isArray(array)) {
      array.forEach(x => {
        const template = [...params].slice(1).join('|');
        result += context.parser.parse(template, x);
      });
    }
    
    return result;
  };

  /**
   * Somma valori numerici di un array usando un template
   * @param data Dati del contesto
   * @param params [0]: nome dell'array
   *               [1+]: template per estrarre il valore numerico
   * @returns Somma come stringa
   */
  const intArraySum = (data: TemplateData, params: FunctionParams) => {
    if (!params || params.length < 2) return null;
    
    const array = data[params[0]];
    let result = new BigNumber(0);
    
    if (Array.isArray(array)) {
      array.forEach(x => {
        const template = [...params].slice(1).join('|');
        const single = context.parser.parse(template, x);
        if (!isNaN(Number(single))) {
          result = result.plus(new BigNumber(single));
        }
      });
    }
    
    return result.toString();
  };

  /**
   * Divide una stringa JSON in array di oggetti
   * @param data Dati del contesto
   * @param params [0]: stringa da dividere
   *               [1]: delimitatore
   * @returns Array di oggetti parsati
   */
  const intSplit = (data: TemplateData, params: FunctionParams) => {
    if (!params || params.length < 2) return [];
    
    try {
      const stringToSplit = params[0];
      const delimiter = params[1];
      
      // Controlla se stringToSplit è valido
      if (!stringToSplit || typeof stringToSplit !== 'string') {
        return [];
      }
      
      // Divide la stringa per delimitatore
      const parts = stringToSplit.split(delimiter);
      const result = [];
      
      // Parsa ogni parte come JSON e aggiunge all'array risultato
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue; // Salta parti vuote
        
        try {
          const parsed = JSON.parse(trimmed);
          result.push(parsed);
        } catch (parseError) {
          // Salta parti JSON non valide
          console.warn(`Skipping invalid JSON part: "${trimmed}"`);
          continue;
        }
      }
      
      return result;
    } catch (error) {
      console.error("intSplit error:", error);
      return [];
    }
  };

  /**
   * Parsa o stringifica JSON
   * @param data Dati del contesto
   * @param params [0]: 'parse' o 'stringify'
   *               [1]: valore da processare
   * @returns Oggetto parsato o stringa JSON
   */
  const intJson = (data: TemplateData, params: FunctionParams) => {
    if (!params || params.length < 2) return null;

    try {
      // Per operazioni JSON, abbiamo bisogno dell'oggetto/valore reale, non della sua rappresentazione stringa
      let value = params[1];
      if (typeof params[1] === "string") {
        // Rimuove le parentesi graffe se presenti e ottiene l'oggetto raw
        let key = params[1];
        if (key.startsWith('{') && key.endsWith('}')) {
          key = key.slice(1, -1);
        }
        value = context.parser.fromContext(data, key);
      }

      if (params[0].toLowerCase() === "parse") {
        return typeof value === "string" ? JSON.parse(value) : null;
      }

      if (params[0].toLowerCase() === "stringify") {
        return JSON.stringify(value);
      }

      return null;
    } catch (error) {
      console.error("intJson error:", error);
      return null;
    }
  };

  return {
    ArrayConcat: intArrayConcat,
    ArraySum: intArraySum,
    Split: intSplit,
    Json: intJson
  };
};