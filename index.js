var express = require('express');
var app = express();

var sha1 = require('sha1');

var _ = require('underscore');

var fs = require('fs');

app.set('view engine', 'ejs');

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));

app.get('/', function (req,res) {
	if (req.cookies.name && req.cookies.email) {
		res.render('home.ejs')
	}else{
		res.redirect('/sign-in');
	}
});

app.get('/sign-in', function(req,res){
	res.render('signIn.ejs');
});
app.post('/sign-in', function(req,res){
	fs.readFile('users.json', "utf8", function(err, data){
		if (err) {
			console.log(err);
		}else{
			var json = JSON.parse(data);
			var user = _.find(json, function(elm, index){
				return elm.email == req.body.email && elm.password == sha1(req.body.password);
			});
			if (user) {
				res.cookie('email', req.body.email);
				res.cookie('name', user.name);
				res.redirect('/');
			}else{
				res.redirect('/sign-in');
			}
		}
	});

});

app.get('/sign-up', function(req,res){
	res.render('signUp.ejs');
});

app.listen(3000);