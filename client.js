var express = require('express.io');
var fs = require('fs');
var users = require('users');
var app = express();

var dota = ['desolater', 'ursa warrior', 'centaur warcheif', 'templar assassin', 'invoker', 'legion commander', 'blood seeker', 'ancient apparition', 'crystal maiden', 'queen of pain', 'storm spirit', 'riki', 'bounty hunter', 'pudge', 'earth shaker', 'viper', 'dragon knight', 'enigma', 'nature prophet', 'faceless void', 'pugna', 'shadow sharman', 'witch doctor', 'life stealer'];

app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname+'/views');

app.get('/', function (req, res){
  res.render('index.html');
});

app.post('/create/:name', function (req, res){
  name = req.params.name || '';
  req.query.name || dota[Math.floor(Math.random() * dota.length)]
  console.log('Checking/Creating user '+ name);
  res.set('Content-Type', 'text/json');
  if(users.get()){
    res.send(412, {})
  } else {
    users
    res.send(200, {id: name})
  }
});

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: '355894807818946',
    clientSecret: '99d286cfece2e55abcdaa8f2a2f14a1f',
    callbackURL: "http://gdqjqnqtxo.localtunnel.me/fb"
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));

app.listen(process.env.PORT || 9090);
