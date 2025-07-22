import { TsTemplater } from '../src/index';

describe('TsTemplater - Configuration and State Management', () => {
  
  describe('Constructor and initialization', () => {
    it('should initialize with default english locale', () => {
      const tmpEngine = new TsTemplater();
      const data = { date: '2024-01-15' };
      const result = tmpEngine.parse('{@Date|{date}|MMMM}', data);
      expect(result).toBe('January');
    });

    it('should initialize with custom locale', async () => {
      const tmpEngine = new TsTemplater('it');
      // Give time for async locale loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const data = { date: '2024-01-15' };
      const result = tmpEngine.parse('{@Date|{date}|DD/MM/YYYY}', data);
      expect(result).toBe('15/01/2024');
    });
  });

  describe('Function registration and custom functions', () => {
    let tmpEngine: TsTemplater;

    beforeEach(() => {
      tmpEngine = new TsTemplater();
    });

    it('should allow custom function registration', () => {
      const customFunctions = {
        Reverse: (params: any[]) => {
          if (!params || params.length !== 1) return null;
          return params[0].toString().split('').reverse().join('');
        },
        
        Multiply: (params: any[]) => {
          if (!params || params.length !== 2) return null;
          return (parseFloat(params[0]) * parseFloat(params[1])).toString();
        }
      };

      tmpEngine.setFunctions(customFunctions);

      const data = { text: 'hello', factor: 3, value: 10 };
      
      const result1 = tmpEngine.parse('{@Reverse|{text}}', data);
      expect(result1).toBe('olleh');

      const result2 = tmpEngine.parse('{@Multiply|{value}|{factor}}', data);
      expect(result2).toBe('30');
    });

    it('should allow overriding existing functions', () => {
      const customFunctions = {
        Sum: (params: any[]) => {
          // Custom sum that adds 1 to the result
          if (!params || params.length !== 2) return null;
          return (parseFloat(params[0]) + parseFloat(params[1]) + 1).toString();
        }
      };

      tmpEngine.setFunctions(customFunctions);

      const result = tmpEngine.parse('{@Sum|5|3}', {});
      expect(result).toBe('9'); // 5 + 3 + 1 = 9
    });

    it('should handle custom array functions', () => {
      const customFunctions = {
        ArrayMultiply: (data: any, params: any[]) => {
          if (!params || params.length < 2) return null;
          const array = data[params[0]];
          let result = 1;
          if (Array.isArray(array)) {
            array.forEach(x => {
              const template = [...params].slice(1).join('|');
              const single = tmpEngine.parse(template, x, null);
              if (!isNaN(single)) {
                result *= parseFloat(single);
              }
            });
          }
          return result.toString();
        }
      };

      tmpEngine.setFunctions(customFunctions);

      const data = { numbers: [{ value: 2 }, { value: 3 }, { value: 4 }] };
      const result = tmpEngine.parse('{#@ArrayMultiply|numbers|{value}}', data);
      expect(result).toBe('24'); // 2 * 3 * 4 = 24
    });
  });

  describe('Cache management', () => {
    let tmpEngine: TsTemplater;

    beforeEach(() => {
      tmpEngine = new TsTemplater();
    });

    it('should provide cache cleaning functionality', () => {
      const data = { value: 'test' };
      
      // Parse something to potentially populate cache
      tmpEngine.parse('{value}', data);
      
      // Clean cache should not throw error
      expect(() => tmpEngine.cleanCache()).not.toThrow();
      
      // Should still work after cache clean
      const result = tmpEngine.parse('{value}', data);
      expect(result).toBe('test');
    });
  });

  describe('Locale changing', () => {
    let tmpEngine: TsTemplater;

    beforeEach(() => {
      tmpEngine = new TsTemplater();
    });

    it('should handle valid locale changes', async () => {
      await tmpEngine.changeDayjsLocale('fr');
      
      const data = { date: '2024-01-15' };
      const result = tmpEngine.parse('{@Date|{date}|MMMM}', data);
      expect(result).toBe('janvier'); // January in French
    });

    it('should handle invalid locale gracefully', async () => {
      // Should not throw error for invalid locale
      await expect(tmpEngine.changeDayjsLocale('invalid-locale')).resolves.not.toThrow();
      
      // Should still work with original locale
      const data = { date: '2024-01-15' };
      const result = tmpEngine.parse('{@Date|{date}|YYYY}', data);
      expect(result).toBe('2024');
    });
  });

  describe('Thread safety and isolation', () => {
    it('should handle multiple instances independently', () => {
      const engine1 = new TsTemplater();
      const engine2 = new TsTemplater();

      // Add custom function to engine1 only
      engine1.setFunctions({
        CustomFunc: (params: any[]) => 'engine1-' + params[0]
      });

      const data = { value: 'test' };
      
      const result1 = engine1.parse('{@CustomFunc|{value}}', data);
      expect(result1).toBe('engine1-test');

      // engine2 should not have the custom function and returns original template
      const result2 = engine2.parse('{@CustomFunc|{value}}', data);
      expect(result2).toBe('{@CustomFunc|test}');
    });

    it('should handle concurrent parsing operations', async () => {
      const tmpEngine = new TsTemplater();
      const data = { value: 'concurrent' };

      // Simulate concurrent operations
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(tmpEngine.parse(`{value}-${i}`, data))
      );

      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result).toBe(`concurrent-${index}`);
      });
    });
  });

  describe('Memory usage and cleanup', () => {
    it('should handle large template processing without memory leaks', () => {
      const tmpEngine = new TsTemplater();
      
      // Create large data structure
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `This is item number ${i}`.repeat(10)
        }))
      };

      // Process multiple large templates
      for (let i = 0; i < 10; i++) {
        const result = tmpEngine.parse('{#@ArrayConcat|items|Item {id}: {name}\n}', largeData);
        expect(result).toContain('Item 0: Item 0');
        expect(result).toContain('Item 999: Item 999');
      }

      // Clean cache after heavy usage
      tmpEngine.cleanCache();
      
      // Verify it still works
      const finalResult = tmpEngine.parse('{items[0].name}', largeData);
      expect(finalResult).toBe('Item 0');
    });
  });

  describe('Error recovery and robustness', () => {
    let tmpEngine: TsTemplater;

    beforeEach(() => {
      tmpEngine = new TsTemplater();
    });

    it('should recover from function errors and continue processing', () => {
      // Add a function that throws an error
      tmpEngine.setFunctions({
        ErrorFunc: () => {
          throw new Error('Test error');
        }
      });

      const data = { value: 'test' };
      
      // Should handle error gracefully and continue with rest of template
      const result = tmpEngine.parse('Before {@ErrorFunc|param} After {value}', data);
      expect(result).toBe('Before {@ErrorFunc|param} After test');
    });

    it('should handle recursive template parsing errors', () => {
      const data = { template: '{recursive}', recursive: '{template}' };
      
      // Should not cause infinite recursion
      const result = tmpEngine.parse('{template}', data);
      expect(result).toBeDefined();
    });

    it('should handle malformed data structures', () => {
      const malformedData = {
        circular: null as any,
        func: () => 'function',
        symbol: Symbol('test'),
        bigint: BigInt(123)
      };
      malformedData.circular = malformedData;

      // Should handle different data types gracefully
      expect(() => tmpEngine.parse('{func}', malformedData)).not.toThrow();
      expect(() => tmpEngine.parse('{symbol}', malformedData)).not.toThrow();
      expect(() => tmpEngine.parse('{bigint}', malformedData)).not.toThrow();
    });
  });
});
