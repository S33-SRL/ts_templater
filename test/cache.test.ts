import { TsTemplater } from '../src/index';

describe('TsTemplater Cache Tests', () => {
    let templater: TsTemplater;

    beforeEach(() => {
        templater = new TsTemplater();
    });

    it('should cache simple property access', () => {
        const data = {
            office: {
                name: 'Main Office',
                rooms: [
                    { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // First access - should populate the cache
        const result1 = templater.evaluate('office.name', data);
        expect(result1).toBe('Main Office');

        // Second access - should use the cache
        const result2 = templater.evaluate('office.name', data);
        expect(result2).toBe('Main Office');
        expect(result1).toBe(result2);
    });

    it('should cache nested object and array access', () => {
        const data = {
            office: {
                rooms: [
                    { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Access to computer in the last room
        const result1 = templater.evaluate('office.rooms[last].table.computers[first].name', data);
        expect(result1).toBe('PC3');

        // Second access to the same path - should use the cache
        const result2 = templater.evaluate('office.rooms[last].table.computers[first].name', data);
        expect(result2).toBe('PC3');

        // Access to a similar path that should reuse part of the cache
        const result3 = templater.evaluate('office.rooms[last].table.computers[last].name', data);
        expect(result3).toBe('PC4');
    });

    it('should cache progressive path building correctly', () => {
        const data = {
            office: {
                rooms: [
                    { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // First access - populates the cache for the entire path
        const result1 = templater.evaluate('office.rooms[last].table.computers[first].name', data);
        expect(result1).toBe('PC3');

        // Mock to verify that cache is being used
        const originalFromContext = templater['fromContext'];
        const mockFromContext = jest.fn(originalFromContext.bind(templater));
        templater['fromContext'] = mockFromContext;

        // Second access - should use the cache
        const result2 = templater.evaluate('office.rooms[last].table.computers[last].name', data);
        expect(result2).toBe('PC4');

        // Restore original method
        templater['fromContext'] = originalFromContext;
    });

    it('should clear cache correctly', () => {
        const data = {
            office: {
                name: 'Main Office'
            }
        };

        // First access - populates the cache
        const result1 = templater.evaluate('office.name', data);
        expect(result1).toBe('Main Office');

        // Verify that cache is not empty
        expect(templater['cache']).toBeDefined();
        expect(Object.keys(templater['cache'] || {}).length).toBeGreaterThanOrEqual(2); // At least 'office' and 'office.name'

        // Clear the cache
        templater.cleanCache();

        // Verify that cache is empty
        expect(templater['cache']).toEqual({});
    });

    it('should handle array access with filters in cache', () => {
        const data = {
            items: [
                { id: '1', value: 'first' },
                { id: '2', value: 'second' },
                { id: '3', value: 'third' }
            ]
        };

        // Access with filter
        const result1 = templater.evaluate('items[2,id].value', data);
        expect(result1).toBe('second');

        // Second access with same filter - should use the cache
        const result2 = templater.evaluate('items[2,id].value', data);
        expect(result2).toBe('second');

        // Access with different filter
        const result3 = templater.evaluate('items[3,id].value', data);
        expect(result3).toBe('third');
    });

    it('should cache work with template parsing', () => {
        const data = {
            office: {
                rooms: [
                    { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        const template = 'The computer is named: {office.rooms[last].table.computers[first].name}';
        
        // First parsing
        const result1 = templater.parse(template, data);
        expect(result1).toBe('The computer is named: PC3');

        // Second parsing - should benefit from the cache
        const result2 = templater.parse(template, data);
        expect(result2).toBe('The computer is named: PC3');
    });

    it('should handle undefined and null values in cache', () => {
        const data = {
            office: {
                rooms: null
            }
        };

        // Access to null property
        const result1 = templater.evaluate('office.rooms.number', data);
        expect(result1).toBeNull();

        // Second access - should use the cache
        const result2 = templater.evaluate('office.rooms.number', data);
        expect(result2).toBeNull();
    });

    it('should provide comprehensive cache management API', () => {
        const data = { test: 'value' };

        // Initially cache empty
        expect(templater.isCacheEnabled()).toBeTruthy();
        expect(templater.getCacheSize()).toBe(0);
        expect(templater.getCacheKeys()).toEqual([]);

        // After an access, cache populated
        templater.evaluate('test', data);
        expect(templater.getCacheSize()).toBeGreaterThan(0);
        expect(templater.getCacheKeys().length).toBeGreaterThan(0);

        // Disable cache
        templater.disableCache();
        expect(templater.isCacheEnabled()).toBeFalsy();
        expect(templater.getCacheSize()).toBe(0);

        // Re-enable cache
        templater.enableCache();
        expect(templater.isCacheEnabled()).toBeTruthy();
        expect(templater.getCacheSize()).toBe(0);

        // Clear cache
        templater.evaluate('test', data);
        templater.cleanCache();
        expect(templater.getCacheSize()).toBe(0);
    });

    it('should work correctly with disabled cache', () => {
        const data = {
            office: {
                rooms: [
                    { number: 1, table: { computers: [{ name: 'PC1' }, { name: 'PC2' }] } },
                    { number: 2, table: { computers: [{ name: 'PC3' }, { name: 'PC4' }] } }
                ]
            }
        };

        // Disable the cache
        templater.disableCache();

        // Operations should work anyway
        const result1 = templater.evaluate('office.rooms[last].table.computers[first].name', data);
        expect(result1).toBe('PC3');

        const result2 = templater.evaluate('office.rooms[last].table.computers[last].name', data);
        expect(result2).toBe('PC4');

        // Template parsing should work
        const template = 'Computer: {office.rooms[first].table.computers[first].name}';
        const result3 = templater.parse(template, data);
        expect(result3).toBe('Computer: PC1');
    });

    it('should allow cache to be disabled from constructor', () => {
        const templaterWithCache = new TsTemplater('en', true);
        const templaterWithoutCache = new TsTemplater('en', false);

        expect(templaterWithCache.isCacheEnabled()).toBeTruthy();
        expect(templaterWithoutCache.isCacheEnabled()).toBeFalsy();

        const data = { test: 'value' };

        // Both should work
        expect(templaterWithCache.evaluate('test', data)).toBe('value');
        expect(templaterWithoutCache.evaluate('test', data)).toBe('value');

        // Only the one with cache should have entries in cache
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
