const path = require('path');
const fs = require('fs');
function sendFileMiddleware() {
    return function (req, res, next) {
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
    }
}
module.exports = sendFileMiddleware;