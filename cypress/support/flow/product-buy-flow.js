const CLOUDFRONT_URL = Cypress.env('CLOUDFRONT_URL');
const LUMEN_URL = Cypress.env('LUMEN_URL');
export default class ProductBuyFlow {
  static searchProductInMarketplace(category) {
    return cy.request({
      url: `${CLOUDFRONT_URL}/search`,
      method: 'GET',
      qs: {
        category: category,
        page: 1,
        available: true,
        per_page: 52,
        sort_by: 'featured_item_score_desc'
      }
    })
      .then(res => {
        return res.body.data;
      })
  }

  static sellerConfirmation(accessToken, id) {
    return cy.request({
      url: `${LUMEN_URL}/users/sales/approvals/${id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        return res.body.data;
      })
  }
}