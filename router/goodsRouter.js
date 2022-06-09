const express = require('express');
const goods = express.Router();

goods.get('/list', (req, res, next)=>{
    res.end('goods list');
});
goods.get('/detail', (req, res, next)=>{
    res.end('goods detail');
});

module.exports = goods;