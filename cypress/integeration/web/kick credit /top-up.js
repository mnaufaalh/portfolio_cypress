import WebHomepage, { WEB_HOMEPAGE_URL } from "../../../pom/web/homepage";
import UserLoginFlow from "../../../support/flow/user-login-flow";
import { sellerIndonesia } from '/cypress/fixtures/json/user.json';
import LocalStorage from "../../../support/helper/local-storage";
import Profle, { WEB_PROFILE_URL } from "../../../pom/web/profile";
import 'cypress-file-upload';
import KickCredit from "../../../pom/web/profile/kick credit ";
import faker from "faker";
import GeneralFlow from "../../../support/flow/general-flow";
import { expect } from "chai";

describe('Kick Credit', function () {
  let accessToken;
  const STAGING_URL = Cypress.env('STAGING_URL');
  let adminFee;
  let topUpAmount;

  before(() => {
    Cypress.on('uncaught:exception', () => {
      return false
    });
    UserLoginFlow.userLogin(sellerIndonesia.emailAddress, sellerIndonesia.password).then(res => {
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
    Profle.getKickCreditButton().click();
    KickCredit.getTopUpButton().click();
    GeneralFlow.topUpSetting(accessToken)
      .then(res => {
        const minimalTopUp = res.kickCredit.minimalTopUpAmount;
        adminFee = res.kickCredit.adminFee.amount;
        const randomTopUpAmount = faker.random.arrayElement([100000, 250000, 500000, 1000000, 2500000, 5000000]);

        randomTopUpAmount < minimalTopUp ? topUpAmount = randomTopUpAmount + minimalTopUp : topUpAmount = randomTopUpAmount;
        KickCredit.getAmountOptionButton(topUpAmount).click();
        KickCredit.getNextButton().click();
        KickCredit.getAmountBePaidText().invoke('text')
      })
      .then(res => {
        expect(parseInt(res.replace(/\D/g, ''))).to.eql(topUpAmount + adminFee);
        const bankName = faker.random.arrayElement(['BCA', 'MANDIRI', 'OTHER', 'BNI', 'PERMATA']);
        KickCredit.getPaymentMethodButton(bankName).click();
        KickCredit.getConfirmButton().click();
      })
  });
});