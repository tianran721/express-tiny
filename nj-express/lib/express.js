const Application = require('./application');
const Router = require('./router/index');
const queryString = require('querystring');

function createApplication() {
    return new Application();
}
createApplication.Router = Router;
createApplication.urlencoded = function(){
    return function (req, res, next) {
        let params = '';
        req.on('data', (chunk)=>{
            params += chunk;
        }) ;
        req.on('end', ()=>{
            req.body = queryString.parse(params);
            next();
        });
    }
}
module.exports = createApplication;