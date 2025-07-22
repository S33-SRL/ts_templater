// src/functions/date.ts

import dayjs from 'dayjs';
import { FunctionFactory, IFunctionContext } from './types';
import { FunctionParams } from '../utils/types';

/**
 * Factory per le funzioni di gestione date
 */
export const dateFunctions: FunctionFactory = (context: IFunctionContext) => {
  
  /**
   * Formatta una data secondo il formato specificato
   * @param params [0]: data da formattare
   *               [1]: formato di output (se solo 2 params)
   *               [1]: formato di input, [2]: formato di output (se 3 params)
   * @returns Data formattata come stringa
   */
  const intDate = (params: FunctionParams) => {
    if (!params || params.length < 1) return null;
    
    // Se solo 1 parametro, ritorna così com'è
    if (params.length === 1) return params[0];

    // Se 3 parametri: data, formato input, formato output
    if (params.length === 3) {
      const mdt = dayjs(params[0], params[1]);
      return mdt.isValid() ? mdt.format(params[2]) : '';
    }
    
    // Se 2 parametri: data, formato output
    const mdt = dayjs(params[0]);
    return mdt.isValid() ? mdt.format(params[1]) : '';
  };

  return {
    Date: intDate
  };
};