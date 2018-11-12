const Domain = require('../models/domain')
const Hostname = require('../models/hostname')
const express = require('express')
const router = express.Router()
const Etcd = require('../etcd')

// Get List Domain
router.get('/',(req, res, next)=> {
  Domain.getAllDomains((err, domains) => {
    if (err) throw err
    res.render('domains', {domains:domains})
  })
})

// Add Domain
router.get('/add', (req, res, next)=> {
  res.render('add_domain')
})

// Add new Domain
router.post('/add', (req, res, next)=> {
  const domainname = req.body.domainname.toLowerCase()
  req.checkBody('domainname', 'Domain name need full FQDN').isFQDN()
  let errors = req.validationErrors()
  if (errors) {
    req.flash('errors', errors)
    res.redirect('/domains')
  } else {
    Domain.getDomainByName(domainname, (err,domain)=> {
      if (err) throw err
      if (domain.length>0) {
        req.flash('error_msg', 'Domain exits')
        res.redirect('/domains')
      } else {
      Domain.addDomain(domainname, (err, rows)=> {
        if (err) throw err
        req.flash('success_msg','Add Domain success')
        res.redirect('/domains')
        })
      }    
    })
  }
})

// Detail Domain
router.get('/:id',(req, res, next)=> {
  Hostname.getHostnameByDomain(req.params.id, (err, hostnames) => {
    if (err) throw err
    Domain.getDomainById(req.params.id, (err, domain)=>{
      if (err) throw err
      res.render('hostnames', {hostnames:hostnames, domains: domain})
    })
  })
    
})

// Delete Domain
router.get('/delete/:domainId',(req, res, next)=> {
  Domain.getDomainById(req.params.domainId, (err, domain)=>{
    if(err) throw err
    if (domain.length<1) {
      req.flash('error_msg', 'Domain not found')
      res.redirect('/domains')
    }
    else {
      Hostname.deleteHostnameByDomain(req.params.domainId, (err, rows) => {
        if (err) throw err
        Domain.deleteDomain(req.params.domainId,(err, rows) => {
          let domainname = domain[0].domainname
          let arr = domainname.split(".")
          let namespace = "/dns/"+arr.reverse().join("/") +"/"
          Etcd.deleteNamespace(namespace)
          req.flash('success_msg', 'Delete domain success')
          res.redirect('/domains')
        })
      })
    }
  })
})

module.exports = router
