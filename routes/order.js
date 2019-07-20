const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/', async(req, res, next) => {

  const orders = db.getAll('orders');
  res.status(200).json(orders);

});

router.get('/:id', async(req, res, next) => {
  const { id } = req.params;
  const order = db.getById('orders', id);

  res.status(200).json(order);
});



module.exports = router;