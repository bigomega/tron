var express = require('express.io');
var fs = require('fs');
var users = require('users');
var app = express();
// var routes = require('./routes');
// var config = require('./oauth.js')
var mongo = require('mongodb')
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google').Strategy;

app.http().io();


var dota = ['desolater', 'ursa warrior', 'centaur warcheif', 'templar assassin', 'invoker', 'legion commander', 'blood seeker', 'ancient apparition', 'crystal maiden', 'queen of pain', 'storm spirit', 'riki', 'bounty hunter', 'pudge', 'earth shaker', 'viper', 'dragon knight', 'enigma', 'nature prophet', 'faceless void', 'pugna', 'shadow sharman', 'witch doctor', 'life stealer'];

// connect to the database

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('tron', server, {safe: true});

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'tron' database");
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.uid);
});

passport.deserializeUser(function(id, done) {
  db.collection('users', function(error, collection) {
    collection.find({uid: id}, function(err, user) {
      if(!err) done(null,user)
      else done(err,null)
    });
  });
});

passport.use(new FacebookStrategy({
  clientID: '355894807818946',
  clientSecret: '99d286cfece2e55abcdaa8f2a2f14a1f',
  callbackURL: "http://gdqjqnqtxo.localtunnel.me/fb"
},
function(accessToken, refreshToken, profile, done) {
  console.log(refreshToken, accessToken);
    // User.findOrCreate({}, function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
    // done('ada', 'zz');
  db.collection('users', function(err, collection) {
    collection.findOne({'uid': profile.provider+'-'+profile.id }, function(err, user) {
      if(err) { console.log(err); }
      if (!err && user != null) {
        done(null, user);
      } else {
        collection.insert({
          uid: profile.provider+'-'+profile.id,
          auth_id: profile.id,
          auth_type: profile.provider,
          name: profile.displayName,
          created: Date.now(),
        }, {safe:true}, function(err, result) {
            if (err) {
                console.log({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
              done(null, user);
            }
        });
      }
    });
  });
}));
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

app.get('/account', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
   if(err) {
     console.log(err);
   } else {
     res.render('account', { user: user});
   };
  });
});

app.get('/dashboard', ensureAuthenticated, function (req, res){
  //
  res.end();
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
