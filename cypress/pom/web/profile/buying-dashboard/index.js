export default class BuyingDashboard {
  static getTable() {
    return cy.get('.item-table');
  }
  static getOfferTabButton() {
    return cy.get('p:contains("Offer")').parents('.tabs');
  }
  static getPendingTabButton() {
    return cy.get('p:contains("Pending")').parents('.tabs');
  }
  static getInProgressTabButton() {
    return cy.get('p:contains("In Progress")').parents('.tabs');
  }
  static getHistoryTabButton() {
    return cy.get('p:contains("History")').parents('.tabs');
  }
  static getSearchBarOffer() {
    return cy.get('input[placeholder="Search your buying offer here"]')
  }
  static getSearchBarPending() {
    return cy.get('input[placeholder="Search your buying pending here"]')
  }
  static getSearchBarInProgress() {
    return cy.get('input[placeholder="Search your buying in progress here"]')
  }
  static getSearchBarHistory() {
    return cy.get('input[placeholder="Search your buying history here"]');
  }
  static completePaymentButton() {
    return cy.get('.button:contains("Complete Payment")');
  }
  static loadingIcon() {
    return cy.get('svg[xmlns="http://www.w3.org/2000/svg"]');
  }
  static statusOrder() {
    return cy.get('.status-text');
  }
  static trackYourPackageButton() {
    return cy.get('.button:contains("Track your package")');
  }
  static IHaveReceivedMyPackageButton() {
    return cy.get('button:contains("I have received my package")');
  }
}