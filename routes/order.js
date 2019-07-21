const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../utils/db');
const { hostUrl } = require('../utils/config');

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
  console.log('order create');
  if(req.body) {
    try {
      const order = db.create('orders', req.body);

      const { data } = await axios.post(`${hostUrl}/wechat/payment`, {
        body: 'Product Title',
        attach: '{"Stringified":"Object"}',
        out_trade_no: 'kfc' + (+new Date),
        total_fee: 1,
        spbill_create_ip: req.ip,
        openid: req.body.open_id,
        trade_type: 'JSAPI'
      });

      return res.status(200).json(data);
      
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  return res.status(404);
});



module.exports = router;