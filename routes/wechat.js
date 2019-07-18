const express = require('express');
const router = express.Router();

// WeChat Stuff
const { Wechat, MiniProgram } = require('wechat-jssdk');
const WXDecrypt = require('../utils/decrypt');

const wechatConfig = {
  "appId": process.env.MP_APPID,
  "appSecret": process.env.MP_APPSECRET,
  "miniProgram": {
    "appId": process.env.MP_APPID,
    "appSecret": process.env.MP_APPSECRET,
  }
};
const wx = new Wechat(wechatConfig);  

// router.get('/', async(req, res, next) => {
//   const { access_token } = await wx.jssdk.getAccessToken();
//   res.status(200).json(access_token);
// });

router.post('/login', async (req, res) => {
  const { iv, encryptedData } = req.body;
  const { code } = req.query;
  if(code && iv && encryptedData) {
    try {
      // Get the session key with code
      const data = await wx.miniProgram.getSession(req.query.code);
      const { session_key } = data;

      // Use the session key and iv to decrypt data
      const pc = new WXDecrypt(process.env.MP_APPID, session_key);

      const decryptedData = pc.decryptData(encryptedData , iv);

      // It's up to you if you want to send back the data or store it in the database
      res.json(decryptedData);
      return;
    } catch (error) {
      console.log(error);
      res.status(500);
      return;
    }
  }
  res.json('No Code Found');
});

// Template Message
router.post('/save-formId', async (req, res) => {
  // save form ID here, to send a message to a user who didn't trigger the form.
})

router.post('/send-message', async (req, res) => {
  /*
    req.body = {
      open_id: String,
      form_id: String,
      template_id: String,
      data: Object
    }
  */
  /*
  {
    "form_id": "1d16026cadf5fef48705f8dc416120dc",
    "touser": 'oIEcc5CTl4nRK1hORoSghj19N-GA', // openID
    "template_id":'epDAg_fFYdvsVD5qDLS2jpxXU45wfNWME36q1HMjgTg',
    "data": {
      keyword1: {
        value: 'Product Name',
      },
      keyword2: {
        value: 'Product Description',
      },
      keyword3: {
        value: '10/10/2018',
      },
      keyword4: {
        value: '10/10/2018',
      },
    },
  }
  */
  try {
    // Get access token
   const { access_token } = await wx.jssdk.getAccessToken();
  //  console.log(access_token);
   // Get template id either hardcoded or making a request to https://api.weixin.qq.com/cgi-bin/wxopen/template/list?access_token=ACCESS_TOKEN
   const template_id = "rOCU8DIXCI1FBIxhg8zpUGyqnYhqT2obhj70Hn8VK2M";
   // Send message
   const message = {
      form_id: req.body.form_id,
      // Recipient's OpenID
      touser: req.body.touser,
      template_id,
      data: {
        keyword1: {
          value: '10/10/2018',
        },
        keyword2: {
          value: 'Product Name',
        },
        keyword3: {
          value: 'Delivery Platform',
        },
      }
    };

   const response = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`, message);

    res.status(200).json(response.data);
 } catch (e) {
   console.error(e.message || e);
   res.status(500).json({ error: e.message || e });
 }
});

module.exports = router;
