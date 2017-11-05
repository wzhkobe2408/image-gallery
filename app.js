var express = require('express');
var multer = require('multer');
var ejs = require('ejs');
var path = require('path');
var mongoose = require('mongoose');

//set storage engine
var storage = multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() +
    path.extname(file.originalname));
  }
});

//init upload
var upload = multer({
  storage:storage,
  limits:{fileSize:1000000},
  fileFilter:function(req, file ,cb) {
    checkFileType(file, cb);
  }
}).single('myImage');

//check fileType
function checkFileType(file, cb) {
  //allowed extensions
  var filetypes = /jpeg|jpg|png|gif/;
  //check extname
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mimetype
  var mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

var Image = require('./models/image');

mongoose.connect('mongodb://localhost/image-uploader', { useMongoClient: true });
mongoose.Promise = global.Promise;

var app = express();

app.set('view engine','ejs');

app.use(express.static('./public'));

app.get('/', (req, res) => {
  Image.find()
    .then(Images => {
      res.render('index',{
        images:Images
      });
    })
});

app.get('/upload', (req, res) => {
  res.render('upload')
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err) {
      res.render('upload',{
        msg: err
      });
    } else {
      if(req.file == undefined) {
        res.render('upload',{
          msg: 'Error: No File Selected!'
        });
      } else {
        var newImage = new Image();
        newImage.filename = req.file.filename;
        newImage.path = req.file.path;
        Image.create(newImage)
          .then(newImage => {
            console.log('successfully upload and save to database');
          })
          .catch(err => {
            console.log(err);
          });
        res.render('upload', {
          msg:'File Uploaded!',
          file:`uploads/${req.file.filename}`
        });
      }
    }
  });
});

app.get('/login',(req, res) => {
  res.render('login');
});

app.get('/signup',(req, res) => {
  res.render('signup');
});

var port = 3000 || process.env.PORT;

app.listen(port, () => {
  console.log("App is running on port " + port);
})
