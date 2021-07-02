require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var cors = require('cors');
var db = require("./Backend/Database/DBconnection");
var bcrypt = require('bcrypt');
var userLib = require('./Backend/Libs/userlib');
var model = require("./Backend/Models/usermodel");
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
//var LocalStorage = require('node-localstorage').LocalStorage;
//var localStorage = new LocalStorage('./scratch');
//var sessionStorage = require('sessionstorage');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var sessionLib = require('./Backend/Libs/sessionLib');
var AuthRoutes = require('./Backend/Routes/AuthRoutes');
var errors1 = require('./Backend/Strategies/passport-google').errors1;
var errors2 = require('./Backend/Strategies/passport-facebook').errors2;
var port = process.env.PORT || 8000;
var str1="",str2="",str3="";

db.connect(process.env.CONNECTION_STRING, true);

app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(cors());
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
    res.render('index',{title: 'The reading Room', user: req.user});
});

app.get("/login",(req,res)=> {
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

app.get('/register', (req,res) =>{
    str3="";
    if(str2.length>0) {
        str3=str2;
        str2="";
    }
    res.render('register', {title : 'The Reading Room', messages : str3, user : req.user});
});

app.get('/about',(req,res)=> {
    res.render('about',{title: 'The Reading Room', user: req.user});
});

app.get('/seat',(req,res)=> {
    res.render('seat',{title: 'The Reading Room', user: req.user});
});

app.post('/register', async(req,res) =>{
    try {
        var query = {email : req.body.email};
        userLib.getSingleItemByQuery(query, model, async function(err, dbUser) {
            if(dbUser) {
                str2='This email already taken !';
                return res.redirect('/register');
            } else {
                req.body.password = await bcrypt.hashSync(req.body.password, parseInt(process.env.SALT_ROUNDS));
                userLib.createUser(req.body);
                return res.redirect('/login');
            }
        });
    } catch(err) {
        console.log("Error : "+err);
        str2=err;
        res.redirect('/register');
    }
});

app.get('/logout', (req, res)=> {
    sessionLib.destroySession(req, function(err, result){
        return res.redirect('/login');
    });
    // localStorage.removeItem('user');
    // return res.redirect('/login');
});


app.listen(port,()=>{
    console.log("Site Running on http://localhost:"+port);
});
