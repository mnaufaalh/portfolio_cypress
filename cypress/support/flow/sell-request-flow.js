const LUMEN_URL = Cypress.env('LUMEN_URL');

export default class SellRequestFlow {
  static updateStatusRequest(accessToken, id, status) {
    return cy.request({
      url: `${LUMEN_URL}/admins/sells/${id}/status`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        status: status
      }
    })
      .then(res => {
        return res.body.data;
      });
  }
}