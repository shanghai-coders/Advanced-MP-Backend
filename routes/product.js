const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/:id', async(req, res, next) => {
  const { id } = req.params;
  const product = db.getById('products', id);

  res.status(200).json(product);
});

router.get('/', async(req, res, next) => {
  const products = db.getAll('products');
  res.status(200).json(products);
});

// router.get('/update/:id', async(req, res, next) => {
//    const { id } = req.params;
//   const products = db.update('products', id, {
//       "id": 1,
//       "name_en": "Rubbing Post"
//   });
//   res.status(200).json(products);
// });

// router.get('/create', async(req, res, next) => {
  // const products = db.create('products', {
  //     "id": 7,
  //     "name_en": "Testing Product",
  //     "name_zh": "猫抓板",
  //     "price": 30,
  //     "img_url": "https://g-search1.alicdn.com/img/bao/uploaded/i4/imgextra/i3/44514716/O1CN01LTRXpD1khyNiK4xZ6_!!0-saturn_solar.jpg_580x580Q90.jpg"
  // });
  // res.status(200).json(products);
// });

router.get('/getMultiple/:ids', async(req, res, next) => {
  try {
    const products = db.getAll('products');
    const { ids } = req.params;
    const parsedIds = JSON.parse(ids);
    const idsMap = parsedIds.reduce((accum, curr) => {
      accum[curr] = curr;
      return accum;
    }, {});
    const filteredProducts = products.filter((product) => idsMap[product.id]);

    res.status(200).json(filteredProducts);
    
  } catch (error) {
    res.status(500);
  }
})


module.exports = router;