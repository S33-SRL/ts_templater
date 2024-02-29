import { TsTemplater } from '../src/index';

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
    const result = tmpEngine.parse('hello {{mainDescription}}', objExample);
    expect(result).toBe('hello ' + objExample.mainDescription);
  });
});