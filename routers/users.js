const Hostname = require('../models/hostname')
const User = require('../models/user')
const express = require('express')
const router = express.Router()
const utils = require('../utils')
const moment = require('moment')
const sendmail = require('../sendmail')
const {checkAuthenticated,checkAdminPermission } = require('../auth')

router.get('/',checkAdminPermission,(req, res, next)=> {
  User.getAllUser((err, users) => {
    if (err) throw err
    res.render('users', {users:users})
  })
})

router.get('/add',checkAdminPermission, (req, res, next)=> {
  res.render('add_user')
})

router.post('/add',checkAdminPermission, (req, res, next)=> {
  const name  = req.body.name.toLowerCase()
  const email = req.body.email.toLowerCase()
  const password = req.body.password
  const isadmin = req.body.isadmin
  const isVerify = 1
  const verifycode = null
  req.checkBody('name', 'Username field is required').notEmpty()
  req.checkBody('email', 'Email must be a valid email address').isEmail()
  req.checkBody('password', 'Password field is required').notEmpty().isLength({min:6}).withMessage('Password require min 6 character')
  req.checkBody('password2', 'Password does not match').equals(req.body.password)
  let errors = req.validationErrors()
  if (errors) {
    res.render('add_user', {
      errors: errors
    })
  } else {
    User.getAllUser(async (err, users)=> {
      userExits = undefined
      users.forEach(element => {
        if (element.username ==name || element.email ==email) {
          userExits =1
        }
      })          
      if (userExits) {
        req.flash('error_msg', 'Account was registered')
        return res.redirect('/users')
      }
      else {
        User.addUser(name, email, password, isadmin, isVerify, verifycode,(err, rows)=> {
          if (err) { throw err }
          req.flash('success_msg', 'Add Account success')
          return res.redirect('/users')
        })
      } 
    })
  }

})

router.get('/:user/changepass', checkAuthenticated,(req, res, next) => {
  res.render('changepass', {username:req.params.user})
})

// Change password
router.post('/changepass',checkAuthenticated, (req,res,next)=>{
  if(req.user.isadmin == 1 || req.user.username == req.body.username ) {
    const username = req.body.username
    const password = req.body.password
    req.checkBody('password', 'Password field is required').notEmpty().isLength({min:6}).withMessage('Password require min 6 character')
    req.checkBody('password2', 'Password does not match').equals(req.body.password)
    let errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      res.redirect('/')
    } else {
      User.updatePassword(username, password, (err, rows)=> {
        if (err) throw err
        req.flash('success_msg', 'Password update success')
        res.redirect('/')
        })
    }
  }
  else {
    req.flash('error_msg', 'Permission deny')
    res.redirect('/')
  }
})

// Reset Password
router.get('/resetpasswd', (req, res, next) => {
  res.render('resetpasswd')
})

router.post('/resetpasswd', (req,res,next)=>{
    const email = req.body.email
    req.checkBody('email', 'Format in correct ').isEmail()
    let errors = req.validationErrors()
    if (errors) {
      req.flash('errors', errors)
      res.redirect('/')
    } else {
      User.getAllUser((err, users)=>{
        let account = null
        users.forEach(user => {
          if (user.email ==email) {
            account = user
          }
        })
        if(account) {
          const verifycode = utils.randomCode(25)
          const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          User.genCode(account.id,verifycode,date,async (err, rows) => {
            const link = "http://127.0.0.1:3000/users/confirmreset/"+verifycode
            const type ="reset"
            console.log(account.email,type, link)
            await sendmail.Sendmail(account.email, type, link)
            req.flash('success_msg', 'Please check mail fo confirm')
            res.redirect('/login')
          })
        }
        else {
          req.flash('error_msg', "Email not found")
           res.redirect('/login')
        }
      })     
    }
})


// Confirm reset
router.get('/confirmreset/:code', (req, res, next) => {
  res.render('confirmreset', {code:req.params.code})
})

// Update Password 
router.post('/confirmreset/:code', (req, res, next)=> {
  const password = req.body.password
  req.checkBody('password', 'Password field is required').notEmpty().isLength({min:6}).withMessage('Password require min 6 character')
  req.checkBody('password2', 'Password does not match').equals(req.body.password)
  let errors = req.validationErrors()
  if (errors) {
    res.render('register', {
      errors: errors
    })
  }
  else {
    let user = null
    User.getAllUser( (err, users)=> {
      if (err) throw err
      users.forEach(element => {
        if (element.verifyCode ==req.params.code) {
          user = element
        }
      })
      if (user && moment(user.request_date).startOf('hour').fromNow() < 24) {
        User.updatePassword(user.username, password, (err, rows)=> {
          if (err) throw err
          req.flash('success_msg', 'Password update success')
          res.redirect('/login')
          })
      } else {
        req.flash('error_msg', 'Sorry token not found or time expired')
        res.redirect('/login')
      }

    })
  }         
})

router.get('/:user',checkAuthenticated,(req, res, next)=> {
  if (req.user.isadmin ==1 || req.user.username==req.params.user ) {
    User.getUserByName(req.params.user,(err, account) => {
      if (err) throw err
      Hostname.getHostnameByUser(account[0].id, (err, hostnames)=>{
        if (err) throw err
        res.render('user', {account:account[0], hostnames: hostnames})
      })
    })
  } else {
    req.flash('error', 'Permission deny')
    res.redirect('/')
  }
})

router.get('/delete/:userid',checkAdminPermission,(req, res, next)=> {
  if (req.user.isadmin==1)
  {
    Hostname.deleteHostnameByUser(req.params.userid, (err, hostname)=> {
      if(err) throw err
      User.deleteUser(req.params.userid,(err, rows) => {
        if (err) throw err
        req.flash('success_msg', 'Delete account success')
        res.redirect('/users')
      })
    })
  } else {
      req.flash('error_msg', 'Permission deny')
      res.redirect('/users')
  }

})

module.exports = router
