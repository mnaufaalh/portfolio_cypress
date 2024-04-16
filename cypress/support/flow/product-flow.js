const AWS_URL = Cypress.env('AWS_URL');
const LUMEN_URL = Cypress.env('LUMEN_URL');
import faker from 'faker';

export default class ProductFlow {
  static productDetail(accessToken, typeProduct) {
    let productId;
    typeProduct === 'sneakers' ? productId = 1 : typeProduct === 'apparels' ? productId = 2 : typeProduct === 'handbags' ? productId = 3 : productId = 4;
    return cy.request({
      url: `${LUMEN_URL}/products/${productId}`,
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

  static findProduct(product, accessToken) {
    let totalPage;
    return cy.request({
      url: `${AWS_URL}/search`,
      method: 'GET',
      qs: {
        category: product
      }
    })
      .then(res => {
        totalPage = res.body.data.last_page;
        return cy.request({
          url: `${AWS_URL}/search`,
          method: 'GET',
          qs: {
            category: product,
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

  static browseSizeProduct(accessToken, product, item) {
    let categoryId;
    let sizes = [];

    return this.productDetail(accessToken, product)
      .then(res => {
        categoryId = res.id;
        return this.selectedBrand(accessToken, categoryId, item, product);
      })
      .then(res => {
        let sex;
        let number = 0;
        const brands = res;
        item.sex === 'P' ? sex = 'F' : item.sex !== 'P' || item.sex !== 'M' ? sex === 'M' : sex = item.sex;

        const findBrandSize = (accessToken, product, categoryId, brandId, sex) => {
          let query = {
            no_limit: true,
            brand_id: brandId,
            sex: sex,
            category_id: categoryId
          }
          product === 'apparels' ? query.category_id = categoryId : '';

          return cy.request({
            url: `${LUMEN_URL}/admins/brand_sizes?`,
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
          findBrandSize(accessToken, product, brands[number].category_id, brands[number].id, sex)
            .then(res => {
              return res.length === 0 ? number === brands.length - 1 ? sizes.push([]) : (number++, findAvailableSize(brands)) : sizes = res;
            });
        };
        return findAvailableSize(brands);
      })
      .then(() => {
        let idAvailableSize = [];
        sizes.sort((a, b) => a.size.id - b.size.id).forEach((el, i) => {
          i == 0 ? idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order }) : idAvailableSize[idAvailableSize.length - 1].id !== el.size.id ? idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order }) : idAvailableSize[idAvailableSize.length - 1].order > el.size_order ? (idAvailableSize.pop(), idAvailableSize.push({ id: el.size.id, size_type: el.alias, size_order: el.order })) : '';
        });
        return this.submitSizeProduct(accessToken, item.id, idAvailableSize);
      });
  };

  static searchIndexOfProductName(productName, categoryName, id) {
    return cy.request({
      url: 'https://dayd0kvuky3n.cloudfront.net/search?',
      qs: {
        keyword: productName,
        category: categoryName,
        sort_by: 'most_popular',
        _scope: 'selling'
      }
    })
      .then(res => {
        let index = res.body.data.data.map(e => e.id).indexOf(id);
        return index;
      });
  };
};