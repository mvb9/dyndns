const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash =require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const {checkAuthenticated,checkAdminPermission } = require('./auth')

const index = require('./routers/index')
const domains = require('./routers/domains')
const users = require('./routers/users')
const hostnames = require('./routers/hostname')
const nic = require('./routers/nic')

const app = express()
// Port
const port = 3000
// Set Engine
app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'pug')

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Parser body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('errors');
  res.locals.user = req.user || null
  res.locals.moment = require('moment')
  next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root

    while(namespace.length) {
      formParam += '[' +namespace.shift() + ']'

    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}))

app.use('/nic', nic)
app.use('/',index)
app.use('/domains',checkAuthenticated, checkAdminPermission,domains)
app.use('/hostnames',checkAuthenticated, hostnames)
app.use('/users',users)




app.listen(port, ()=> {
  console.log('Service running on port:'+port)
})