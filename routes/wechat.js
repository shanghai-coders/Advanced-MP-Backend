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
  console.log(req.body);
  const { open_id } = req.body;
  console.log("send message", open_id);

  const { access_token } = await wx.jssdk.getAccessToken();

  try {
    if (open_id) {
      const message = {
        touser: open_id,
        template_id: "vnqBrzHJpwvB5P0WZ6iLaih_PtJT9qYha6qB64u42eU",
        page: "/pages/index/index",
        data: {
          thing1: {
            value: "Class Name"
          },
          time4: {
            value: "2015年01月05日"
          },
          name2: {
            value: "User Name"
          }
        }
      };

      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
        message
      );

      res.status(200).json(response.data);
      return;
    }

    res.status(401).json("Open_id not found");
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

module.exports = router;
