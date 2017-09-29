var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg');
var MapboxClient = require('mapbox');
var passwordHash = require('password-hash');
var cookieParser = require('cookie-parser');

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
var token = 'pk.eyJ1Ijoia2V2aW5pcmFjZSIsImEiOiJjajY0M2ExZDIxbm1hMzNwOHp0cWpzbjJkIn0.g_KHQKSe60ViArp6hW-2TA';
var client = new MapboxClient(token);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-fo
app.use(cookieParser("K secret"));

app.use('/node_modules',  express.static(__dirname + '/node_modules'));

app.use('/style',  express.static(__dirname + '/style'));

app.use('/images',  express.static(__dirname + '/images'));


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

app.get('/logOut', function(req, res) {
  res.clearCookie('myUsername');
  console.log('Logging Out');
});


app.get('/getData', function(request, response) {

  var email = request.signedCookies['myUsername'];
  console.log('email: ', email);
  response.contentType('application/json');
  var res = {};
  var countries = [], cities = [];

  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    client.query('SELECT country FROM user_countries WHERE username = $1 ;', [email], function(err, result) {

      if(err) {
        return console.error('error running query', err);
      }
      for(i = 0; i < result.rows.length; i++){
        countries.push(result.rows[i].country);
      }
      console.log(countries);
      res.countryList = countries;

      client.query('SELECT city FROM user_cities WHERE username = $1 ;', [email], function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }

        for(i = 0; i < result.rows.length; i++){
          cities.push(result.rows[i].city);
        }
        console.log(cities);
        res.cityList = cities;
        console.log(res);
        response.json(res);
      });
    });
  });

});

app.get('/getCountries', function(request, response) {
  response.contentType('application/json');
  results = [];
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * FROM countries;', function(err, result) {
    done();
    if(err) {
      return console.error('error running query', err);
    }
    for(i = 0; i < result.rows.length; i++){
      temp = [result.rows[i].name, result.rows[i].continent];
      results.push(temp);
    }
    response.json(results);
  });
  });
});

app.get('/addCity', function(request, response) {
  response.contentType('application/json');
  var query = String(request.query.city);
  var result;
  client.geocodeForward(query, {
    limit: 1,
    types: 'place'
  }, function(err, data, res) {
    result = data;
    console.log('ADDED CITY: ', result);
    response.json(result);
  });
});

app.post('/register', function(req, res) {
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  var hashedPassword = passwordHash.generate(req.body.inputPassword);

  client.query('INSERT INTO users VALUES ($1, $2, DEFAULT, DEFAULT);',[req.body.inputEmail, hashedPassword], function(err, result) {
    done();
    if(err) {
      return console.error('error running query', err);
      res.redirect('/showSignUpPage');
      res.end();
    }
    res.redirect('/registered');
    res.end();
  });

});
});

app.post('/verifyuser', function(req,res){

  pool.connect(function(err, client, done) {

  if(err) {
    return console.error('error fetching client from pool', err);
  }

  client.query('SELECT password FROM users WHERE username = $1 ;', [req.body.inputEmail], function(err, result) {

    done();

    if(err) {
      return console.error('error running query', err);
    }

    if(result.rows.length < 1){
      res.redirect('/showSignInPageretry');
      res.end();
    }
    else{
      let hashPW = result.rows[0].password;
      if(passwordHash.verify(req.body.inputPassword, hashPW)){
        let options = {
          httpOnly: true, // The cookie only accessible by the web server
          signed: true // Indicates if the cookie should be signed
        }
        res.cookie('myUsername', req.body.inputEmail, options);
        res.redirect('/account');
        res.end();
      }
      else{
        console.log("user not found");
        res.redirect('/showSignInPageretry');
        res.end();
      }
    }
  });
  });
});

app.post('/updateCountryDB', function(req,res){

  var action = req.body.action;
  var country = req.body.country;
  var user_name = req.signedCookies['myUsername'];
  var query = '';

  if(action === 'ADD'){
    query = 'INSERT INTO user_countries VALUES ($1, $2);'
  }
  if(action === 'REMOVE'){
    query = 'DELETE FROM user_countries WHERE username = $1 AND country = $2;';
  }

  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query(query, [user_name, country], function(err, result) {
    done();
    if(err) {
      return console.error('error running query', err);
    }
  });
  });
});

app.post('/updateCityDB', function(req,res){

  var action = req.body.action;
  var city = req.body.city;
  var user_name = req.signedCookies['myUsername'];
  var query2 = '';

  if(action === 'ADD'){
    query2 = 'INSERT INTO user_cities VALUES ($1, $2) ON CONFLICT DO NOTHING;'
  }
  if(action === 'REMOVE'){
    query2 = 'DELETE FROM user_cities WHERE username = $1 AND city = $2;';
  }

  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query(query2, [user_name, city], function(err, result) {
    done();
    if(err) {
      return console.error('error running query', err);
    }
  });
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
