var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');

const config = {
  user: 'ajoxkpklisbuqh',
  password: '03f38407bd8de6f8ff7aec1b18c89139bcdaefd2e74facd8132800cad3405e08',
  host: 'ec2-54-163-237-25.compute-1.amazonaws.com',
  port: '5432',
  database: 'dahd3h9qg8blj',
  ssl: true
};

var pool = new pg.Pool(config);

var bodyParser = require('body-parser');

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
  var email = request.query.email;
  console.log('email: ', email);
  response.contentType('application/json');

  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('SELECT countries FROM user_data WHERE username = $1 ;', [email], function(err, result) {
    //call 'done()' to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    console.log(result.rows[0].countries);
    response.json(result.rows[0].countries);

    //output: 1
  });
});

});

app.post('/register', function(req, res) {
	console.log(req.body);
  /*
  if(users.get(req.body.inputEmail)){
    cosole.log("User already exists");
    res.redirect('/showSignUpPage');
    res.end();
  }
  else{
    users.set(req.body.inputEmail, {pass: req.body.inputPassword, countries: []});
    res.redirect('/registered');
    res.end();
  }*/

  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('INSERT INTO user_data VALUES ($1, $2, DEFAULT, DEFAULT);',[req.body.inputEmail, req.body.inputPassword], function(err, result) {
    //call 'done()' to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
      res.redirect('/showSignUpPage');
      res.end();
    }

    console.log(result);
    console.log(result.rows[0]);
    res.redirect('/registered');
    res.end();
    //output: 1
  });

});
});

app.post('/verifyuser', function(req,res){
  console.log('req.body');
  console.log(req.body);
  /*
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
  }*/
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('SELECT password FROM user_data WHERE username = $1 ;', [req.body.inputEmail], function(err, result) {
    //call 'done()' to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    console.log(result.rows[0]);

    if(result.rows[0].password == req.body.inputPassword){
      var string = req.body.inputEmail;
      res.redirect('/account?valid='+string);
      res.end();
    }
    else{
      console.log("user not found");
      res.redirect('/showSignInPageretry');
      res.end();
    }

  });
});
});

app.post('/saveData', function(req,res){
  var user_name = req.body.user;
  var user_countries = JSON.stringify(req.body.countries);

  user_countries = user_countries.replace('[','{').replace(']','}');
  console.log('to be saved: ', user_countries);

  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('UPDATE user_data SET countries = $1 WHERE username = $2 ;', [user_countries, user_name], function(err, result) {
    //call 'done()' to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    console.log(result.rows[0]);
    //output: 1
  });
});
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
