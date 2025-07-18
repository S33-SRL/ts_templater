# Custom Functions - setFunctions Method

Il metodo `setFunctions` di TsTemplater permette di iniettare funzioni personalizzate per estendere le capacità della libreria, rendendola estremamente flessibile e adattabile a qualsiasi esigenza di business.

## Sintassi Base

```typescript
templater.setFunctions(functionObject);
```

Dove `functionObject` è un oggetto contenente le funzioni personalizzate:

```typescript
const customFunctions = {
    'FunctionName': (params: any[]) => {
        // Logica della funzione
        return result;
    }
};
```

## Tipi di Funzioni Personalizzate

### 1. Funzioni Simple (@)
Funzioni che operano solo sui parametri passati, senza accesso al contesto dati.

```typescript
const simpleFunctions = {
    'StringLength': (params: any[]) => {
        if (!params || params.length !== 1) return null;
        return params[0] ? params[0].toString().length : 0;
    },
    
    'ToUpper': (params: any[]) => {
        if (!params || params.length !== 1) return null;
        return params[0] ? params[0].toString().toUpperCase() : '';
    },
    
    'Square': (params: any[]) => {
        if (!params || params.length !== 1) return null;
        const num = Number(params[0]);
        return isNaN(num) ? null : num * num;
    }
};

templater.setFunctions(simpleFunctions);

// Utilizzo nei template
const data = { name: 'giovanni', age: 5 };
templater.parse('{@StringLength|{name}}', data);  // "8"
templater.parse('{@ToUpper|{name}}', data);       // "GIOVANNI"
templater.parse('{@Square|{age}}', data);         // "25"
```

### 2. Funzioni con Contesto (!@)
Funzioni che hanno accesso ai dati del contesto principale.

```typescript
const contextFunctions = {
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
    }
};

templater.setFunctions(contextFunctions);

// Utilizzo nei template
const userData = {
    firstName: 'Mario',
    lastName: 'Rossi',
    customerType: 'premium',
    orderAmount: 100
};

templater.parse('{!@GetUserInfo|fullName}', userData);        // "Mario Rossi"
templater.parse('{!@GetUserInfo|initials}', userData);       // "MR"
templater.parse('{!@CalculateDiscount|{orderAmount}}', userData); // "15.00"
```

### 3. Funzioni per Array (#@)
Funzioni che operano su array e hanno accesso al contesto dati.

```typescript
const arrayFunctions = {
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

templater.setFunctions(arrayFunctions);

// Utilizzo nei template
const productsData = {
    products: [
        { name: 'Laptop', price: 1000, active: true },
        { name: 'Mouse', price: 25, active: false },
        { name: 'Keyboard', price: 75, active: true }
    ]
};

templater.parse('{#@FilterArray|products|{active}}', productsData);  // "Laptop, Keyboard"
templater.parse('{#@MaxValue|products|{price}}', productsData);      // "1000"
```

## Esempi Pratici di Business Logic

### Gestione Clienti e Ordini

```typescript
const businessFunctions = {
    // Formattazione telefono
    'FormatPhone': (params: any[]) => {
        if (!params || params.length !== 1) return '';
        const phone = params[0].toString().replace(/\D/g, '');
        if (phone.length === 10) {
            return `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
        }
        return phone;
    },
    
    // Calcolo età
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
    },
    
    // Status ordine con colore
    'OrderStatus': (data: any, params: any[]) => {
        const status = data.status;
        const template = params[0] || '{status}';
        
        const statusConfig = {
            'pending': { color: 'orange', text: 'In Attesa' },
            'processing': { color: 'blue', text: 'In Elaborazione' },
            'shipped': { color: 'green', text: 'Spedito' },
            'delivered': { color: 'darkgreen', text: 'Consegnato' },
            'cancelled': { color: 'red', text: 'Annullato' }
        };
        
        const config = statusConfig[status] || { color: 'gray', text: status };
        
        if (template === 'color') return config.color;
        if (template === 'text') return config.text;
        return `<span style="color: ${config.color}">${config.text}</span>`;
    }
};

templater.setFunctions(businessFunctions);

// Utilizzo
const customerData = {
    phone: '1234567890',
    birthDate: '1990-05-15',
    status: 'shipped'
};

templater.parse('Tel: {@FormatPhone|{phone}}', customerData);           // "Tel: (123) 456-7890"
templater.parse('Età: {@CalculateAge|{birthDate}} anni', customerData); // "Età: 34 anni"
templater.parse('{!@OrderStatus}', customerData);                      // "<span style="color: green">Spedito</span>"
templater.parse('{!@OrderStatus|color}', customerData);                // "green"
```

### Template Email Dinamico

```typescript
const emailFunctions = {
    'PersonalizedGreeting': (data: any, params: any[]) => {
        const hour = new Date().getHours();
        const name = data.firstName || 'Cliente';
        
        let greeting;
        if (hour < 12) greeting = 'Buongiorno';
        else if (hour < 18) greeting = 'Buon pomeriggio';
        else greeting = 'Buonasera';
        
        return `${greeting} ${name}`;
    },
    
    'ProductRecommendations': (data: any, params: any[]) => {
        const category = data.preferredCategory;
        const budget = Number(data.budget) || 0;
        
        const recommendations = {
            'electronics': [
                { name: 'Smartphone', price: 299 },
                { name: 'Tablet', price: 199 },
                { name: 'Smartwatch', price: 149 }
            ],
            'clothing': [
                { name: 'Maglietta Premium', price: 29 },
                { name: 'Jeans Designer', price: 89 },
                { name: 'Scarpe Casual', price: 79 }
            ]
        };
        
        const products = recommendations[category] || [];
        const affordable = products.filter(p => p.price <= budget);
        
        if (affordable.length === 0) return 'Nessun prodotto trovato nel tuo budget.';
        
        return affordable.map(p => `• ${p.name} (€${p.price})`).join('\n');
    }
};

templater.setFunctions(emailFunctions);

// Template email
const emailTemplate = `
{!@PersonalizedGreeting}!

Abbiamo selezionato questi prodotti per te:

{!@ProductRecommendations}

Cordiali saluti,
Il Team
`;

const customerData = {
    firstName: 'Marco',
    preferredCategory: 'electronics',
    budget: 200
};

const email = templater.parse(emailTemplate, customerData);
// Risultato:
// Buongiorno Marco!
// 
// Abbiamo selezionato questi prodotti per te:
// 
// • Tablet (€199)
// • Smartwatch (€149)
// 
// Cordiali saluti,
// Il Team
```

## Best Practices

### 1. Gestione Errori
```typescript
const safeFunctions = {
    'SafeDivision': (params: any[]) => {
        try {
            if (!params || params.length !== 2) return '0';
            const num1 = Number(params[0]);
            const num2 = Number(params[1]);
            
            if (isNaN(num1) || isNaN(num2) || num2 === 0) return '0';
            
            return (num1 / num2).toFixed(2);
        } catch (error) {
            console.error('SafeDivision error:', error);
            return '0';
        }
    }
};
```

### 2. Validazione Parametri
```typescript
const validatedFunctions = {
    'FormatCurrency': (params: any[]) => {
        // Validazione rigorosa dei parametri
        if (!params || !Array.isArray(params) || params.length === 0) {
            return '€0.00';
        }
        
        const amount = Number(params[0]);
        if (isNaN(amount)) return '€0.00';
        
        const currency = params[1] || '€';
        const decimals = parseInt(params[2]) || 2;
        
        return `${currency}${amount.toFixed(decimals)}`;
    }
};
```

### 3. Performance Optimization
```typescript
// Cache per funzioni costose
const cache = new Map();

const optimizedFunctions = {
    'ExpensiveCalculation': (params: any[]) => {
        const cacheKey = JSON.stringify(params);
        
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }
        
        // Calcolo costoso...
        const result = performExpensiveCalculation(params);
        
        cache.set(cacheKey, result);
        return result;
    }
};
```

## Sovrascrittura Funzioni Built-in

Le funzioni personalizzate possono sovrascrivere quelle built-in:

```typescript
const customMath = {
    // Sovrascrive la funzione Math built-in per aggiungere logging
    'Math': (params: any[]) => {
        console.log('Custom Math called with:', params);
        
        if (!params || params.length !== 3) return null;
        
        const operator = params[0];
        const num1 = Number(params[1]);
        const num2 = Number(params[2]);
        
        let result;
        switch(operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num1 / num2; break;
            default: result = null;
        }
        
        console.log('Math result:', result);
        return result;
    }
};

templater.setFunctions(customMath);
templater.parse('{@Math|+|5|3}', {}); // Log: "Custom Math called with: ['+', '5', '3']"
                                      // Log: "Math result: 8"
                                      // Output: "8"
```

## Conclusioni

Il metodo `setFunctions` rende TsTemplater incredibilmente flessibile, permettendo di:

- **Estendere** le funzionalità con logica di business specifica
- **Personalizzare** il comportamento per casi d'uso particolari  
- **Integrare** con sistemi esterni e API
- **Riutilizzare** codice comune tra diversi template
- **Mantenere** la separazione tra logica e presentazione

Questa flessibilità permette di adattare la libreria a qualsiasi scenario, dal semplice templating di email ai complessi report dinamici con logiche di business avanzate.
