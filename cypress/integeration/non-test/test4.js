import ProductFlow from '../../support/flow/product-flow';
import UserLoginFlow from '../../support/flow/user-login-flow';
import { adminDapur, qualityChecker, legitChecker, userKBrand } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../support/helper/local-storage";
import faker from "faker";
import UserFlow from '../../support/flow/user-flow';



describe('test', function () {
  it('test', function () {
    let selectedProduct;
    let accessTokenAdmin;
    let accessTokenKBrand;
    let accessTokenQC;
    let accessTokenLC;


    let userDetailSeller;
    const email = userKBrand.emailAddress
    let selectedSize;
    let invoiceNumber
    let saleDetail;


    let shippingMethod;
    let price;
    let isBrandNew;
    let isDefect;

    const category = 'sneakers'

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
        return UserLoginFlow.userLogin(userKBrand.emailAddress, userKBrand.password)

      })
      .then(res => {
        accessTokenKBrand = res;
        LocalStorage.setLogin(accessTokenAdmin);
        return ProductFlow.listOfProductVariant(category, accessTokenAdmin)
      })
      .then(res => {
        selectedProduct = res[faker.datatype.number({ max: res.length - 1 })];
        console.log(selectedProduct)
        console.log(selectedProduct.display_name)
        console.log(selectedProduct.SKU)
        console.log(selectedProduct.product.id)
        return ProductFlow.browseSizeProduct(accessTokenAdmin, category, selectedProduct);
      })
      .then(res => {
        selectedSize = res[faker.datatype.number({ max: res.length - 1 })].id;
        console.log(selectedSize)
        return UserFlow.findIdUserDapur(accessTokenAdmin, email)
      })
      .then(res => {
        userDetailSeller = res.data.find(e => e.typed_email === email);
        ProductFlow.setProductVariantToBeActive(accessTokenAdmin, selectedProduct);
        let quantity = faker.datatype.number({ min: 1, max: 25 })
        console.log(quantity)
        for (let i = 0; i < quantity; i++) {
          ProductFlow.addStock({ accessTokenAdmin, shippingMethod: 'Standard', isBrandNew: true, isDefect: false, selectedProduct, userDetailSeller, sizeId: selectedSize, price: 1000000, quantity: 1 })
            .then(res2 => {
              if (i <= quantity - 2) {
                console.log(i)
                const id = res2.id;
                cy.request({
                  url: 'https://lumenstaging.kickavenue.com/users/payments',
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessTokenKBrand}`
                  },
                  body: { "shipping": { "id": 87808, "alias": "test", "full_name": "test", "phone_number": "+62139572498", "street_address": "test", "note": "", "country": "IDN", "province": "DKI Jakarta", "province_id": 6, "city": "Jakarta Barat", "city_id": 151, "postal_code": "11620" }, "user_sell_id": id, "quantity": 1, "payment_method": "full_wallet", "ka_courier_price": 40000, "currency": "IDR", "offer_amount": 1000000, "unique_amount": 0, "administration_fee": 0, "ka_courier_option": "FLAT_RATE", "wallet_amount": 1060000, "subsidy_price": 0, "point_enabled": false, "facebook_ad_campaign": null }
                })
                  .then(res3 => {
                    invoiceNumber = res3.body.data.invoice_number;
                    ProductFlow.searchSale(accessTokenAdmin, invoiceNumber)
                      .then(res4 => {
                        saleDetail = res4;
                        cy.request({
                          url: `https://lumenstaging.kickavenue.com/admins/sales/${saleDetail.id}`, method: 'PUT',
                          headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`
                          },
                          body: { "seller_responded": "2024-07-22 23:36:00", "status": "NEW" }
                        })
                        ProductFlow.changeStatusSale({ accessToken: accessTokenAdmin, sale: saleDetail, email: adminDapur.emailAddress, verificationType: 'KA_RECEIVED' });
                        ProductFlow.changeStatusSale({ accessToken: accessTokenQC, sale: saleDetail, verificationType: 'VERIFICATION_PASSED' });
                        ProductFlow.changeStatusSale({ accessToken: accessTokenLC, sale: saleDetail, verificationType: 'VERIFICATION_PASSED' });
                        ProductFlow.changeStatusSale({ accessToken: accessTokenLC, sale: saleDetail, verificationType: 'PENDING_DELIVERING' })
                          .then(res5 => {
                            ProductFlow.adminInputAWB(accessTokenAdmin, res5);
                            cy.request({
                              url: `https://lumenstaging.kickavenue.com/users/orders/${saleDetail.id}/completions`,
                              method: 'PUT',
                              headers: {
                                Authorization: `Bearer ${accessTokenKBrand}`
                              }
                            })
                          })
                      })
                  })
              }

            })

        }
      })
  })
})