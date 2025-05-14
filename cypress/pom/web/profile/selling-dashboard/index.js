export default class SellingDashboard {
  static getSellAProductButton() {
    return cy.get('.sell-request');
  }
  static getCurrentTabButton() {
    return cy.get('p:contains("Current")').parents('.tabs');
  }
  static getInProgressTabButton() {
    return cy.get('p:contains("In Progress")').parents('.tabs');
  }
  static getHistoryTabButton() {
    return cy.get('p:contains("History")').parents('.tabs');
  }
  static getAddOrEditProductsButton() {
    return cy.get('.ant-select-selector');
  }
  static getAddBulkProductsButton() {
    return cy.get('.ant-select-item-option-content:contains("Add Product(s)")');
  }
  static getEditProductsButton() {
    return cy.get('.ant-select-item-option-content:contains("Edit Product(s)")');
  }
  static getSearchBar() {
    return cy.get('input[placeholder="Search your listings here"]');
  }
  static getTitleProduct(title) {
    return cy.get(`p[class="title"]:contains(${title})`);
  }
  static getPriceProduct(price) {
    return cy.get('[class="price-container"]').children(`p[class="red"]:contains(${price})`);
  }
}