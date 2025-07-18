import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

export class TsTemplater  {

    private formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/;
    escape(str:string){
        const metaChar = /[-[\]{}()*+?.\\^$|,]/g;
        return str.replace(metaChar, "\\$&");
    };

    private currentLang:string |undefined = undefined;
    // Function to change the language in dayjs
    async changeDayjsLocale(lang: string) {
        try {
            this.currentLang = lang;
            // Try to import the specific localization dynamically
            const locale = await import(`dayjs/locale/${lang}.js`);
            dayjs.locale(lang); // Set the locale in dayjs
        } catch (error) {
            console.error(`Locale ${lang} not found for dayjs`, error);
        }
    }
    
    constructor ( lang: string = 'en') 
    {
        this.changeDayjsLocale(lang);
        this.functions["Date"] = this.intDate;
        this.functions["Bool"] = this.intToBool;
        this.functions["Number"] = this.toNumber;
        this.functions["Currency"] = this.intCurrency;
        this.functions["IsNull"] = this.intIsNull;
        this.functions["Not"] = this.intNot;
        this.functions["Sum"] = this.intSum;
        this.functions["Math"] = this.intMath;
        this.functions["If"] = this.intIf;
        this.functions["Switch"] = this.intSwitch;
        this.functions["SwitchInsensitive"] = this.intSwitchCaseInsersitive;
        this.functions["Contains"] = this.intContains
        this.functions["PadStart"] = this.intPadStart;
        this.functions["PadEnd"] = this.intPadEnd;
        this.functions["Split"] = this.intSplit;
        this.functions["ArrayConcat"] = this.intArrayConcat;
        this.functions["ArraySum"] = this.intArraySum;
        this.functions["Json"] = this.intJson;
    }

    matchRecursive (str:string, format:string) {
        var p = this.formatParts.exec(format);
        if (!p) throw new Error("format must include start and end tokens separated by '...'");
        if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

        var	opener = p[1],
            closer = p[2],
            /* Use an optimized regex when opener and closer are one character each */
            iterator: any = new RegExp(format.length == 5 ? "["+this.escape(opener+closer)+"]" : this.escape(opener)+"|"+this.escape(closer), "g"),
            results = [],
            openTokens, matchStartIndex, match;

        do {
            openTokens = 0;
            while (match = iterator.exec(str)) {
                if (match[0] == opener) {
                    if (!openTokens)
                        matchStartIndex = iterator.lastIndex;
                    openTokens++;
                } else if (openTokens) {
                    openTokens--;
                    if (!openTokens)
                        results.push(str.slice(matchStartIndex, match.index));
                }
            }
        } while (openTokens && (iterator.lastIndex = matchStartIndex));

        return results;
    };

    private cache:{} | undefined = undefined ;

    public cleanCache(){
        this.cache = {};
    }

    private arrayFirstByField(array:Array<any>,key:string,fieldName:string[]){
        if(!array) return null;
        if(!Array.isArray(array)) return null;
        return array.find(x => {
            let val = x;
            for (let field of fieldName)
                val = val[field];
            return val == key;
        });
    }

    /**
     * Evaluates a single expression against the provided data and returns the result
     * with its original type (string, number, boolean, object, array, function, null, undefined).
     *
     * @param expression The expression to evaluate (e.g., "user.name", "@Math|+|2|3", "#@ArraySum|items|{price}")
     * @param data The main data context.
     * @param otherData The secondary data context (used by '##@').
     * @returns The evaluation result, preserving the original type.
     */
    public evaluate(expression: string, data: any, otherData: any = null): any {
        try {
            let value: any = null;
            const trimmedExpression = expression.trim(); // Remove leading/trailing whitespace

            // 1. Check special function syntaxes (!@, @, #@, ##@)
            if (trimmedExpression.indexOf('!@') === 0 && trimmedExpression.indexOf('|') > 0) {
                const parameters = trimmedExpression.split('|');
                const functionName = parameters[0].substring(2);
                if (this.functions[functionName]) {
                     // Original logic for '!@' passed 'data'
                     value = this.functions[functionName](data, parameters.slice(1));
                } else {
                     console.warn(`Function ${functionName} not found for expression: ${expression}`);
                     value = undefined; // Or null, or throw an error
                }
            } else if (trimmedExpression.indexOf('@') === 0 && trimmedExpression.indexOf('|') > 0) {
                 const parameters = trimmedExpression.split('|');
                 const functionName = parameters[0].substring(1);
                 if (this.functions[functionName]) {
                    // Call function only with explicit parameters
                    value = this.functions[functionName](parameters.slice(1));
                 } else {
                    console.warn(`Function ${functionName} not found for expression: ${expression}`);
                    value = undefined;
                 }
            } else if (trimmedExpression.indexOf('#@') === 0 && trimmedExpression.indexOf('|') > 0) {
                 const parameters = trimmedExpression.split('|');
                 const functionName = parameters[0].substring(2);
                  if (this.functions[functionName]) {
                    // Call function passing 'data' and parameters
                    value = this.functions[functionName](data, parameters.slice(1));
                 } else {
                    console.warn(`Function ${functionName} not found for expression: ${expression}`);
                    value = undefined;
                 }
            } else if (trimmedExpression.indexOf('##@') === 0 && trimmedExpression.indexOf('|') > 0) {
                 const parameters = trimmedExpression.split('|');
                 const functionName = parameters[0].substring(3);
                 if (this.functions[functionName]) {
                    // Call function passing 'otherData', 'data' and parameters
                    value = this.functions[functionName](otherData, data, parameters.slice(1));
                 } else {
                     console.warn(`Function ${functionName} not found for expression: ${expression}`);
                     value = undefined;
                 }
            }
            // 2. If not a special function, try to resolve as key/path or inline function (like 'exist')
            else {
                 // Use parserWithFunction/fromContext logic to resolve the value
                 // ATTENTION: parserWithFunction might have logic that forces to string (e.g., in 'exist' case).
                 // To get the original type, we might need to call fromContext directly
                 // or ensure that parserWithFunction returns the correct type.

                 // Simple approach: use fromContext for simple paths
                 // This handles "obj.prop", "array[0]", "array[key,field]" but NOT the 'exist|...' syntax
                 value = this.fromContext(data, trimmedExpression);

                 // TODO: If you need the 'exist|...' logic or others handled in parserWithFunction
                 // you might need to refactor parserWithFunction to return non-string types
                 // or integrate its logic here more directly.
                 // Example (hypothetical, requires parserWithFunction modification):
                 // value = this.parserWithFunctionReturningAny(data, trimmedExpression);
            }

            // Return the value as is, without converting it to string
            // and without changing null/undefined to ''
            return value;

        } catch (error) {
            console.error(`Error evaluating expression: "${expression}"`, error);
            // Decide what to return on error: null, undefined, or rethrow the error
            return undefined; // or return null; or throw error;
        }
    }

    public parse(template:string, data:any,otherData:any=null, selectorOpen = '{', selectorClose = '}'): any {

        let result =  template+'';
        let array = this.matchRecursive(result, `${selectorOpen}...${selectorClose}`);
        (array || []).forEach(x=>{
            try {
                let value = null;
                let change:string  = x ||'';
                if (change.indexOf('!@') === 0 && change.indexOf('|') > 0) {
                    let parameters = change.split('|');
                    value = this.functions[parameters[0].substr(2)](data,parameters.slice(1));
                } else {
                    // Check if we're dealing with a function call that handles arrays (#@, ##@)
                    // These functions need raw parameters to process them in the context of each array element
                    // But simple @ functions need their parameters resolved in the current context
                    let isArrayFunction = (change.indexOf('#@') === 0 && change.indexOf('|') > 0) ||
                                        (change.indexOf('##@') === 0 && change.indexOf('|') > 0);
                    
                    if(change.indexOf(selectorOpen)>=0 && !isArrayFunction){
                        change = this.parse(x,data, null, selectorOpen, selectorClose);
                    }
                    
                    if (change.indexOf('@') === 0 && change.indexOf('|') > 0) {
                        let parameters = change.split('|');
                        value = this.functions[parameters[0].substr(1)](parameters.slice(1));
                    }
                    else if (change.indexOf('#@') === 0 && change.indexOf('|') > 0) {
                        let parameters = change.split('|');
                        value = this.functions[parameters[0].substr(2)](data,parameters.slice(1));
                    }
                    else if (change.indexOf('##@') === 0 && change.indexOf('|') > 0) {
                        let parameters = change.split('|');
                        value = this.functions[parameters[0].substr(3)](otherData,data,parameters.slice(1));
                    }
                    else {
                        value = this.parserWithFunction(data, change);
                    }
                }

                if (value === undefined || value === null) {
                    value = '';
                }

                let replaceString = selectorOpen+x+selectorClose;
                result = replaceString == result ? value : result.replace(replaceString,value);
            } catch (error) {
                console.error("parse :"+ template,error);
            }

        });
        return result;
    }

    private parserString(str:string, data:any): any {
        return str.replace(/\{ *([\w_.:,'|\-\[\]]+) *\}/g, (str, key) => {
            let value = this.parserWithFunction(data, key);
            if (value === undefined || value === null) {
                value = '';
            } else if (typeof value === 'function') {
                //value = value(data);
            }
            return value;
        });
    }

    private parserWithFunction(data: any, key: string): string {

        let result: any = null;
        let colonsIndexStart = key.indexOf('|');
        if (colonsIndexStart >= 0) {
            switch (key.substr(0, colonsIndexStart).toLowerCase()) {
                case 'exist': {
                    let paramsStr = key.substr(colonsIndexStart + 1, key.length - colonsIndexStart);
                    let params = paramsStr.split(",");
                    if (params.length === 3) {
                        let value = this.fromContext(data, params[0]);
                        let strData = '';
                        if (value) {
                            strData = params[1];
                        } else {
                            strData = params[2];
                        }
                        if (strData[0] == '"' || strData[0] == "'") {
                            result = this.parserString(strData.substr(1, strData.length - 2), data)
                        } else {
                            result = this.fromContext(data, strData);
                        }
                    }
                }
                break;
            }
        } else {
            result = this.fromContext(data, key);
        }
        return result;
    }

    private fromContext(data: any, key: string): any {

        if (!data) return null;
        let prefix = key;
        let dotIndex = key.indexOf('.');
        let arrayIndexStart = key.indexOf('[');
        let arrayIndexEnd = key.indexOf(']');

        if (dotIndex >= 0) {
            prefix = key.substr(0, dotIndex);
        } else if (arrayIndexStart >= 0 && arrayIndexEnd > 0) {
            prefix = key.substr(0, arrayIndexStart);
        }

        let result = null;
        if (arrayIndexStart > 0 && arrayIndexStart < dotIndex) {
            result = this.fromContext(data, prefix);
        } else {
            result = data[prefix];
        }
        if (dotIndex >= 0 && result) {
            result = this.fromContext(result, key.substr(dotIndex + 1));
        } else if (arrayIndexStart >= 0 && arrayIndexEnd > 0 && result) {
            if (Array.isArray(result)) {
                let lenght = arrayIndexEnd - arrayIndexStart;
                let position = key.substr(arrayIndexStart + 1, lenght - 1);
                if(position.indexOf(',')>=0){
                    let filters = position.split(',');  // Use commas also to access fields inside the object, so the first element is the value, while all the rest are field names
                    result =  this.arrayFirstByField(result,filters[0],filters.slice(1));
                } else{
                    switch (position) {
                        case 'first': {
                            result = result[0];
                        }
                        break;
                    case 'last': {
                        result = result[result.length - 1];
                    }
                    break;
                    default: {
                        let index = +position;
                        if (index >= 0) {
                            result = result[index];
                        } else {
                            result = null;
                        }
                    }
                    break;
                    }
                }

            } else {
                result = null;
            }
        }
        return result;
    }

//#region Functions
    private functions:any = {};

    public setFunctions(func: any) {
        this.functions = {...this.functions, ...func};
    }

    private  intIf = (parameters:any[]) =>{
        let result=null;
        if (!parameters || parameters.length < 2 || parameters.length > 3) return null;
        try{
            result = eval(parameters[0]);
        }
        catch(ex)
        {
            console.error("[INTIF] Parameters",parameters[0]);
            console.error("[INTIF] ERROR",ex);
        }
        return ( result ? parameters[1] : parameters[2]);
    }

    private intIsNull = (params: any[]) => {
        if (!params || (params.length !== 2 && params.length !== 3)) return null;
        if(params.length === 2)
            return params[0] === null || params[0] === undefined || (typeof params[0] === 'string' && params[0].trim() === '') ? params[1] : params[0];

        return params[0] === null || params[0] === undefined || (typeof params[0] === 'string' && params[0].trim() === '') ? params[2] : params[1];
    }

    private intSwitch = (params: any[], insensitive: boolean = false) => {
        if (!params || params.length < 2) return null;
        let i = 1;
        while (params[i]) {
            let index = params[i].indexOf(':');
            if (index <= 0) return params[i];
            let conditionValue = params[i].slice(0, index);
            let returnValue = params[i].slice(index + 1);
            if (conditionValue == 'default' || !insensitive && conditionValue == params[0] || insensitive && conditionValue.toLocaleLowerCase() == params[0].toLocaleLowerCase())
                return returnValue;
            i++;
        }

        return null;
    }

    private intSwitchCaseInsersitive = (params: string[]) => {
        return this.intSwitch(params, true);
    }

    private intDate = (params:any[]) => {
        if (!params || params.length < 1) return null;
        if (params.length === 1) return params[0];

        if (params.length === 3) {
            const mdt =  dayjs(params[0], params[1]);
            return mdt.isValid() ? mdt.format(params[2]) : '';
        }
        const mdt = dayjs(params[0]);
        return mdt.isValid() ? mdt.format(params[1]) : '';
    }

    private intCurrency = (params:any[]) => {
        if (!params || params.length < 1) return null;
        
        const value = this.toNumber([params[0]]);
        if (value === null || isNaN(value)) return null;

        let currency = "EUR";
        let locale = this.currentLang || 'en';
        
        // Handle different parameter combinations
        if (params.length >= 2 && params[1]) {
            currency = params[1];
        }
        if (params.length >= 3 && params[2]) {
            locale = params[2];
        }

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        } catch (error) {
            // Fallback for invalid currency/locale
            console.warn(`Invalid currency "${currency}" or locale "${locale}", using default`);
            return new Intl.NumberFormat('en', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        }
    }

    private intNot = (params:any[]) => {
        if (!params || params.length != 1) return null;

        var result = this.intToBool(params);

        if(result=='true')
            return 'false';

        return 'true';
    }

    private intToBool = (params:any[]) => {
        if (!params || params.length != 1) return null;

        if(params[0]=='false' || params[0] === '' || params[0] == "0" || params[0] == undefined || params[0] == 'undefined' || params[0] == null)
            return 'false';

        return 'true';
    }

    private toNumber = (params:any[]) => {
        if (!params || params.length != 1) return null;
        let value = params[0];
        switch (typeof value) {
            case "number": return value;
            case "boolean": return value ? 1 : 0;
            case "string":
                try {
                    let number = new BigNumber(value);
                    return number.isNaN() ? null : number.toNumber();
                } catch {
                    return null;
                }
            default: return null;
        }
    };

    private intSum = (params:any[]) => {
        if (!params || params.length != 2) return null;
        return (<any>params[0] * 1.0)+(<any>params[1] * 1.0)
    };

    private intMath = (params:any[]) => {
      if (!params || params.length !=3) return null;
      let result = null;
      let number1 = (<any>params[1] * 1.0);
      let number2 = (<any>params[2] * 1.0);
      switch(params[0]){
        case '+': result = number1 + number2; break;
        case '-': result = number1 - number2; break;
        case '*': result = number1 * number2; break;
        case '/': result = number1 / number2; break;
        case '%': result = number1 % number2; break;
        case '**': result = number1 ** number2; break;
      }
      return result
    };

    private intArrayConcat = (data: any, params:any[]) => {
        if (!params || params.length < 2) return null;
        let array = data[params[0]];
        let result = '';
        if(Array.isArray(array)){
            array.forEach(x=>{
                let template = [...params].slice(1).join('|');
                result += this.parse(template, x, null);
            })
        }
        return result;
    };

    private intArraySum = (data: any, params:any[]) => {
        if (!params || params.length < 2) return null;
        let array = data[params[0]];
        let result = new BigNumber(0);
        if(Array.isArray(array)){
            array.forEach(x=>{
                let template = [...params].slice(1).join('|');
                let single = this.parse(template, x, null);
                if(!isNaN(single)) {
                    result = result.plus(new BigNumber(single));
                }
            })
        }
        return result.toString();
    };

    private intContains = (params: any[]) => {
        if (!params || params.length < 2 || params.length > 4) return null;
        let contains = params[0]?.toLowerCase().includes(params[1].toLowerCase());
        if (contains) {
            if (params.length >= 3)
                return params[2];
            return params[0];
        } else if (params.length === 4)
            return params[3];
        return null;
    }

    private intPadStart = (params:any[]) => {
        if (!params || params.length < 2) return null;
        let value: string = params[0].toString();
        return value.padStart(params[1], params[2]);
    }
    private intPadEnd = (params:any[]) => {
        if (!params || params.length < 2) return null;
        let value: string = params[0].toString();
        return value.padEnd(params[1], params[2]);
    }

    // intSplit function that splits a string by delimiter and parses each part as JSON
    // Syntax: {@Split|jsonString|delimiter}
    // Example: {@Split|{"code":"1","desc":"primo"};{"code":"2","desc":"secondo"}|;}
    // Returns: [{"code":"1","desc":"primo"}, {"code":"2","desc":"secondo"}]
    private intSplit = (data: any, params: any[]) => {
        if (!params || params.length < 2) return [];
        
        try {
            const stringToSplit = params[0];
            const delimiter = params[1];
            
            // Check if stringToSplit is valid
            if (!stringToSplit || typeof stringToSplit !== 'string') {
                return [];
            }
            
            // Split the string by delimiter
            const parts = stringToSplit.split(delimiter);
            const result = [];
            
            // Parse each part as JSON and add to result array
            for (const part of parts) {
                const trimmed = part.trim();
                if (!trimmed) continue; // Skip empty parts
                
                try {
                    const parsed = JSON.parse(trimmed);
                    result.push(parsed);
                } catch (parseError) {
                    // Skip invalid JSON parts or add as string?
                    console.warn(`Skipping invalid JSON part: "${trimmed}"`);
                    continue;
                }
            }
            
            return result;
        } catch (error) {
            console.error("intSplit error:", error);
            return [];
        }
    }

    // intJson function that if param[0] is 'Parse' parses a JSON string and returns the corresponding object, 
    // or does the opposite if param[0] is 'Stringify' and converts from object to string
    private intJson = (data: any, params: any[]) => {
        if (!params || params.length < 2) return null;
    
        try {
            // For JSON operations, we need the actual object/value, not its string representation
            // So we use fromContext directly to get the raw value
            let value = params[1];
            if (typeof params[1] === "string") {
                // Remove braces if present and get the raw object
                let key = params[1];
                if (key.startsWith('{') && key.endsWith('}')) {
                    key = key.slice(1, -1);
                }
                value = this.fromContext(data, key);
            }
    
            if (params[0].toLowerCase() === "parse") {
                return typeof value === "string" ? JSON.parse(value) : null;
            }
    
            if (params[0].toLowerCase() === "stringify") {
                return JSON.stringify(value);
            }
    
            return null;
        } catch (error) {
            console.error("intJson error:", error);
            return null;
        }
    }


//#endregion
}