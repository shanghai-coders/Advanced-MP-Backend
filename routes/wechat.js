const express = require('express');
const router = express.Router();

// WeChat Stuff
const { Wechat, MiniProgram } = require('wechat-jssdk');

const wechatConfig = {
  "appId": process.env.MP_APPID,
  "appSecret": process.env.MP_APPSECRET,
  "miniProgram": {
    "appId": process.env.MP_APPID,
    "appSecret": process.env.MP_APPSECRET,
  }
};
const wx = new Wechat(wechatConfig);  

router.post('/login', async (req, res) => {
  const { code } = req.query;
  if(code) {
    try {
      // Get the session key with code
      const data = await wx.miniProgram.getSession(code);

      // It's up to you if you want to send back the data or store it in the database
      res.json(data);
      return;
    } catch (error) {
      console.log(error);
      res.status(500);
      return;
    }
  }
  res.json('No Code Found');
});

module.exports = router;
