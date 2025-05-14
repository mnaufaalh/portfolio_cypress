import {
  adminDapur,
  qualityChecker,
  legitChecker,
  automationUserBuyerMidtrans,
  automationUserSeller,
  automationUserBuyerKickCredit,
  automationUserBuyerKickPoint,
  automationUserBuyerSellerCredit
} from '/cypress/fixtures/json/user.json';
import WebHomepage from '../../../pom/web/homepage';
import UserFlow from '../../../support/flow/user-flow';
import UserLoginFlow from '../../../support/flow/user-login-flow';
import LocalStorage from '../../../support/helper/local-storage';
import ProductBuyFlow from '../../../support/flow/product-buy-flow';
import faker from 'faker';
import ProductFlow from '../../../support/flow/product-flow';
import Marketplace from '../../../pom/web/marketplace';
import GeneralFlow from '../../../support/flow/general-flow';
import BuyingDashboard from '../../../pom/web/profile/buying-dashboard';
import { expect } from 'chai';
import DateTime from '../../../support/helper/datetime';
import Profile from '../../../pom/web/profile';
import midtransSnap from '../../../pom/midtrans/snap';
import midtransSimulator from '../../../pom/midtrans/simulator';

describe('Purchase', function () {
  const STAGING_URL = Cypress.env('STAGING_URL');
  const MIDTRANS_SIMULATOR_URL = Cypress.env('MIDTRANS_SIMULATOR_URL');
  const CVV = Cypress.env('CVV');
  const PASSWORD_TRANSACTION_MIDTRANS = Cypress.env(
    'PASSWORD_TRANSACTION_MIDTRANS'
  );
  const bankCC = faker.random.arrayElement(['BCA', 'Mandiri', 'BNI']);
  const bankVA = faker.random.arrayElement([
    'BCA',
    'Mandiri',
    'BNI',
    'Permata',
    'BRI'
  ]);

  let accessTokenAdmin;
  let accessTokenQC;
  let accessTokenLC;
  let accessTokenSeller;
  let accessTokenBuyer;
  let accessTokenBuyerMidtrans;
  let accessTokenBuyerKickCredit;
  let accessTokenBuyerKickPoint;
  let accessTokenBuyerSellerCredit;
  let emailBuyer;
  let isPopUpBanner;
  let category;
  let selectedProduct;
  let priceMultipliers;
  let processingFee;
  let shippingFee;
  let askingPrice;
  let totalPrice;
  let userDetailSeller;
  let userDetailBuyer;
  let kickKredit;
  let sellerCredit;
  let kickPoint;
  let sizeId;
  let sizeUS;
  let invoiceNumber;
  let bidId;
  let userSellId;
  let saleDetail;
  let VirtualAccountNumber;
  let isExpress;
  let voucherCode;
  let voucherAmount;
  let cashback;
  let isCashback;
  let deductType;
  let typeOfCalculationVoucher;
  let maxAmountDiscountVoucher;
  let productAddOn;
  let displayNameProductAddOn;
  let priceProductAddOn;

  const openPageUntilProductDetail = (params) => {
    return new Cypress.Promise((resolve, reject) => {
      const {
        productCondition = 'Brand New',
        sizeUS,
        isAddOnProduct = false,
        voucher = {
          isVoucher: false,
          typeOfVoucher: ''
        },
        paymentMethod = {
          payment: 'Seller Credit',
          isOffer: false
        }
      } = params;
      let isKickPoint;
      let displayCategory;
      let disbursementIn = 0;
      const offerPrice =
        faker.datatype.number({
          min: Math.round(50000 / priceMultipliers),
          max: Math.round(askingPrice / priceMultipliers)
        }) * priceMultipliers;

      const handlePayment = () => {
        return new Cypress.Promise((resolve, reject) => {
          let pathname;
          paymentMethod.payment === 'CC'
            ? Marketplace.creditCardPaymentButton(bankCC).click()
            : paymentMethod.payment === 'VA'
            ? Marketplace.virtualAccountPaymentButton(bankVA).click()
            : (Marketplace.kickCreditPaymentButton().click(),
              isKickPoint === false || isKickPoint === undefined
                ? Marketplace.useCreditButton().click()
                : Marketplace.useKickPointButton().click());
          paymentMethod.payment === 'VA' || paymentMethod.payment === 'CC'
            ? (pathname = '/users/payments/midtrans')
            : (pathname = '/users/payments');
          paymentMethod.isOffer === false || paymentMethod.isOffer === undefined
            ? cy.intercept('POST', pathname).as('PaymentItem')
            : cy.intercept('POST', '/users/bids').as('PaymentItem');
          paymentMethod.payment === 'VA' || paymentMethod.payment === 'CC'
            ? Marketplace.continueButton().click()
            : Marketplace.proceedToPaymentButton().click();
          cy.wait('@PaymentItem').then((res) => {
            paymentMethod.payment === 'VA' || paymentMethod.payment === 'CC'
              ? paymentMethod.isOffer === false ||
                paymentMethod.isOffer === undefined
                ? ((bidId = ''),
                  (invoiceNumber = res.response.body.data.invoice_number),
                  paymentMethod.payment === 'VA'
                    ? viaVA(paymentMethod.isOffer)
                    : viaCC(paymentMethod.isOffer))
                : ((bidId = res.response.body.data.id),
                  (invoiceNumber = ''),
                  Marketplace.viewOfferHistoryButton().click())
              : paymentMethod.isOffer === false ||
                paymentMethod.isOffer === undefined
              ? ((invoiceNumber = res.response.body.data.invoice_number),
                Marketplace.goToBuyingDashboardButton().click(),
                cy.reload(),
                refreshProfile(),
                (bidId = ''))
              : (Marketplace.viewOfferHistoryButton().should('exist').click(),
                BuyingDashboard.getTable().should('exist'),
                (bidId = res.response.body.data.id));
            resolve({ bidId: bidId, invoiceNumber: invoiceNumber });
          });
        });
      };

      const paymentOffer = (paymentMethod, bidId) => {
        return new Cypress.Promise((resolve, reject) => {
          BuyingDashboard.getSearchBarOffer().type(
            `${selectedProduct.display_name}{enter}`
          );
          ProductFlow.sellingCurrentList(
            accessTokenSeller,
            selectedProduct.display_name
          ).then((res) => {
            const data = res.find(
              (e) =>
                e.product_variant.display_name === selectedProduct.display_name
            );
            userSellId = data.id;
            return ProductFlow.acceptBid(
              accessTokenSeller,
              userSellId,
              bidId
            ).then((res) => {
              invoiceNumber = res.offer.invoice_number;
              paymentMethod.payment === 'VA' || paymentMethod.payment === 'CC'
                ? (BuyingDashboard.getPendingTabButton().click(),
                  BuyingDashboard.getTable().should('exist'),
                  cy
                    .intercept({
                      method: 'GET',
                      pathname: '/users/payments',
                      query: {
                        keyword: `${selectedProduct.display_name}`,
                        sort_by: '',
                        category: '',
                        status: 'pending',
                        order_status: '',
                        page: '1'
                      }
                    })
                    .as('PendingOfferList'),
                  BuyingDashboard.getSearchBarPending().type(
                    `${selectedProduct.display_name}{enter}`
                  ),
                  cy.wait('@PendingOfferList'),
                  BuyingDashboard.completePaymentButton().click(),
                  paymentMethod.payment === 'VA'
                    ? viaVA(paymentMethod.isOffer)
                    : viaCC(paymentMethod.isOffer),
                  refreshProfile())
                : (BuyingDashboard.getInProgressTabButton().click(),
                  refreshProfile());
              resolve(invoiceNumber);
            });
          });
        });
      };

      const useVoucher = (typeOfVoucher, askingPrice) => {
        return new Cypress.Promise((resolve, reject) => {
          let body;
          let isActive;
          let isLimit;
          let isInRangeOfDate;
          let isAllPatform;
          let isVariant;
          let isAnyCategory;
          let isAnyBrand;
          let isEarly;
          let idVoucher;
          let totalUsage;
          let categoriesId = [];
          let isMinPurchase;

          GeneralFlow.voucherList(accessTokenAdmin, typeOfVoucher) //typeOfVoucher = public_open, public, private
            .then((res) => {
              const data = res[faker.datatype.number(res.length - 1)];
              idVoucher = data.id;
              return GeneralFlow.totalVoucherUsage(accessTokenAdmin, idVoucher);
            })
            .then((res) => {
              totalUsage = res.total_usages;
              return GeneralFlow.categoriesList(accessTokenAdmin);
            })
            .then((res) => {
              res.forEach((e) => {
                categoriesId.push(e.id);
              });
              return GeneralFlow.voucherDetail(accessTokenAdmin, idVoucher);
            })
            .then((res) => {
              const voucherDetail = res;
              isCashback = voucherDetail.is_cashback;
              deductType = voucherDetail.deduct_type;
              voucherCode = voucherDetail.code;
              typeOfCalculationVoucher = voucherDetail.type;
              maxAmountDiscountVoucher = voucherDetail.max_amount;
              body = voucherDetail;
              const dailyStartTime = voucherDetail.daily_start_time;
              const newDateToday = new Date();
              let newDateStartedAt = new Date(voucherDetail.started_at);
              let newDateEndedAt = new Date(voucherDetail.ended_at);

              typeOfCalculationVoucher === 'percentage'
                ? (voucherAmount =
                    (parseInt(voucherDetail.amount) * askingPrice) / 100)
                : (voucherAmount = parseInt(voucherDetail.amount));

              maxAmountDiscountVoucher !== null
                ? parseInt(maxAmountDiscountVoucher) < voucherAmount
                  ? (voucherAmount = parseInt(maxAmountDiscountVoucher))
                  : ''
                : '';

              console.log(
                parseInt(maxAmountDiscountVoucher),
                `maxAmountDiscountVoucher.....`
              );
              console.log(voucherAmount, `voucherAmount.....`);

              body.listing_pre_order = false;
              body.listing_pre_verified = false;

              const functionCheckDailyTime = () => {
                let earlyOrNot;
                const parseTime = (timeString) => {
                  const [hours, minutes, seconds] = timeString
                    .split(':')
                    .map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, seconds, 0);
                  return date;
                };
                const dateToTimeString = (date) => {
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${hours}:${minutes}:00`;
                };
                const dateTest = parseTime(dailyStartTime);
                const dateTest2 = parseTime(DateTime.getCurrentTimeStamp());
                let newDateTest;
                let newTestString;

                dateTest > dateTest2
                  ? ((earlyOrNot = true),
                    (newDateTest = new Date(dateTest2)),
                    newDateTest.setHours(newDateTest.getHours() - 1),
                    newDateTest.setSeconds(0),
                    (newTestString = dateToTimeString(newDateTest)),
                    (body.daily_start_time = `${newTestString}`))
                  : (earlyOrNot = false);
                return earlyOrNot;
              };

              typeOfVoucher === 'private'
                ? GeneralFlow.addUserInVoucher(
                    accessTokenAdmin,
                    idVoucher,
                    userDetailBuyer
                  )
                : '';

              isEarly = functionCheckDailyTime();

              body.brand_vouchers.length !== 0
                ? ((isAnyBrand = true), (body.brand_vouchers = []))
                : (isAnyBrand = false);

              parseInt(body.minimum_purchase) > askingPrice
                ? ((isMinPurchase = true),
                  (body.minimum_purchase = askingPrice))
                : (isMinPurchase = false);

              body.voucher_payment_methods.length !== 0
                ? GeneralFlow.editPaymentMethodInVoucher(
                    accessTokenAdmin,
                    idVoucher
                  )
                : '';

              body.platform_specifications !== null
                ? ((isAllPatform = true), (body.platform_specifications = null))
                : (isAllPatform = false);

              body.categories.length !== categoriesId.length
                ? ((isAnyCategory = true),
                  GeneralFlow.editableCategoriesInVoucher(
                    accessTokenAdmin,
                    idVoucher,
                    categoriesId
                  ))
                : (isAnyCategory = false);

              body.variant_vouchers.length !== 0
                ? ((isVariant = true),
                  GeneralFlow.editVariantVoucher(accessTokenAdmin, idVoucher))
                : (isVariant = false);

              voucherDetail.active === false
                ? ((body.active = true), (isActive = true))
                : (isActive = false);

              totalUsage === voucherDetail.limit
                ? ((isLimit = true), (body.limit += body.limit++))
                : (isLimit = false);

              newDateToday < newDateStartedAt
                ? ((isInRangeOfDate = true),
                  (newDateStartedAt = DateTime.formatDate(
                    newDateToday.setDate(newDateToday.getDate() - 1)
                  )),
                  (body.started_at = newDateStartedAt))
                : (isInRangeOfDate = false);

              newDateToday > newDateEndedAt
                ? ((isInRangeOfDate = true),
                  (newDateEndedAt = DateTime.formatDate(
                    newDateToday.setDate(newDateToday.getDate() + 1)
                  )),
                  (body.ended_at = newDateEndedAt))
                : (isInRangeOfDate = false);

              return GeneralFlow.userUsageVoucher(
                accessTokenAdmin,
                idVoucher,
                userDetailBuyer
              );
            })
            .then((res) => {
              let isLimitUser;
              let isSetLimitPerUser;

              body.limit !== null
                ? parseInt(body.limit) === res.used_count
                  ? ((isLimitUser = true), body.limit++)
                  : ''
                : (isLimitUser = false);

              parseInt(body.limit_per_user) === totalUsage
                ? ((isSetLimitPerUser = true), body.limit_per_user++)
                : (isSetLimitPerUser = false);

              isLimit === true ||
              isInRangeOfDate === true ||
              isActive === true ||
              isAllPatform === true ||
              isVariant === true ||
              isEarly === true ||
              isAnyBrand === true ||
              isAnyCategory === true ||
              isLimitUser === true ||
              isSetLimitPerUser === true ||
              isMinPurchase === true
                ? ((body.minimum_purchase = parseInt(body.minimum_purchase)),
                  (body.max_amount = parseInt(body.max_amount)),
                  GeneralFlow.editBeUsableVoucher(
                    accessTokenAdmin,
                    idVoucher,
                    body
                  ))
                : '';
              resolve(voucherCode);
            });
        });
      };

      UserFlow.findIdUserDapur(accessTokenAdmin, emailBuyer)
        .then((res) => {
          userDetailBuyer = res.data.find((e) => e.typed_email === emailBuyer);
          kickKredit = parseInt(userDetailBuyer.balance);
          console.log(kickKredit, `awal`);

          sellerCredit = parseInt(userDetailBuyer.balance_with_fee);
          console.log(sellerCredit, `awal`);

          kickPoint = parseInt(userDetailBuyer.locked_balance);
          console.log(kickPoint, `awal`);

          voucher.isVoucher === true
            ? useVoucher(voucher.typeOfVoucher, askingPrice, userDetailBuyer)
            : '';

          paymentMethod.payment !== 'Kick Credit'
            ? (isKickPoint = false)
            : paymentMethod.hasOwnProperty('isKickPoint') === true
            ? (isKickPoint = paymentMethod.isKickPoint)
            : (isKickPoint = false);

          paymentMethod.payment === 'Kick Credit'
            ? paymentMethod.isOffer === false
              ? isKickPoint === true
                ? askingPrice > kickPoint
                  ? ((disbursementIn =
                      faker.datatype.number({
                        min: Math.ceil(
                          (askingPrice + (askingPrice * processingFee) / 100) /
                            priceMultipliers
                        ),
                        max: 100000
                      }) * priceMultipliers),
                    GeneralFlow.createDisbursement({
                      accessToken: accessTokenAdmin,
                      userDetailBuyer,
                      balance_source: 'LOCKED_BALANCE',
                      payoutType: 'MANUAL',
                      disbursementType: 'BALANCE_IN',
                      amount: disbursementIn
                    }))
                  : ''
                : askingPrice > kickKredit
                ? ((disbursementIn =
                    faker.datatype.number({
                      min: Math.ceil(
                        (askingPrice + (askingPrice * processingFee) / 100) /
                          priceMultipliers
                      ),
                      max: 100000
                    }) * priceMultipliers),
                  GeneralFlow.createDisbursement({
                    accessToken: accessTokenAdmin,
                    userDetailBuyer,
                    balance_source: 'BALANCE',
                    payoutType: 'MANUAL',
                    disbursementType: 'BALANCE_IN',
                    amount: disbursementIn
                  }))
                : ''
              : isKickPoint === true
              ? offerPrice > kickPoint
                ? ((disbursementIn =
                    faker.datatype.number({
                      min: Math.ceil(
                        (askingPrice + (askingPrice * processingFee) / 100) /
                          priceMultipliers
                      ),
                      max: 100000
                    }) * priceMultipliers),
                  GeneralFlow.createDisbursement({
                    accessToken: accessTokenAdmin,
                    userDetailBuyer,
                    balance_source: 'LOCKED_BALANCE',
                    payoutType: 'MANUAL',
                    disbursementType: 'BALANCE_IN',
                    amount: disbursementIn
                  }))
                : ''
              : offerPrice > kickKredit
              ? ((disbursementIn =
                  faker.datatype.number({
                    min: Math.ceil(
                      (askingPrice + (askingPrice * processingFee) / 100) /
                        priceMultipliers
                    ),
                    max: 100000
                  }) * priceMultipliers),
                GeneralFlow.createDisbursement({
                  accessToken: accessTokenAdmin,
                  userDetailBuyer,
                  balance_source: 'BALANCE',
                  payoutType: 'MANUAL',
                  disbursementType: 'BALANCE_IN',
                  amount: disbursementIn
                }))
              : ''
            : paymentMethod.payment === 'Seller Credit'
            ? paymentMethod.isOffer === false
              ? askingPrice > sellerCredit
                ? ((disbursementIn =
                    faker.datatype.number({
                      min: Math.ceil(
                        (askingPrice + (askingPrice * processingFee) / 100) /
                          priceMultipliers
                      ),
                      max: 100000
                    }) * priceMultipliers),
                  console.log(disbursementIn, `disbursementIn......`),
                  GeneralFlow.createDisbursement({
                    accessToken: accessTokenAdmin,
                    userDetailBuyer,
                    balance_source: 'BALANCE_WITH_FEE',
                    payoutType: 'MANUAL',
                    disbursementType: 'BALANCE_IN',
                    amount: disbursementIn
                  }))
                : ''
              : offerPrice > sellerCredit
              ? ((disbursementIn =
                  faker.datatype.number({
                    min: Math.ceil(
                      (askingPrice + (askingPrice * processingFee) / 100) /
                        priceMultipliers
                    ),
                    max: 100000
                  }) * priceMultipliers),
                GeneralFlow.createDisbursement({
                  accessToken: accessTokenAdmin,
                  userDetailBuyer,
                  balance_source: 'BALANCE_WITH_FEE',
                  payoutType: 'MANUAL',
                  disbursementType: 'BALANCE_IN',
                  amount: disbursementIn
                }))
              : ''
            : kickKredit < 25000
            ? GeneralFlow.createDisbursement({
                accessToken: accessTokenAdmin,
                userDetailBuyer,
                balance_source: 'BALANCE',
                payoutType: 'MANUAL',
                disbursementType: 'BALANCE_IN',
                amount: faker.datatype.number({ min: 25000 })
              })
            : '';

          LocalStorage.setLogin(accessTokenBuyer);
          cy.visit(STAGING_URL);
          cy.wait('@BannerLoaded');
          isPopUpBanner.length !== 0
            ? WebHomepage.getClosePopUpBanner().click()
            : '';
          cy.wait(2500);
          WebHomepage.getSearchButton().click();
          WebHomepage.getSeachField().type(
            `${selectedProduct.display_name}{enter}`
          );
          category === 'sneakers'
            ? (displayCategory = 'Sneakers')
            : category === 'apparels'
            ? (displayCategory = 'Apparel')
            : category === 'handbags'
            ? (displayCategory = 'Luxury')
            : (displayCategory = 'Electronics & Collectibles');
          cy.intercept({
            method: 'GET',
            pathname: 'search',
            query: {
              keyword: selectedProduct.display_name
                .replace(/\s*#\d+$/, '')
                .toUpperCase(),
              category: category,
              availables: 'true',
              per_page: '52',
              sort_by: 'featured_item_score_desc'
            }
          }).as('ItemSearched');
          Marketplace.getFilterConditionSneaker(displayCategory).click();
          cy.wait('@ItemSearched');
          Marketplace.getNameOfItem(selectedProduct.display_name).click();
          Marketplace.productCondition(productCondition)
            .should('be.visible')
            .click();
          Marketplace.selectSize(sizeUS).click();
          paymentMethod.isOffer === true
            ? (Marketplace.makeOfferButton().click(),
              Marketplace.inputOffer().type(offerPrice),
              Marketplace.continueButton().click(),
              cy.wait(7500))
            : (cy
                .intercept({
                  method: 'GET',
                  pathname: '/product-addons',
                  query: {
                    per_page: '25'
                  }
                })
                .as('AddOnProduct'),
              Marketplace.continueButton().click(),
              cy.wait('@AddOnProduct').then((res) => {
                voucher.isVoucher === true
                  ? (Marketplace.viewVoucherButton().click(),
                    Marketplace.findVoucherField().type(voucherCode),
                    cy.intercept('POST', '/vouchers/apply').as('ApplyCode'),
                    Marketplace.checkVoucherAvailabilityButton().click(),
                    cy.wait('@ApplyCode'),
                    Marketplace.useVoucherButton().click())
                  : '';
                isAddOnProduct === true
                  ? ((productAddOn =
                      res.response.body.data.data[
                        faker.datatype.number(res.response.body.data.to - 1)
                      ]),
                    (displayNameProductAddOn = productAddOn.display_name),
                    (priceProductAddOn = parseInt(productAddOn.price)),
                    Marketplace.choosePaymentButton().click(),
                    Marketplace.backButton().click(),
                    Marketplace.chooseProductAddOnButton(
                      displayNameProductAddOn
                    ).click(),
                    Marketplace.choosePaymentButton().click())
                  : (priceProductAddOn = 0);
              }));
          Marketplace.choosePaymentButton().click();
          return cy
            .window()
            .its('localStorage')
            .invoke('getItem', 'X2NvdXJpZXJQcmljZQ==')
            .should('exist');
        })
        .then((res) => {
          shippingFee = JSON.parse(atob(res))[0].data;
          console.log(shippingFee, `1.......`);
          console.log(deductType, 'deductType');
          console.log(isCashback, 'isCashback');
          isCashback === false
            ? deductType === 'product_price'
              ? ''
              : shippingFee < voucherAmount
              ? (voucherAmount = voucherAmount - shippingFee)
              : (voucherAmount = shippingFee)
            : deductType === 'product_price'
            ? (cashback = voucherAmount)
            : (cashback = shippingFee);
          Marketplace.backButton().click();
          console.log(voucherAmount, `voucherAmount.......`);
          console.log(priceProductAddOn, `priceProductAddOn3.......`);

          console.log(
            askingPrice,
            (askingPrice * processingFee) / 100,
            shippingFee,
            priceProductAddOn,
            voucherAmount,
            `^^^^^^^^`
          );

          isCashback === false
            ? paymentMethod.isOffer === true
              ? (totalPrice =
                  offerPrice +
                  (offerPrice * processingFee) / 100 +
                  shippingFee -
                  voucherAmount +
                  priceProductAddOn)
              : (totalPrice =
                  askingPrice +
                  (askingPrice * processingFee) / 100 +
                  shippingFee -
                  voucherAmount +
                  priceProductAddOn)
            : paymentMethod.isOffer === true
            ? (totalPrice =
                offerPrice +
                (offerPrice * processingFee) / 100 +
                shippingFee +
                priceProductAddOn)
            : (totalPrice =
                askingPrice +
                (askingPrice * processingFee) / 100 +
                shippingFee +
                priceProductAddOn);

          Marketplace.totalPrice()
            .invoke('text')
            .then((res) => {
              expect(res).contain(totalPrice.toLocaleString('en-US'));
              Marketplace.choosePaymentButton().click();
              handlePayment().then((res) => {
                console.log(isKickPoint, `isKickPoint`);
                console.log(disbursementIn, `disbursementIn`);

                console.log(sellerCredit, `akhir`);
                console.log(kickKredit, `akhir`);
                console.log(kickPoint, `akhir`);
                console.log(totalPrice, `akhir`);
                console.log(disbursementIn, `akhir`);

                paymentMethod.isOffer === false ||
                paymentMethod.isOffer === undefined
                  ? resolve(res.invoiceNumber)
                  : resolve(paymentOffer(paymentMethod, res.bidId));
                paymentMethod.payment === 'Kick Credit'
                  ? isKickPoint === false
                    ? cy
                        .get('.kick-credit-container')
                        .children('.balance-value')
                        .invoke('text')
                        .then((res) => {
                          console.log(res, `Kick Credit`);
                          expect(res).contain(
                            (
                              kickKredit -
                              totalPrice +
                              disbursementIn
                            ).toLocaleString('id-ID')
                          );
                        })
                    : cy
                        .get('.value')
                        .invoke('text')
                        .then((res) => {
                          console.log(res, `Kick Point`);
                          expect(res).contain(
                            (
                              kickPoint -
                              totalPrice +
                              disbursementIn
                            ).toLocaleString('id-ID')
                          );
                        })
                  : paymentMethod.payment === 'Seller Credit'
                  ? cy
                      .get('.seller-credit-container')
                      .children('.balance-value')
                      .invoke('text')
                      .then((res) => {
                        console.log(res, 'Seller Credit');
                        expect(res).contain(
                          (
                            sellerCredit -
                            totalPrice +
                            disbursementIn
                          ).toLocaleString('id-ID')
                        );
                      })
                  : '';
              });
            });
        });
    });
  };

  const viaVA = (isOffer) => {
    return new Cypress.Promise((resolve, reject) => {
      let billerCode;
      cy
        .intercept({
          method: 'POST',
          url: '/snap/v2/transactions/**'
        })
        .as('Charge'),
        midtransSnap.bankLogoOnVirtualAccountButton(bankVA).click(),
        cy.wait('@Charge').then((res) => {
          bankVA === 'Mandiri'
            ? ((billerCode = res.response.body.biller_code),
              (VirtualAccountNumber = res.response.body.bill_key))
            : bankVA === 'BCA'
            ? (VirtualAccountNumber = res.response.body.bca_va_number)
            : bankVA === 'Permata'
            ? (VirtualAccountNumber = res.response.body.permata_va_number)
            : bankVA === 'BNI'
            ? (VirtualAccountNumber = res.response.body.bni_va_number)
            : (VirtualAccountNumber = res.response.body.bri_va_number);
          cy.visit(MIDTRANS_SIMULATOR_URL);
          midtransSimulator.virtualAccountButtonOnSideBar().click();
          midtransSimulator.bankButtonOnSideBar(bankVA).click();
          bankVA === 'Mandiri'
            ? (midtransSimulator.billerCodeField().type(billerCode),
              midtransSimulator.billKeyField().type(VirtualAccountNumber))
            : midtransSimulator
                .virtualAccountField(bankVA)
                .type(VirtualAccountNumber);
          midtransSimulator.inquireButton().click();
          midtransSimulator.payButton().click();
          isOffer === false
            ? (cy.visit(`${STAGING_URL}/invoices/${invoiceNumber}`),
              Marketplace.goToBuyingDashboardButton()
                .should('be.visible')
                .click())
            : (cy.visit(`${STAGING_URL}/user_dashboard/order`),
              Profile.getBuyingDashboardButton().click());
        });
      resolve();
    });
  };

  const viaCC = (isOffer) => {
    return new Cypress.Promise((resolve, reject) => {
      midtransSnap.cvvField().type(CVV);
      midtransSnap.payNowButton().click();
      midtransSnap.passwordField().type(PASSWORD_TRANSACTION_MIDTRANS);
      cy.intercept('GET', '/snap/v1/transactions/**').as('CompletePayment');
      midtransSnap.submitButton().click();
      cy.wait('@CompletePayment');
      midtransSnap.OKButton().click();
      isOffer === false
        ? Marketplace.goToBuyingDashboardButton().should('be.visible').click()
        : (cy.visit(STAGING_URL),
          cy.wait('@BannerLoaded'),
          WebHomepage.getProfileUserButton().click(),
          Profile.getBuyingDashboardButton().click());
      resolve();
    });
  };

  const refreshProfile = () => {
    BuyingDashboard.getInProgressTabButton().click();
    BuyingDashboard.getTable().should('exist');
    BuyingDashboard.getSearchBarInProgress().type(`${invoiceNumber}{enter}`);
    BuyingDashboard.loadingIcon().should('exist');
    BuyingDashboard.getTable().should('have.length', 1);
  };

  const verificationNotExpress = () => {
    BuyingDashboard.statusOrder()
      .invoke('text')
      .then((res) => {
        expect(res.toUpperCase()).eql('AWAITING SELLER CONFIRMATION');
        ProductBuyFlow.sellerConfirmation(accessTokenSeller, saleDetail.id);
        cy.reload();
        refreshProfile();
        return BuyingDashboard.statusOrder().invoke('text');
      })
      .then((res) => {
        expect(res.toUpperCase()).eql('WAITING FOR SELLER TO DELIVER');
        ProductFlow.changeStatusSale({
          accessToken: accessTokenAdmin,
          sale: saleDetail,
          email: adminDapur.emailAddress,
          verificationType: 'KA_RECEIVED'
        });
        cy.reload();
        refreshProfile();
        return BuyingDashboard.statusOrder().invoke('text');
      })
      .then((res) => {
        expect(res.toUpperCase()).eql('AUTHENTICATION PROCESS');
        ProductFlow.changeStatusSale({
          accessToken: accessTokenQC,
          sale: saleDetail,
          verificationType: 'VERIFICATION_PASSED'
        });
        ProductFlow.changeStatusSale({
          accessToken: accessTokenLC,
          sale: saleDetail,
          verificationType: 'VERIFICATION_PASSED'
        });
        cy.reload();
        refreshProfile();
        return BuyingDashboard.statusOrder().invoke('text');
      });
  };

  before(() => {
    Cypress.on('uncaught:exception', () => {
      return false;
    });
    UserLoginFlow.userLogin(adminDapur.emailAddress, adminDapur.password)
      .then((res) => {
        accessTokenAdmin = res;
        return UserLoginFlow.userLogin(
          qualityChecker.emailAddress,
          qualityChecker.password
        );
      })
      .then((res) => {
        accessTokenQC = res;
        return UserLoginFlow.userLogin(
          legitChecker.emailAddress,
          legitChecker.password
        );
      })
      .then((res) => {
        accessTokenLC = res;
        return UserLoginFlow.userLogin(
          automationUserSeller.emailAddress,
          automationUserSeller.password
        );
      })
      .then((res) => {
        accessTokenSeller = res;
        return UserLoginFlow.userLogin(
          automationUserBuyerMidtrans.emailAddress,
          automationUserBuyerMidtrans.password
        );
      })
      .then((res) => {
        accessTokenBuyerMidtrans = res;
        return UserLoginFlow.userLogin(
          automationUserBuyerKickCredit.emailAddress,
          automationUserBuyerKickCredit.password
        );
      })
      .then((res) => {
        accessTokenBuyerKickCredit = res;
        return UserLoginFlow.userLogin(
          automationUserBuyerKickPoint.emailAddress,
          automationUserBuyerKickPoint.password
        );
      })
      .then((res) => {
        accessTokenBuyerKickPoint = res;
        return UserLoginFlow.userLogin(
          automationUserBuyerSellerCredit.emailAddress,
          automationUserBuyerSellerCredit.password
        );
      })
      .then((res) => {
        accessTokenBuyerSellerCredit = res;
        category = faker.random.arrayElement([
          'sneakers',
          'handbags',
          'apparels',
          'lifestyles'
        ]);
        return GeneralFlow.popUpBanner();
      })
      .then((res) => {
        isPopUpBanner = res;
        return ProductFlow.listOfProductVariant(category, accessTokenAdmin);
      })
      .then((res) => {
        selectedProduct =
          res[faker.datatype.number({ min: 0, max: res.length - 1 })];
        return GeneralFlow.settingProcessingFee(accessTokenAdmin);
      })
      .then((res) => {
        processingFee = res;
      });
  });

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      pathname: '/products/trends',
      query: {
        availables: 'true',
        category: 'all_category',
        per_page: '40',
        homepage_all_category: 'true',
        range_type: 'week',
        range_value: '1'
      }
    }).as('BannerLoaded');
    ProductFlow.browseSizeProduct(accessTokenAdmin, category, selectedProduct)
      .then((res) => {
        const selectedSize =
          res[faker.datatype.number({ min: 0, max: res.length - 1 })];
        sizeId = selectedSize.id;
        sizeUS = selectedSize.US;
        ProductFlow.setProductVariantToBeActive(
          accessTokenAdmin,
          selectedProduct
        );
        return GeneralFlow.priceMultipliers(accessTokenAdmin);
      })
      .then((res) => {
        priceMultipliers = res;
        askingPrice =
          faker.datatype.number({ min: 1, max: 100000 }) * priceMultipliers;
        return UserFlow.findIdUserDapur(
          accessTokenAdmin,
          automationUserSeller.emailAddress
        );
      })
      .then((res) => {
        userDetailSeller = res.data.find(
          (e) => e.typed_email === automationUserSeller.emailAddress
        );
        voucherAmount = 0;
        cashback = 0;
        priceProductAddOn = 0;
        isExpress = false;
      });
  });

  it('Should be to make an offer for a product Kick Credit', function () {
    accessTokenBuyer = accessTokenBuyerKickCredit;
    emailBuyer = automationUserBuyerKickCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'Kick Credit',
        isOffer: true
      },
      sizeUS
    });
  });

  it('Should be to make an offer for a product Kick Point', function () {
    accessTokenBuyer = accessTokenBuyerKickPoint;
    emailBuyer = automationUserBuyerKickPoint.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'Kick Credit',
        isOffer: true,
        isKickPoint: true
      },
      sizeUS
    });
  });

  it('Should be to make an offer for a product Seller Credit', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'Seller Credit',
        isOffer: true
      },
      sizeUS
    });
  });

  it('Should be to make an offer for a product Virtual Account', function () {
    accessTokenBuyer = accessTokenBuyerMidtrans;
    emailBuyer = automationUserBuyerMidtrans.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'VA',
        isOffer: true
      },
      sizeUS
    });
  });

  it('Should be to make an offer for a product Credit Card', function () {
    accessTokenBuyer = accessTokenBuyerMidtrans;
    emailBuyer = automationUserBuyerMidtrans.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'CC',
        isOffer: true
      },
      sizeUS
    });
  });

  it('Should be to Buy product using Private Voucher', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      voucher: { isVoucher: true, typeOfVoucher: 'private' },
      sizeUS
    });
  });

  it('Should be to Buy product using Public Voucher', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      voucher: { isVoucher: true, typeOfVoucher: 'public' },
      sizeUS
    });
  });

  it('Should be to Buy product using Public Open Voucher', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      voucher: { isVoucher: true, typeOfVoucher: 'public_open' },
      sizeUS
    });
  });

  it('Should be to buy product using Virtual Account', function () {
    accessTokenBuyer = accessTokenBuyerMidtrans;
    emailBuyer = automationUserBuyerMidtrans.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'VA',
        isOffer: false
      },
      sizeUS
    });
  });

  it('Should be to buy product using Credit Card', function () {
    accessTokenBuyer = accessTokenBuyerMidtrans;
    emailBuyer = automationUserBuyerMidtrans.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'CC',
        isOffer: false
      },
      sizeUS
    });
  });

  it('Should be to buy product using Kick Credit', function () {
    accessTokenBuyer = accessTokenBuyerKickCredit;
    emailBuyer = automationUserBuyerKickCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      sizeUS,
      paymentMethod: {
        payment: 'Kick Credit',
        isOffer: false
      }
    });
  });

  it('Should be to buy product using Kick Point', function () {
    accessTokenBuyer = accessTokenBuyerKickPoint;
    emailBuyer = automationUserBuyerKickPoint.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'Kick Credit',
        isOffer: false,
        isKickPoint: true
      },
      sizeUS
    });
  });

  it('Should be to buy product using Seller Credit', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({
      paymentMethod: {
        payment: 'Seller Credit',
        isOffer: false
      },
      sizeUS
    });
  });

  it('Should be to buy product with "Add On Product"', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;

    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({ isAddOnProduct: true, sizeUS });
  });

  it('Should be to buy standard product', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({ sizeUS });
  });

  it('Should be to buy pre order product', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Pre Order',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice
    });
    openPageUntilProductDetail({ productCondition: 'Pre Order', sizeUS });
  });

  it('Should be to buy used product', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Standard',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice,
      isBrandNew: false
    });
    openPageUntilProductDetail({ productCondition: 'Used', sizeUS });
  });

  it('Should be to buy express product', function () {
    accessTokenBuyer = accessTokenBuyerSellerCredit;
    emailBuyer = automationUserBuyerSellerCredit.emailAddress;
    isExpress = true;
    ProductFlow.addStock({
      accessTokenAdmin,
      shippingMethod: 'Express',
      selectedProduct,
      userDetailSeller,
      sizeId,
      price: askingPrice,
      accessTokenQC,
      accessTokenLC
    });
    openPageUntilProductDetail({ sizeUS });
  });

  afterEach(() => {
    cy.reload();
    refreshProfile();
    ProductFlow.searchSale(accessTokenAdmin, invoiceNumber)
      .then((res) => {
        saleDetail = res;
        return isExpress === false || isExpress === undefined
          ? verificationNotExpress()
          : BuyingDashboard.statusOrder().invoke('text');
      })
      .then((res) => {
        expect(res.toUpperCase()).eql('AUTHENTICATION PROCESS - SUCCESS');
        return ProductFlow.changeStatusSale({
          accessToken: accessTokenLC,
          sale: saleDetail,
          verificationType: 'PENDING_DELIVERING'
        });
      })
      .then((res) => {
        ProductFlow.adminInputAWB(accessTokenAdmin, res);
        cy.reload();
        refreshProfile();
        BuyingDashboard.trackYourPackageButton().should('exist').click();
        cy.intercept('PUT', `/users/orders/${saleDetail.id}/completions`).as(
          'ReceivedByBuyer'
        );
        BuyingDashboard.IHaveReceivedMyPackageButton().click();
        cy.wait('@ReceivedByBuyer');
        BuyingDashboard.getHistoryTabButton().click();
        BuyingDashboard.statusOrder().should('exist');
        BuyingDashboard.getSearchBarHistory().type(`${invoiceNumber}{enter}`);
        BuyingDashboard.loadingIcon().should('exist');
        BuyingDashboard.statusOrder().should('have.length', 1);
        return BuyingDashboard.statusOrder().invoke('text');
      })
      .then((res) => {
        expect(res.toUpperCase()).eql('DELIVERED');
      });
  });
});
