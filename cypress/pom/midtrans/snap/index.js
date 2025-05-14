export default class midtransSnap {
  static bankLogoOnVirtualAccountButton(bankVA) {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find(`span:contains("${bankVA}")`);
  }
  static cvvField() {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find('#card-cvv');
  }
  static payNowButton() {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find('[type="button"]:contains("Pay now")');
  }
  static passwordField() {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find('iframe').its('0.contentDocument.body').find('[type="password"]');
  }
  static submitButton() {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find('iframe').its('0.contentDocument.body').find('[type="submit"]');
  }
  static OKButton() {
    return cy.get('iframe#snap-midtrans').its('0.contentDocument.body').find('[type="button"]:contains("OK")');
  }
}