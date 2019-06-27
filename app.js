require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const wechat = require('./routes/wechat');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/wechat', wechat);

app.use('/', (req, res) => {
    res.status(200).json('API Running');
})

module.exports = app;
