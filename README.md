<div align="center">

# 🎯 TS-Templater

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&pause=1000&color=00D9FF&center=true&vCenter=true&width=600&lines=Powerful+TypeScript+Templating;Dynamic+String+Processing;Type-Safe+%26+Flexible" alt="Typing SVG" />

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 10px; margin: 20px 0;">
<div style="background: #0d1117; padding: 20px; border-radius: 8px;">

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-00D26A?style=for-the-badge&logo=opensourceinitiative&logoColor=white)
![Tests](https://img.shields.io/badge/tests-115%2F115-00C851?style=for-the-badge&logo=jest&logoColor=white)
![Coverage](https://img.shields.io/badge/coverage-100%25-4CAF50?style=for-the-badge&logo=codecov&logoColor=white)

</div>
</div>

<h3 style="color: #58a6ff;">🚀 A powerful and flexible TypeScript library for dynamic string templating and data processing</h3>

</div>

---

<div align="center">

## ✨ **Why Choose TS-Templater?**

<table>
<tr>
<td align="center" width="33%">
<div style="font-size: 3em;">🎭</div>
<h3>Dual Modes</h3>
<p><code>parse()</code> for templating<br><code>evaluate()</code> for data</p>
</td>
<td align="center" width="33%">
<div style="font-size: 3em;">⚡</div>
<h3>Lightning Fast</h3>
<p>Optimized performance<br>Type-safe operations</p>
</td>
<td align="center" width="33%">
<div style="font-size: 3em;">🔧</div>
<h3>Extensible</h3>
<p>Custom functions<br>Rich built-in library</p>
</td>
</tr>
</table>

</div>

---

<div align="center">

## 📦 **Installation**

```bash
# 🚀 Get started in seconds
npm install ts-templater

# 🔥 Or with yarn
yarn add ts-templater
```

</div>

---

<div align="center">

## 🚀 **Quick Start**

</div>

```typescript
import { TsTemplater } from 'ts-templater';

const templater = new TsTemplater();

const data = {
  user: { name: '🎯 John', age: 30 },
  products: [
    { name: '💻 Laptop', price: 999.99 },
    { name: '🖱️ Mouse', price: 29.99 }
  ]
};

// ✨ String templating
const greeting = templater.parse('Hello {user.name}!', data);
// 🎉 Result: "Hello 🎯 John!"

// 🔥 Type-preserving evaluation
const age = templater.evaluate('user.age', data);
// ⚡ Result: 30 (number, not string)
```

---

<div align="center">

## 🎨 **Core Concepts**

</div>

### 🎭 **Dual Modes Explained**

| Method | Purpose | Return Type | Use Case | 
|--------|---------|-------------|----------|
| `parse()` | 📝 String templating | Always `string` | Templates, emails, UI |
| `evaluate()` | 🔢 Data processing | Original types | Calculations, APIs |

```typescript
// 📝 parse() - For templating (string output)
const template = templater.parse('Price: {price}€', { price: 42.5 });
// → "Price: 42.5€"

// 🔢 evaluate() - For data processing (type preserved)
const price = templater.evaluate('price', { price: 42.5 });
// → 42.5 (number)
```

### 🔧 **Function Syntax Types**

| Syntax | Description | Example |
|--------|-------------|---------|
| `@Function` | 🎯 Simple functions | `{@Date\|{date}\|DD/MM/YYYY}` |
| `#@Function` | 📊 Data-aware | `{#@ArraySum\|items\|{price}}` |
| `!@Function` | 🔄 Legacy syntax | `{!@Math\|+\|5\|3}` |

---

<div align="center">

## 🎨 **Basic Templating**

</div>

<details>
<summary><h3>📝 Property Access (Click to expand)</h3></summary>

```typescript
const data = {
  name: '🌟 Alice',
  profile: { age: 25, city: '🏛️ Rome' },
  tags: ['👩‍💻 developer', '📘 typescript', '⚛️ react']
};

// 🔹 Simple properties
templater.parse('{name}', data);                    // → "🌟 Alice"

// 🔹 Nested properties  
templater.parse('{profile.age}', data);             // → "25"

// 🔹 Array by index
templater.parse('{tags[0]}', data);                 // → "👩‍💻 developer"

// 🔹 Array special positions
templater.parse('{tags[first]}', data);             // → "👩‍💻 developer"
templater.parse('{tags[last]}', data);              // → "⚛️ react"
```

</details>

<details>
<summary><h3>🔍 Array Search (Click to expand)</h3></summary>

```typescript
const users = [
  { id: 1, name: '👑 John', role: 'admin' },
  { id: 2, name: '👤 Jane', role: 'user' }
];

// 🎯 Find by field value
templater.parse('{users[2,id].name}', { users });   // → "👤 Jane"
templater.parse('{users[admin,role].name}', { users }); // → "👑 John"
```

</details>

---

<div align="center">

## 🧮 **Functions Showcase**

</div>

<div align="center">

<table>
<tr>
<td width="50%" valign="top">

### 📅 **Date & Time**
```typescript
// ⏰ Basic formatting
{@Date|2023-12-25|DD/MM/YYYY}
// → "25/12/2023"

// 🌟 Custom format
{@Date|{timestamp}|dddd, MMMM Do YYYY}
// → "Monday, December 25th 2023"
```

### 💰 **Currency & Numbers**
```typescript
// 💵 Currency formatting
{@Currency|1234.56}         // → "€1,234.56"
{@Currency|{price}|USD}     // → "$1,234.56"
{@Currency|{amount}|GBP|en-GB} // → "£1,234.56"

// 🔢 Number conversion
{@Number|{stringValue}}     // Converts to number
{@Bool|{value}}            // Converts to boolean
```

### 🧮 **Mathematics**
```typescript
// ➕ Basic math
{@Math|+|{a}|{b}}          // Addition
{@Math|-|10|3}             // → 7
{@Math|*|{price}|1.22}     // 22% markup
{@Math|/|{total}|{count}}  // Average
{@Math|%|{number}|10}      // Modulo
{@Math|**|2|3}             // Power (2³ = 8)
```

</td>
<td width="50%" valign="top">

### 🔀 **Conditional Logic**
```typescript
// 🤔 If statements
{@If|{age}>=18|🔞 Adult|👶 Minor}

// 🔄 Switch statements  
{@Switch|{type}|user:👤 User|admin:👑 Admin}

// ✅ Boolean operations
{@Bool|{value}}            // Convert to boolean
{@Not|{isActive}}          // Negate boolean
```

### 🔍 **String Operations**
```typescript
// 🔎 Contains check
{@Contains|{filename}|.jpg|📸 Image|📄 Document}

// 📏 Padding
{@PadStart|{id}|5|0}       // → "00123"
{@PadEnd|{name}|10|.}      // → "John......"
```

### ✂️ **Split Function** ⭐ *New!*
```typescript
// 🔄 Split JSON strings into arrays
{#@Split|{"id":1,"name":"A"};{"id":2,"name":"B"}|;} 
// → [{id:1,name:"A"}, {id:2,name:"B"}]

// 🎯 Use with different delimiters
{#@Split|{"a":1}###{"b":2}|###} 
// → [{a:1}, {b:2}]
```

</td>
</tr>
</table>

</div>

---

<div align="center">

## 📊 **Array Processing**

</div>

```typescript
const data = {
  items: [
    { name: '💻 Laptop', price: 999 },
    { name: '🖱️ Mouse', price: 29 }
  ]
};

// 🔗 Concatenate array elements
{#@ArrayConcat|items|{name}: €{price}\n}           
// → "💻 Laptop: €999\n🖱️ Mouse: €29\n"

// ➕ Sum array values
{#@ArraySum|items|{price}}                         // → "1028"
{#@ArraySum|items|{@Math|*|{price}|1.22}}         // Sum with 22% tax
```

---

<div align="center">

## 🎯 **Advanced Examples**

</div>

<details>
<summary><h3>📧 Email Template (Click to expand)</h3></summary>

```typescript
const emailTemplate = `
🎉 Hello {user.name}!

📦 Your order {order.id} from {@Date|{order.date}|DD/MM/YYYY} has been confirmed.

🛍️ Items:
{#@ArrayConcat|order.items|• {name} x{qty} - {@Currency|{@Math|*|{price}|{qty}}}
}
💰 Total: {@Currency|{order.total}}

🙏 Thank you for your purchase!
`;
```

</details>

<details>
<summary><h3>📊 Dynamic Report (Click to expand)</h3></summary>

```typescript
const report = templater.parse(`
📈 SALES REPORT - {month}

💰 Revenue: {@Currency|{stats.totalSales}}
📦 Orders: {stats.orders}
📊 Avg Order: {@Currency|{stats.avgOrder}}

🏆 TOP PRODUCTS:
{#@ArrayConcat|topProducts|{@PadStart|{@Math|+|{$index}|1}|2| }. {name}: {@Currency|{sales}}
}

📈 Performance: {@If|{stats.totalSales}>10000|🟢 Excellent|🟡 Good}
`, reportData);
```

</details>

---

<div align="center">

## 🔧 **Configuration**

</div>

### 🌍 **Localization**
```typescript
// 🌎 Set language for date formatting and currency
const templater = new TsTemplater('it'); // Italian locale

// 🔄 Change locale at runtime
await templater.changeDayjsLocale('fr');
```

### 🔌 **Custom Functions**
```typescript
// ⚡ Add your own functions
templater.setFunctions({
  customFormat: (params) => `✨ Custom: ${params[0]}`,
  calculateDiscount: (data, params) => {
    const price = data[params[0]];
    const discount = parseFloat(params[1]);
    return price * (1 - discount / 100);
  }
});
```

---

<div align="center">

## 🧪 **Testing Excellence**

<div style="font-size: 4em; margin: 20px 0;">🎯</div>

**115/115** tests passing with **100%** coverage

✅ All core functions  
✅ Edge cases and error handling  
✅ Type preservation  
✅ Complex nested scenarios  
✅ Performance and memory usage  

```bash
# 🧪 Run tests
npm test
```

</div>

---

<div align="center">

## 📄 **License**

**🔓 MIT License** - Free for commercial and personal use

<table>
<tr>
<td align="center" width="50%">

### ✅ **What you CAN do:**
- 💼 **Commercial use** - Use in commercial projects
- 🔧 **Modify** - Change the source code  
- 📦 **Distribute** - Share the library
- 🔒 **Private use** - Use in private projects

</td>
<td align="center" width="50%">

### ❌ **What we DON'T provide:**
- 🛡️ **Warranty** - No warranty provided
- ⚖️ **Liability** - Authors not liable for damages

</td>
</tr>
</table>

</div>

---

<div align="center">

## 🤝 **Contributing**

<div style="font-size: 3em; margin: 20px 0;">🚀</div>

**Contributions welcome!** Please:

1. 🍴 **Fork** the repository
2. 🌟 **Create** a feature branch  
3. ✅ **Add tests** for new features
4. 📝 **Update** documentation
5. 🚀 **Submit** a pull request

</div>

---

<div align="center">

## 🆘 **Support & Community**

<div style="font-size: 3em; margin: 20px 0;">💬</div>

- 📚 **Documentation**: Check this README
- 🐛 **Issues**: [GitHub Issues](https://github.com/S33-SRL/ts_templater/issues)  
- 💬 **Discussions**: [GitHub Discussions](https://github.com/S33-SRL/ts_templater/discussions)

</div>

---

<div align="center">

<div style="font-size: 4em; margin: 20px 0;">❤️</div>

**Made with ❤️ by the TS-Templater team**

<div style="margin: 30px 0;">
<a href="https://github.com/S33-SRL/ts_templater" style="text-decoration: none;">
<img src="https://img.shields.io/github/stars/S33-SRL/ts_templater?style=social" alt="GitHub stars">
</a>
</div>

⭐ **Star us on GitHub if this project helped you!**

<div style="margin: 20px 0; font-size: 1.2em;">
🚀 **Ready to transform your templating experience?** 🚀
</div>

</div>
