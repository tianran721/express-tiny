const express = require('express');
const user = express.Router();

// /user/login
user.get('/login', (req, res, next)=>{
    res.end('user login');
});
// /user/register
user.get('/register', (req, res, next)=>{
    res.end('user register');
});

module.exports = user;