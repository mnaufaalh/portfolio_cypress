describe('Catalog Enhancement', function () {
  let accessToken;
  let idBrand;
  let idSubCategory;
  let idSize;

  before(() => {
    const bodyLogin = {
      "email": "testing.kickavenue@gmail.com",
      "password": "buatest1"
    }
    return cy.request({
      url: 'http://revampstaging.kickavenue.com/api/v1/auth/login',
      method: 'POST',
      body: bodyLogin
    })
      .then(res => {
        accessToken = res.body.Data.access_token;
        console.log(res.body.Data)
        const bodyBrand = {
          "background_image": "<string>",
          "logo_image": "<string>",
          "name": "Brand Kick Avenue",
          "description": "<string>",
          "is_active": true,
          "is_partner": false
        }
        return cy.request({
          url: 'http://revampstaging.kickavenue.com/api/v1/catalog/brand/create',
          method: 'POST',
          body: bodyBrand,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      })
      .then(res => {
        idBrand = res.body.Data.id;
        console.log(res.body.Data)
        const bodySubCategory = {
          "name": "sub category Kick Avenue",
          "parent_id": 3,
          "sequence": 1,
          "complementary_id": [],
          "is_active": true
        }
        return cy.request({
          url: 'http://revampstaging.kickavenue.com/api/v1/catalog/sub-category/create',
          method: 'POST',
          body: bodySubCategory,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      })
      .then(res => {
        idSubCategory = res.body.Data.id;
        console.log(res.body.Data)
        let bodySizeChart = [];
        for (let i = 0; i < 100; i++) {
          bodySizeChart.push(
            {
              "us": `'${4.5 + i / 2}'`,
              "cm": `'${21 + i / 2}'`,
              "uk": `'${3 + i / 2}'`,
              "eu": `'${35.5 + i / 2}'`
            }
          )
        };
        const body = {
          "brand_id": idBrand,
          "category_id": idSubCategory,
          "size": bodySizeChart,
          "gender": "Men",
          "name": "Size Kick Avenue"
        }
        return cy.request({
          url: 'http://revampstaging.kickavenue.com/api/v1/catalog/size-chart/create',
          method: 'POST',
          body,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
        })
      })
      .then(res => {
        idSize = res.body.Data.id;
        console.log(res.body.Data)
        const bodyItem = {
          "brand_id": [idBrand],
          "category_id": 3,
          "sub_category_id": idSubCategory,
          "size_chart_id": idSize,
          "name": "Item Kick Avenue",
          "sku_code": "KickAvenue123",
          "colorway": "WHITE/BLACK",
          "gender": "MEN",
          "weight": 2,
          "is_active": true,
          "is_add_on": true,
          "is_non_purchaseable": true,
          "images": [
            "string", "string2", "string3"
          ]
        }
        return cy.request({
          url: 'http://revampstaging.kickavenue.com/api/v1/catalog/item/create',
          method: 'POST',
          body: bodyItem,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
        })
      })
      .then(res => {
        console.log(res.body.Data)
      })
  });


  it('Should be to buy standard product', function () {

    // return cy.request({
    //   url: 'http://revampstaging.kickavenue.com/api/v1/auth/login',
    //   method: 'POST',
    //   body: bodyLogin
    // }).then(res => {
    //   accessToken = res.body.Data.access_token;
    // });
  });
});
