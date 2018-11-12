exports.checkAuthenticated= (req, res, next)=> {
  if(req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error_msg', 'You are not authorized')
    res.redirect('/login')
  }
}

exports.checkAdminPermission= (req, res, next) => {
  if(req.user.isadmin==1) {
    return next()
  } else {
    req.flash('error_msg', "Permission deny")
    res.redirect('/hostnames')
  }
}