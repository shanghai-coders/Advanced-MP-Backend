const express = require('express');
const router = express.Router();
const db = require('../db.json');

router.get('/all', async(req, res, next) => {
  const orders = db['orders'];

  res.status(200).json(orders);
});

router.get('/:id', async(req, res, next) => {
  const orders = db['orders'];
  const { id } = req.params;
  const filteredOrders = orders.filter((order) => String(order.id) === String(id));

  res.status(200).json(filteredOrders[0]);
});



module.exports = router;