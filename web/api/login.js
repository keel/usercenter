/*
登录的api
 */
'use strict';
const cck = require('cck');
const kc = require('kc');
const iApi = kc.iApi;
const render = kc.render();
const fail2ban = kc.fail2ban;
const error = require('../error');
const sessionAuth = kc.sessionAuth;
const vlog = require('vlog').instance(__filename);
// const authenticator = require('authenticator');

const showLevel = 0;
const kconfig = kc.kconfig;
const apiKey = kconfig.get('s$_apiKey') || 'test_client_key';


const checkUserPwd = function checkUserPwd(reqData, user) {
  if (!user) {
    return false;
  }
  if (user.loginPwd) {
    return user.loginPwd === reqData.loginPwd;
  }
  // if (user.k) {
  //   return authenticator.verifyToken(user.k, reqData.loginPwd);
  // }
  vlog.error('无此登录方式! req:%j', reqData);
  return false;
};

const login = function(req, resp, callback) {
  const reqDataArr = iApi.parseApiReq(req.body, apiKey);
  // vlog.log('reqDataArr:%j', reqDataArr);
  if (reqDataArr[0] !== 0) {
    return callback(vlog.ee(new Error('iApi req'), 'kc iApi req error', reqDataArr), null, 200, reqDataArr[0]);
  }
  const reqData = reqDataArr[1];
  fail2ban.checkBan(reqData.loginName, (err, waitHours) => {
    if (err) {
      return callback(null, error.json('fail2ban', '登录失败次数过多，请等待 ' + waitHours + ' 小时后重试.'), 200);
    }
    const user = kconfig.get('h$_users')[reqData.loginName];
    if (!checkUserPwd(reqData, user)) {
      fail2ban.failOne(reqData.loginName);
      return callback(null, error.json('auth', '用户名密码验证失败，请重试.'), 200);
    }
    fail2ban.clear(reqData.loginName);
    sessionAuth.setAuthed(req, resp, reqData.loginName, user.level, function(err, re) {
      if (err) {
        return callback(vlog.ee(err, 'login:setAuthed', reqData), re, 500, 'session');
      }
      callback(null, { 're': '0' });
    });
  });
};

const inputCheck = function(input) {
  const re = cck.check(input, 'strLen', [3, 18]);
  return re;
};


const iiConfig = {
  'auth': false,
  'act': {
    //空字符串表示仅有一个顶级动作,无二级动作
    '': {
      'showLevel': showLevel,
      'validator': {
        'loginName': inputCheck,
        'loginPwd': inputCheck
      },
      'resp': login
    }
  }
};



exports.router = function() {

  const router = iApi.getRouter(iiConfig);

  router.get('*', function(req, resp, next) { // eslint-disable-line
    resp.send(render.login());
    // if (req.userLevel < showLevel) {
    //   resp.status(404).send('40401');
    //   return;
    // }
    // resp.send(render.user({
    //   level: req.userLevel,
    //   cpid: req.userId
    // }));
  });

  return router;
};