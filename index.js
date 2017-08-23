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

app.get('/getData', function(request, response) {
  console.log('req', request);
  var email = request.query.email;
  console.log('email: ', email);
  var userCountries = users.get(email).countries;
  // We want to set the content-type header so that the browser understands
  //  the content of the response.
  response.contentType('application/json');

  // Normally, the would probably come from a database, but we can cheat:
  /*
  var countries = [
    { name: 'Dave', location: 'Atlanta' },
    { name: 'Santa Claus', location: 'North Pole' },
    { name: 'Man in the Moon', location: 'The Moon' }
  ];*/

  // Since the request is for a JSON representation of the people, we
  //  should JSON serialize them. The built-in JSON.stringify() function
  //  does that.
  var countryJSON = JSON.stringify(userCountries);

  // Now, we can use the response object's send method to push that string
  //  of people JSON back to the browser in response to this request:
  response.send(countryJSON);
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

app.post('/saveData', function(req,res){
  var user_name = req.body.user;
  var user_countries = req.body.countries;
  let password = users.get(user_name).pass;
  users.set(user_name, {pass: password, countries: user_countries});

});



http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
