var express = require('express');
var app = express();

app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname+'/views');

app.get('/', function (req, res){
  res.render('index.html');
});

app.get('/create/:name', function (req, res){
  name = req.params[0] || '';
  console.log('Checking user '+ name);
});

app.listen(process.env.PORT || 9090);
