import { TsTemplater } from '../src/index';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

const objExample =
  {
    "mainDescription": "short",
    "packageQuantity": 10,
    "reorderPoint": 0,
    "leadTime": 234.56,
    "increase": [],
    "purchaseDiscount": [],
    "installationRoot": false,
    "productImage":"image.jpg",
    "installationComponent": true,
    "creationDate": "2016-06-10T15:19:25.75",
    "lastModifyDate": "2022-02-08T07:44:36.9117091",
    "autoImported": true,
    "parent":null,
    "measureUnit": {
        "symbol": "nr",
        "extCode": "NR",
        "description": "Numero",
        "code": "NR",
        "identity": "9ba3578a-b8b9-4628-83c0-ce6da554e448"
    },
    "type":
    {
        "favorite": false,
        "locked": false,
        "description": "TVCC",
        "code": "50",
        "identity": "4b8e1685-cedf-4fbd-a5e1-238141d592f8"
    },
    "tags": [
        {
            "favorite": false,
            "locked": false,
            "description": "MODULI ESSER",
            "code": "115",
            "identity": "147bd82a-37b0-4782-ac6d-c8295d662a36"
        },
        {
            "favorite": false,
            "locked": false,
            "description": "Computer",
            "code": "COMP",
            "identity": "2d98e48f-4c31-4bc1-a2ae-b9d9b208e728"
        },
        {
            "favorite": false,
            "locked": false,
            "description": "Server",
            "code": "SERV",
            "identity": "4e672dc9-4d7d-4813-9a8b-8e3019cd6fcd"
        }
    ],
    "notes": [
      {
          "kind": "note",
          "value": "Thi is main note ",
          "displayPopUp": true,
          "identity": "efea9ce2-52db-434b-a5b7-63d0a4054cf4"
      },
      {
        "kind": "second",
        "value": "Thi is second note ",
        "displayPopUp": false,
        "identity": "efea9ce2-52db-434b-a5b7-63d0a4054cf5"
      }
    ],
    "bom": [],
    "attachments": [],
    "tagList": "TVCC",
    "shortDescription": "1/3\" Progressive Scan CMOS",
    "consumable": false,
    "noMoveInStore": false,
    "prices": [
        {
            "kind": "customer",
            "priceListPrice": 302,
            "price": 317.1,
            "ignoreDiscounts": false
        },
        {
            "kind": "supplier",
            "priceListPrice": 302,
            "price": 108.72,
            "ignoreDiscounts": false
        }
    ],
    "fullDescription": "1/3\" Progressive Scan CMOS, 0.01Lux @(F1.2,AGC ON) , 0 Lux with IR, IR: up to 30m, 25fps (1920 × 1080), 25 fps (1280 × 960),  25 fps (1280 x 720), 6mm lens, DC12V/ PoE, H.264/MJPEG, dual-stream, IP66, DWDR, 3D DNR, BLC, Motion Detection",
    "code": "DS-2CD2T20-I3(6mm)",
    "identity": "f20c3a22-9043-472a-bac0-8df8f1fd6c7a"
  }


describe('TsTemplater', () => {
  let tmpEngine = new TsTemplater();
  it('Render single field', () => {
    const result = tmpEngine.parse('hello {mainDescription}', objExample);
    expect(result).toBe('hello ' + objExample.mainDescription);
  });

  it('Navigate fields',() => {
    const result = tmpEngine.parse('navigate {measureUnit.symbol}', objExample);
    expect(result).toBe('navigate ' + objExample.measureUnit.symbol);
  });

  it('Render multi fields',() => {
    const result = tmpEngine.parse('fields {code} - {shortDescription}', objExample);
    expect(result).toBe('fields ' + objExample.code + ' - ' + objExample.shortDescription);
  });

  it('render nasted fields',() => {
    const result = tmpEngine.parse('nasted {type.description} - {measureUnit.description}', objExample);
    expect(result).toBe('nasted ' + objExample.type.description + ' - ' + objExample.measureUnit.description);
  });

  it('render elementby index',() => {
    const result = tmpEngine.parse('element by index {tags[1].description}', objExample);
    expect(result).toBe('element by index ' + objExample.tags[1].description);
  });

  it('render first element in array',() => {
    const result = tmpEngine.parse('first {prices\[customer,kind\].price} - Buy price: {prices\[supplier,kind\].price}', objExample);
    expect(result).toBe('first ' + objExample.prices[0].price + ' - Buy price: ' + objExample.prices[1].price);
  });

  it('Coverting date',() => {
    const result = tmpEngine.parse('{@Date|2016-06-10T15:19:25.75|DD/MM/YYYY}', objExample);
    expect(result).toBe( dayjs('2016-06-10T15:19:25.75').format('DD/MM/YYYY'));
  });

  it('Coverting date from field',() => {
    const result = tmpEngine.parse('{@Date|{creationDate}|YYYY-MM-DD HH:mm}', objExample);
    expect(result).toBe( dayjs(objExample.creationDate).format('YYYY-MM-DD HH:mm'));
  });

  it('Coverting form format to format',() => {
    const result = tmpEngine.parse('{@Date|02-16-24|MM-DD-YY|DD/MM/YYYY}', objExample);
    expect(result).toBe( dayjs('02-16-24','MM-DD-YY').format('DD/MM/YYYY'));
  });

  it('Work with boolean 1',() => {
    const result = tmpEngine.parse('{@Bool|duck}', objExample);
    expect(result).toBe('true');
  });

  it('Work with boolean 2',() => {
    const result = tmpEngine.parse('{@Bool|false}', objExample);
    expect(result).toBe('false');
  });

  it('Work with boolean 3' ,() => {
    const result = tmpEngine.parse('{@Bool|true}', objExample);
    expect(result).toBe('true');
  });

  it('Work with boolean 4' ,() => {
    const result = tmpEngine.parse('{@Bool|undefined}', objExample);
    expect(result).toBe('false');
  });

  it('Work with boolean 5' ,() => {
    const result = tmpEngine.parse('{@Bool|{installationComponent}}', objExample);
    expect(result).toBe(''+objExample.installationComponent);
  });

  it('number format 1' ,() => {
    const result = tmpEngine.parse('{@Number|}', objExample);
    expect(result).toBe('');
  });

  it('number format 2' ,() => {
    const result = tmpEngine.parse('{@Number|true}', objExample);
    expect(result).toBe('');
  });

  it('number format 3' ,() => {
    const result = tmpEngine.parse('{@Number|012}', objExample);
    expect(result).toBe(12);
  });

  it('number format 4' ,() => {
    const result = tmpEngine.parse('{@Number|23.342}', objExample);
    expect(result).toBe(23.342);
  });

  it('number format 5' ,() => {
    const result = tmpEngine.parse('{@Number|{leadTime}}', objExample);
    expect(result).toBe(234.56);
  });

  // it('Currency format 1' ,() => {
  //   const result = tmpEngine.parse('{@Currency|234.56}', objExample);
  //   expect(result).toBe('$234.56');
  // }
  
  // it('Currency format 2' ,() => {
  //   const result = tmpEngine.parse('{@Currency|{prices\[supplier,kind\].price}}', objExample);
  //   expect(result).toBe('$108.72');
  // }

  it('Not 1',() => {
    const result = tmpEngine.parse('{@Not|true}', objExample);
    expect(result).toBe('false');
  });

  it('Not 2',() => {
    const result = tmpEngine.parse('{@Not|{consumable}}', objExample);
    expect(result).toBe(''+!objExample.consumable);
  });

  it('Sum 1',() => {
    const result = tmpEngine.parse('{@Sum|1|2}', objExample);
    expect(result).toBe(3);
  })

  it('Sum 2',() => {
    const result = tmpEngine.parse('{@Sum|{packageQuantity}|2}', objExample);
    expect(result).toBe(objExample.packageQuantity+2);
  })

  it('Sum 3',() => {
    const result = tmpEngine.parse('{@Sum|{packageQuantity}|{leadTime}}', objExample);
    expect(result).toBe(objExample.packageQuantity+objExample.leadTime);
  })

  it('Math function 1',() => {
    const result = tmpEngine.parse('{@Math|*|3|2}', objExample);
    expect(result).toBe(6);
  });

  it('Math function 2',() => {
    const result = tmpEngine.parse('{@Math|/|{packageQuantity}|2}', objExample);
    expect(result).toBe(objExample.packageQuantity/2);
  });

  it('Math function 3',() => {
    const result = tmpEngine.parse('{@Math|%|{leadTime}|{packageQuantity}}', objExample);
    expect(result).toBe(objExample.leadTime%objExample.packageQuantity);
  });

});