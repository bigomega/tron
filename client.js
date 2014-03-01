var express = require('express.io');
var fs = require('fs');
var users = require('users');
var app = express();

app.http().io();

var passport = require('passport')
, FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google').Strategy;

var dota = ['desolater', 'ursa warrior', 'centaur warcheif', 'templar assassin', 'invoker', 'legion commander', 'blood seeker', 'ancient apparition', 'crystal maiden', 'queen of pain', 'storm spirit', 'riki', 'bounty hunter', 'pudge', 'earth shaker', 'viper', 'dragon knight', 'enigma', 'nature prophet', 'faceless void', 'pugna', 'shadow sharman', 'witch doctor', 'life stealer'];

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: '355894807818946',
  clientSecret: '99d286cfece2e55abcdaa8f2a2f14a1f',
  callbackURL: "http://gdqjqnqtxo.localtunnel.me/fb"
},
function(accessToken, refreshToken, profile, done) {
 process.nextTick(function () {
   return done(null, profile);
 });
 console.log(refreshToken, accessToken);
    // User.findOrCreate({}, function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
    // done('ada', 'zz');
  }
));
// passport.use(new TwitterStrategy({
//  consumerKey: config.twitter.consumerKey,
//  consumerSecret: config.twitter.consumerSecret,
//  callbackURL: config.twitter.callbackURL
// },
// function(accessToken, refreshToken, profile, done) {
//  process.nextTick(function () {
//    return done(null, profile);
//  });
// }
// ));
// passport.use(new GithubStrategy({
//  clientID: config.github.clientID,
//  clientSecret: config.github.clientSecret,
//  callbackURL: config.github.callbackURL
// },
// function(accessToken, refreshToken, profile, done) {
//  process.nextTick(function () {
//    return done(null, profile);
//  });
// }
// ));
// passport.use(new GoogleStrategy({
//  returnURL: config.google.returnURL,
//  realm: config.google.realm
// },
// function(identifier, profile, done) {
//  process.nextTick(function () {
//    profile.identifier = identifier;
//    return done(null, profile);
//  });
// }
// ));

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
// app.engine('html', require('ejs').renderFile)
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

app.get('/', ensureAuthenticated, function (req, res){
  res.render('index');
});
app.get('/login', function (req, res){
  res.render('login');
});

app.get('/zzz', function (req, res){
  // console.log(req.user)
  res.send('zzz');
});

app.get('/dashboard', ensureAuthenticated, function (req, res){
  //
});

// app.post('/create/:name', function (req, res){
//   name = req.params.name || '';
//   req.query.name || dota[Math.floor(Math.random() * dota.length)]
//   console.log('Checking/Creating user '+ name);
//   res.set('Content-Type', 'text/json');
//   if(users.get()){
//     res.send(412, {})
//   } else {
//     users
//     res.send(200, {id: name})
//   }
// });


app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/fb', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res){
  res.redirect('/dashboard')
});
// app.get('/auth/twitter',
//   passport.authenticate('twitter'),
//   function(req, res){
//   });
// app.get('/auth/twitter/callback',
//   passport.authenticate('twitter', { failureRedirect: '/' }),
//   function(req, res) {
//    res.redirect('/account');
//  });
// app.get('/auth/github',
//   passport.authenticate('github'),
//   function(req, res){
//   });
// app.get('/auth/github/callback',
//   passport.authenticate('github', { failureRedirect: '/' }),
//   function(req, res) {
//    res.redirect('/account');
//  });
// app.get('/auth/google',
//   passport.authenticate('google'),
//   function(req, res){
//   });
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   function(req, res) {
//    res.redirect('/account');
//  });
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT || 9090);

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
