const Layer = require('./layer');
const Route = require('./route');
const methods = require('methods');
const url = require('url');

function Router() {
    // this.stack = [];
    let router = function (req, res, next) {
        router.handler(req, res, next);
    };
    /*
    注意点: 这个Router将来有两种使用方式, 第一种是直接调用, 第二种是通过new来创建
            但是现在这个方法中返回了一个中间件, 所以将来通过new创建之后拿到的并不是创建的那个对象
            而是我们返回的这个中间件, 所以我们通过new创建之后是不能使用Router上的方法的
    * */
    router.stack = [];
    router.paramsCallback = {};
    router.__proto__ = proto;
    return router;
}
let proto = {};
proto.param = function(path, handler){
    if(this.paramsCallback[path]){
        this.paramsCallback[path].push(handler);
    }else{
        this.paramsCallback[path] = [handler];
    }
    // { name: [ [Function], [Function] ], age: [ [Function] ] }
};
proto.handler_params = function(req, res, done){
    let keys = Object.keys(req.params);
    if(!keys || keys.length === 0){
        done(); // 没有路由参数, 那么就继续往下执行
        return;
    }
    let idx = 0;
    let next = () =>{
        if(idx === keys.length){
            done();
            return;
        }
        let key = keys[idx++];
        let value = req.params[key];
        let fns = this.paramsCallback[key];
        processCallback(key, value, fns, next);
    }
    next();
    function processCallback(key, value, fns, out) {
        let idx = 0;
        let next = ()=>{
            if(idx === fns.length){
                out();
                return;
            }
            let fn = fns[idx++];
            fn(req, res, next, value, key);
        }
        next();
    }
};
proto.use = function(path, handler){
    if(typeof path === "function"){
        handler = path;
        path = '/';
    }
    // 创建一大层保存中间件
    let layer = new Layer(path, '*', handler);
    layer.route = undefined; // 是中间件就没有route
    this.stack.push(layer);
}
methods.forEach(method =>{
    proto[method] = function (path, handlers) {
        let route = new Route();
        route[method](path, handlers);
        // 每次调用get就创建一大层
        // 注意: 大层的handler是Route中的dispatch方法
        let layer = new Layer(path, method, route.dispatch.bind(route));
        layer.route = route;
        this.stack.push(layer);
    };
});
proto.handler = function (req, res, out) {
    const {pathname} = url.parse(req.url);
    const requestPath = pathname;
    const requestMethod = req.method.toLowerCase();
    let idx = 0;
    let next = (err)=>{ // next方法的作用, 就是取出一大层
        if(idx === this.stack.length){ // 如果所有大层都取完了都没有匹配到, 那么就返回Cannot xxx
            out(req, res);
            return;
        }
        let layer = this.stack[idx++];
        if(err){
            if(!layer.route){
                // 如果是中间件, 那么有可能是处理错误的中间件, 我们需要执行
                layer.handler_error(err, req, res, next);
            }else{
                // 如果是不中间件, 那么就跳过所有
                next(err);
            }
        }else{
            if(layer.matchPath(requestPath)){ // /test?name=lnj&age=33   /test
                if(!layer.route){
                    // 处理子路由
                    /*
                    当前的请求路径: /test?name=lnj&age=33
                    当前的子路由路径: /
                    * */
                    if(layer.path !== '/'){
                        req.url = requestPath.slice(layer.path.length);
                    }
                    // 是中间件
                    layer.handler_request(req, res, next);
                }else{
                    // 是get/post
                    if(layer.matchMethod(requestMethod)){
                        req.params = layer.params;
                        // 如果有路由参数, 那么就处理完路由参数之后再继续执行
                        this.handler_params(req, res, ()=>{
                            // 匹配到了就调用route.dispatch取出小层来执行
                            layer.handler_request(req, res, next);
                        })
                    }else{
                        // 如果没有匹配到, 就继续取出下面一大层
                        next();
                    }
                }
            }
            else{
                next();
            }
        }
    };
    next();
};
module.exports = Router;