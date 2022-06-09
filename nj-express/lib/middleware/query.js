const url = require('url');
function queryMiddleware() {
    return function (req, res, next) {
        let {pathname, query} =  url.parse(req.url, true);
        req.query = query;
        req.path = pathname;
        next();
    }
}
module.exports = queryMiddleware;