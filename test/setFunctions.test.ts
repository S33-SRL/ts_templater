import { TsTemplater } from '../src/index';

describe('TsTemplater - setFunctions Tests', () => {
    let templater: TsTemplater;

    beforeEach(() => {
        templater = new TsTemplater();
    });

    describe('Custom function injection', () => {
        it('should allow injecting custom functions', () => {
            // Definiamo alcune funzioni personalizzate
            const customFunctions = {
                // Funzione che calcola la lunghezza di una stringa
                'StringLength': (params: any[]) => {
                    if (!params || params.length !== 1) return null;
                    return params[0] ? params[0].toString().length : 0;
                },
                
                // Funzione che converte in maiuscolo
                'ToUpper': (params: any[]) => {
                    if (!params || params.length !== 1) return null;
                    return params[0] ? params[0].toString().toUpperCase() : '';
                },
                
                // Funzione che calcola il quadrato di un numero
                'Square': (params: any[]) => {
                    if (!params || params.length !== 1) return null;
                    const num = Number(params[0]);
                    return isNaN(num) ? null : num * num;
                }
            };

            // Inietta le funzioni personalizzate
            templater.setFunctions(customFunctions);

            const data = { name: 'Giovanni', age: 25 };

            // Test delle funzioni personalizzate
            expect(templater.parse('{@StringLength|{name}}', data)).toBe('8');
            expect(templater.parse('{@ToUpper|{name}}', data)).toBe('GIOVANNI');
            expect(templater.parse('{@Square|{age}}', data)).toBe('625');
        });

        it('should work with data-dependent custom functions', () => {
            const customFunctions = {
                // Funzione che accede ai dati del contesto
                'GetUserInfo': (data: any, params: any[]) => {
                    if (!params || params.length !== 1) return null;
                    const field = params[0];
                    if (field === 'fullName') {
                        return `${data.firstName} ${data.lastName}`;
                    } else if (field === 'initials') {
                        return `${data.firstName[0]}${data.lastName[0]}`;
                    }
                    return data[field] || '';
                },

                // Funzione che conta elementi in un array
                'CountItems': (data: any, params: any[]) => {
                    if (!params || params.length !== 1) return null;
                    const arrayPath = params[0];
                    const array = data[arrayPath];
                    return Array.isArray(array) ? array.length : 0;
                }
            };

            templater.setFunctions(customFunctions);

            const data = {
                firstName: 'Mario',
                lastName: 'Rossi',
                items: ['item1', 'item2', 'item3'],
                orders: []
            };

            // Test funzioni con contesto dati
            expect(templater.parse('{!@GetUserInfo|fullName}', data)).toBe('Mario Rossi');
            expect(templater.parse('{!@GetUserInfo|initials}', data)).toBe('MR');
            expect(templater.parse('{!@CountItems|items}', data)).toBe('3');
            expect(templater.parse('{!@CountItems|orders}', data)).toBe('0');
        });

        it('should work with array processing functions', () => {
            const customFunctions = {
                // Funzione che filtra elementi in base a una condizione
                'FilterArray': (data: any, params: any[]) => {
                    if (!params || params.length < 2) return '';
                    const arrayName = params[0];
                    const template = params.slice(1).join('|');
                    const array = data[arrayName];
                    
                    if (!Array.isArray(array)) return '';
                    
                    const filtered = array.filter(item => {
                        const result = templater.parse(template, item);
                        return result && result !== '' && result !== '0' && result !== 'false';
                    });
                    
                    return filtered.map(item => templater.parse('{name}', item)).join(', ');
                },

                // Funzione che trova il valore massimo in un array
                'MaxValue': (data: any, params: any[]) => {
                    if (!params || params.length !== 2) return null;
                    const arrayName = params[0];
                    const fieldTemplate = params[1];
                    const array = data[arrayName];
                    
                    if (!Array.isArray(array) || array.length === 0) return null;
                    
                    const values = array.map(item => {
                        const result = templater.parse(fieldTemplate, item);
                        return Number(result) || 0;
                    });
                    
                    return Math.max(...values);
                }
            };

            templater.setFunctions(customFunctions);

            const data = {
                products: [
                    { name: 'Laptop', price: 1000, active: true },
                    { name: 'Mouse', price: 25, active: false },
                    { name: 'Keyboard', price: 75, active: true },
                    { name: 'Monitor', price: 300, active: true }
                ]
            };

            // Test funzioni di elaborazione array
            expect(templater.parse('{#@FilterArray|products|{active}}', data)).toBe('Laptop, Keyboard, Monitor');
            expect(templater.parse('{#@MaxValue|products|{price}}', data)).toBe('1000');
        });

        it('should preserve built-in functions when adding custom ones', () => {
            const customFunctions = {
                'CustomFunction': (params: any[]) => {
                    return 'custom result';
                }
            };

            templater.setFunctions(customFunctions);

            const data = { value: 42 };

            // Le funzioni built-in dovrebbero continuare a funzionare
            expect(templater.parse('{@Math|+|{value}|8}', data)).toBe('50');
            expect(templater.parse('{@CustomFunction|}', data)).toBe('custom result');
        });

        it('should override built-in functions when custom function has same name', () => {
            const customFunctions = {
                // Sovrascrive la funzione Math built-in
                'Math': (params: any[]) => {
                    return 'custom math function';
                }
            };

            templater.setFunctions(customFunctions);

            const data = { value: 42 };

            // La funzione personalizzata dovrebbe sovrascrivere quella built-in
            expect(templater.parse('{@Math|+|{value}|8}', data)).toBe('custom math function');
        });
    });

    describe('Error handling for custom functions', () => {
        it('should handle missing custom functions gracefully', () => {
            const data = { value: 'test' };

            // Funzione che non esiste
            const result = templater.parse('{@NonExistentFunction|{value}}', data);
            expect(result).toBe('{@NonExistentFunction|test}'); // Il valore viene processato ma il placeholder preservato
        });

        it('should handle custom functions that throw errors', () => {
            const customFunctions = {
                'ErrorFunction': (params: any[]) => {
                    throw new Error('Test error');
                },
                'NullFunction': (params: any[]) => {
                    return null;
                },
                'UndefinedFunction': (params: any[]) => {
                    return undefined;
                }
            };

            templater.setFunctions(customFunctions);

            const data = { value: 'test' };

            // La funzione che genera errore dovrebbe essere gestita
            expect(() => templater.parse('{@ErrorFunction|{value}}', data)).not.toThrow();
            
            // Funzioni che restituiscono null/undefined dovrebbero essere gestite
            expect(templater.parse('{@NullFunction|{value}}', data)).toBe('');
            expect(templater.parse('{@UndefinedFunction|{value}}', data)).toBe('');
        });

        it('should handle malformed custom function calls', () => {
            const customFunctions = {
                'ValidFunction': (params: any[]) => {
                    if (!params || params.length === 0) return 'no params';
                    if (params.length === 1 && params[0] === '') return 'empty param';
                    return params.join('-');
                }
            };

            templater.setFunctions(customFunctions);

            const data = { value: 'test' };

            // Chiamate malformate
            expect(templater.parse('{@ValidFunction|}', data)).toBe('empty param');
            expect(templater.parse('{@ValidFunction||}', data)).toBe('-');
            expect(templater.parse('{@ValidFunction|param1|param2}', data)).toBe('param1-param2');
        });
    });

    describe('Real-world examples', () => {
        it('should work with business logic functions', () => {
            const businessFunctions = {
                // Calcola lo sconto in base al tipo di cliente
                'CalculateDiscount': (data: any, params: any[]) => {
                    const customerType = data.customerType;
                    const amount = Number(params[0]) || 0;
                    
                    let discountRate = 0;
                    switch (customerType) {
                        case 'premium': discountRate = 0.15; break;
                        case 'gold': discountRate = 0.10; break;
                        case 'silver': discountRate = 0.05; break;
                        default: discountRate = 0;
                    }
                    
                    return (amount * discountRate).toFixed(2);
                },

                // Formatta un numero di telefono
                'FormatPhone': (params: any[]) => {
                    if (!params || params.length !== 1) return '';
                    const phone = params[0].toString().replace(/\D/g, '');
                    if (phone.length === 10) {
                        return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
                    }
                    return phone;
                },

                // Calcola l'età da una data di nascita
                'CalculateAge': (params: any[]) => {
                    if (!params || params.length !== 1) return '';
                    const birthDate = new Date(params[0]);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age.toString();
                }
            };

            templater.setFunctions(businessFunctions);

            const customerData = {
                customerType: 'premium',
                phone: '1234567890',
                birthDate: '1990-05-15',
                orderAmount: 100
            };

            expect(templater.parse('{!@CalculateDiscount|100}', customerData)).toBe('15.00');
            expect(templater.parse('{@FormatPhone|{phone}}', customerData)).toBe('(123) 456-7890');
            expect(Number(templater.parse('{@CalculateAge|{birthDate}}', customerData))).toBeGreaterThan(30);
        });
    });
});
