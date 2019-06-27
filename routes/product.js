const express = require('express');
const router = express.Router();
const db = require('../db.json');

router.get('/:id', async(req, res, next) => {
  const products = db['products'];
  const { id } = req.params;
  const filteredProducts = products.filter((product) => String(product.id) === String(id));

  res.status(200).json(filteredProducts[0]);
});

router.get('/getMultiple/:ids', async(req, res, next) => {
  const products = db['products'];
  const { ids } = req.params;
  const parsedIds = JSON.parse(ids);
  const idsArray = parsedIds.split(",");
  const idsMap = idsArray.reduce((accum, curr) => {
    accum[curr] = curr;
    return accum;
  }, {});
  const filteredProducts = products.filter((product) => idsMap[product.id]);

  res.status(200).json(filteredProducts);
})

router.get('/', async(req, res, next) => {
  const products = db['products'];
  res.status(200).json(products);
});



module.exports = router;