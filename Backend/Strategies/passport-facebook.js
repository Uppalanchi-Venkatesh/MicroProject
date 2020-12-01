var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var userLib = require('../Libs/userlib');
var model = require('../Models/usermodel');
require('dotenv').config();

passport.serializeUser((user, done)=> {
    done(null, user._id);
});

passport.deserializeUser((id , done)=> {
    var query = {_id : id};
    userLib.getItemById(query, model, (err, dbUser)=> {
        if(err)
            return done(err,dbUser);
        return done(null,dbUser);
    });
});

var URL;

if(process.env.NODE_ENV === 'production') 
    URL = process.env.FB_CALLBACK_URL1;
else
    URL = process.env.FB_CALLBACK_URL;

var customFields = {
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: URL,
    profileFields: ['id', 'displayName', 'photos', 'email']
}

var errors2=[];

var verifyCallback = (accessToken, refreshToken, profile, done)=> {
    // console.log("FB profile : "+ JSON.stringify(profile));
    // console.log("Email : "+ profile.emails[0].value);
    var query = {email : profile.emails[0].value};
    userLib.getSingleItemByQuery(query, model, (err, user)=> {
        if(err) {
            errors2[0]=err;
            return done(err);
        }
        if(!user) {
            errors2[0]='No user with that email !';
            return done(null, false);
        }
        return done(null, user);
    });
}

var Strategy = new FacebookStrategy(customFields, verifyCallback);

passport.use(Strategy);

module.exports = {passport,errors2};