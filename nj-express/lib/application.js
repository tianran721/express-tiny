const http  = require('http');
const Router = require('./router/index');
const methods = require('methods');
const queryMiddleware = require('./middleware/query');
const sendMiddleware = require('./middleware/send');
const sendFileMiddleware = require('./middleware/sendFile');

function Application() {
    this.router = new Router();
    this.router.use(queryMiddleware());
    this.router.use(sendMiddleware());
    this.router.use(sendFileMiddleware());
}
Application.prototype.param = function(path, handler){
    this.router.param(path, handler);
};
Application.prototype.use = function(path, handler){
    this.router.use(path, handler);
};
methods.forEach(method =>{
    Application.prototype[method] = function(path, ...handlers){
        this.router[method](path, handlers);
    };
});

Application.prototype.listen = function(){
    let server = http.createServer();
    let _handler = (req, res)=>{
        res.end(`Cannot ${req.method} ${req.url}`);
    };
    server.on('request', (req, res)=>{
        this.router.handler(req, res, _handler);
    });
    server.listen(...arguments);
}
module.exports = Application;