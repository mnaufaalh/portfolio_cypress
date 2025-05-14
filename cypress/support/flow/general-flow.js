const LUMEN_URL = Cypress.env('LUMEN_URL');
import faker from 'faker';
import DateTime from '../helper/datetime';

export default class GeneralFlow {
  static categoriesList(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/categories`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        no_limit: true
      }
    })
      .then(res => {
        return res.body.data;
      });
  };

  static editableCategoriesInVoucher(accessToken, idVoucher, categoriesId) {
    const body = { categories: categoriesId }
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${idVoucher}/categories`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  };

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
      });
  };

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
      });
  };

  static popUpBanner() {
    return cy.request({
      url: `${LUMEN_URL}/popup_banners`,
      method: 'GET',
      qs: {
        keyword: 'home'
      }
    })
      .then(res => {
        return res.body.data;
      });
  };

  static voucherList(accessToken, typeOfVoucher) {
    let lastPage;
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        voucher_type: typeOfVoucher //public, private, public_open
      }
    })
      .then(res => {
        lastPage = res.body.data.last_page;
        return cy.request({
          url: `${LUMEN_URL}/admins/vouchers`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          qs: {
            voucher_type: typeOfVoucher,
            page: faker.datatype.number({ min: 1, max: lastPage })
          }
        })
      })
      .then(res => {
        return res.body.data.data
      });
  };

  static voucherDetail(accessToken, id) {
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    })
      .then(res => {
        return res.body.data
      });
  };

  static userUsageVoucher(accessToken, id, userDetailBuyer) {
    const userId = userDetailBuyer.id;
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${id}/users`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        const data = res.body.data.data.find(e => e.user_id === userId);
        return data;
      });
  };

  static editBeUsableVoucher(accessToken, id, bodyVoucher) {
    let body = bodyVoucher;
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data
      });
  };

  static totalVoucherUsage(accessToken, id) {
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${id}/usages`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    })
      .then(res => {
        return res.body.data
      });
  };

  static paymentList(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/settings`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        name: 'payment_methods'
      }
    })
      .then(res => {
        const data = JSON.parse(res.body.data.data[0].value);
        let paymentList = [];
        data.forEach(e => {
          paymentList.push({ payment_method: e.value })
        })
        return paymentList
      });
  };

  static editPaymentMethodInVoucher(accessToken, id) {
    return this.paymentList(accessToken)
      .then(res => {
        const body = { vouchers: res };
        return cy.request({
          url: `${LUMEN_URL}/admins/vouchers/payment_methods/${id}`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body
        })
          .then(res => {
            return res.body.data;
          })
      })
  };

  static editVariantVoucher(accessToken, id) {
    const body = {
      product_variants: [
        "*"
      ]
    };
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/${id}/voucher_variants`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  };

  static addUserInVoucher(accessToken, id, userDetailBuyer) {
    const userId = userDetailBuyer.id
    const body = {
      used: false,
      used_count: 0,
      used_at: null,
      voucher_id: id,
      user_id: [userId],
      quantity: 1,
      started_at: null,
      ended_at: null
    }
    return cy.request({
      url: `${LUMEN_URL}/admins/vouchers/uservouchers`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  };

  static createDisbursement(params) {
    const { accessToken, userDetailBuyer, balance_source, payoutType, disbursementType, amount = 1000000000 } = params;
    const userId = userDetailBuyer.id
    const body = {
      disburse_to: userId,
      balance_source: balance_source,
      payout_type: payoutType,
      disbursement_type: disbursementType,
      total_amount: amount,
      validate_bank_account: true,
      fee: 0,
      note: "",
      status: "COMPLETED"
    };
    return cy.request({
      url: `${LUMEN_URL}/admins/disbursements`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  };

  static settingProcessingFee(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/settings/85`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        const data = JSON.parse(res.body.data.value);
        return data.percentage;
      });
  };
}