export const WEB_HOMEPAGE_URL = '/';

export default class WebHomepage {
  static getLoginButton() {
    return cy.get('.ant-col').children('p:contains("Login")');
  }

  static getRegisterButton() {
    return cy.get('.ant-col').children('p:contains("Register")');
  }

  static getSneakersButton() {
    return cy.get('.HeaderRow_header-row__2M33E').children('.ant-col').find('p:contains("Sneakers")');
  }

  static getApparelButton() {
    return cy.get('.HeaderRow_header-row__2M33E').children('.ant-col').find('p:contains("Apparel")');
  }

  static getLuxuryButton() {
    return cy.get('.HeaderRow_header-row__2M33E').children('.ant-col').find('p:contains("Luxury")');
  }

  static getElectronicAndCollectibleButton() {
    return cy.get('.HeaderRow_header-row__2M33E').children('.ant-col').find('p:contains("Electronics & Collectibles")');
  }

  static getSearchButton() {
    return cy.get('.ant-input-prefix');
    // return cy.get('p:contains("Type any products here")');
  }

  static getSeachField() {
    return cy.get('.ant-col').children('input[placeholder="Type any products here"]');
  }

  static getUserLogin() {
    return cy.get('.ButtonProfile_profile-image__r48gN').siblings('p');
  }

  static getProfileUserButton() {
    return cy.get('.ButtonProfile_profile-image__r48gN');
  }

  static getClosePopUpBanner() {
    return cy.get('.dont-show-again');
  }
}
