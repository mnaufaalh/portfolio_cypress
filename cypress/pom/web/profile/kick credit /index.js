export default class KickCredit {
  static getTopUpButton() {
    return cy.get('[type="button"]:contains("Top Up")');
  }
  static getCashOutButton() {
    return cy.get('[type="button"]:contains("Cash Out")');
  }
  static getPendingCashOutButton() {
    return cy.get('.tabs:contains("Pending Cash Out")');
  }
  static getWalletLogsButton() {
    return cy.get('.tabs:contains("Wallet Logs")');
  }
  static getAmountOptionButton(amount) {
    return cy.get(`button:contains(IDR ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")})`);
  }
  static getNextButton() {
    return cy.get('button.topup-content');
  }
  static getAmountBePaidText() {
    return cy.get('.amount-info').children('span:eq(1)');
  }
  static getPaymentMethodButton(paymentMethod) {
    return cy.get('.payment-label').children(`span:contains("${paymentMethod} Virtual Account")`);
  }
  static getConfirmButton() {
    return cy.get('[type="button"]:contains("Confirm")');
  }
}