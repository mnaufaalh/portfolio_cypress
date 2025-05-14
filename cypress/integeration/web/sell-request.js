import WebHomepage, { WEB_HOMEPAGE_URL } from "../../pom/web/homepage";
import UserLoginFlow from "../../support/flow/user-login-flow";
import { userIndonesia } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../support/helper/local-storage";
import Profle, { WEB_PROFILE_URL } from "../../pom/web/profile";
import SellingDasboard from "../../pom/web/profile/selling-dashboard";
import 'cypress-file-upload';
import SellNow, { SELL_NOW_URL } from "../../pom/web/profile/selling-dashboard/sell-now";
import ProductFlow from "../../support/flow/product-flow";
import faker from "faker";
import GeneralFlow from "../../support/flow/general-flow";
import SellRequestFlow from "../../support/flow/sell-request-flow";

describe('Sell Request', function () {
  let accessToken;
  const STAGING_URL = Cypress.env('STAGING_URL');
  const imagePath = 'image/kickavenue.png';
  const category = faker.random.arrayElement(['sneakers', 'handbags', 'apparels', 'lifestyles']);
  let displayNameItem;
  let sizes;
  let index;
  let indexUploadImage;
  let selectedItem;
  let price;
  let priceFormatted;
  const interceptProductList = (keyword) => cy.intercept({
    pathname: '/users/selling/sells',
    query: {
      keyword: `${keyword}`,
      sort_by: '',
      category: '',
      status: '',
      order_status: '',
      page: '1',
      sneakers_condition: ''
    }
  });
  const findSpecificProduct = (displayNameItem) => {
    interceptProductList(displayNameItem).as('SearchProduct');
    SellingDasboard.getSearchBar().type(`${displayNameItem}{enter}`);
    return cy.wait('@SearchProduct');
  }

  before(() => {
    Cypress.on('uncaught:exception', () => {
      return false
    });
    UserLoginFlow.userLogin(userIndonesia.emailAddress, userIndonesia.password).then(res => {
      accessToken = res;
      LocalStorage.setLogin(accessToken);
    });
  });

  it('Should able to sell single product', function () {
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
    cy.visit(STAGING_URL);
    cy.url().should('include', WEB_HOMEPAGE_URL);
    cy.wait('@BannerLoaded')
    WebHomepage.getProfileUserButton().click();
    cy.url().should('include', WEB_PROFILE_URL);
    Profle.getSellingDashboardButton().click();
    SellingDasboard.getSellAProductButton().should('be.visible').click();
    cy.url().should('include', SELL_NOW_URL);
    SellNow.getCategoryButton(category).click();
    category !== 'handbags' ? indexUploadImage = 5 : indexUploadImage = 6;
    for (let i = 0; i < indexUploadImage; i++) {
      SellNow.getUploadPhoto(i).attachFile(imagePath);
    };
    ProductFlow.findProduct(category, accessToken).then(res => {
      selectedItem = res;
      displayNameItem = selectedItem.display_name;
      sizes = selectedItem.sizes;

      if (sizes.length === 0 || sizes[0] === undefined) {
        ProductFlow.browseSizeProduct(accessToken, category, selectedItem)
          .then(res => {
            sizes = res;
            return sizes;
          })
      } else {
        return sizes;
      }
    })
      .then(() => {
        SellNow.getProductName().type(displayNameItem);
        return ProductFlow.searchIndexOfProductName(displayNameItem, category, selectedItem.id)
      })
      .then(res => {
        index = res;
        SellNow.getSearchProductItem(displayNameItem, index).click();
        SellNow.getSizeProduct().click();
        const selectedSize = faker.random.arrayElement(sizes);
        SellNow.getSearchSize(selectedSize.US).click();
        SellNow.getProductCondition().click();
        let productCondition;
        category === 'handbags' ? productCondition = ['BRAND NEW', 'PRISTINE', 'GOOD', 'WELL USED', 'LIKE NEW', 'VINTAGE'] : productCondition = ['BRAND NEW', 'PRE OWNED'];
        const selectedProductCondition = faker.random.arrayElement(productCondition);
        SellNow.getSearchProductCondition(selectedProductCondition).click();
        SellNow.getBoxCondition().click();
        const boxCondition = ['PERFECT', 'DEFECT', 'MISSING BOX'];
        const selectedboxCondition = faker.random.arrayElement(boxCondition);
        SellNow.getSearchBoxCondition(selectedboxCondition).click();
        SellNow.getNoteField().type(faker.lorem.words());
        return GeneralFlow.priceMultipliers(accessToken)
      })
      .then(res => {
        const priceMultipliers = res;
        price = faker.datatype.number({ min: 1, max: 20000 }) * priceMultipliers;
        priceFormatted = `IDR ${price.toLocaleString()}`
        SellNow.getSellingPriceField().clear().type(price);
        cy.intercept('POST', '/products/prices').as('SubmitRequest');
        interceptProductList('').as('SellRequestList');
        SellNow.getSubmitButton().click();
        cy.wait('@SubmitRequest');
        cy.wait('@SellRequestList');
        return findSpecificProduct(displayNameItem);
      }).then(res => {
        const data = res.response.body.data.data;
        const IDProductCreated = data.find(e => e.asking_price === `${price}.00`).id;
        SellingDasboard.getTitleProduct(displayNameItem).should('exist');
        SellingDasboard.getPriceProduct(priceFormatted).should('exist');
        SellRequestFlow.updateStatusRequest(accessToken, IDProductCreated, 'approved');
        cy.reload();
        findSpecificProduct(displayNameItem);
      });
  });
});