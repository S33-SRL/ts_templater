# Custom Functions Documentation

TsTemplater allows you to inject custom functions to extend the library's capabilities with specific business logic. This makes the library extremely flexible and adaptable to any business need.

## Basic Usage

### Adding Custom Functions

```typescript
import { TsTemplater } from 'ts-templater';

const templater = new TsTemplater();

// Define your custom functions
const customFunctions = {
    // Simple function without parameters
    CompanyName: () => 'My Company Ltd.',
    
    // Function with parameters
    Discount: (params) => {
        const price = parseFloat(params[0] || 0);
        const percentage = parseFloat(params[1] || 0);
        return price * (percentage / 100);
    },
    
    // Context-aware function (has access to data)
    CustomerDiscount: (data, params) => {
        const basePrice = parseFloat(params[0] || 0);
        const customerType = data.customer?.type || 'standard';
        
        const discounts = {
            'premium': 0.20,
            'gold': 0.15,
            'standard': 0.05
        };
        
        const discount = discounts[customerType] || 0;
        return basePrice * (1 - discount);
    }
};

// Inject the functions
templater.setFunctions(customFunctions);
```

### Using Custom Functions in Templates

```typescript
const data = {
    customer: { type: 'premium', name: 'John Doe' },
    product: { price: 100 }
};

// Using different function syntaxes
const templates = [
    'Welcome to {@CompanyName}!',                           // → 'Welcome to My Company Ltd.!'
    'Discount: {@Discount|100|10}',                        // → 'Discount: 10'
    'Final price: {!@CustomerDiscount|100}',               // → 'Final price: 80'
    'Formatted: {#@CustomerDiscount|100}',                 // → 'Formatted: 80.00'
    'Currency: {##@CustomerDiscount|100}'                  // → 'Currency: $80.00'
];

templates.forEach(template => {
    console.log(templater.parse(template, data));
});
```

## Function Types and Syntax

### 1. Simple Functions (`@`)
```typescript
{@FunctionName|param1|param2}
```
- Basic function call
- Returns the raw result
- Used for simple transformations

### 2. Null-Safe Functions (`!@`)
```typescript
{!@FunctionName|param1|param2}
```
- Returns empty string if result is null/undefined
- Useful for optional values

### 3. Formatted Functions (`#@`)
```typescript
{#@FunctionName|param1|param2}
```
- Formats numbers with 2 decimal places
- Returns "0.00" for null/undefined

### 4. Currency Functions (`##@`)
```typescript
{##@FunctionName|param1|param2}
```
- Formats as currency with symbol
- Returns "$0.00" for null/undefined

## Practical Examples

### 1. Phone Number Formatting
```typescript
const functions = {
    PhoneIT: (params) => {
        const phone = params[0]?.toString() || '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return `${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
        }
        return phone; // Return original if invalid
    }
};

templater.setFunctions(functions);

const template = 'Contact: {@PhoneIT|3201234567}';
// Result: 'Contact: 320 123 4567'
```

### 2. Time-Based Greetings
```typescript
const functions = {
    GreetingTime: () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }
};

const template = '{@GreetingTime}, {customer.name}!';
// Result: 'Good morning, John!' (depending on the time)
```

### 3. Rating Display
```typescript
const functions = {
    StarRating: (params) => {
        const rating = parseInt(params[0] || 0);
        const maxStars = parseInt(params[1] || 5);
        return '★'.repeat(rating) + '☆'.repeat(maxStars - rating);
    }
};

const template = 'Rating: {@StarRating|4|5}';
// Result: 'Rating: ★★★★☆'
```

### 4. Array Processing Functions
```typescript
const functions = {
    JoinArray: (data, params) => {
        const arrayPath = params[0] || '';
        const separator = params[1] || ', ';
        
        // Navigate to the array in the data
        const parts = arrayPath.split('.');
        let current = data;
        for (const part of parts) {
            current = current?.[part];
        }
        
        if (Array.isArray(current)) {
            return current.join(separator);
        }
        return '';
    }
};

const data = {
    order: {
        items: ['Laptop', 'Mouse', 'Keyboard']
    }
};

const template = 'Items: {@JoinArray|order.items| - }';
// Result: 'Items: Laptop - Mouse - Keyboard'
```

## Error Handling

### Missing Functions
If a function is not found, TsTemplater returns the original placeholder and logs a warning:

```typescript
const template = '{@NonExistentFunction|param}';
const result = templater.parse(template, {});
// Result: '{@NonExistentFunction|param}'
// Console: Warning: Function 'NonExistentFunction' not found
```

### Runtime Errors
If a function throws an error during execution, TsTemplater handles it gracefully:

```typescript
const functions = {
    ProblematicFunction: () => {
        throw new Error('Something went wrong');
    }
};

templater.setFunctions(functions);

const template = '{@ProblematicFunction}';
const result = templater.parse(template, {});
// Result: '{@ProblematicFunction}'
// Console: Error executing function 'ProblematicFunction': Something went wrong
```

## Advanced Patterns

### 1. Conditional Business Logic
```typescript
const functions = {
    OrderStatus: (data, params) => {
        const order = data.order || {};
        const status = order.status || 'unknown';
        
        const statusMap = {
            'pending': '⏳ Pending',
            'processing': '🔄 Processing', 
            'shipped': '📦 Shipped',
            'delivered': '✅ Delivered',
            'cancelled': '❌ Cancelled'
        };
        
        return statusMap[status] || '❓ Unknown';
    }
};

const template = 'Status: {@OrderStatus}';
```

### 2. Dynamic Calculations
```typescript
const functions = {
    TaxCalculation: (data, params) => {
        const amount = parseFloat(params[0] || 0);
        const country = data.customer?.country || 'US';
        
        const taxRates = {
            'US': 0.08,
            'IT': 0.22,
            'DE': 0.19,
            'FR': 0.20
        };
        
        const rate = taxRates[country] || 0;
        return amount * rate;
    }
};

const template = 'Tax: {##@TaxCalculation|100}'; // Formatted as currency
```

### 3. Text Processing
```typescript
const functions = {
    Capitalize: (params) => {
        const text = params[0] || '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    Truncate: (params) => {
        const text = params[0] || '';
        const maxLength = parseInt(params[1] || 50);
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
};

const template = 'Title: {@Capitalize|{@Truncate|{product.description}|30}}';
```

## Overriding Built-in Functions

You can override any built-in function with your custom implementation:

```typescript
const functions = {
    // Override the built-in Date function
    Date: (params) => {
        const date = new Date(params[0] || Date.now());
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
};

templater.setFunctions(functions);

const template = '{@Date|2024-12-25}';
// Result: 'Wednesday, December 25, 2024' (instead of default format)
```

## Best Practices

### 1. Function Naming
- Use **PascalCase** for function names
- Choose **descriptive names** that clearly indicate the function's purpose
- Avoid names that conflict with JavaScript reserved words

### 2. Parameter Handling
```typescript
const functions = {
    SafeFunction: (params) => {
        // Always provide defaults for parameters
        const value = params[0] || '';
        const defaultVal = params[1] || 'N/A';
        
        // Validate input types
        if (typeof value !== 'string') {
            return defaultVal;
        }
        
        return value.toUpperCase();
    }
};
```

### 3. Error Management
```typescript
const functions = {
    RobustFunction: (data, params) => {
        try {
            // Your logic here
            return someProcessing(params[0]);
        } catch (error) {
            // Return a safe default instead of throwing
            console.warn('RobustFunction error:', error.message);
            return '';
        }
    }
};
```

### 4. Context-Aware Functions
```typescript
const functions = {
    ContextFunction: (data, params) => {
        // Always check if data exists
        if (!data) return '';
        
        // Use optional chaining for nested properties
        const user = data.user?.profile?.settings;
        
        // Provide meaningful defaults
        return user?.theme || 'default';
    }
};
```

## Real-World Use Cases

### 1. Email Templates
```typescript
const emailFunctions = {
    PersonalizedGreeting: (data) => {
        const time = new Date().getHours();
        const name = data.user?.firstName || 'there';
        const greeting = time < 12 ? 'Good morning' : time < 18 ? 'Good afternoon' : 'Good evening';
        return `${greeting}, ${name}`;
    },
    
    UnsubscribeLink: (data) => {
        const userId = data.user?.id || '';
        const token = data.email?.token || '';
        return `https://example.com/unsubscribe?user=${userId}&token=${token}`;
    }
};

const emailTemplate = `
{@PersonalizedGreeting}!

Thank you for your order...

Unsubscribe: {@UnsubscribeLink}
`;
```

### 2. Dashboard Widgets
```typescript
const dashboardFunctions = {
    ProgressBar: (params) => {
        const value = parseFloat(params[0] || 0);
        const max = parseFloat(params[1] || 100);
        const width = parseInt(params[2] || 20);
        
        const filled = Math.round((value / max) * width);
        const empty = width - filled;
        
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${value}%`;
    },
    
    StatusIcon: (params) => {
        const status = params[0]?.toLowerCase() || '';
        const icons = {
            'online': '🟢',
            'offline': '🔴', 
            'maintenance': '🟡',
            'error': '🔴'
        };
        return icons[status] || '⚪';
    }
};
```

### 3. Report Generation
```typescript
const reportFunctions = {
    FormatCurrency: (data, params) => {
        const amount = parseFloat(params[0] || 0);
        const currency = data.settings?.currency || 'USD';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    GrowthPercentage: (params) => {
        const current = parseFloat(params[0] || 0);
        const previous = parseFloat(params[1] || 0);
        
        if (previous === 0) return 'N/A';
        
        const growth = ((current - previous) / previous) * 100;
        const sign = growth >= 0 ? '+' : '';
        
        return `${sign}${growth.toFixed(1)}%`;
    }
};
```

The custom functions system makes TsTemplater incredibly powerful and adaptable to any business scenario while maintaining simplicity and performance!
