var express = require('express');
var app = express();
var path = require('path');
var db = require("./Backend/Database/DBconnection");
var bcrypt = require('bcrypt');
var userModel = require('./Backend/Libs/userlib');
var model = require("./Backend/Models/usermodel");
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var port = process.env.PORT || 8000;

db.connect();

app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
}));
app.use(flash());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'Frontend')));

app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.get('/about',(req,res)=>{
    res.render('about');
});

app.get('/dashboard',(req,res)=>{
    res.render('dashboard');
});

// router.post('/verifyemail', (req, res)=>{
//     if(!req.body.email || req.body.email.length == 0)
//         return res.json({message: 'Blank email is not allowed'});
//     var query = {email: req.body.email};
//     itemLib.getSingleItemByQuery(query, userModel, function(err, dbUser){
//         if(err || dbUser)
//             return res.json({message: 'found'});
//         return res.json({message: ''});
//     })
// })

/*router.post('/register', (req, res)=>{
    // HASH THE PASSWORD BEFORE SAVING
    req.body.password = bcrypt.hashSync(req.body.password, config.bcrypt_salt_rounds);
    itemLib.createitem(req.body, userModel, function(err, savedUserObj){
        if(err)
            return res.redirect('/register');
        return res.redirect('/login');
    })
})*/

app.post('/register',async function(req,res){
    try{
        var hashedPassword = await bcrypt.hash(req.body.password , 10);
        req.body.password = hashedPassword;
        userModel.createUser(req.body);
        //console.log(req.body.email);
        res.redirect('/login');
    }catch{
        res.redirect('/register');
    }
    /*RegisterUserLib.createUsers(req.body);
    //res.send("user registered sucessfully");*/
})

app.get('/getregisteruser',function(req,res){
    userModel.getAllUsers(function(err,result){
        if(err)
            res.json(err);
        else
            res.json(result);
    })
})

app.post('/login', (req, res)=>{
    if(!req.body.email || req.body.email.length == 0)
        return res.render('login',{title:'The Reading Room',messages:'Blank Email Not Allowed'});
    var query = {email: req.body.email};
    userModel.getSingleItemByQuery(query, model, function(err, dbUser){
        if(err || !dbUser)
            return res.render('login',{title:'The Reading Room',messages:'Sorry! Invalid Email'});
        var frontendSentPassword = req.body.password;
        bcrypt.compare(frontendSentPassword, dbUser.password, function(err, cmpResult){
            if(cmpResult)
                return res.redirect("/dashboard");
            else
                //return res.redirect("/register");
                return res.render('login',{title:'The Reading Room', messages:'Sorry! Invalid Password'});
        })
    })
})

//db.disconnect();

app.listen(port,()=>{
    console.log("Site Running on http://localhost:"+port);
});
