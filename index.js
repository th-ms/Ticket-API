const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const axios = require('axios').default;
const fs = require('fs');
const mongoose = require('mongoose');
var app = express();
var path = require('path');
var port = process.env.PORT || 8080
const apiRoute = require('./routes/api');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var User = require('./models/User.js');

mongoose.connect('mongodb+srv://thomas:lTtlhuzgeUWH76hx@cluster0.j03wb.mongodb.net/rest?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true}, () =>
console.log('Connected to DB'))

// axios.get('https://www.supremenewyork.com/ticket.js')
//     .then(function (response) {
//         var TTS = response.data
//         TTS = TTS.match(/return \([^.?]{4}=[^.?]{4}\[[^.?]{4}.[^.?]{4}\(\+[^.?]{4}.[^.?]{4}\)\]\[[^.?]{4}.[^.?]{4}\(+\+[^.?]{4}.[^.?]{4}\)\]\([^.?]{4}\),document\[[^.?]{4}.[^.?]{4}\(\+[^.?]{4}.[^.?]{4}\)\]=this\[[^.?]{4}.[^.?]{4}\(\+[^.?]{4}.[^.?]{4}\)\]\(\) \+ [^.?]{4}.[^.?]{4}\(\+[^.?]{4}.[^.?]{4}\) \+ this\[[^.?]{4}.[^.?]{4}\([^.?]{4}.[^.?]{4} \^ [^.?]{4}.[^.?]{4}\)\]\([^.?]{4}\) \+ [^.?]{4}.\[\+[^.?]{4}.[^.?]{4}\]\);/)[0]
//         p1 = TTS.match(/=.+?\[.+?\]\[.+?\]\(.+?\)/)[0].slice(1)
//         p2 = TTS.match(/\+ this\[.+?\]\(.+?\)/)[0].slice(2).replace(/\(.{4}\)/,('('+p1+')')).replace('this','h')
//         a = 'var h = this;genCookie=function(t){var e=[];for(i=0;i<t;i++)e.push({ntbcc:'+p2+'});var a=new XMLHttpRequest;a.open("POST","https://th-mas-ticketapi.herokuapp.com/api/add",!0),a.setRequestHeader("Content-type","application/json"),a.onreadystatechange=function(){if(a.readyState == XMLHttpRequest.DONE){console.log(a.responseText)}},a.send(JSON.stringify({data:e}))};' + TTS
//         var newData = response.data
//         newData = newData.replace(TTS,a)
//         fs.writeFile('public/ticket.js', newData, function (err) {
//             if (err) throw err;
//             console.log('Ticket Ready For Cookie Creation!');
//         });
//     })
//     .catch(function (error) {
//         console.log("Error fetching ticket.js")
//         console.log(error)
//     })

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

app.route('/signup')
    .post((req, res) => {
        User.create({
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            res.json({"user":user});
        })
    });

app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(path.join(__dirname+'/static' + '/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

app.route('/login')
.get(sessionChecker, (req, res) => {
    res.sendFile(path.join(__dirname+'/static' + '/login.html'));
})
.post((req, res) => {
    var email = req.body.email,
        password = req.body.password;
    User.findOne({ "email": email, "password":password}).then(function (user) {
        if (!user) {
            res.redirect('/login');
        } else {
            req.session.user = user;
            res.redirect('/dashboard');
        }
    });
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/login');
    } else {
        res.redirect('/login');
    }
});

app.get('/',sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.use('/api', apiRoute)

app.listen(port);
console.log("Listen on port: ",port)