const Hostname = require('../models/hostname')
const Domain = require('../models/domain')
const express = require('express')
const router = express.Router()
const Etcd = require('../etcd')

// Get List Hostname
router.get('/',(req, res, next)=> {
  if (req.user.isadmin ==1) {
    Hostname.getAllHostname((err, hostnames) => {
      if (err) throw err
      Domain.getAllDomains((err, domains) => {
        if (err) throw err
        return res.render('hostnames', {hostnames:hostnames, domains:domains})
      })
    })
  } else {
    Hostname.getHostnameByUser(req.user.id, (err, hostnames) => {
      if (err) throw err
      Domain.getAllDomains((err, domains) => {
        if (err) throw err
        return res.render('hostnames', {hostnames:hostnames, domains:domains})
      })
    })
  }
})

// Add Hostname
router.get('/add', (req, res, next)=> {
  Domain.getAllDomains((err, domains) => {
    if (err) throw err
    res.render('add_hostname', {domains:domains})
  })
})

// Add Hostname
router.post('/add', (req, res, next)=> {
  const domain = req.body.domain
  const user = req.user.id
  const name =req.body.name.toLowerCase()
  req.checkBody('name').matches(/^([0-9A-z\_\-]+)$/, 'g').withMessage('Hostname must be alphanumeric, and can contain underscores')
  let errors = req.validationErrors()
  if (errors) {
    Domain.getAllDomains((err, domains) => {
      if (err) throw err
      req.flash('errors', errors)
      res.redirect('/hostnames')
    })
  }  else {    
    Hostname.getHostnameByName(name, (err,hostname)=> {
      if (err) throw err
      if (hostname.length>0) {
        req.flash('error_msg', 'Hostname is exits')
        res.redirect('/hostnames')
      } else {
        Hostname.addHostname(name, domain, user, (err, rows)=> {
        if (err) throw err
        req.flash('success_msg', 'Hostname add success')
        res.redirect('/hostnames')
        })
      }    
    })
  }
})

// Delete Hostname
router.get('/delete/:id',(req, res, next)=> {
  const hostid = req.params.id
  const userid = req.user.id
  Hostname.getHostnameById(hostid, (err, hostname) => {
    if (err) throw err
    if (hostname.length<1) {
      req.flash('error_msg', 'Hostname not found')
      res.redirect('/')
    }
    else {
      if (req.user.isadmin==1 || hostname[0].userid ==userid) {
        let domain = hostname[0].domainname
        let arr = domain.split(".")
        let namespace = "/dns/"+arr.reverse().join("/") +"/"
        Hostname.deleteHostnameById(hostname[0].id, (err, rows)=> {
          if (err) throw err
          Etcd.deleteRecord(namespace, hostname[0].name)
          req.flash('success_msg', 'Delete hostname success')
          res.redirect('/hostnames')
        })
      } else {
        req.flash('error_msg', 'Hostname not found or permission deny')
        res.redirect('/hostnames')
      } 
    }
  })
})

module.exports = router
