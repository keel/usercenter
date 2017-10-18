'use strict';

const kc = require('kc');

//生成项目express主进程
const app = kc.createApp(__dirname);

//增加非api和tpl的路由,如logout,此处为express的标准用法
app.get('/logout', kc.sessionAuth.logout);

//启动进程
app.start(kc.kconfig.get('startPort'));
