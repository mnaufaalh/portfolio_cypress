import { adminDapur, qualityChecker, legitChecker, emailNaufal, emailTamara } from '/cypress/fixtures/json/user.json';
import UserFlow from '../../support/flow/user-flow';
import UserLoginFlow from '../../support/flow/user-login-flow';
import { userIndonesia, userKBrand } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../support/helper/local-storage";
import faker from "faker";
import ProductFlow from '../../support/flow/product-flow';


describe('Purchase', function () {
  let accessTokenAdmin;
  let accessTokenKBrand;
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
        return UserLoginFlow.userLogin(legitChecker.emailAddress, legitChecker.password)

      })
      .then(res => {
        accessTokenKBrand = res;
        LocalStorage.setLogin(accessTokenAdmin);
      })
  });


  it('Should be to buy standard product', function () {
    for (let i = 0; i < 51; i++) {

      // const category = faker.random.arrayElement(['sneakers', 'handbags', 'apparels', 'lifestyles']);
      const category = 'sneakers '

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
          // const selectedSize = res[faker.datatype.number({ min: 0, max: res.length - 1 })].US;
          const selectedSize = res[faker.datatype.number({ min: 0, max: res.length - 1 })].id;
          console.log(selectedSize)
          let number = 0;
          let shippingMethod;
          let price;
          let isBrandNew;
          let isDefect;

          const loop = () => {
            if (number == 0) {
              email = userKBrand.emailAddress;
              shippingMethod = 'Standard';
              price = 1000000;
              isBrandNew = true;
              isDefect = false;
            }
            // else if (number === 1) {
            //   email = userKBrand.emailAddress;
            //   shippingMethod = 'Standard'
            //   price = 1000000;
            //   isBrandNew = true;
            //   isDefect = false;
            // } else if (number === 2) {
            //   email = userKBrand.emailAddress;
            //   shippingMethod = 'Standard'
            //   price = 1000000;
            //   isBrandNew = true;
            //   isDefect = false;
            // } 
            else {
              return
            }
            number++;

            return UserFlow.findIdUserDapur(accessTokenAdmin, email)
              .then(res => {
                userDetail = res.data.find(e => e.typed_email === email);
                ProductFlow.setProductVariantToBeActive(accessTokenAdmin, selectedProduct);
                if (shippingMethod === 'Standard') {
                  // Seller 1 Standard
                  ProductFlow.addStock({ accessTokenAdmin, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect, selectedProduct, userDetail, sizeId: selectedSize, price: price });
                } else if (shippingMethod === 'Pre Order') {
                  // Seller 2 Pre Order
                  ProductFlow.addStock({
                    accessTokenAdmin, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect,
                    selectedProduct, userDetail, sizeId: selectedSize, price: price
                  });
                } else {
                  // Seller 3 Express
                  ProductFlow.addStock({ accessTokenAdmin, accessTokenQC, accessTokenLC, shippingMethod: shippingMethod, isBrandNew: isBrandNew, isDefect: isDefect, selectedProduct, userDetail, sizeId: selectedSize, price: price });
                }
                return loop()
              })
          }
          return loop()
        });
    }
  });
});
