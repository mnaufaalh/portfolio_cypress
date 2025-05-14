import WebHomepage, { WEB_HOMEPAGE_URL } from "../../../pom/web/homepage";
import UserLoginFlow from "../../../support/flow/user-login-flow";
import { userIndonesia } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../../support/helper/local-storage";
import Profle, { WEB_PROFILE_URL } from "../../../pom/web/profile";
import 'cypress-file-upload';

describe('Seller Credit', function () {
  let accessToken;
  const STAGING_URL = Cypress.env('STAGING_URL');

  before(() => {
    Cypress.on('uncaught:exception', () => {
      return false
    });
    UserLoginFlow.userLogin(userIndonesia.emailAddress, userIndonesia.password).then(res => {
      accessToken = res;
      LocalStorage.setLogin(accessToken);
    });
  });

  it('Should able to cash out in seller credit', function () {
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
    Profle.getSellerCreditButton().click();

  });
});