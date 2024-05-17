export const SELLER_CREDIT_URL = '/seller-history';

export default class SellerCredit {
  static getCashOutButton() {
    return cy.get('button:contains("Cash Out")');
  }
  static getNominalCashOutForm() {
    return cy.get('input[name="_value"]')[1];
  }
  static getNextButton() {
    return cy.get('.cashout-button');
  }
  static getConfirmButton() {
    return cy.get('button:contains("Confirm)');
  }
  static getPasswordForm() {
    return cy.get('input[type="password"]');
  }
  static getSubmitButton() {
    return cy.get('button.password-content');
  }
  static getDoneButton() {
    return cy.get('button:contains("Done")');
  }
  static getfirstOfDisbursementNumberPendingCashOut() {
    return cy.get('.body-data-wallet-logs');
  }
  static getfirstOfDatePendingCashOut() {
    return cy.get('.expiry-container-wallet-logs').children('span');
  }
  static getfirstOfStatusPendingCashOut() {
    return cy.get('.price-container').children('p');
  }
  static geWalletLogsButton() {
    return cy.get('.tabs:contains("Wallet Logs")');
  }
  static getfirstOfDisbursementNumberWalletLogs() {
    return cy.get('.item-table').find('.body-data-wallet-logs')[0];
  }
  static getfirstOfDateWalletLogs() {
    return cy.gett('.item-table').find('.expiry-container-wallet-logs').children('span')[0];
  }
  static getfirstOfStatusWalletLogs() {
    return cy.get('.item-table').find('.price-container').children('p')[0];
  }
}