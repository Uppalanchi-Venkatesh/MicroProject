var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 8000;

app.set('views', path.join(__dirname, 'Frontend', 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.get('/sample',(req,res)=>{
    res.render('sample');
});

app.get('/edit',(req,res)=>{
    res.render('edit');
});

app.get('/resource',(req,res)=>{
    res.render('resource');
});

app.get('/single',(req,res)=>{
    res.render('single');
});

app.listen(port,()=>{
    console.log("Site Running on http://localhost:"+port);
});
