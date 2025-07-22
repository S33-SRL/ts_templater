// src/functions/math.ts

import BigNumber from 'bignumber.js';
import { FunctionFactory, IFunctionContext } from './types';
import { FunctionParams } from '../utils/types';

/**
 * Factory per le funzioni matematiche e numeriche
 */
export const mathFunctions: FunctionFactory = (context: IFunctionContext) => {
  
  /**
   * Converte un valore in numero
   * @param params [0]: valore da convertire
   * @returns Numero convertito o null se non valido
   */
  const toNumber = (params: FunctionParams) => {
    if (!params || params.length != 1) return null;
    const value = params[0];
    
    switch (typeof value) {
      case "number": 
        return value;
      case "boolean": 
        return value ? 1 : 0;
      case "string":
        try {
          const number = new BigNumber(value);
          return number.isNaN() ? null : number.toNumber();
        } catch {
          return null;
        }
      default: 
        return null;
    }
  };

  /**
   * Somma due numeri
   * @param params [0]: primo numero, [1]: secondo numero
   * @returns Somma dei due numeri
   */
  const intSum = (params: FunctionParams) => {
    if (!params || params.length != 2) return null;
    return (<any>params[0] * 1.0) + (<any>params[1] * 1.0);
  };

  /**
   * Esegue operazioni matematiche
   * @param params [0]: operatore (+,-,*,/,%,**), [1]: primo numero, [2]: secondo numero
   * @returns Risultato dell'operazione
   */
  const intMath = (params: FunctionParams) => {
    if (!params || params.length != 3) return null;
    
    let result = null;
    const number1 = (<any>params[1] * 1.0);
    const number2 = (<any>params[2] * 1.0);
    
    switch(params[0]) {
      case '+': result = number1 + number2; break;
      case '-': result = number1 - number2; break;
      case '*': result = number1 * number2; break;
      case '/': result = number1 / number2; break;
      case '%': result = number1 % number2; break;
      case '**': result = number1 ** number2; break;
    }
    
    return result;
  };

  /**
   * Formatta un numero come valuta
   * @param params [0]: valore, [1]: valuta (default EUR), [2]: locale (default currentLang)
   * @returns Stringa formattata come valuta
   */
  const intCurrency = (params: FunctionParams) => {
    if (!params || params.length < 1) return null;
    
    const value = toNumber([params[0]]);
    if (value === null || isNaN(value)) return null;

    let currency = "EUR";
    let locale = context.currentLang || 'en';
    
    // Gestisce diverse combinazioni di parametri
    if (params.length >= 2 && params[1]) {
      currency = params[1];
    }
    if (params.length >= 3 && params[2]) {
      locale = params[2];
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      // Fallback per valuta/locale non validi
      console.warn(`Invalid currency "${currency}" or locale "${locale}", using default`);
      return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  };

  return {
    Number: toNumber,
    Sum: intSum,
    Math: intMath,
    Currency: intCurrency
  };
};