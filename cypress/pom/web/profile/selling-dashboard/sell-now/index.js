export const SELL_NOW_URL = 'sell-request';

export default class SellNow {
  static getCategoryButton(product) {
    let displayName;
    product === 'apparels' ?
      displayName = 'Apparel' : product === 'sneakers' ?
        displayName = 'Sneakers' : product === 'handbags' ?
          displayName = 'Luxury' : displayName = 'Electronics & Collectibles'
    return cy.get(`p:contains(${displayName})`).parents('.category-container ');
  }
  static getUploadPhoto(index) {
    return cy.get(`[data-index=${index}]`).find('input');
  }
  static getProductName() {
    return cy.get('[placeholder="Input Name or SKU of the Product"]');
  }
  static getSearchProductItem(name, index) {
    return cy.get(`p:contains("${name}"):eq(${index})`).parents('.search-product-item');
  }
  static getSizeProduct() {
    return cy.get('.input-section > p:contains("Size (US)")').siblings('.text-box');
  }
  static getSearchSize(size) {
    return cy.get('.input-section > p:contains("Size (US)")').siblings('.search-product-result-container').find(`p:contains('${size}'):eq(0)`).parents(`.search-size-item`);
  }
  static getProductCondition() {
    return cy.get('.input-section > p:contains("Product Condition")').siblings('.text-box');
  }
  static getSearchProductCondition(condition) {
    return cy.get('.input-section > p:contains("Product Condition")').siblings('.search-product-result-container').find(`p:contains(${condition}):eq(0)`).parents(`.search-size-item`);
  }
  static getBoxCondition() {
    return cy.get('.input-section > p:contains("Packaging / Box Condition")').siblings('.text-box');
  }
  static getSearchBoxCondition(condition) {
    return cy.get('.input-section > p:contains("Packaging / Box Condition")').siblings('.search-product-result-container').find(`p:contains(${condition}):eq(0)`).parents(`.search-size-item`);
  }
  static getNoteField() {
    return cy.get('p:contains("Note")').siblings('textarea');
  }
  static getSellingPriceField() {
    return cy.get('.price-box').children('input');
  }
  static getSubmitButton() {
    return cy.get('.submit-button');
  }
}