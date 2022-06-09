function sendMiddleware() {
    return function (req, res, next) {
        res.send = function (value) {
            if(typeof value === 'string'){
                res.end(value);
            }else if(typeof value === 'object'){
                res.end(JSON.stringify(value));
            }
        }
        next();
    }
}
module.exports = sendMiddleware;