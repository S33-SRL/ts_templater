import * as moment from "moment";
import BigNumber from 'bignumber.js';

export class TsTemplater  {

    private currentLang:string = 'it';
    public changeLang(lang:string){
        this.currentLang = lang;
        moment.locale(this.currentLang);
    }

    
    constructor ()
    {
        this.functions["Date"] = this.intDate;
        this.functions["Bool"] = this.intToBool;
        this.functions["Number"] = this.toNumber;
        //this.functions["Currency"] = this.intCurrency; TO DO 
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
        //this.functions["ToList"] = this.intCurrency; // TO DO
        this.functions["ArrayConcat"] = this.intArrayConcat;
        this.functions["ArraySum"] = this.intArraySum;

        moment.locale(this.currentLang);
    }

    private  matchRecursive = function () {
        var	formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
            metaChar = /[-[\]{}()*+?.\\^$|,]/g,
            escape = function (str:string) {
                return str.replace(metaChar, "\\$&");
            };

        return function (str:string, format:string) {
            var p = formatParts.exec(format);
            if (!p) throw new Error("format must include start and end tokens separated by '...'");
            if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

            var	opener = p[1],
                closer = p[2],
                /* Use an optimized regex when opener and closer are one character each */
                iterator: any = new RegExp(format.length == 5 ? "["+escape(opener+closer)+"]" : escape(opener)+"|"+escape(closer), "g"),
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
    }();

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
        // let i = 0;
        // while(array[i]){
        //   if(`${(array[i][fieldName])}`==key) return array[i];
        //   i++;
        // }
        // return null;
    }



    public parse(template:string, data:any,otherData:any=null, selectorOpen = '{', selectorClose = '}'): any {
        let result =  template+'';
        let array = this.matchRecursive(result, `${selectorOpen}...${selectorClose}`);
        //console.log(`${selectorOpen}...${selectorClose}`, array, data);
        (array || []).forEach(x=>{
            try {
                let value = null;
                let change:string  = x ||'';
                if (change.indexOf('!@') === 0 && change.indexOf('|') > 0) {
                    let parameters = change.split('|');
                    value = this.functions[parameters[0].substr(2)](data,parameters.slice(1));
                } else {
                    if(change.indexOf(selectorOpen)>=0){
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
                    if (params.length = 3) {
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
                    let filters = position.split(',');  // Utilizzo le virgole anche per accedere ai campi dentro l'oggetto quindi il primo elemento è valore, mentre tutto il resto sono nomi dei campi
                    result =  this.arrayFirstByField(result,filters[0],filters.slice(1));
                } else{
                    switch (position) {
                        case 'first': {
                            result = result[0];
                        }
                        break;
                    case 'last': {
                        result = result[( < Array < any >> result).length - 1];
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
            console.log("[INTIF] Parameters",parameters[0]);
            console.log("[INTIF] ERROR",ex);
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
            const mdt =  moment(params[0], params[1]);
            return mdt.isValid() ? mdt.format(params[2]) : '';
        }
        const mdt = moment(params[0]);
        return mdt.isValid() ? mdt.format(params[1]) : '';
    }

    // private intCurrency = (params:any[]) => {
    //     if (!params || params.length < 1) return null;
    //     if(!this._currencyPipe) return null;

    //     let currency = "EUR";
    //     if(params.length>1 && params[1])
    //     currency = params[1];

    //     let result= this._currencyPipe.transform(params[0], currency,"symbol","1.2");

    //     return result;
    // }

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
        //console.log('ArrayConcat', params);
        if (!params || params.length < 2) return null;
        let array = data[params[0]];
        let result = '';
        if(Array.isArray(array)){
            array.forEach(x=>{
                let template = [...params].slice(1).join('|');
                //console.log("ArrayConcat item", x, template);
                result += this.parse(template, x, null);
            })
        }
        //console.log("ArrayConcat result", result);
        return result;
    };

    private intArraySum = (data: any, params:any[]) => {
        //console.log('ArrayConcat', params);
        if (!params || params.length < 2) return null;
        let array = data[params[0]];
        let result = 0;
        if(Array.isArray(array)){
            array.forEach(x=>{
                let template = [...params].slice(1).join('|');
                //console.log("ArrayConcat item", x, template);
                let single = this.parse(template, x, null);
                if(!isNaN(single)) result += (single*1.0);
            })
        }
        //console.log("ArrayConcat result", result);
        return result;
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

//#endregion
}
