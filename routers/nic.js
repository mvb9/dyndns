const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Hostname = require('../models/hostname')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const moment = require('moment')
const { check, validationResult } = require('express-validator/check')
const Etcd = require('../etcd')

passport.use(new BasicStrategy(
  (username, password, done)=> {
    User.getUserByName(username, (err, user)=>{
      if (err) throw err
      if(!user[0]) {
        return done(null, false,'badauth')
      }
      User.comparePassword(password, user[0].password, (err, ismatch)=> {
        if(err) throw err
        if(ismatch) {
          return done(null, user[0])
        } else {
          return done(null, false, 'badauth')
        }
  
      })
    })
  }
));

// Update IP
router.get('/update', 
  passport.authenticate('basic', { session: false } ), check('hostname').isFQDN(),
  check('myip').isIP() , (req, res) => {
    const hostname = req.query.hostname.toLowerCase()
    const ip = req.query.myip
    let date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(422).send('notfqdn')
    } else if (req.user.isadmin ==1) {
      Hostname.getAllHostname((err, hostnames) => {
        hostnames.forEach( element => {
            let path = element.name +'.' +element.domainname
            if (hostname==path) {
              Hostname.updateHostname(element.id, ip, date, (err, rows) => {
                if (err) throw err
                domain = element.domainname
                arr = domain.split(".")
                namespace = "/dns/"+arr.reverse().join("/") +"/"
                let record = '{"host":'+'"'+ip+'"'+',"ttl":60}'
                Etcd.addRecord(namespace, element.name, record)
                return res.status(200).send('good '+ip).end()
              })
            }
            else {
              return res.status(422).send('nohost')
            }
        })
      })
    }
     else {
      Hostname.getHostnameByUser(req.user.id,async (err, hostnames)=> {
        if (err) throw err
        let host = undefined
        await hostnames.forEach( element => {
          let path = element.name +'.' +element.domainname
          if (hostname==path) {
            host = element
          }
        })
        if (host)
         {
          Hostname.updateHostname(host.id, ip, date, (err, rows) => {
            if (err) throw err
            domain = host.domainname
            arr = domain.split(".")
            namespace = "/dns/"+arr.reverse().join("/") +"/"
            let record = '{"host":'+'"'+ip+'"'+',"ttl":60}'
            Etcd.addRecord(namespace, host.name, record)
            return res.status(200).send('good '+ip).end()
          })
         }
         else {
           return res.status(422).send('nohost')
         }
      })
    }
  })


module.exports = router