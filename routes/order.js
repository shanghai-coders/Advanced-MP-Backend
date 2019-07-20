const express = require('express');
const router = express.Router();
const axios = require('axios');
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

router.post('/create', async (req, res) => {
  if(req.body) {
    const order = db.create('orders', req.body);

    console.log(order);

    const { data } = await axios.post(`${hostUrl}/wechat/payment`, {
      body: 'Product Title',
      attach: '{"Stringified":"Object"}',
      out_trade_no: 'kfc' + (+new Date),
      total_fee: 1,
      spbill_create_ip: req.ip,
      openid: req.user.openid,
      trade_type: 'JSAPI'
    });

    return res.status(200).json(data);
  }
  return res.status(404);
});



module.exports = router;