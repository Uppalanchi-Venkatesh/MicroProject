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
var sessionStorage = require('sessionstorage');
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');
var mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
var port = process.env.PORT || 8000;

db.connect(true);

app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie:{
        maxAge: 10000,
        expires: 60*60,
        httpOnly: true
    }
}));
app.use(flash());
app.use(cookieParser());
//app.use(sessionLib.populateSessionUser);
app.use(express.static(path.join(__dirname, 'Frontend')));

app.get('/',(req,res)=>{
    res.render('index',{title: 'The reading Room'});
});

app.get("/login",(req,res)=>{
    if(localStorage.getItem('user'))
        return res.redirect('/dashboard');
    res.render('login',{title:'The Reading Room',messages:'', user: req.user});
});

app.get("/register",(req,res)=>{
    if(localStorage.getItem('user'))
        return res.redirect('/dashboard');
    res.render('register',{title:'The Reading Room', user: req.user});
});

app.get('/logout', (req, res)=>{
    // sessionLib.destroySession(req, function(err, result){
    //     return res.redirect('/login');
    // });
    localStorage.removeItem('user');
    return res.redirect('/login');
});

app.get('/about',(req,res)=>{
    res.render('about',{title: 'The Reading Room'});
});

app.get('/dashboard', function(req, res) {
    //res.locals.query = req.query;
    //console.log("REQ.QUERY"+req.query);
    if(localStorage.getItem('user'))
        return res.render('dashboard',{title:'Dashboard', user: localStorage.getItem('user')});//localStorage.getItem('user')
    //res.render('dashboard',{title:'Dashboard', user: req.user});
    return res.redirect('/login');
});

/*router.post('/verifyemail', (req, res)=>{
    if(!req.body.email || req.body.email.length == 0)
        return res.json({message: 'Blank email is not allowed'});
    var query = {email: req.body.email};
    itemLib.getSingleItemByQuery(query, userModel, function(err, dbUser){
        if(err || dbUser)
            return res.json({message: 'found'});
        return res.json({message: ''});
    })
})

router.post('/register', (req, res)=>{
    // HASH THE PASSWORD BEFORE SAVING
    req.body.password = bcrypt.hashSync(req.body.password, config.bcrypt_salt_rounds);
    itemLib.createitem(req.body, userModel, function(err, savedUserObj){
        if(err)
            return res.redirect('/register');
        return res.redirect('/login');
    })
});

app.get('/getregisteruser',function(req,res){
    userModel.getAllUsers(function(err,result){
        if(err)
            res.json(err);
        else
            res.json(result);
    })
});*/

app.post('/register',async function(req,res){
    try{
        var hashedPassword = await bcrypt.hash(req.body.password , 10);
        req.body.password = hashedPassword;
        userModel.createUser(req.body);
        res.redirect('/login');
    }catch{
        res.redirect('/register');
    }
});

app.post('/login', (req, res)=>{
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
                // sessionLib.setSessionUser(req, dbUser, function(err, result){
                //     return res.redirect('/dashboard');
                // });
                localStorage.setItem('user',req.body.email);
                return res.redirect('/dashboard');
            }
            else
                //return res.redirect("/register");
                return res.render('login',{title:'The Reading Room', messages:'Sorry! Invalid Password', user: req.user});
        })
    })
});

// function authUser(req,res,next){

// }

//db.disconnect();

app.listen(port,()=>{
    console.log("Site Running on http://localhost:"+port);
});
