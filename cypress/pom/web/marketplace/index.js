export default class Marketplace {
  static getFilterConditionSneaker(displayCategory) {
    return cy.get('.condition-sneaker').find(`button:contains("${displayCategory}")`);
  }

  static getNameOfItem(name) {
    return cy.get(`h2.price-tag:contains("${name.trim()}")`);
  }

  static brandNewButton() {
    return cy.get('p:contains("Brand New")');
  }

  static usedButton() {
    return cy.get('p:contains("Used")');
  }

  static preOrderButton() {
    return cy.get('p:contains("Pre-Order")');
  }

  static selectSize(size) {
    return cy.get('.size-div-tabel').find(`span:contains('${size}')`);
  }

  static makeOfferButton() {
    return cy.get('.make-offer-btn-wrapper');
  }

  static inputOffer() {
    return cy.get('input[placeholder="Enter Your Offer"]');
  }

  static continueButton() {
    return cy.get('p:contains("Continue")').parent();
  }

  static voucherName(name) {
    return cy.get('.right-bag-voucher-text col').children(`p:contains('${name}')`);
  }

  static choosePaymentButton() {
    return cy.get('p:contains("Choose Payment")');
  }

  static creditCardPaymentButton(bankCC) {
    return cy.get('p:contains("Credit Card")').parent().siblings().find(`p:contains('${bankCC.toUpperCase()} Credit Card')`);
  }

  static virtualAccountPaymentButton(bankVA) {
    return cy.get('p:contains("Virtual Account")').parent().siblings().find(`p:contains("${bankVA.toUpperCase()}")`);
  }

  static kickCreditPaymentButton() {
    return cy.get('p:contains("Kick Credit")').parent().first().siblings();
  }

  static useCreditButton() {
    return cy.get('p:contains("Use Credit")').parent().siblings('.payment-toggle-switch ');
  }

  static useKickPointButton() {
    return cy.get('p:contains("Use Kick Point")').parent().siblings('.payment-toggle-switch ');
  }

  static proceedToPaymentButton() {
    return cy.get('p:contains("Proceed to Payment")');
  }

  static goToBuyingDashboardButton() {
    return cy.get('.button').children('p:contains("Go to Buying Dashboard")');
  }

  static viewOfferHistoryButton() {
    return cy.get('p:contains("View Offer History")').parent();
  }

  static viewVoucherButton() {
    return cy.get('p:contains("View")').parent('button');
  }

  static findVoucherField() {
    return cy.get('input[placeholder="Enter voucher code here"]');
  }

  static checkVoucherAvailabilityButton() {
    return cy.get('p:contains("Check")').parent('.arrow-wrapper');
  }

  static useVoucherButton() {
    return cy.get('.footer-button:contains("Use voucher")');
  }

  static backButton() {
    return cy.get('p:contains("Choose Payment")').parent('.text').siblings().find('img');
  }

  static chooseProductAddOnButton(productAddOn) {
    return cy.get(`p:contains("${productAddOn}")`).parent().siblings().find('img');
  }

  static getOrderIdText() {
    return cy.get('.result-text-wrapper').find('u');
  }

  static totalPrice() {
    return cy.get('p:contains("Total")').siblings();
  }

  static productCondition(condition) {
    return condition === 'Brand New' ? this.brandNewButton()
      : condition === 'Used' ? this.usedButton()
        : this.preOrderButton()
  }
}