require('dotenv').config();
const LUMEN_URL = Cypress.env('LUMEN_URL');

export default class UserFlow {
  static findIdUserDapur(accessToken, email) {
    return cy.request({
      url: `${LUMEN_URL}/admins/users`,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      qs: {
        'keyword': email
      }
    }).then(res => {
      return res.body.data
    });
  };

  static updateUserDetail(accessToken, userDetail) {
    const body = {
      username: userDetail.username,
      typed_email: userDetail.typed_email,
      first_name: userDetail.first_name,
      family_name: userDetail.family_name,
      seller_points: userDetail.seller_points,
      roles: [{ "id": 1 }, { "id": 2 }, { "id": 3 }, { "id": 5 }, { "id": 14 }, { "id": 16 }, { "id": 18 }, { "id": 21 }]
    }
    return cy.request({
      url: `${LUMEN_URL}/admins/users/${userDetail.id}`,
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      body
    })
      .then(res => {
        return res.body.status_code;
      })
  }
}