// src/utils/index.ts

/**
 * Escapa i caratteri speciali per l'uso in espressioni regolari
 * @param str Stringa da escapare
 * @returns Stringa con caratteri speciali escapati
 */
export function escape(str: string): string {
  const metaChar = /[-[\]{}()*+?.\\^$|,]/g;
  return str.replace(metaChar, "\\$&");
}

/**
 * Trova il primo elemento di un array che corrisponde a un valore in un campo specifico
 * Supporta l'accesso a campi annidati
 * 
 * @param array Array da cercare
 * @param key Valore da cercare
 * @param fieldName Array di nomi di campo per navigare nell'oggetto
 * @returns L'elemento trovato o null
 */
export function arrayFirstByField(array: Array<any>, key: string, fieldName: string[]): any {
  if (!array) return null;
  if (!Array.isArray(array)) return null;
  
  return array.find(x => {
    let val = x;
    // Naviga attraverso i campi annidati
    for (let field of fieldName) {
      val = val[field];
    }
    return val == key;
  });
}

/**
 * Converte un valore in stringa in modo sicuro
 * @param value Valore da convertire
 * @returns Stringa risultante
 */
export function safeToString(value: any): string {
  if (value === undefined || value === null) {
    return '';
  } else if (typeof value !== 'string') {
    return String(value);
  }
  return value;
}

// Re-export dei tipi
export * from './types';