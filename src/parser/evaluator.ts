// src/parser/evaluator.ts

import { TemplateData, IParserContext } from '../utils/types';
import { FunctionManager } from '../functions';

/**
 * Gestisce l'evaluation delle espressioni preservando i tipi originali
 */
export class Evaluator {
  private parser: IParserContext;
  private functionManager: FunctionManager;

  constructor(parser: IParserContext, functionManager: FunctionManager) {
    this.parser = parser;
    this.functionManager = functionManager;
  }

  /**
   * Valuta una singola espressione preservando il tipo originale
   * A differenza di parse() che ritorna sempre stringhe, evaluate() mantiene i tipi
   * 
   * @param expression L'espressione da valutare (es. "user.name", "@Math|+|2|3", "#@ArraySum|items|{price}")
   * @param data Il contesto dati principale
   * @param otherData Il contesto dati secondario (usato da '##@')
   * @returns Il risultato dell'evaluation, preservando il tipo originale
   */
  public evaluate(expression: string, data: any, otherData: any = null): any {
    try {
      let value: any = null;
      const trimmedExpression = expression.trim();

      // 1. Controlla sintassi funzioni speciali (!@, @, #@, ##@)
      if (trimmedExpression.indexOf('!@') === 0 && trimmedExpression.indexOf('|') > 0) {
        const parameters = trimmedExpression.split('|');
        const functionName = parameters[0].substring(2);
        const func = this.functionManager.getFunction(functionName);
        
        if (func) {
          // Logica originale per '!@' passava 'data'
          value = (func as any)(data, parameters.slice(1));
        } else {
          console.warn(`Function ${functionName} not found for expression: ${expression}`);
          value = undefined;
        }
      } 
      else if (trimmedExpression.indexOf('@') === 0 && trimmedExpression.indexOf('|') > 0) {
        const parameters = trimmedExpression.split('|');
        const functionName = parameters[0].substring(1);
        const func = this.functionManager.getFunction(functionName);
        
        if (func) {
          // Chiama la funzione solo con parametri espliciti
          value = (func as any)(parameters.slice(1));
        } else {
          console.warn(`Function ${functionName} not found for expression: ${expression}`);
          value = undefined;
        }
      } 
      else if (trimmedExpression.indexOf('#@') === 0 && trimmedExpression.indexOf('|') > 0) {
        const parameters = trimmedExpression.split('|');
        const functionName = parameters[0].substring(2);
        const func = this.functionManager.getFunction(functionName);
        
        if (func) {
          // Chiama la funzione passando 'data' e parametri
          value = (func as any)(data, parameters.slice(1));
        } else {
          console.warn(`Function ${functionName} not found for expression: ${expression}`);
          value = undefined;
        }
      } 
      else if (trimmedExpression.indexOf('##@') === 0 && trimmedExpression.indexOf('|') > 0) {
        const parameters = trimmedExpression.split('|');
        const functionName = parameters[0].substring(3);
        const func = this.functionManager.getFunction(functionName);
        
        if (func) {
          // Chiama la funzione passando 'otherData', 'data' e parametri
          value = (func as any)(otherData, data, parameters.slice(1));
        } else {
          console.warn(`Function ${functionName} not found for expression: ${expression}`);
          value = undefined;
        }
      }
      // 2. Se non è una funzione speciale, risolvi come chiave/percorso
      else {
        // Usa fromContext per risolvere il valore
        // Questo gestisce "obj.prop", "array[0]", "array[key,field]"
        value = this.parser.fromContext(data, trimmedExpression);
      }

      // Ritorna il valore così com'è, senza convertirlo in stringa
      // e senza cambiare null/undefined in ''
      return value;

    } catch (error) {
      console.error(`Error evaluating expression: "${expression}"`, error);
      return undefined;
    }
  }
}