export default class midtransSimulator {
  static getVirtualAccountNumberField() {
    return cy.get('[name="va_number"]');
  }
  static getInquireButton() {
    return cy.get('[value="Inquire"]');
  }
  static getPayButton() {
    return cy.get('[value="Pay"]');
  }
}