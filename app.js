require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const wechat = require('./routes/wechat');
const product = require('./routes/product');
const order = require('./routes/order');

const db = require('./utils/db');

db.getAll();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/wechat', wechat);
app.use('/product', product);
app.use('/order', order);

app.use('/', (req, res) => {
    res.status(200).json('API Running');
})

module.exports = app;
