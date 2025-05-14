const AWS_URL = Cypress.env('AWS_URL');
const LUMEN_URL = Cypress.env('LUMEN_URL');
const CLOUDFRONT_URL = Cypress.env('CLOUDFRONT_URL');
import faker from 'faker';
import DateTime from '../helper/datetime';

export default class ProductFlow {
  static productDetail(accessToken, category) {
    let categoryId;
    category === 'sneakers' ? categoryId = 1 : category === 'apparels' ? categoryId = 2 : category === 'handbags' ? categoryId = 3 : categoryId = 4;
    return cy.request({
      url: `${LUMEN_URL}/products/${categoryId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        return res.body.data;
      });
  };

  static productVariant(accessToken, id) {
    return cy.request({
      url: `${LUMEN_URL}/admins/productvariants/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(res => {
        return res.body.data;
      });
  };

  static selectedBrand(accessToken, categoryId) {
    categoryId === 4 ? categoryId = 5 : '';
    return cy.request({
      url: `${LUMEN_URL}/admins/brands?`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        category_id: categoryId
      }
    })
      .then(res => {
        return res.body.data;
      });
  };

  static submitSizeProduct(accessToken, id, body) {
    return cy.request({
      url: `${LUMEN_URL}/admins/productvariants/sizes/${id}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        size_id: body
      }
    })
      .then(res => {
        return res.body.data.sizes
      });
  };

  static findProduct(category, accessToken) {
    let totalPage;
    return cy.request({
      url: `${AWS_URL}/search`,
      method: 'GET',
      qs: {
        category: category
      }
    })
      .then(res => {
        totalPage = res.body.data.last_page;
        return cy.request({
          url: `${AWS_URL}/search`,
          method: 'GET',
          qs: {
            category: category,
            sort_by: 'most_popular',
            _scope: 'selling',
            page: faker.datatype.number(totalPage)
          }
        })
          .then(res => {
            const body = res.body.data;
            const selectedItem = body.data[faker.datatype.number(body.data.length - 1)];
            const id = selectedItem.id;
            return this.productVariant(accessToken, id);
          })
          .then(res => {
            return res;
          });
      });
  };

  static browseSizeProduct(accessToken, category, item) {
    let categoryId;
    let sizes = [];

    return this.productDetail(accessToken, category)
      .then(res => {
        categoryId = res.id;
        return this.selectedBrand(accessToken, categoryId);
      })
      .then(res => {
        let sex;
        let number = 0;
        const brands = res;
        item.sex === 'P' ? sex = 'F' : item.sex !== 'P' || item.sex !== 'M' ? sex = 'M' : sex = item.sex;

        const findBrandSize = (accessToken, categoryId, brandId, sex) => {
          let url;
          let query = {
            no_limit: true,
            brand_id: brandId,
            sex: sex,
            category_id: categoryId
          }
          categoryId === 1 ? url = 'admins/sizes?' : url = 'admins/brand_sizes?'
          categoryId === 2 ? query.category_id = categoryId : delete query.category_id;

          return cy.request({
            url: `${LUMEN_URL}/${url}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            qs: query
          })
            .then(res => {
              return res.body.data;
            });
        };

        const findAvailableSize = (brands) => {
          findBrandSize(accessToken, brands[number].category_id, brands[number].id, sex)
            .then(res => {
              return res.length === 0 ? number === brands.length - 1 ? sizes.push([]) : (number++, findAvailableSize(brands)) : sizes = res;
            });
        };
        return findAvailableSize(brands);
      })
      .then(() => {
        let idAvailableSize = [];
        categoryId !== 1 ?
          sizes.sort((a, b) => a.size.id - b.size.id).forEach((el, i) => {
            i == 0 ? idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order }) : idAvailableSize[idAvailableSize.length - 1].id !== el.size.id ? idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order }) : idAvailableSize[idAvailableSize.length - 1].order > el.size_order ? (idAvailableSize.pop(), idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order })) : '';
          }) : sizes.forEach(e => idAvailableSize.push(e.id))
        return this.submitSizeProduct(accessToken, item.id, idAvailableSize);
      });
  };

  static searchIndexOfProductName(productName, category, id) {
    return cy.request({
      url: `${CLOUDFRONT_URL}/search?`,
      method: 'GET',
      qs: {
        keyword: productName,
        category: category,
        sort_by: 'most_popular',
        _scope: 'selling'
      }
    })
      .then(res => {
        let index = res.body.data.data.map(e => e.id).indexOf(id);
        return index;
      });
  };

  static listOfProductVariant(category, accessToken) {
    let categoryId;
    category === 'sneakers' ? categoryId = 1 : category === 'apparels' ? categoryId = 2 : category === 'handbags' ? categoryId = 3 : categoryId = 5;

    const functionProductVariant = (accessToken, categoryId, page = 1) => {
      const randomPage = faker.datatype.number({ min: 1, max: page });
      return cy.request({
        url: `${LUMEN_URL}/admins/productvariants`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        method: 'GET',
        qs: {
          category_id: categoryId,
          page: randomPage
        }
      })
    }

    return functionProductVariant(accessToken, categoryId).then(res => {
      const totalPage = res.body.data.last_page;
      return functionProductVariant(accessToken, categoryId, totalPage)
    })
      .then(res => {
        return res.body.data.data;
      })
  };

  static setProductVariantToBeActive(accessToken, selectedProduct) {
    const body = selectedProduct;
    body.active = true;
    const id = selectedProduct.id;
    return cy.request({
      url: `${LUMEN_URL}/admins/productvariants/${id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data.data;
      });
  };

  static addStock(params) {
    const {
      accessTokenAdmin,
      accessTokenQC,
      accessTokenLC,
      shippingMethod = 'Standard', // Standard, Express, Pre Order
      isBrandNew = true,
      isDefect = false,
      userDetailSeller,
      selectedProduct,
      sizeId,
      price = 1000000,
      quantity = 1,
      preOrder = false,
      preVerified = false,
      missingAccessories = false,
      displayItem = false,
      yellowing = false,
      noTags = false,
      sneakersDefect = false,
      manufactureDefect = false,
      missingOriginal = false,
      discoloration = false,
      scratches = false,
      transferredColor = false,
      signOfWear = false,
      noExtraLaces = false,
      noWrapPaper = false,
      box = false,
      dustBag = false,
      tag = false,
      mirror = false,
      starps = false,
      authenticationCard = false,
      stockStatus = 'KA_STOCK'
    } = params

    const body = {
      user_id: userDetailSeller.id,
      product_variant_id: selectedProduct.id,
      size_id: sizeId,
      asking_price: price,
      purchase_price: price,
      quantity: quantity,
      pre_order: preOrder,
      pre_verified: preVerified,
      rack: null,
      expiry: null,
      defects: {
        missing_accessories: missingAccessories,
        display_item: displayItem,
        yellowing: yellowing,
        sneakers_defect: sneakersDefect
      },
      missing_accessories_list: {
        no_extra_laces: noExtraLaces,
        no_wrap_paper: noWrapPaper,
        no_tags: noTags
      }
    };

    isBrandNew === true ? body.sneakers_condition = 'BARU' : body.sneakers_condition = 'BEKAS';
    isDefect === false ? body.box_condition = 'SEMPURNA' : body.box_condition = 'CACAT';

    const functionAddStock = (accessTokenAdmin, body) => {
      return cy.request({
        url: `${LUMEN_URL}/admins/sells`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessTokenAdmin}`
        },
        body
      })
        .then(res => {
          return res.body.data;
        });
    };

    let consignmentNumber;
    let userSell;
    let selectedConsignmentItem;

    return shippingMethod === 'Express' ? (
      body.defects.no_tags = noTags,
      body.defects.manufacture_defect = manufactureDefect,
      body.defects.missing_original = missingOriginal,
      body.defects.discoloration = discoloration,
      body.defects.scratches = scratches,
      body.defects.transferred_color = transferredColor,
      body.defects.sign_of_wear = signOfWear,
      body.inclusions = {
        box: box,
        dust_bag: dustBag,
        tag: tag,
        mirror: mirror,
        straps: starps,
        authentication_card: authenticationCard,
      },
      body.pre_verified = true,
      body.rack = '',
      body.note = '',
      body.expiry = '',
      body.consignment = true,
      body.request_type = 'CONSIGNMENT_REQUEST',
      body.stock_status = stockStatus,
      body.hypequarter_display = false,
      functionAddStock(accessTokenAdmin, body).then(res => {
        userSell = res;
        return this.changeStatusSellAndConsignmentRequest(accessTokenAdmin, userSell, 'consignment_approved');
      })
        .then(res => {
          consignmentNumber = res.consignment_id;
          return this.consignmentList(accessTokenAdmin);
        })
        .then(res => {
          selectedConsignmentItem = res.data.find(e => e.consignment_number === consignmentNumber);
          this.changeStatusConsignment(accessTokenAdmin, selectedConsignmentItem, 'Outstanding Consignment');
          this.changeStatusConsignment(accessTokenQC, selectedConsignmentItem, 'Quality Control');
          this.changeStatusConsignment(accessTokenLC, selectedConsignmentItem, 'Legit Check');
          return this.racklist(accessTokenAdmin)
        })
        .then(res => {
          const rackId = res[faker.datatype.number({ min: 0, max: res.length - 1 })].id;
          this.assignRack(accessTokenAdmin, selectedConsignmentItem, userSell, rackId)
        })
    )
      : shippingMethod === 'Standard' ? (
        body.status = 'approved',
        functionAddStock(accessTokenAdmin, body)
      ) : (
        body.status = 'approved',
        body.pre_order = true,
        delete body.defects.yellowing,
        body.missing_accessories_list = false,
        body.sneakers_defect = sneakersDefect,
        functionAddStock(accessTokenAdmin, body)
      )
  };

  static changeStatusSellAndConsignmentRequest(accessToken, userSell, status) {
    const body = {
      status: status
    };

    return cy.request({
      url: `${LUMEN_URL}/admins/sells/${userSell.id}/status`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  }

  static consignmentList(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/sell-consignments`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        type: 'outstanding',
        sort_by: 'updatedAt_desc'
      }
    })
      .then(res => {
        return res.body.data;
      });
  }


  static changeStatusConsignment(accessToken, selectedConsignmentItem, consignmentStatus) {
    const consignmentId = selectedConsignmentItem.id;
    let status;
    let body = {
      status: status
    };
    consignmentStatus === 'Outstanding Consignment' ? (
      body.status = 'KA_RECEIVED',
      body.notes = '',
      body.seller_courier_option = '',
      body.seller_courier = '',
      body.seller_awb_number = '',
      body.received_at = DateTime.getCurrentDateAndTime(),
      body.seller_sent = DateTime.getCurrentDateAndTime(),
      body.received_by = ''
    ) : (
      body.status = 'VERIFICATION_PASSED',
      body.ka_verified = true
    );
    return cy.request({
      url: `${LUMEN_URL}/admins/sell-consignments/${consignmentId}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  }

  static racklist(accessToken) {
    return cy.request({
      url: `${LUMEN_URL}/admins/sell_racks`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        availables: true,
        no_limit: true
      }
    })
      .then(res => {
        return res.body.data;
      });
  }

  static assignRack(accessToken, selectedConsignmentItem, userSell, rackId) {
    const consignmentId = selectedConsignmentItem.id;
    let body = {
      sell_id: userSell.id,
      rack_id: rackId
    }
    return cy.request({
      url: `${LUMEN_URL}/admins/sell-consignments/${consignmentId}/racks`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data;
      });
  }

  static searchSale(accessToken, invoiceNumber) {
    return cy.request({
      url: `${LUMEN_URL}/admins/sales`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      qs: {
        keyword: invoiceNumber
      }
    })
      .then(res => {
        let data;
        data = res.body.data.data.find(e => e.invoice_number === invoiceNumber);
        return data;
      });
  }

  static changeStatusSale(params) {
    const {
      accessToken,
      sale,
      email,
      verificationType
    } = params;
    let body;
    let courier;

    verificationType === 'KA_RECEIVED' ? body = {
      notes: "",
      seller_courier: null,
      seller_courier_option: "",
      seller_courier_price: 0,
      seller_price: sale.seller_price,
      seller_sent: DateTime.getCurrentDateAndTime(),
      seller_awb_number: null,
      received_at: DateTime.getCurrentDateAndTime(),
      received_by: email,
      status: "KA_RECEIVED"
    } : verificationType === 'VERIFICATION_PASSED' ? body = {
      ka_verified: true,
      status: "VERIFICATION_PASSED"
    } : (
      courier = faker.random.arrayElement([
        'JNT',
        'POS',
        'GOSEND',
        'WAREHOUSE',
        'PAXEL',
        'JNE'
      ]), body = {
        notes: "",
        ka_courier: courier,
        ka_courier_option: "",
        status: "PENDING_DELIVERING"
      });

    return cy.request({
      url: `${LUMEN_URL}/admins/sales/${sale.id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data
      });
  }

  static adminInputAWB(accessToken, sale) {
    const body = {
      "notes": "",
      "ka_courier": sale.sale_shipping.ka_courier,
      "ka_courier_option": "",
      "ka_courier_price": faker.datatype.number(),
      "awb_number": faker.random.alpha(10),
      "ka_sent": DateTime.getCurrentDateAndTime()
    }

    return cy.request({
      url: `${LUMEN_URL}/admins/sales/${sale.id}/awb_number`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data
      });
  }

  static acceptBid(accessToken, userSellId, bidId) {
    const body = {
      bid_id: bidId
    };
    return cy.request({
      url: `${LUMEN_URL}/users/sells/${userSellId}/bids`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body
    })
      .then(res => {
        return res.body.data
      });
  }

  static sellingCurrentList(accessToken, keyword) {
    return new Cypress.Promise((resolve, reject) => {
      return cy.request({
        url: `${LUMEN_URL}/users/selling/sells`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        qs: {
          keyword: keyword
        }
      })
        .then(res => {
          resolve(res.body.data.data)
        })
    });
  };
};
