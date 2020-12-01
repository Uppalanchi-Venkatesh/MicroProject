var express = require('express');
var app = express();
var path = require('path');
var db = require("./Backend/Database/DBconnection");
var bcrypt = require('bcrypt');
var userModel = require('./Backend/Libs/userlib');
var model = require("./Backend/Models/usermodel");
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');
var sessionStorage = require('sessionstorage');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var sessionLib = require('./Backend/Libs/sessionLib');
var AuthRoutes = require('./Backend/Routes/AuthRoutes');
var errors1 = require('./Backend/Strategies/passport-google').errors1;
var errors2 = require('./Backend/Strategies/passport-facebook').errors2;
var port = process.env.PORT || 8000;
var str1="",str2="",str3="";
require('dotenv').config();

db.connect(process.env.CONNECTION_STRING, true);

app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(cookieParser());
app.use(sessionLib.populateSessionUser);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'Frontend')));
app.use(AuthRoutes);

app.get('/',(req,res)=> {
    res.render('index',{title: 'The reading Room'});
});

app.get("/login",(req,res)=> {
    if(req.user)        //if(localStorage.getItem('user'))
        return res.redirect('/dashboard');
    str1="";
    if(errors1.length>0 && errors1[0]!=="") {
        str1=errors1[0];
        errors1[0]="";
    }
    if(errors2.length>0 && errors2[0]!=="") {
        str1=errors2[0];
        errors2[0]="";
    }
    res.render('login',{title : 'The Reading Room',messages : str1, user : req.user});
});

app.get("/register",(req,res)=> {
    if(req.user)        //if(localStorage.getItem('user'))
        return res.redirect('/dashboard');
    res.render('register',{title:'The Reading Room', user: req.user});
});

app.get('/logout', (req, res)=> {
    sessionLib.destroySession(req, function(err, result){
        return res.redirect('/login');
    });
    // localStorage.removeItem('user');
    // return res.redirect('/login');
});

app.get('/about',(req,res)=> {
    res.render('about',{title: 'The Reading Room'});
});

app.get('/dashboard', function(req, res) {
    // res.locals.query = req.query;
    // console.log("REQ.QUERY : "+JSON.stringify(req.query));
    if(req.user)        //if(localStorage.getItem('user'))
        return res.render('dashboard',{title:'Dashboard',messages: 'Successful', user: req.user});//localStorage.getItem('user')
    return res.redirect('/login');
});

app.post('/register',async function(req,res) {
    try {
        var hashedPassword = await bcrypt.hash(req.body.password , 10);
        req.body.password = hashedPassword;
        //console.log(JSON.stringify(req.body));
        userModel.createUser(req.body);
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});

/*app.post('/login', (req, res)=>{
    if(!req.body.email || req.body.email.length == 0)
        return res.render('login',{title:'The Reading Room',messages:'Blank Email Not Allowed', user: req.user});
    var query = {email: req.body.email};
    userModel.getSingleItemByQuery(query, model, function(err, dbUser){
        if(err || !dbUser)
            return res.render('login',{title:'The Reading Room',messages:'Sorry! Invalid Email', user: req.user});
        var frontendSentPassword = req.body.password;
        bcrypt.compare(frontendSentPassword, dbUser.password, function(err, cmpResult){
            if(cmpResult)
            {
                sessionLib.setSessionUser(req, dbUser, function(err, result){
                    //console.log("USER : "+JSON.stringify(dbUser));
                    return res.redirect('/dashboard');
                });
                //localStorage.setItem('user',req.body.email);
                //return res.redirect('/dashboard');
            }
            else
                return res.render('login',{title:'The Reading Room', messages:'Sorry! Invalid Password', user: req.user});
        })
    })
});*/

//db.disconnect();

app.listen(port,()=>{
    console.log("Site Running on http://localhost:"+port);
});
