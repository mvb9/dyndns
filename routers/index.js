const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const moment = require('moment')
const Utils = require('../utils')
const { check, validationResult } = require('express-validator/check')
const sendmail = require('../sendmail')
const {checkAuthenticated,checkAdminPermission } = require('../auth')

// Home Page
router.get('/', checkAuthenticated,(req, res, next)=>{
  res.redirect('/hostnames')
})


// Login Form
router.get('/login', (req, res, next)=>{
  res.render('login')
})

// Logout
router.get('/logout', checkAuthenticate,(req, res, next)=>{
  req.logout()
  req.flash('success_msg', 'You are logout')
  res.redirect('/login')
})
// Register Form
router.get('/register', (req, res, next)=>{
  res.render('register')
})

// Process register
router.post('/register', (req, res, next)=> {
  const name  = req.body.name.toLowerCase()
  const email = req.body.email.toLowerCase()
  const password = req.body.password
  const verifycode = Utils.randomCode(25)
  const isadmin = null
  const isVerify = 0
  let userExits = 0
  
  // Register Account
  req.checkBody('name', 'Username field is required').notEmpty()
  req.checkBody('email', 'Email must be a valid email address').isEmail()
  req.checkBody('password', 'Password field is required').notEmpty().isLength({min:6}).withMessage('Password require min 6 character')
  req.checkBody('password2', 'Password does not match').equals(req.body.password)
  let errors = req.validationErrors()
  if (errors) {
    res.render('register', {
      errors: errors
    })
  } else {
    User.getAllUser( (err, users)=> {
      if (err) throw err
      users.forEach(element => {
        if (element.username ==name || element.email ==email) {
          userExits =1
        }
      })         
      if (userExits==1) {
        req.flash('error_msg', 'Account was registered')
        return res.redirect('/register')
      }
      else {
        User.addUser(name, email, password, isadmin, isVerify, verifycode, async (err, rows)=> {
          if (err) { throw err }
          const link = "http://127.0.0.1:3000/verify/"+verifycode
          const type ="confirm"
          await sendmail.Sendmail(email, type, link)
          req.flash('success_msg', 'User register success, please active mail')
          return res.redirect('/login')
        })
      }
    })
    }
})

// Local Strategy
passport.use(new LocalStrategy((username, password, done)=> {
  User.getUserByName(username, (err, user)=>{
    if (err) throw err
    if(!user[0]) {
      return done(null, false, {message: 'Login failed'})
    }
    User.comparePassword(password, user[0].password, (err, ismatch)=> {
      if(err) throw err
      if (user[0].isVerify!=1) {
        return done(null, false, {message: 'Please active account'})
      }
      else if(ismatch) {
        let date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        
        User.updateDate(user[0].id, date, (err, rows) =>{
          if (err) throw err
          return done(null, user[0])
        })
      } else {
        return done(null, false, {message: 'Login failed'})
      }

    })
  })
}))

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, function(err, user) {
    done(err, user[0]);
  });
});

// Login Proccess
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/hostnames',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next)
})
function checkAuthenticate(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error_msg', 'You are not authorized')
    res.redirect('/login')
  }
}

// Verify Account After Register
router.get('/verify/:code',check('code').isAlphanumeric(), (req, res, next)=>{
  const verifycode = req.params.code
  const errors = validationResult(req)
  if (!errors.isEmpty()){
    req.flash('errors', errors)
    req.redirect('/login')
  }
  User.getAllUser((err, users) => {
    if (err) throw err
    let account = null
    users.forEach(user => {
      if (user.verifyCode == verifycode && user.isVerify ==0) {
        account = user
         
       }
    })
    if(account) {
      User.verifyUser(account.id, (err, rows) => {
        req.flash('success_msg', 'Acctive success, please login')
        res.redirect('/login')
      })
    }
    else {
      req.flash('error_msg', "Account not found or code failed")
      res.redirect('/login')
    }
  })
})

module.exports= router