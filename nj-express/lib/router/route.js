const Layer = require('./layer');
const methods = require('methods');

function Route() {
    this.stack = [];
}
methods.forEach(method =>{
    Route.prototype[method] = function(path, handlers){
        if(Array.isArray(handlers)){
            handlers.forEach(handler =>{
                // 遍历到一个handler就需要创建一小层
                let layer = new Layer(path, method, handler);
                this.stack.push(layer);
            });
        }else{
            let layer = new Layer(path, method, handlers);
            this.stack.push(layer);
        }
    };
});
// 专门用于遍历取出所有小层的方法
Route.prototype.dispatch = function(req, res, out){
    const requestPath = req.url;
    const requestMethod = req.method.toLowerCase();
    let idx = 0;
    let next = (err)=>{ // next方法的作用, 就是取出一小层
        if(err){
            out(err);
            return;
        }
        if(idx === this.stack.length){
            out();
            return;
        }
        let layer = this.stack[idx++]; // 取去每一小层
        if(layer.matchMethod(requestMethod)){
            // 如果匹配就执行实际的回调函数
            layer.handler_request(req, res, next);
        }else{
            // 如果不匹配就再取出下面一小层
            next();
        }
    }
    next();
}
module.exports = Route;