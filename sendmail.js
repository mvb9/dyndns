const  nodemailer = require('nodemailer')
const config = require('./config')

module.exports.Sendmail = function sendEmail(email, type, link) {
  let transporter = nodemailer.createTransport({
    host: config.get('smtp').smtp_server,
    secure: config.get('smtp').secure,
    auth: {
      user: config.get('smtp').user,
      pass: config.get('smtp').password
    }
  })
  let verifyAccount = {
    from: config.get('smtp').sender,
    to: email,
    subject: 'DynDNS, please verify account',
    text: 'Email verification, press here to verify your email:' + link,
    html: "<b>Hello there,<br> click <a href=" + link + "> here to verify</a></b>"
  }

  let resetPassword = {
    from: config.get('smtp').sender,
    to: email,
    subject: 'DynDNS, reset password account',
    text: 'DynDNS, press here to reset your password:' + link,
    html: "<b>Hello" +email+" ,<br> click <a href=" + link + "> here to verify</a></b>"
  }
  if (type=="confirm") {
    transporter.sendMail(verifyAccount, function(error, response){
      if(error){
       console.log(error);
      }else{
       console.log("Message sent: " + response.message);
      }
      // if you don't want to use this transport object anymore, uncomment following line
      //smtpTransport.close(); // shut down the connection pool, no more messages
      });
  }
  else if (type=="reset") {
    transporter.sendMail(resetPassword, function(error, response){
      if(error){
       console.log(error);
      }else{
       console.log("Message sent: " + response.message);
      }
      // if you don't want to use this transport object anymore, uncomment following line
      //smtpTransport.close(); // shut down the connection pool, no more messages
      });
  }
}