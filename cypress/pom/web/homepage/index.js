export const WEB_HOMEPAGE_URL = '/';

export default class WebHomepage {
  static getLoginButton() {
    return cy.get('.ant-col').children('p:contains("Login")');
  }

  static getRegisterButton() {
    return cy.get('.ant-col').children('p:contains("Register")');
  }

  static getSneakersButton() {
    return cy.get('.ant-col').children('p:contains("Sneakers")');
  }

  static getApparelButton() {
    return cy.get('.ant-col').children('p:contains("Apparel")');
  }

  static getLuxuryButton() {
    return cy.get('.ant-col').children('p:contains("Luxury")');
  }

  static getElectronicAndCollectibleButton() {
    return cy.get('.ant-col').children('p:contains("Electronics & Collectibles")');
  }

  static getSearchButton() {
    return cy.get('[alt="default-image"]');
  }

  static getSeachField() {
    return cy.get('input[placeholder="Type any products here"]');
  }

  static getUserLogin() {
    return cy.get('[class="CountryFlag_country-flag__UTRXi"]').siblings('p');
  }

  static getProfileUserButton() {
    return cy.get('[class="ButtonProfile_profile-image__r48gN"]');
  }
}
