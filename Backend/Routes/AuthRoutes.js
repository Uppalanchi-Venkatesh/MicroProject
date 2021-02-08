var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt');
var userLib = require('../Libs/userlib');
var sessionLib = require('../Libs/sessionLib');
var model = require("../Models/usermodel");
//var localStorage = new LocalStorage('./scratch');
require('../Strategies/passport-google').passport;
require('../Strategies/passport-facebook').passport;
require('dotenv').config(); 

router.post('/auth/login', (req, res)=> {
    if(!req.body.email || req.body.email.length == 0)
        return res.render('login',{title:'The Reading Room',messages:'Blank Email Not Allowed', user: req.user});
    var query = {email: req.body.email};
    userLib.getSingleItemByQuery(query, model, function(err, dbUser) {
        if(err || !dbUser)
            return res.render('login',{title:'The Reading Room',messages:'No user with that email !', user: req.user});
        var frontendSentPassword = req.body.password;
        bcrypt.compare(frontendSentPassword, dbUser.password, function(err, cmpResult) { 
            if(cmpResult) {
                sessionLib.setSessionUser(req, dbUser, function(err, result) {
                    //console.log("USER : "+JSON.stringify(dbUser));
                    return res.redirect('/');
                });
                //localStorage.setItem('user',req.body.email);
                //return res.redirect('/dashboard');
            }
            else
                return res.render('login',{title:'The Reading Room', messages:'Sorry! Invalid Password', user: req.user});
        })
    })
});

var GoogleURL,FacebookURL;

if(process.env.PRODUCTION) {
    console.log("Production");
    GoogleURL = process.env.GOOGLE_CALLBACK_URL1;
    FacebookURL = process.env.FB_CALLBACK_URL1;
} else {
    console.log("Development");
    GoogleURL = process.env.GOOGLE_CALLBACK_URL;
    FacebookURL = process.env.FB_CALLBACK_URL;
}

router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile','email'] })
);

router.get(GoogleURL, 
    passport.authenticate('google', {
        successRedirect : '/',
        failureRedirect: '/login', 
        failureFlash: true
}));

router.get('/auth/facebook',
    passport.authenticate('facebook',{ scope: ['profile','email'] })
);

router.get(FacebookURL,
    passport.authenticate('facebook', { 
        successRedirect : '/',
        failureRedirect: '/login',
        failureFlash : true 
}));

module.exports = router;