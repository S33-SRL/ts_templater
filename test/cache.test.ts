import { TsTemplater } from '../src/index';

describe('TsTemplater Cache Tests', () => {
    let templater: TsTemplater;

    beforeEach(() => {
        templater = new TsTemplater();
    });

    it('should cache simple property access', () => {
        const data = {
            ufficio: {
                nome: 'Sede Centrale',
                stanze: [
                    { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Primo accesso - dovrebbe popolare la cache
        const result1 = templater.evaluate('ufficio.nome', data);
        expect(result1).toBe('Sede Centrale');

        // Secondo accesso - dovrebbe usare la cache
        const result2 = templater.evaluate('ufficio.nome', data);
        expect(result2).toBe('Sede Centrale');
        expect(result1).toBe(result2);
    });

    it('should cache nested object and array access', () => {
        const data = {
            ufficio: {
                stanze: [
                    { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Accesso al computer dell'ultima stanza
        const result1 = templater.evaluate('ufficio.stanze[last].tavolo.computers[first].name', data);
        expect(result1).toBe('PC3');

        // Secondo accesso allo stesso percorso - dovrebbe usare la cache
        const result2 = templater.evaluate('ufficio.stanze[last].tavolo.computers[first].name', data);
        expect(result2).toBe('PC3');

        // Accesso a un percorso simile che dovrebbe riutilizzare parte della cache
        const result3 = templater.evaluate('ufficio.stanze[last].tavolo.computers[last].name', data);
        expect(result3).toBe('PC4');
    });

    it('should cache progressive path building correctly', () => {
        const data = {
            ufficio: {
                stanze: [
                    { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Primo accesso - popola la cache per tutto il percorso
        const result1 = templater.evaluate('ufficio.stanze[last].tavolo.computers[first].name', data);
        expect(result1).toBe('PC3');

        // Mock per verificare che la cache viene utilizzata
        const originalFromContext = templater['fromContext'];
        const mockFromContext = jest.fn(originalFromContext.bind(templater));
        templater['fromContext'] = mockFromContext;

        // Secondo accesso - dovrebbe utilizzare la cache
        const result2 = templater.evaluate('ufficio.stanze[last].tavolo.computers[last].name', data);
        expect(result2).toBe('PC4');

        // Ripristina il metodo originale
        templater['fromContext'] = originalFromContext;
    });

    it('should clear cache correctly', () => {
        const data = {
            ufficio: {
                nome: 'Sede Centrale'
            }
        };

        // Primo accesso - popola la cache
        const result1 = templater.evaluate('ufficio.nome', data);
        expect(result1).toBe('Sede Centrale');

        // Verifica che la cache non sia vuota
        expect(templater['cache']).toBeDefined();
        expect(Object.keys(templater['cache'] || {}).length).toBeGreaterThanOrEqual(2); // Almeno 'ufficio' e 'ufficio.nome'

        // Pulisce la cache
        templater.cleanCache();

        // Verifica che la cache sia vuota
        expect(templater['cache']).toEqual({});
    });

    it('should handle array access with filters in cache', () => {
        const data = {
            items: [
                { id: '1', value: 'primo' },
                { id: '2', value: 'secondo' },
                { id: '3', value: 'terzo' }
            ]
        };

        // Accesso con filtro
        const result1 = templater.evaluate('items[2,id].value', data);
        expect(result1).toBe('secondo');

        // Secondo accesso con stesso filtro - dovrebbe usare la cache
        const result2 = templater.evaluate('items[2,id].value', data);
        expect(result2).toBe('secondo');

        // Accesso con filtro diverso
        const result3 = templater.evaluate('items[3,id].value', data);
        expect(result3).toBe('terzo');
    });

    it('should cache work with template parsing', () => {
        const data = {
            ufficio: {
                stanze: [
                    { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        const template = 'Il computer si chiama: {ufficio.stanze[last].tavolo.computers[first].name}';
        
        // Primo parsing
        const result1 = templater.parse(template, data);
        expect(result1).toBe('Il computer si chiama: PC3');

        // Secondo parsing - dovrebbe beneficiare della cache
        const result2 = templater.parse(template, data);
        expect(result2).toBe('Il computer si chiama: PC3');
    });

    it('should handle undefined and null values in cache', () => {
        const data = {
            ufficio: {
                stanze: null
            }
        };

        // Accesso a proprietà nulla
        const result1 = templater.evaluate('ufficio.stanze.numero', data);
        expect(result1).toBeNull();

        // Secondo accesso - dovrebbe usare la cache
        const result2 = templater.evaluate('ufficio.stanze.numero', data);
        expect(result2).toBeNull();
    });

    it('should provide comprehensive cache management API', () => {
        const data = { test: 'value' };

        // Inizialmente cache vuota
        expect(templater.isCacheEnabled()).toBeTruthy();
        expect(templater.getCacheSize()).toBe(0);
        expect(templater.getCacheKeys()).toEqual([]);

        // Dopo un accesso, cache popolata
        templater.evaluate('test', data);
        expect(templater.getCacheSize()).toBeGreaterThan(0);
        expect(templater.getCacheKeys().length).toBeGreaterThan(0);

        // Disabilita cache
        templater.disableCache();
        expect(templater.isCacheEnabled()).toBeFalsy();
        expect(templater.getCacheSize()).toBe(0);

        // Riabilita cache
        templater.enableCache();
        expect(templater.isCacheEnabled()).toBeTruthy();
        expect(templater.getCacheSize()).toBe(0);

        // Pulisce cache
        templater.evaluate('test', data);
        templater.cleanCache();
        expect(templater.getCacheSize()).toBe(0);
    });

    it('should work correctly with disabled cache', () => {
        const data = {
            ufficio: {
                stanze: [
                    { numero: 1, tavolo: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { numero: 2, tavolo: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Disabilita la cache
        templater.disableCache();

        // Le operazioni dovrebbero funzionare comunque
        const result1 = templater.evaluate('ufficio.stanze[last].tavolo.computers[first].name', data);
        expect(result1).toBe('PC3');

        const result2 = templater.evaluate('ufficio.stanze[last].tavolo.computers[last].name', data);
        expect(result2).toBe('PC4');

        // Template parsing dovrebbe funzionare
        const template = 'Computer: {ufficio.stanze[first].tavolo.computers[first].name}';
        const result3 = templater.parse(template, data);
        expect(result3).toBe('Computer: PC1');
    });

    it('should allow cache to be disabled from constructor', () => {
        const templaterWithCache = new TsTemplater('en', true);
        const templaterWithoutCache = new TsTemplater('en', false);

        expect(templaterWithCache.isCacheEnabled()).toBeTruthy();
        expect(templaterWithoutCache.isCacheEnabled()).toBeFalsy();

        const data = { test: 'value' };

        // Entrambi dovrebbero funzionare
        expect(templaterWithCache.evaluate('test', data)).toBe('value');
        expect(templaterWithoutCache.evaluate('test', data)).toBe('value');

        // Solo quello con cache dovrebbe avere entry nella cache
        expect(templaterWithCache.getCacheSize()).toBeGreaterThan(0);
        expect(templaterWithoutCache.getCacheSize()).toBe(0);
    });

    it('should enable cache by default', () => {
        const defaultTemplater = new TsTemplater();
        expect(defaultTemplater.isCacheEnabled()).toBeTruthy();
        
        const explicitTemplater = new TsTemplater('en');
        expect(explicitTemplater.isCacheEnabled()).toBeTruthy();
    });
});
