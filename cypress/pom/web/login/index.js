export const WEB_LOGIN_URL = '/login';

export default class WebLogin {
  static getEmailAddressField() {
    return cy.get('input[type="email"]');
  }

  static getPasswordField() {
    return cy.get('input[type="password"]');
  }

  static getSubmitButton() {
    return cy.get('input[type="submit"]');
  }

  static linkSignUp() {
    return cy.get('span:contains("Sign up here")');
  }

  static linkForgetPassword() {
    return cy.get('[class="forgot-password"]');
  }

  static buttonOkOnModalFailed() {
    return cy.get('button:contains("OK")');
  }

  static buttonResetPassword() {
    return cy.get('button:contains("Reset Password")')
  }

  static modalFailedLogin() {
    return cy.get('[id="failed-login-attempt"]');
  }
}