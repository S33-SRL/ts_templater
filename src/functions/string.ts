// src/functions/string.ts

import { FunctionFactory, IFunctionContext } from './types';
import { FunctionParams } from '../utils/types';

/**
 * Factory per le funzioni di manipolazione stringhe e logica
 */
export const stringFunctions: FunctionFactory = (context: IFunctionContext) => {
  
  /**
   * Converte un valore in booleano
   * @param params [0]: valore da convertire
   * @returns 'true' o 'false' come stringa
   */
  const intToBool = (params: FunctionParams) => {
    if (!params || params.length != 1) return null;

    if (params[0] == 'false' || params[0] === '' || params[0] == "0" || 
        params[0] == undefined || params[0] == 'undefined' || params[0] == null) {
      return 'false';
    }

    return 'true';
  };

  /**
   * Nega un valore booleano
   * @param params [0]: valore da negare
   * @returns 'true' o 'false' come stringa
   */
  const intNot = (params: FunctionParams) => {
    if (!params || params.length != 1) return null;

    const result = intToBool(params);
    return result == 'true' ? 'false' : 'true';
  };

  /**
   * Gestisce valori null con fallback
   * @param params [0]: valore da controllare
   *               [1]: valore di fallback (se 2 params) o valore se non null (se 3 params)
   *               [2]: valore se null (se 3 params)
   * @returns Valore appropriato basato sul controllo null
   */
  const intIsNull = (params: FunctionParams) => {
    if (!params || (params.length !== 2 && params.length !== 3)) return null;
    
    const isNullOrEmpty = params[0] === null || params[0] === undefined || 
                         (typeof params[0] === 'string' && params[0].trim() === '');
    
    if (params.length === 2) {
      return isNullOrEmpty ? params[1] : params[0];
    }

    return isNullOrEmpty ? params[2] : params[1];
  };

  /**
   * Valuta una condizione e restituisce il valore appropriato
   * @param params [0]: condizione da valutare
   *               [1]: valore se true
   *               [2]: valore se false
   * @returns Valore basato sulla condizione
   */
  const intIf = (params: FunctionParams) => {
    if (!params || params.length < 2 || params.length > 3) return null;
    
    let result = null;
    try {
      result = eval(params[0]);
    } catch(ex) {
      console.error("[INTIF] Parameters", params[0]);
      console.error("[INTIF] ERROR", ex);
    }
    
    return result ? params[1] : params[2];
  };

  /**
   * Switch condizionale
   * @param params [0]: valore da confrontare
   *               [1+]: pattern "case:value" o "default:value"
   * @param insensitive Se true, confronto case-insensitive
   * @returns Valore corrispondente al case
   */
  const intSwitch = (params: FunctionParams, insensitive: boolean = false) => {
    if (!params || params.length < 2) return null;
    
    let i = 1;
    while (params[i]) {
      const index = params[i].indexOf(':');
      if (index <= 0) return params[i];
      
      const conditionValue = params[i].slice(0, index);
      const returnValue = params[i].slice(index + 1);
      
      if (conditionValue == 'default' || 
          (!insensitive && conditionValue == params[0]) || 
          (insensitive && conditionValue.toLocaleLowerCase() == params[0].toLocaleLowerCase())) {
        return returnValue;
      }
      i++;
    }

    return null;
  };

  /**
   * Switch case-insensitive
   */
  const intSwitchCaseInsensitive = (params: FunctionParams) => {
    return intSwitch(params, true);
  };

  /**
   * Controlla se una stringa contiene un'altra stringa
   * @param params [0]: stringa da cercare in
   *               [1]: stringa da cercare
   *               [2]: valore se trovato (o stringa originale se non specificato)
   *               [3]: valore se non trovato (opzionale)
   * @returns Valore appropriato basato sul risultato
   */
  const intContains = (params: FunctionParams) => {
    if (!params || params.length < 2 || params.length > 4) return null;
    
    const contains = params[0]?.toLowerCase().includes(params[1].toLowerCase());
    
    if (contains) {
      return params.length >= 3 ? params[2] : params[0];
    } else if (params.length === 4) {
      return params[3];
    }
    
    return null;
  };

  /**
   * Aggiunge padding all'inizio di una stringa
   * @param params [0]: stringa originale
   *               [1]: lunghezza finale
   *               [2]: carattere di riempimento
   * @returns Stringa con padding
   */
  const intPadStart = (params: FunctionParams) => {
    if (!params || params.length < 2) return null;
    const value: string = params[0].toString();
    return value.padStart(params[1], params[2]);
  };

  /**
   * Aggiunge padding alla fine di una stringa
   * @param params [0]: stringa originale
   *               [1]: lunghezza finale
   *               [2]: carattere di riempimento
   * @returns Stringa con padding
   */
  const intPadEnd = (params: FunctionParams) => {
    if (!params || params.length < 2) return null;
    const value: string = params[0].toString();
    return value.padEnd(params[1], params[2]);
  };

  return {
    Bool: intToBool,
    Not: intNot,
    IsNull: intIsNull,
    If: intIf,
    Switch: intSwitch,
    SwitchInsensitive: intSwitchCaseInsensitive,
    Contains: intContains,
    PadStart: intPadStart,
    PadEnd: intPadEnd
  };
};