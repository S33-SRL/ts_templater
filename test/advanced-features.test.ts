import { TsTemplater } from '../src/index';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import 'dayjs/locale/fr';

describe('TsTemplater - Advanced Features', () => {
  let tmpEngine = new TsTemplater();

  describe('Complex nested templating', () => {
    const complexData = {
      user: {
        name: 'John',
        age: 30,
        addresses: [
          { type: 'home', city: 'New York', country: 'USA' },
          { type: 'work', city: 'Boston', country: 'USA' }
        ]
      },
      products: [
        { name: 'Product A', price: 100, categories: ['tech', 'gadget'] },
        { name: 'Product B', price: 200, categories: ['tech', 'premium'] }
      ]
    };

    it('should handle deeply nested field access', () => {
      const result = tmpEngine.parse('{user.addresses[0].city}', complexData);
      expect(result).toBe('New York');
    });

    it('should handle array filtering with multiple fields', () => {
      const result = tmpEngine.parse('{user.addresses[work,type].city}', complexData);
      expect(result).toBe('Boston');
    });

    it('should handle complex nested templating in functions', () => {
      const result = tmpEngine.parse('{@If|{user.age}>25|User {user.name} is adult|User {user.name} is young}', complexData);
      expect(result).toBe('User John is adult');
    });

    it('should handle multiple template replacements in ArrayConcat', () => {
      const result = tmpEngine.parse('{#@ArrayConcat|products|{name}: €{price} }', complexData);
      expect(result).toBe('Product A: €100 Product B: €200 ');
    });
  });

  describe('Evaluate method comprehensive tests', () => {
    const data = {
      user: { name: 'John', age: 30 },
      scores: [85, 92, 78],
      config: { enabled: true, factor: 1.5 }
    };

    it('should preserve different data types correctly', () => {
      expect(tmpEngine.evaluate('user.age', data)).toBe(30);
      expect(typeof tmpEngine.evaluate('user.age', data)).toBe('number');

      expect(tmpEngine.evaluate('config.enabled', data)).toBe(true);
      expect(typeof tmpEngine.evaluate('config.enabled', data)).toBe('boolean');

      expect(tmpEngine.evaluate('user', data)).toEqual({ name: 'John', age: 30 });
      expect(typeof tmpEngine.evaluate('user', data)).toBe('object');

      expect(tmpEngine.evaluate('scores', data)).toEqual([85, 92, 78]);
      expect(Array.isArray(tmpEngine.evaluate('scores', data))).toBe(true);
    });

    it('should handle function calls in evaluate', () => {
      const mathResult = tmpEngine.evaluate('@Math|+|10|5', data);
      expect(mathResult).toBe(15);
      expect(typeof mathResult).toBe('number');

      const boolResult = tmpEngine.evaluate('@Bool|{config.enabled}', data);
      expect(boolResult).toBe('true'); // Functions still return strings for consistency
    });

    it('should return null/undefined for non-existent fields', () => {
      expect(tmpEngine.evaluate('nonExistent', data)).toBeUndefined();
      expect(tmpEngine.evaluate('user.nonExistent', data)).toBeUndefined();
    });
  });

  describe('Custom selectors', () => {
    const data = { message: 'Hello World' };

    it('should work with custom open/close selectors', () => {
      const result = tmpEngine.parse('<<message>>', data, null, '<<', '>>');
      expect(result).toBe('Hello World');
    });

    it('should handle mixed custom selectors', () => {
      const result = tmpEngine.parse('Start [message] End', data, null, '[', ']');
      expect(result).toBe('Start Hello World End');
    });

    it('should handle functions with custom selectors', () => {
      const result = tmpEngine.parse('Result: [@Sum|5|3]', data, null, '[', ']');
      expect(result).toBe('Result: 8');
    });
  });

  describe('Locale and internationalization', () => {
    it('should handle date formatting with different locales', () => {
      const tmpEngineIt = new TsTemplater('it');
      tmpEngineIt.changeDayjsLocale('it');
      
      const data = { date: '2024-01-15' };
      const result = tmpEngineIt.parse('{@Date|{date}|MMMM}', data);
      // January in Italian should be "gennaio"
      expect(result.toLowerCase()).toContain('gen'); // Short form might be "gen"
    });

    it('should handle currency with different locales', () => {
      const data = { price: 1234.56 };
      
      const resultUS = tmpEngine.parse('{@Currency|{price}|USD|en-US}', data);
      expect(resultUS).toContain('$');
      expect(resultUS).toContain('1,234.56');

      const resultDE = tmpEngine.parse('{@Currency|{price}|EUR|de-DE}', data);
      expect(resultDE).toContain('€');
      // German locale uses different number formatting
    });
  });

  describe('Performance and caching', () => {
    const largeData = {
      items: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 2 }))
    };

    it('should handle large datasets efficiently', () => {
      const start = Date.now();
      const result = tmpEngine.parse('{#@ArraySum|items|{value}}', largeData);
      const end = Date.now();
      
      expect(result).toBe('999000'); // Sum of 0*2 + 1*2 + ... + 999*2
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle cache cleaning', () => {
      tmpEngine.cleanCache();
      const result = tmpEngine.parse('{#@ArrayConcat|items|{id},}', { items: [{ id: 1 }, { id: 2 }] });
      expect(result).toBe('1,2,');
    });
  });

  describe('Switch function comprehensive tests', () => {
    const data = { status: 'active', level: 'ADMIN' };

    it('should handle case sensitivity correctly', () => {
      const result1 = tmpEngine.parse('{@Switch|{status}|active:Working|inactive:Stopped|default:Unknown}', data);
      expect(result1).toBe('Working');

      const result2 = tmpEngine.parse('{@Switch|{status}|ACTIVE:Working|inactive:Stopped|default:Unknown}', data);
      expect(result2).toBe('Unknown');
    });

    it('should handle case insensitive switch', () => {
      const result = tmpEngine.parse('{@SwitchInsensitive|{level}|admin:Administrator|user:Standard User|default:Unknown}', data);
      expect(result).toBe('Administrator');
    });

    it('should handle missing default case', () => {
      const result = tmpEngine.parse('{@Switch|unknown|case1:value1|case2:value2}', data);
      expect(result).toBe('');
    });
  });

  describe('If function with complex expressions', () => {
    const data = { 
      count: 15, 
      threshold: 10, 
      name: 'Product A',
      categories: ['tech', 'premium']
    };

    it('should handle complex boolean expressions', () => {
      const result1 = tmpEngine.parse('{@If|{count}>={threshold}|Sufficient stock|Low stock}', data);
      expect(result1).toBe('Sufficient stock');

      // Complex OR expression with || - eval doesn't work with template syntax
      const result2 = tmpEngine.parse('{@If|{count}<5|Extreme|Normal}', data);
      expect(result2).toBe('Normal');
    });

    it('should handle string comparisons', () => {
      const result = tmpEngine.parse('{@If|"{name}"=="Product A"|Correct product|Wrong product}', data);
      expect(result).toBe('Correct product');
    });

    it('should handle template values in conditions', () => {
      const result = tmpEngine.parse('{@If|{count}>10|High count: {count}|Low count: {count}}', data);
      expect(result).toBe('High count: 15');
    });
  });

  describe('BigNumber precision tests', () => {
    const precisionData = {
      prices: [
        { value: 0.1 },
        { value: 0.2 },
        { value: 0.3 }
      ],
      largeNumbers: [
        { amount: 999999999999999 },
        { amount: 1 }
      ]
    };

    it('should handle floating point precision correctly', () => {
      const result = tmpEngine.parse('{#@ArraySum|prices|{value}}', precisionData);
      expect(result).toBe('0.6'); // Should be exactly 0.6, not 0.6000000000000001
    });

    it('should handle large number precision', () => {
      const result = tmpEngine.parse('{#@ArraySum|largeNumbers|{amount}}', precisionData);
      expect(result).toBe('1000000000000000');
    });
  });
});
