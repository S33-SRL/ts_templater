# ts-templater

A flexible TypeScript library for dynamic string templating.

This library allows you to "serialize" an untyped object into a string using a Template String as a model.

## 🚀 **Key Features**

- **String Templating**: `parse()` method always returns strings for template rendering
- **Type Preservation**: `evaluate()` method preserves original data types
- **Rich Function Library**: Date formatting, math operations, conditional logic
- **Array Processing**: Advanced array manipulation and aggregation
- **Flexible Syntax**: Multiple syntax patterns for different use cases

## 📖 **Basic Usage**

```typescript
import { TsTemplater } from 'ts-templater';

const templater = new TsTemplater();
const data = { name: 'John', age: 30, scores: [85, 92, 78] };

// String templating - always returns string
const template = templater.parse('Hello {name}, you are {age} years old', data);
// Result: "Hello John, you are 30 years old"

// Type-preserving evaluation - returns original types  
const age = templater.evaluate('age', data);
// Result: 30 (number, not string)
```

###### Work with base tamplate

**Render single field: "{~property}"** Example: "{code}" | Result: DS-2CD2T20-I3(6mm)

**Navigate fields : "{~property.~sub-property}"** Example: "Type: {type.description}" | Result: Type: TVCC

**Render multi fields : "{~property1} - {~property2}"** Example: "{code} - {shortDescription}" | Result: DS-2CD2T20-I3(6mm) - 1/3" Progressive Scan CMOS

**Render nasted fields : "{{property1}~part-of-property2}"** Example: "Main: {mainDescription} - Nasted: {{mainDescription}Description}" | Result: Main Descripion:short - Description Nasted: 1/3" Progressive Scan CMOS

###### Work with array

**Render element of an array by index (starting from index 0): "{~array\[~index\].~property}"** Example: "{tags\[1\].code}" | Result: COMP

**Render first element of an array: "{~array\[first\].~property}"** Example: "{tags\[first\].code}" | Result : 115

**Render last element of an array: "{~array\[last\].~property}"** Example: "{tags\[last\].code}" | Result : SERV

e **Render first element in array (like js find): "{~array\[~property-key-value,~property1\].~sub-property}"** Example: Sell price: {prices\[customer,kind\].price} - Buy price: {prices\[supplier,kind\].price} | Result: Sell price: 317.1 - Buy price: 108.72

###### Data Conversion

**Date: "{@Date|~date|~string-format}"** Example: "{@Date|2016-06-10T15:19:25.75|DD/MM/YYYY}" | Result: 10/06/2016  
Example: "{@Date|{creationDate}|YYYY-MM-DD HH:mm}" | Result: 2016-06-10 15:19

**Bool: "{@Bool|~variable}"** Example: "{@Bool|}" | Result: false  
Example: "{@Bool|duck}" | Result: true  
Example: "{@Bool|false}" | Result: false  
Example: "{@Bool|true}" | Result: true  
Example: "{@Bool|undefined}" | Result: false  
Example: "{@Bool|{installationComponent}}" | Result: true  

**Number: "{@Number|~variable}"** Example: "{@Number|}" | Result:  
Example: "{@Number|true}" | Result:  
Example: "{@Number|012}" | Result: 12  
Example: "{@Number|23.342}" | Result: 23.342  
Example: "{@Number|{leadTime}}" | Result: 234.56  

**Currency: "{@Currency|~number|~currency-code|~locale}"** Example: "{@Currency|234.56}" | Result: €234.56  
Example: "{@Currency|{prices[supplier,kind].price}}" | Result: €108.72  
Example: "{@Currency|100|USD}" | Result: $100.00  
Example: "{@Currency|1500|GBP|en-GB}" | Result: £1,500.00

###### Math function

**Not: "{@Not|~variable}"** Example: "{@Not|true}" | Result: false  
Example: "{@Not|false}" | Result: true  
Example: "{@Not|{consumable}}" | Result: true  

**Sum: "{@Sum|~number1|~number1}"** Example: "{@Sum|1|2}" | Result: 3  
Example: "{@Sum|{packageQuantity}|2}" | Result: 10+2 = 12  
Example: "{@Sum|{packageQuantity}|{leadTime}}" | Result: 10+234.56 = 244.56

**Math ( Sum '+',Difference '-',Product '\*',Quotient '/',Remainder '%', Power '\*\*'): "{@Math|~sign|~number1|~number1}"** Example: "{@Math|\*|3|2}" | Result: 6  
Example: "{@Math|/|{packageQuantity}|2}" | Result: 10/2 = 5  
Example: "{@Math|%|{leadTime}|{packageQuantity}}" | Result: 234.56 % 10 = 4.560000000000002  

###### Comparisons

**IsNull (2 parameter): "{@IsNull|~variable-nullable|~variable-alternative}"** Example: "{@IsNull||alternative}" | Result: alternative  
Example: "{@IsNull|exist|alternative}" | Result: exist  
Example: "{@IsNull|{parent}|alternative}" | Result: alternative  
Example: "{@IsNull|{packageQuantity}|alternative}" | Result: 10 **IsNull (3 parameter): "{@IsNull|~variable-nullable|~if-not-null|~if-null}"** Example: "{@IsNull||is null|is not null}" | Result: is null  
Example: "{@IsNull|1|is null|is not null}" | Result: is not null  
Example: "{@IsNull|{parent}|is null|is not null}" | Result: is null  
Example: "{@IsNull|{packageQuantity}|is null|is not null}" | Result: is not null

**If (eval-string use js eval): "{@If|~eval-string|~true-case|~false-case}"** Example: "{@If|1==1|true case|false case}" | Result: true case  
Example: "{@If|{packageQuantity}>100|big quantity|small quantity}" | Result: small quantity  
Example: "{@If|{packageQuantity}>5|quantity is {packageQuantity}|quantity too small}" | Result: quantity is 10  
Example: "{@If|{reorderPoint}>0|reorder at {reorderPoint}|no reorder needed}" | Result: no reorder needed  
Example: "{@If|{packageQuantity}=={leadTime}|same values|different values}" | Result: different values

**Switch : "{@Switch|~expression|~case-string-1:~value-case|~case-string-2:~value-case|...|~(default:)~value-default}"** Example: "{@Switch|b|a:case a|b:case b|case default}" | Result: case b  
Example: "{@Switch|A|a:case a|b:case b|case default}" | Result: case default  
Example: "{@Switch|A|a:case a|A:case A|case default}" | Result: case A  
**SwitchInsensitive : "{@SwitchInsensitive|~expression|~case-string-1:~value-case|~case-string-2:~value-case|...|~(default:)~value-default}"** Example: "{@SwitchInsensitive|A|a:case a|B:case B|case default}" | Result: case a  

**Contains (3 parameter): "{@Contains|~variable|~string-contained|~value-is-contained|~value-is-not-contained}"** Example: "{@Contains|image.jpg|.jpg| contain .jpg }" | Result: contain .jpg  
Example: "{@Contains|image/jpg|png|contain png }" | Result:  
Example: "{@Contains|{productImage}|.png| {productImage} is png image }" | Result:  
Example: "{@Contains|{productImage}|.jpg| {productImage} is jpg image }" | Result: image.jpg is jpg image  
**Contains (4 parameter): "{@Contains|~variable|~string-contained|~value-if-contain|~value-if-not-contain}"** Example: "{@Contains|image.jpg|.jpg| contain .jpg |not contain .jpg }" | Result: contain .jpg  
Example: "{@Contains|image/jpg|png|contain png|not contain png}" | Result: not contain png  
Example: "{@Contains|{productImage}|.png| {productImage} is png image | {productImage} isn't png image}" | Result: not contain png

###### String Manipulation

**PadStart: "{@PadStart|~string|~target-length|~pad-string}"** Example: "{@PadStart|{packageQuantity}|5|0}" | Result: 00010  
Example: "{@PadStart|test|10| }" | Result: "      test"

**PadEnd: "{@PadEnd|~string|~target-length|~pad-string}"** Example: "{@PadEnd|{packageQuantity}|5|0}" | Result: 10000  
Example: "{@PadEnd|test|10|.}" | Result: test......

###### Array Operations

**ArrayConcat: "{#@ArrayConcat|~array-field|~template}"** Example: "{#@ArrayConcat|tags|{code}}" | Result: 115COMPSERV  
Example: "{#@ArrayConcat|tags|{code}, }" | Result: 115, COMP, SERV,

**ArraySum: "{#@ArraySum|~array-field|~template}"** Example: "{#@ArraySum|prices|{price}}" | Result: 425.82  
Example: "{#@ArraySum|prices|{@Math|*|{price}|1.22}}" | Result: Sum with 22% markup

###### JSON Operations

**Json Parse: "{#@Json|parse|~json-string}"** Example: "{#@Json|parse|{\"name\":\"test\",\"value\":42}}" | Result: Object {name: "test", value: 42}

**Json Stringify: "{#@Json|stringify|~object}"** Example: "{#@Json|stringify|{measureUnit}}" | Result: {"symbol":"nr","extCode":"NR","description":"Numero","code":"NR","identity":"..."}

###### Advanced Features

**Evaluate Method**: For type-preserving evaluation without string conversion:
```typescript
const templater = new TsTemplater();

// parse() - Always returns strings (for templating)
const stringResult = templater.parse('{user.age}', data); // "30" (string)
const mathResult = templater.parse('{@Math|+|5|3}', data); // "8" (string)

// evaluate() - Preserves original types (for logic/calculations)
const numberResult = templater.evaluate('user.age', data); // 30 (number)
const mathNumber = templater.evaluate('@Math|+|5|3', data); // 8 (number)
const objectResult = templater.evaluate('user', data); // {name: "John", age: 30} (object)
```

**When to use each method:**
- Use `parse()` for **string templating** (emails, documents, UI text)
- Use `evaluate()` for **data processing** (calculations, conditional logic, type checking)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Commercial use** - You can use this library in commercial projects
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute the library
- ✅ **Private use** - You can use it in private projects
- ✅ **Patent use** - Express patent rights from contributors
- ❌ **Liability** - Authors are not liable for damages
- ❌ **Warranty** - No warranty is provided

The MIT License ensures that anyone can use this library freely while preventing anyone from restricting others' access to it.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
