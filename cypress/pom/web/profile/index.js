export const WEB_PROFILE_URL = '/profile-settings';

export default class Profle {
  static getBuyingDashboardButton() {
    return cy.get('.menu-item:contains("Buying Dashboard")');
  }
  static getSellingDashboardButton() {
    return cy.get('.menu-item:contains("Selling Dashboard")');
  }
  static getConsignmentDashboardButton() {
    return cy.get('.menu-item:contains("Consignment Dashboard")');
  }
  static getMyVoucherButton() {
    return cy.get('.menu-item:contains("My Voucher")');
  }
  static getSettingsButton() {
    return cy.get('.menu-item:contains("Settings")');
  }
  static getLogoutButton() {
    return cy.get('.menu-item:contains("Logout Button")');
  }
  static getKickCreditButton() {
    return cy.get('.kick-credit-container');
  }
  static getSellerCreditButton() {
    return cy.get('.seller-credit-container');
  }
  static getSettingsButton() {
    return cy.get('.top-up-container');
  }
  static getLogoutButton() {
    return cy.get('.cash-out-container');
  }
}