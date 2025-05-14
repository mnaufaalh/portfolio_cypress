const LUMEN_URL = Cypress.env('LUMEN_URL');
export default class PaymentFlow {
  static paymentList(accessToken, invoiceNumber) {
    return cy.request({
      url: `${LUMEN_URL}/admins/offers`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        sort_by: 'updatedAt_desc',
        per_page: '50'
      }
    })
      .then(res => {
        const data = res.body.data.data.find(e => e.invoice_number === invoiceNumber);
        return data;
      })
  };

  static completePayment(accessToken, invoiceNumber) {
    const body = {
      status: "COMPLETED",
      remarks: null
    };
    return this.paymentList(accessToken, invoiceNumber)
      .then(res => {
        const paymentId = res.id;
        return cy.request({
          url: `${LUMEN_URL}/admins/offers/${paymentId}`,
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body
        })
          .then(res => {
            return res.body.data
          })
      })
  };
}