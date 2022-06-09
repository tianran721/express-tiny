// const express = require('express');
const express = require('./nj-express/index'); // createApplication方法

const app = express(); // 执行createApplication方法, 会返回一个对象给我们
/*
app.use((req, res, next)=>{
    const path = require('path');
    const fs = require('fs');
    res.sendFile = function (pathname, {root}) {
        let absPath = '';
        if(typeof root === 'undefined'){
            absPath = pathname;
        }else{
            absPath = path.join(root, pathname);
        }
        fs.createReadStream(absPath).pipe(res);
    }
    next();
});
 */

app.get('/test', (req, res, next)=>{
    res.sendFile('test.js', {root: __dirname});
});

app.listen(3000, ()=>{
    console.log('listen 3000 ok');
});