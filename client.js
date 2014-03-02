var _ = require('underscore');
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
var rooms = {};
var findInRooms = function(id){
  for(x in rooms){
    if(rooms[x].players[id]){
      return x;
    }
  }
  return false;
};
var getPlayersInRoom = function(rid){
  return _.map(rooms[rid] && rooms[rid].players, function(v){ return v;});
};

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
    collection.findOne({uid: id}, function(err, user) {
      if(!err) done(null,user)
      else done(err,null)
    });
  });
});

passport.use(new FacebookStrategy({
  clientID: '355894807818946',
  clientSecret: '99d286cfece2e55abcdaa8f2a2f14a1f',
  callbackURL: 'http://wqialikuuj.localtunnel.me/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
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
          image: 'http://graph.facebook.com/'+profile.id+'/picture'
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
//   consumerKey: config.twitter.consumerKey,
//   consumerSecret: config.twitter.consumerSecret,
//   callbackURL: config.twitter.callbackURL
// },
// function(accessToken, refreshToken, profile, done) {
//   process.nextTick(function () {
//     return done(null, profile);
//   });
// }
// ));
passport.use(new GithubStrategy({
  clientID: '0875c7c49030f736d2ab',
  clientSecret: 'e80252b32d9111a0377c80f483de80119b552066',
  callbackURL: 'http://wqialikuuj.localtunnel.me/auth/github/callback'
},
function(accessToken, refreshToken, profile, done) {
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
          image: profile._json.avatar_url,
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


app.io.route('connect', function (req, res){
  var user = req.session && req.session.passport && req.session.passport.user
  if(user){
    // if()
  }
});

app.io.route('disconnect', function (req, res){
  //
  console.log("DC");
  console.log("user: "+(req.session && req.session.passport &&req.session.passport.user));
});

app.io.route('create:room', function(req) {
  var uid = req.session.passport.user;
  console.log('creating room: ', uid);
  req.io.join(uid);
  rooms[uid] = {
    id: uid,
    creator: req.session.user.name,
    creator_image: req.session.user.image,
    users: 1,
    state: 'waiting',
    players: {},
  };
  rooms[uid].players[uid] = req.session.user;
  app.io.broadcast('add:room-list', {
    id: uid,
    name: req.session.user.name,
    image: req.session.user.image
  });
  req.io.respond({ success: 'Creted a room by: ' + uid });
});

app.io.route('join:room', function(req){
  var uid = req.session.passport.user;
  var data = req.data || {};
  console.log('joining room: ', uid);
  req.io.join(data.room);
  room[id].players[uid] = req.session.user;
  room[id].users += 1;
  app.io.room(id).broadcast('update:player-list', {list: getPlayersInRoom(id)})
});

app.io.route('leave:room', function(req){
  var uid = req.session.passport.user;
   //
});

app.get('/', ensureAuthenticated, function (req, res){
  var uid = req.session.passport.user
  db.collection('users', function(error, collection) {
    collection.findOne({uid: uid}, function(err, user) {
      req.session.user = user;
      res.render('dashboard',{
        list: _.map(rooms, function(v,i) { return {name: v.creator, id: v.id}})
      });
    });
  });
});
app.get('/login', function (req, res){
  res.render('login');
});

app.get('/account', ensureAuthenticated, function(req, res){
   if(err) {
     console.log(err);
   } else {
     res.render('account', { user: req.session.user});
   };
});

app.get('/dashboard', ensureAuthenticated, function (req, res){
  res.redirect('/');
});

app.get('/room/:id', ensureAuthenticated, function (req, res){
  var id = req.params.id || '';
  var uid = req.session.passport.user;
  if(id == 'create'){
    res.redirect('/room/'+uid);
  } else if(id == ''){
    res.render('404', {message: 'Room not found'});
  } else if(rooms[id] && rooms[id].users >= 4){
    res.render('404', {message: 'Room full... Please select another room'});
  } else if(!rooms[id] && uid != id){
    res.render('404', {message: 'Room does not exits... Please create a room or join from list'});
  // } else if(rooms[id] && ){
  //   //
  } else {
    var arr = [];
    if(uid != id)
      arr = _.map(rooms[id].players, function(v,i) { return v.name});
    arr.push(req.session.user.name);
    console.log(arr)
    res.render('room', {
      user: req.session.user,
      room: id,
      list: arr
    });
  }
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
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res){
  res.redirect('/')
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
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
   res.redirect('/');
 });
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
  // return next();
}
