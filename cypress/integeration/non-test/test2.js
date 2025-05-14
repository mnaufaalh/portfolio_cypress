import { adminDapur, qualityChecker, legitChecker, emailNaufal, emailTamara } from '/cypress/fixtures/json/user.json';
import UserFlow from '../../support/flow/user-flow';
import UserLoginFlow from '../../support/flow/user-login-flow';
import { userIndonesia } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../support/helper/local-storage";
import faker from "faker";
import ProductFlow from '../../support/flow/product-flow';


describe('Purchase', function () {
  let accessTokenAdmin;
  let accessTokenQC;
  let accessTokenLC;

  before(() => {
    Cypress.on('uncaught:exception', () => {
      return false
    });
    UserLoginFlow.userLogin(adminDapur.emailAddress, adminDapur.password).then(res => {
      accessTokenAdmin = res;
      return UserLoginFlow.userLogin(qualityChecker.emailAddress, qualityChecker.password)
    })
      .then(res => {
        accessTokenQC = res;
        return UserLoginFlow.userLogin(legitChecker.emailAddress, legitChecker.password)
      })
      .then(res => {
        accessTokenLC = res;
        LocalStorage.setLogin(accessTokenAdmin);
      })
  });


  it('Should be to buy standard product', function () {
    const category = faker.random.arrayElement(['sneakers', 'handbags', 'apparels', 'lifestyles']);

    let selectedProduct;
    let userDetail;
    let email;

    ProductFlow.listOfProductVariant(category, accessTokenAdmin)
      .then(res => {
        selectedProduct = res[faker.datatype.number({ min: 0, max: res.length - 1 })];
        console.log(selectedProduct)
        console.log(selectedProduct.display_name)
        console.log(selectedProduct.SKU)
        console.log(selectedProduct.product.id)
        return ProductFlow.browseSizeProduct(accessTokenAdmin, category, selectedProduct);
      })
      .then(res => {
        const selectedSize = res[faker.datatype.number({ min: 0, max: res.length - 1 })].US;
        console.log(selectedSize);

        const users = [
          {
            email: 'muhammadnhilmi@gmail.com',
            price: 1000000,
            sneakersCondition: 'Brand New',
            preOrder: false,
            boxCondition: 'Perfect'
          },
          {
            email: 'tamaratesting1@gmail.com',
            price: 1000000,
            sneakersCondition: 'Brand New',
            preOrder: false,
            boxCondition: 'Perfect'
          }
        ]

        const functionToJSON = (body) => {
          const isArray = Array.isArray(body);
          let arrayElement;
          isArray === false ? arrayElement = [body] : arrayElement = body;
          let data = [];
          const length = arrayElement.length;
          const fileJSON = {
            "Error Message": "",
            "Stock ID": "",
            "Email": "",
            "SKU": selectedProduct.SKU,
            "Size (US)": selectedSize,
            "Price": "",
            "Purchase Price": "",
            "Currency": "IDR",
            "Pre-Verified": "",
            "Pre-Order": "",
            "Status": "APPROVED",
            "Sneakers Condition": "",
            "Missing Accessories": "",
            "Yellowing": "",
            "Display Item": "",
            "Sneakers Defect": "",
            "No Tags": "",
            "Missing Original": "",
            "Manufacture Defect": "",
            "Box Condition": "",
            "Rack": "",
            "Quantity": "1",
            "Note": "",
            "Expiry": "",
            "Consignment": "",
            "Hypequarter Display": ""
          };
          for (let i = 0; i < length; i++) {
            fileJSON.Email = arrayElement[i].email;
            fileJSON.Price = arrayElement[i].price;
            fileJSON["Sneakers Condition"] = arrayElement[i].sneakersCondition;
            fileJSON["Pre-Order"] = arrayElement[i].preOrder;
            fileJSON["Box Condition"] = arrayElement[i].boxCondition;
            data.push(fileJSON);
          };
          return data;
        };

        function jsonToCsv(body, path) {
          const items = functionToJSON(body);
          const header = Object.keys(items[0]);
          const headerString = header.join(',');
          // handle null or undefined values here
          const replacer = (key, value) => value ?? '';
          const rowItems = items.map((row) =>
            header
              .map((fieldName) => JSON.stringify(row[fieldName], replacer))
              .join(',')
          );
          // join header and body, and break into separate lines
          const csv = [headerString, ...rowItems].join('\r\n');
          return cy.writeFile(`cypress/fixtures/file/${path}.csv`, csv);
        };
        jsonToCsv(users, 'data');

        // const user = users.find(e => e.email === 'tamaratesting1@gmail.com');
        // user.price = 50000;






        // jsonToCsv(user, 'data2');




        // console.log(data, `.....`)
        // const csvContent = data.map((row) => row.join(",")).join("\n");
        // console.log(csvContent)





        // const data = [
        //   {
        //     "Error Message": "",
        //     "Stock ID": "",
        //     "Email": "muhammadnhilmi@gmail.com",
        //     "SKU": selectedProduct.SKU,
        //     "Size (US)": selectedSize,
        //     "Price": firstUser.price,
        //     "Purchase Price": "",
        //     "Currency": "IDR",
        //     "Pre-Verified": "",
        //     "Pre-Order": firstUser.preOrder,
        //     "Status": "APPROVED",
        //     "Sneakers Condition": firstUser.sneakersCondition,
        //     "Missing Accessories": "",
        //     "Yellowing": "",
        //     "Display Item": "",
        //     "Sneakers Defect": "",
        //     "No Tags": "",
        //     "Missing Original": "",
        //     "Manufacture Defect": "",
        //     "Box Condition": firstUser.boxCondition,
        //     "Rack": "",
        //     "Quantity": "1",
        //     "Note": "",
        //     "Expiry": "",
        //     "Consignment": "",
        //     "Hypequarter Display": ""
        //   },
        //   {
        //     "Error Message": "",
        //     "Stock ID": "",
        //     "Email": "tamaratesting1@gmail.com",
        //     "SKU": selectedProduct.SKU,
        //     "Size (US)": selectedSize,
        //     "Price": firstUser.price,
        //     "Purchase Price": "",
        //     "Currency": "IDR",
        //     "Pre-Verified": "",
        //     "Pre-Order": firstUser.preOrder,
        //     "Status": "APPROVED",
        //     "Sneakers Condition": firstUser.sneakersCondition,
        //     "Missing Accessories": "",
        //     "Yellowing": "",
        //     "Display Item": "",
        //     "Sneakers Defect": "",
        //     "No Tags": "",
        //     "Missing Original": "",
        //     "Manufacture Defect": "",
        //     "Box Condition": firstUser.boxCondition,
        //     "Rack": "",
        //     "Quantity": "1"
        //   }
        // ]






        // const selectedSize = res[faker.datatype.number({ min: 0, max: res.length - 1 })].id;
        // console.log(selectedSize)
        let number = 0;
        let shippingMethod;
        let price;
        let isBrandNew;
        let isDefect;

        //   const loop = () => {
        //     if (number == 0) {
        //       email = userIndonesia.emailAddress;
        //       shippingMethod = 'Pre Order';
        //       price = 100000;
        //       isBrandNew = true;
        //       isDefect = false;
        //     } else if (number === 1) {
        //       email = emailTamara.emailAddress;
        //       shippingMethod = 'Pre Order'
        //       price = 100000;
        //       isBrandNew = true;
        //       isDefect = false;
        //     } else if (number === 2) {
        //       email = emailNaufal.emailAddress;
        //       shippingMethod = 'Pre Order'
        //       price = 1000000;
        //       isBrandNew = true;
        //       isDefect = false;
        //     } else {
        //       return
        //     }
        //     number++;

        //     return UserFlow.findIdUserDapur(accessTokenAdmin, email)
        //       .then(res => {
        //         userDetail = res.data.find(e => e.typed_email === email);
        //         ProductFlow.setProductVariantToBeActive(accessTokenAdmin, selectedProduct);

        //         if (shippingMethod === 'Standard') {
        //           // Seller 1 Standard
        //           ProductFlow.addStock({ accessTokenAdmin, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect, selectedProduct, userDetail, selectedSize, price: price });
        //         } else if (shippingMethod === 'Pre Order') {
        //           // Seller 2 Pre Order
        //           ProductFlow.addStock({
        //             accessTokenAdmin, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect,
        //             selectedProduct, userDetail, selectedSize, price: price
        //           });
        //         } else {
        //           // Seller 3 Express
        //           ProductFlow.addStock({ accessTokenAdmin, accessTokenQC, accessTokenLC, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect, selectedProduct, userDetail, selectedSize, price: price });
        //         }


        //         return loop()
        //       })
        //   }
        //   return loop()
      });
  });
});
