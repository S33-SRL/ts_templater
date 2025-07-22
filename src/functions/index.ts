// src/functions/index.ts

import { IFunctionContext } from './types';
import { FunctionRegistry, TemplaterFunction } from '../utils/types';
import { mathFunctions } from './math';
import { dateFunctions } from './date';
import { stringFunctions } from './string';
import { arrayFunctions } from './array';

/**
 * Gestisce il registro delle funzioni per TsTemplater
 */
export class FunctionManager {
  private functions: FunctionRegistry = {};
  private context: IFunctionContext;

  constructor(context: IFunctionContext) {
    this.context = context;
    this.initializeBuiltInFunctions();
  }

  /**
   * Inizializza tutte le funzioni built-in
   */
  private initializeBuiltInFunctions(): void {
    // Ottiene tutte le funzioni dalle factory
    const math = mathFunctions(this.context);
    const date = dateFunctions(this.context);
    const string = stringFunctions(this.context);
    const array = arrayFunctions(this.context);

    // Combina tutte le funzioni nel registro
    this.functions = {
      ...math,
      ...date,
      ...string,
      ...array
    };
  }

  /**
   * Aggiunge o sovrascrive funzioni custom
   * @param customFunctions Oggetto con le funzioni custom
   */
  public setFunctions(customFunctions: Record<string, TemplaterFunction>): void {
    this.functions = { ...this.functions, ...customFunctions };
  }

  /**
   * Ottiene una funzione dal registro
   * @param name Nome della funzione
   * @returns La funzione o undefined se non trovata
   */
  public getFunction(name: string): TemplaterFunction | undefined {
    return this.functions[name];
  }

  /**
   * Verifica se una funzione esiste
   * @param name Nome della funzione
   * @returns true se la funzione esiste
   */
  public hasFunction(name: string): boolean {
    return name in this.functions;
  }

  /**
   * Ottiene tutti i nomi delle funzioni registrate
   * @returns Array con i nomi delle funzioni
   */
  public getFunctionNames(): string[] {
    return Object.keys(this.functions);
  }

  /**
   * Aggiorna il contesto (es. quando cambia la lingua)
   * @param newContext Nuovo contesto
   */
  public updateContext(newContext: Partial<IFunctionContext>): void {
    this.context = { ...this.context, ...newContext };
    // Reinizializza le funzioni con il nuovo contesto
    this.initializeBuiltInFunctions();
  }
}

// Re-export dei tipi
export * from './types';
export { mathFunctions } from './math';
export { dateFunctions } from './date';
export { stringFunctions } from './string';
export { arrayFunctions } from './array';