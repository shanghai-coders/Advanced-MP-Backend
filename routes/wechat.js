const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment");
const { hostUrl } = require("../utils/config");

// WeChat Stuff
const { Wechat, MiniProgram } = require("wechat-jssdk");
const WXDecrypt = require("../utils/decrypt");

// Initialization for WeChat JSSDK
const wechatConfig = {
  appId: process.env.MP_APPID,
  appSecret: process.env.MP_APPSECRET,
  miniProgram: {
    appId: process.env.MP_APPID,
    appSecret: process.env.MP_APPSECRET
  }
};
const wx = new Wechat(wechatConfig);

// WeChat Payment
const Payment = require("wechat-pay").Payment;
const PaymentMiddleware = require("wechat-pay").middleware;

// Initialization for WeChat Payment
const paymentConfig = {
  partnerKey: process.env.MERCHANT_SECRET,
  appId: process.env.MP_APPID,
  mchId: process.env.MERCHANT_ID,
  notifyUrl: `${hostUrl}/wechat/payment-callback`
};

const payment = new Payment(paymentConfig);

router.post("/login", async (req, res) => {
  const { iv, encryptedData } = req.body;
  const { code } = req.query;
  if (code && iv && encryptedData) {
    try {
      // Get the session key with code
      const data = await wx.miniProgram.getSession(req.query.code);
      const { session_key } = data;

      // Use the session key and iv to decrypt data
      const pc = new WXDecrypt(process.env.MP_APPID, session_key);

      const decryptedData = pc.decryptData(encryptedData, iv);

      // It's up to you if you want to send back the data or store it in the database
      res.json(decryptedData);
      return;
    } catch (error) {
      console.log(error);
      res.status(500);
      return;
    }
  }
  res.json("No Code Found");
});

// WeChat Pyament
router.post("/payment", async (req, res) => {
  try {
    const order = req.body;

    payment.getBrandWCPayRequestParams(order, (err, payargs) => {
      console.log(payargs);
      res.json(payargs);
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.use(
  "/payment-callback",
  PaymentMiddleware(paymentConfig)
    .getNotify()
    .done((message, req, res, next) => {
      let attach = {};
      const payment_detail = message;
      try {
        attach = JSON.parse(message.attach);
        const { id } = attach;
        // Update order status
        axios
          .post(`${hostUrl}/order/update/${id}`, {
            status: "paid",
            payment_detail
          })
          .then(data => {
            res.reply("success");
          });
      } catch (e) {
        res.reply(new Error("..."));
      }
    })
);

// Template Message
router.post("/save-formId", async (req, res) => {
  // save form ID here, to send a message to a user who didn't trigger the form.
});

router.post("/send-message", async (req, res) => {
  const { form_id, open_id, order_id } = req.body;

  if (form_id && open_id && order_id) {
    try {
      const { data } = await axios.get(`${hostUrl}/order/${order_id}`);

      if (data) {
        // Prepare form data
        const formData = {
          form_id: form_id,
          touser: open_id,
          // Get template id either hardcoded or making a request to https://api.weixin.qq.com/cgi-bin/wxopen/template/list?access_token=ACCESS_TOKEN
          template_id: "Ekab2Y-FtsZQO01m9fMvW6mMTsFbh4MbqfPFbtanF44",
          data: {
            keyword1: {
              value: data.products[0].name_en
            },
            keyword2: {
              value: data.totalPrice
            },
            keyword3: {
              value: moment().format("YYYY-MM-DD hh:mm")
            },
            keyword4: {
              value: data.id
            }
          }
        };

        // Get access token
        const { access_token } = await wx.jssdk.getAccessToken();

        const response = await axios.post(
          `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`,
          formData
        );

        res.status(200).json(response.data);
        return;
      }

      res.status(401).json("Order not found");
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }
});

module.exports = router;
