import { buyerIndonesia } from '/cypress/fixtures/json/user.json';
import { adminDapur } from '/cypress/fixtures/json/user.json';
import WebHomepage, { WEB_HOMEPAGE_URL } from '../../pom/web/homepage';
import WebLogin, { WEB_LOGIN_URL } from '../../pom/web/login';
import UserFlow from '../../support/flow/user-flow';
import UserLoginFlow from '../../support/flow/user-login-flow';

describe('Login', function () {
  const STAGING_URL = Cypress.env('STAGING_URL');
  let accessToken;
  let userDetail;
  beforeEach(() => {
    cy.visit(STAGING_URL);
    Cypress.on('uncaught:exception', () => {
      return false
    });
    cy.url().should('include', WEB_HOMEPAGE_URL);
    WebHomepage.getLoginButton().click();
    cy.url().should('include', WEB_LOGIN_URL);
    WebLogin.getEmailAddressField().type(buyerIndonesia.emailAddress);
  })
  it('Should unable to login with invalid credential', function () {
    WebLogin.getPasswordField().type('salah password');
    WebLogin.getSubmitButton().click();
    WebLogin.modalFailedLogin().should('exist');
  });
  it('Should able to login with valid credential', function () {
    WebLogin.getPasswordField().type(buyerIndonesia.password);
    WebLogin.getSubmitButton().click();
    WebHomepage.getUserLogin().invoke('text').should('eql', buyerIndonesia.emailAddress);
  });
  it('Should be to reset the password if failed to login in 5 times in a row', function () {
    WebLogin.getPasswordField().type('salah password');
    const attemptFailedLogin = 5;
    for (let i = 0; i < attemptFailedLogin; i++) {
      WebLogin.getSubmitButton().click();
      i === 4 ? WebLogin.buttonResetPassword().should('be.visible') :
        WebLogin.buttonOkOnModalFailed().should('be.visible').click();
    }
    UserLoginFlow.userLogin(adminDapur.emailAddress, adminDapur.password)
      .then(res => {
        accessToken = res;
        return UserFlow.findIdUserDapur(accessToken, buyerIndonesia.emailAddress)
      })
      .then(res => {
        userDetail = res.data.find(e => e.typed_email === buyerIndonesia.emailAddress);
        UserFlow.updateUserDetail(accessToken, userDetail);
        UserLoginFlow.userLogin(buyerIndonesia.emailAddress, buyerIndonesia.password);
      })
  });
});
