const AWS_URL = Cypress.env('AWS_URL');
const LUMEN_URL = Cypress.env('LUMEN_URL');
import faker from 'faker';

export default class GeneralFlow {
  static priceMultipliers(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/settings/69`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        return JSON.parse(res.body.data.value).priceMultipliers.IDR;
      })
  }
  static topUpSetting(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/settings/86`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        return JSON.parse(res.body.data.value);
      })
  }
}