const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// router.get('/:id', async(req, res, next) => {
//   const products = db['products'];
//   const { id } = req.params;
//   const filteredProducts = products.filter((product) => String(product.id) === String(id));

//   res.status(200).json(filteredProducts[0]);
// });

// router.get('/getMultiple/:ids', async(req, res, next) => {
//   const products = db['products'];
//   const { ids } = req.params;
//   const parsedIds = JSON.parse(ids);
//   const idsArray = parsedIds.split(",");
//   const idsMap = idsArray.reduce((accum, curr) => {
//     accum[curr] = curr;
//     return accum;
//   }, {});
//   const filteredProducts = products.filter((product) => idsMap[product.id]);

//   res.status(200).json(filteredProducts);
// })

router.get('/', async(req, res, next) => {
  const products = db.getAll('products');
  res.status(200).json(products);
});

router.get('/create', async(req, res, next) => {
  const products = db.create('products', {
      "id": 7,
      "name_en": "Testing Product",
      "name_zh": "猫抓板",
      "price": 30,
      "img_url": "https://g-search1.alicdn.com/img/bao/uploaded/i4/imgextra/i3/44514716/O1CN01LTRXpD1khyNiK4xZ6_!!0-saturn_solar.jpg_580x580Q90.jpg"
  });
  res.status(200).json(products);
});



module.exports = router;