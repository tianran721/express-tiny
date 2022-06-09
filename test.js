const url = require('url');

let path = 'http://127.0.0.1:3000/test?name=lnj&age=33';
let obj = url.parse(path, true);
console.log(obj);
