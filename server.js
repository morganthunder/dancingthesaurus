var express = require ('express');
var logger = require('morgan');

var fs = require ('fs');
var app = express ();

var util = require('util');
var server = require ('http').createServer (app);
//app.set('views', __dirname + '/views');
app.set('views', __dirname + '');
app.use(logger('dev'));
app.engine('.html', require('ejs').__express);

var Functions=require("./functions.js");
var wordsearchfunction=new Functions();







/* listen to get request and respond accordingly*/
app.get ('/', function (req, res){
    console.log ('GET /');

    res.render('index.html');    
});

app.post ('/synonym', function (req, res){
    wordsearchfunction.querysearch(req, res);   
});


/* listen to post requests and respond accordingly*/
app.post("/", function (req, res) {

    wordsearchfunction.querysearch(req, res);
    

});

/* set views folder to public access so users can get access to html and css files*/
app.use(express.static(__dirname + ''));

/* Start listening to port 80*/
server.listen (80);



