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
    fs.readFile('users.json', "utf8", function(err, data){
        if (err) {
            console.log(err);
        }else{
            var json = JSON.parse(data);
            var user = _.find(json, function(elm, index){
                return elm.email == req.cookies.email && elm.name == req.cookies.name;
            });
            if (user) {
                res.render("home.ejs");
            }else{
                res.redirect('/sign-in');
            }
        }
    });});

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

app.post('/signUp', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = sha1(req.body.password);
    var rePassword = sha1(req.body.rePassword);
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    if(name.length <= 1 || !validateEmail(email) || password.length < 6 || password != rePassword || rePassword == ""){
        res.status(406);
        res.send('validation error');
    }else{
    	fs.readFile('users.json', "utf8", function (err, data) {
			if(err){
				console.log(err);
                res.status(500);
                res.send('server error');
			}
			else{
				var users = JSON.parse(data);
				var obj = {};
				obj.name = name;
				obj.email = email;
				obj.password = password;
				users.push(obj);
				users = JSON.stringify(users);
				fs.writeFile("users.json", users, function (err) {
					if (err) {
                        console.log(err);
                    }else{
						res.cookie("email", obj.email);
						res.cookie("name", obj.name);
						res.send('success');
					}
                });
			}
        });

	}
})

app.listen(3000);