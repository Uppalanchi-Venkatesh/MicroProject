var userModel = require('../Models/usermodel');
var itemLib = require('./userlib');

module.exports.populateSessionUser = function(req, res, next) {
    module.exports.getSessionUser(req, function(err, user) {
        //console.log("ERROR: "+ JSON.stringify(user));
        req.user = user;
        next();
    })
}
module.exports.setSessionUser = function(req, userObj, cb) {
    req.session.email = userObj.email;
    cb(null, true);
}

module.exports.destroySession = function(req, cb) {
    if(req.session) {
        req.session.destroy(function(err){
            req.user= null;
        })
    }
    cb(null, true);
}

module.exports.getSessionUser = function(req, cb) {
    if(req.session && req.session.email) {
        // Get User Details of sessionUser from DB
        var query = {email : req.session.email};
        itemLib.getSingleItemByQuery(query, userModel, function(err, dbUser) {
            //var sessionUser = {email: dbUser};
            cb(err, dbUser.email);
        })
    } else {
        cb(null, null);
    }
}