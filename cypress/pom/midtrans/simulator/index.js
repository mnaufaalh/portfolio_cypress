export default class midtransSimulator {
  static virtualAccountButtonOnSideBar() {
    return cy.get('span:contains("Virtual Account")').parents('.sidebar-list');
  }
  static bankButtonOnSideBar(bankVA) {
    return cy.get(`span:contains("${bankVA}")`).parents('[class="sidebar-link sub-link"]');
  }
  static billerCodeField() {
    return cy.get('input[name="billerCode"]');
  }
  static billKeyField() {
    return cy.get('input[name="billKey"]');
  }
  static virtualAccountField(bankVA) {
    return bankVA === 'BCA' || bankVA === 'BNI' ? cy.get('input[name="va_number"]') : cy.get('input[name="vaNumber"]');
  }
  static inquireButton() {
    return cy.get('[type="submit"][value="Inquire"]');
  }
  static payButton() {
    return cy.get('[type="submit"][value="Pay"]');
  }
}