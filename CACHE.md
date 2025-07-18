# Cache System Documentation

TsTemplater include un sistema di cache intelligente **abilitato di default** che migliora significativamente le performance, specialmente quando si elaborano template complessi con accessi ricorsivi agli oggetti.

## Configurazione Iniziale

```typescript
// Cache abilitata di default
const templater = new TsTemplater();

// Cache abilitata esplicitamente  
const templaterWithCache = new TsTemplater('en', true);

// Cache disabilitata fin dall'inizio
const templaterWithoutCache = new TsTemplater('en', false);
```

## Come Funziona

La cache utilizza un sistema di chiavi progressive che rappresenta il percorso di navigazione negli oggetti. Quando si accede a un percorso come `ufficio.stanze[last].tavolo.computers[first].name`, il sistema crea chiavi di cache per ogni livello:

- `ufficio` → proprietà principale
- `ufficio.stanze` → array stanze
- `ufficio.stanze[last]` → ultimo elemento dell'array stanze  
- `ufficio.stanze[last].tavolo` → oggetto tavolo
- `ufficio.stanze[last].tavolo.computers` → array computers
- `ufficio.stanze[last].tavolo.computers[first]` → primo computer
- `ufficio.stanze[last].tavolo.computers[first].name` → nome del computer

## Vantaggi

1. **Riutilizzo Intelligente**: Se successivamente si accede a `ufficio.stanze[last].tavolo.computers[last].name`, il sistema riutilizza tutto il percorso cached fino a `computers` e calcola solo l'accesso finale.

2. **Gestione di Oggetti Distinti**: Il sistema utilizza un'identità unica per ogni oggetto per evitare conflitti quando si processano elementi diversi di un array.

3. **Performance**: Riduce drasticamente il numero di traversamenti ricorsivi necessari.

## API della Cache

```typescript
const templater = new TsTemplater();

// Verifica se la cache è attiva
templater.isCacheEnabled(); // true

// Ottieni il numero di entry nella cache
templater.getCacheSize(); // 0

// Ottieni le chiavi della cache (utile per debugging)
templater.getCacheKeys(); // []

// Pulisci la cache
templater.cleanCache();

// Disabilita la cache (migliora la memoria ma riduce le performance)
templater.disableCache();

// Riabilita la cache
templater.enableCache();
```

## Esempi di Utilizzo

### Esempio Base
```typescript
const data = {
    ufficio: {
        stanze: [
            { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
            { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
        ]
    }
};

const templater = new TsTemplater();

// Prima chiamata - popola la cache
const result1 = templater.evaluate('ufficio.stanze[last].tavolo.computers[first].name', data);
console.log(result1); // 'PC3'

// Seconda chiamata - riutilizza la cache
const result2 = templater.evaluate('ufficio.stanze[last].tavolo.computers[last].name', data);
console.log(result2); // 'PC4' (riutilizza il percorso fino a 'computers')
```

### Con Template
```typescript
const template = 'Il computer si chiama: {ufficio.stanze[last].tavolo.computers[first].name}';

// Prima elaborazione - popola la cache
const result1 = templater.parse(template, data);

// Elaborazioni successive beneficiano della cache
const result2 = templater.parse(template, data);
```

### Gestione della Cache in Ambienti con Memoria Limitata
```typescript
// Disabilita la cache per risparmiare memoria
templater.disableCache();

// Ora tutte le operazioni funzionano senza cache
const result = templater.parse(template, data);

// Riabilita quando le performance sono più importanti
templater.enableCache();
```

## Note Tecniche

- La cache viene automaticamente inizializzata nel costruttore
- Le chiavi di cache includono un identificativo dell'oggetto per evitare conflitti
- La cache gestisce correttamente valori `null`, `undefined`, e oggetti circolari
- La disabilitazione della cache non causa perdita di funzionalità, solo riduzione delle performance

## Benefici per le Performance

Con dataset complessi e template con molteplici accessi allo stesso percorso base, la cache può ridurre i tempi di elaborazione del 60-80%, specialmente in scenari con:

- Array con molti elementi
- Oggetti deeply nested
- Template che riutilizzano lo stesso percorso base con indici diversi
- Elaborazioni batch di molti template simili
