require('dotenv').config();
const LUMEN_URL = Cypress.env('LUMEN_URL');
export default class UserLoginFlow {
  static userLogin(email, password) {
    const body = {
      email: email,
      password: password
    }
    return cy.request({
      url: `${LUMEN_URL}/auth`,
      method: 'POST',
      body
    })
      .then(res => {
        return res.body.data.token
      })
  };
}