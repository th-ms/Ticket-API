const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const Cookie = require('../models/Cookie.js');
const Client = require('../models/Client.js');
const genCookie = require('../public/customTicket.js')
const crypto = require("crypto");

var apiVersion = 1

router.use(bodyParser.json());

router.post('/add', async (req, res) => {
    Cookie.insertMany(req.body.data)
    .then(() => res.json({message:'Cookies Added.'}))
    .catch((err) => res.json({message:'There was an error adding the cookies'}))
});

router.post('/addclient', async (req, res) => {
    Client.countDocuments({api_key: req.body.owner.api_key}, function (err, count){ 
        if(count>0){
            Client.countDocuments({discord: req.body.added.discord}, function (err, count){ 
                if(count>0){
                    res.json({message:'This client already exists.'})
                } else {
                    newClient = {
                        "discord": req.body['added']['discord'],
                        "api_key": crypto.randomBytes(20).toString('hex'),
                        "requests": 0,
                        "email": req.body['added']['email']
                    }
                    Client.create(newClient)
                    .then(() => res.json({'client':newClient,'message':'Client added.'}))
                    .catch((err) => res.json({message:'There was an error adding the client'}))
                }
            }); 
        } else {
            res.json({message:'Invalid API Key.'})
        }
    }); 
});

router.post('/removeclient', async (req, res) => {
    Client.countDocuments({api_key: req.body.owner.api_key}, function (err, count){ 
        if(count>0){
            Client.countDocuments({discord: req.body.removed.discord}, function (err, count){ 
                if(count>0){
                    Client.deleteOne(req.body.removed)
                    .then(() => res.json({message:'Client removed.'}))
                    .catch((err) => res.json({message:'There was an error removing the client.'}))
                } else {
                    res.json({message:'This client does not exist.'})
                }
            }); 
        } else {
            res.json({message:'Invalid API Key.'})
        }
    }); 
});

router.post('/changeversion', async (req, res) => {
    Client.countDocuments({api_key: req.body.api_key}, function (err, count){ 
        if(count>0){
            try{
                apiVersion = req.body.version;
                res.json({message:'Version changed.'})
            }catch(err){
                res.json({error:'Error changing version.'})
            }
        } else {
            res.json({message:'Invalid API Key.'})
        }
    }); 
});

router.post('/clearcookies', async (req, res) => {
    Client.countDocuments({api_key: req.body.api_key}, function (err, count){ 
        if(count>0){
            try{
                Cookie.remove({}, function(err, cookie){
                    res.json({message:"Successfully cleared cookies."})
                })
            }catch(err){
                res.json({error:'Error clearing cookies.'})
            }
        } else {
            res.json({message:'Invalid API Key.'})
        }
    }); 
});

router.get('/version', async (req, res) => {
    res.json({"version":apiVersion})
});

router.get('/clients', async (req, res) => {
    try{
        Client.find({}, function (err, clients){ 
            res.json({"clients":clients})
        }); 
    }catch(err){
        res.json({"message":'There was an error fetching clients'})
    }

});


router.get('/count', async function(req,res) {
    try{
        Cookie.countDocuments({}, function(err, count){
            res.json({cookie_count:count})
        })
    }catch(err){
        res.json({message:'Unable to fetch cookie count'});
    }
})

router.post('/fetch', async function(req,res) {
    Client.countDocuments({api_key: req.body.api_key}, function (err, count){ 
        if(count>0){
            if (apiVersion.toString() == '1'){
                res.json(genCookie(1))
            } else {
                try{
                    Cookie.findOneAndDelete({}, function(err, cookie){
                        res.json({ntbcc:cookie.ntbcc})
                    })
                    
                }catch(err){
                    res.json({message:'Probably out of cookies'});
                }
            }
        } else {
            res.json({message:'Invalid API Key.'})
        }
    }); 
})

module.exports = router;