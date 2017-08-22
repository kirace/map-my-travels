var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');

let users = new Map(); // maps each username to its associated password and user data
let clients = new Map(); //maps each current server client to its username
users.set('kevinirace@gmail.com', {pass: 'admin', countries: ['Italy', 'United States of America']});


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-fo

app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.use('/style',  express.static(__dirname + '/style'));

app.get('/',function(req,res){
    res.sendFile('home.html',{'root': __dirname + '/public'});
});

app.get('/showSignInPage',function(req,res){
    res.sendFile('signin.html',{'root': __dirname + '/public'});
});

app.get('/showSignInPageretry',function(req,res){
    res.sendFile('signinretry.html',{'root': __dirname + '/public'});
});

app.get('/showSignUpPage',function(req,res){
  res.sendFile('signup.html',{'root':__dirname + '/public'})
});

app.get('/registered',function(req,res){
    res.sendFile('registered.html',{'root': __dirname + '/public'});
});

app.get('/account',function(req,res){
    res.sendFile('account.html',{'root': __dirname + '/public'});
});

app.post('/register', function(req, res) {
	console.log(req.body);
  if(users.get(req.body.inputEmail)){
    cosole.log("User already exists");
    res.redirect('/showSignUpPage');
    res.end();
  }
  else{
    users.set(req.body.inputEmail, {pass: req.body.inputPassword, countries: []});
    res.redirect('/registered');
    res.end();
  }

});

app.post('/verifyuser', function(req,res){

	console.log(users);
  console.log('req.body');
  console.log(req.body);

  if(users.get(req.body.inputEmail)){
    if(users.get(req.body.inputEmail).pass = req.body.inputPassword){
      console.log("user verified!");
      //var string = encodeURIComponent(req.body.inputEmail);
      var string = req.body.inputEmail;
      res.redirect('/account?valid='+string);
      res.end();
    }
    else{
      console.log("wrong password");
      res.redirect('/showSignInPageretry');
      res.end();
    }
  }
  else{
    console.log("user not found");
    res.redirect('/showSignInPageretry');
    res.end();
  }

});


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('saveData', function (data) {
    console.log('saving data');
    console.log('user ', data.user);
    console.log('countries ', data.countries);
    let password = users.get(data.user).pass;
    users.set(data.user, {pass: password, countries: data.countries});
  });

  socket.on('initialize', function (data) {
    console.log('initialize username: ', data);
    console.log('socket id: ', socket.id)
    clients.set(data, socket.id);
    let userCountries = users.get(data).countries;
    console.log(clients.get(data));
    io.to(clients.get(data)).emit('initialize', {countries: userCountries});
  });

  socket.on('disconnect', function() {
        clients.delete(socket.id);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
