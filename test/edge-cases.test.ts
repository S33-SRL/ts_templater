import { TsTemplater } from '../src/index';

describe('TsTemplater - Edge Cases and Error Handling', () => {
  let tmpEngine = new TsTemplater();

  describe('Invalid inputs and error handling', () => {
    const objExample = {
      normalValue: "test",
      numberValue: 42,
      arrayValue: [1, 2, 3]
    };

    it('should handle undefined/null data gracefully', () => {
      const result1 = tmpEngine.parse('{field}', null);
      expect(result1).toBe('');

      const result2 = tmpEngine.parse('{field}', undefined);
      expect(result2).toBe('');
    });

    it('should handle non-existent properties', () => {
      const result = tmpEngine.parse('{nonExistent.deep.property}', objExample);
      expect(result).toBe('');
    });

    it('should handle malformed template syntax', () => {
      const result1 = tmpEngine.parse('{unclosed', objExample);
      expect(result1).toBe('{unclosed');

      const result2 = tmpEngine.parse('unopened}', objExample);
      expect(result2).toBe('unopened}');
    });

    it('should handle invalid function calls', () => {
      const result1 = tmpEngine.parse('{@NonExistentFunction|param}', objExample);
      expect(result1).toBe('{@NonExistentFunction|param}'); // Returns original template when function not found

      const result2 = tmpEngine.parse('{@Date}', objExample); // Missing parameters
      expect(result2).toBe(''); // Returns empty string when function has wrong syntax
    });

    it('should handle circular references in nested access', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const result = tmpEngine.parse('{name}', circularObj);
      expect(result).toBe('test');
    });
  });

  describe('Array access edge cases', () => {
    const objWithArrays = {
      emptyArray: [],
      strings: ['a', 'b', 'c'],
      objects: [
        { name: 'first', value: 1 },
        { name: 'second', value: 2 }
      ]
    };

    it('should handle empty array access', () => {
      const result1 = tmpEngine.parse('{emptyArray[0]}', objWithArrays);
      expect(result1).toBe('');

      const result2 = tmpEngine.parse('{emptyArray[first]}', objWithArrays);
      expect(result2).toBe('');

      const result3 = tmpEngine.parse('{emptyArray[last]}', objWithArrays);
      expect(result3).toBe('');
    });

    it('should handle out-of-bounds array access', () => {
      const result1 = tmpEngine.parse('{strings[10]}', objWithArrays);
      expect(result1).toBe('');

      const result2 = tmpEngine.parse('{strings[-1]}', objWithArrays);
      expect(result2).toBe('');
    });

    it('should handle invalid array filter syntax', () => {
      const result = tmpEngine.parse('{objects[invalidFilter]}', objWithArrays);
      expect(result).toBe('');
    });
  });

  describe('Function parameter edge cases', () => {
    const objExample = { value: 42 };

    it('should handle functions with wrong parameter count', () => {
      // Sum needs 2 parameters
      const result1 = tmpEngine.parse('{@Sum|1}', objExample);
      expect(result1).toBe(''); // Returns null which becomes empty string

      // Math needs 3 parameters
      const result2 = tmpEngine.parse('{@Math|+|1}', objExample);
      expect(result2).toBe(''); // Returns null which becomes empty string
    });

    it('should handle functions with empty parameters', () => {
      const result1 = tmpEngine.parse('{@Sum||5}', objExample);
      expect(result1).toBe(5); // Should handle empty as 0

      const result2 = tmpEngine.parse('{@IsNull||default}', objExample);
      expect(result2).toBe('default');
    });

    it('should handle invalid Date formats', () => {
      const result1 = tmpEngine.parse('{@Date|invalid-date|YYYY}', objExample);
      expect(result1).toBe(''); // Invalid date returns empty string

      const result2 = tmpEngine.parse('{@Date|2024-01-01|INVALID-FORMAT}', objExample);
      expect(result2).toBe('INVAMLI1-FOR1AMT'); // dayjs tries to format with invalid pattern
    });

    it('should handle invalid mathematical operations', () => {
      const result1 = tmpEngine.parse('{@Math|/|5|0}', objExample); // Division by zero
      expect(result1).toBe(Infinity);

      const result2 = tmpEngine.parse('{@Math|invalid|5|3}', objExample); // Invalid operator
      expect(result2).toBe(''); // Returns null which becomes empty string
    });
  });

  describe('JSON function edge cases', () => {
    const objExample = {
      validJson: '{"test": "value"}',
      invalidJson: '{"test": invalid}',
      complexObject: { nested: { value: 42 } }
    };

    it('should handle invalid JSON parsing', () => {
      const result = tmpEngine.parse('{@Json|parse|{invalidJson}}', objExample);
      expect(result).toBe('');
    });

    it('should handle JSON stringify with circular references', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const objWithCircular = { circular: circularObj };
      const result = tmpEngine.parse('{#@Json|stringify|{circular}}', objWithCircular);
      // Should handle the error gracefully
      expect(result).toBe('');
    });
  });

  describe('Currency function edge cases', () => {
    const objExample = { price: 123.45 };

    it('should handle invalid currency codes', () => {
      const result = tmpEngine.parse('{@Currency|100|INVALID}', objExample);
      // Should fallback to EUR
      expect(result).toContain('€');
    });

    it('should handle invalid locale', () => {
      const result = tmpEngine.parse('{@Currency|100|USD|invalid-locale}', objExample);
      // Fallback to 'en' locale with USD currency shows as "100,00 USD" format (european style)
      expect(result).toContain('100');
      expect(result).toContain('USD');
    });

    it('should handle non-numeric values', () => {
      const result = tmpEngine.parse('{@Currency|not-a-number}', objExample);
      expect(result).toBe('');
    });
  });
});
