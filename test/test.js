'use strict';
const OAuth2Server = require('oauth2-server');
const bodyParser = require('body-parser');
const express = require('express');
// const OAuthServer = require('express-oauth-server');

const oauth = new OAuth2Server({
  model: require('./model')
});



const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

let request = new Request({/*...*/});
let response = new Response({/*...*/});

var app = express();

app.oauth = new OAuthServer({
  model: {}, // See https://github.com/thomseddon/node-oauth2-server for specification
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(app.oauth.authorize());

app.use(function(req, res) {
  res.send('Secret area');
});

app.listen(3000);