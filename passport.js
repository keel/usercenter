'use strict';

const kc = require('kc');

//生成项目express主进程
const app = kc.createApp(__dirname);
const passport = require('passport');
const express = require('express');
const WechatStrategy = require('passport-wechat').Strategy;

const wechatProp = {
  appID: 'wx1d60e0e2859b208b',
  name: 'wechat',
  appSecret: 'd4624c36b6795d1d99dcf0547af5443d',
  client: 'web', //{wechat|web},
  callbackURL: '/auth/wechat/callback',
  scope: 'snsapi_base', // {snsapi_userinfo|snsapi_base},
  state: 's1s1', //{STATE},
  getToken: null, //'p3WqgTyqearyMvSTsIK8Yqm4Z61RD1nL',
  saveToken: null //{saveToken}
};

passport.use(
  new WechatStrategy(wechatProp,
    function(accessToken, refreshToken, profile, expires_in, done) {
      console.log(profile);
      return done(null, profile);
    }
  )
);

app.use(passport.initialize());

app.get('/auth/wechat', passport.authenticate('wechat'));
app.get('/auth/wechat/callback', passport.authenticate('wechat', {
  failureRedirect: '/auth/fail',
  successReturnToOrRedirect: '/auth/succ'
}));
app.get('/auth/fail', express.Router().all('*', function(req, res, next) { // eslint-disable-line
  res.status(404).send('auth fail');
}));
app.get('/auth/fail', express.Router().all('*', function(req, res, next) { // eslint-disable-line
  res.status(404).send('auth succ');
}));
//启动进程
app.start(kc.kconfig.get('startPort'));