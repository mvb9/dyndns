const db = require('./dbconnection')
const bcrypt = require('bcrypt')

const User = {
  addUser: (username, email, password, isadmin, isVerify, verifycode,callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err
        return db.query('INSERT INTO Users(username, email, password, isadmin, isVerify, verifycode)  VALUES(?,?,?,?,?,?)',[ username, email, hash, isadmin, isVerify, verifycode], callback)
      })
    })
    
  },
  getAllUser: (callback) => {
    return db.query('SELECT id, username, email, isadmin, last_login, verifyCode, isVerify, request_date FROM Users', callback)
  },
  getUserByName: (username, callback) => {
    return db.query('SELECT * FROM Users WHERE username=?',[username], callback)
  },
  getUserById: (id, callback) => {
    return db.query('SELECT * FROM Users WHERE id=?',[id], callback)
  },
  deleteUser: (userid, callback) => {
    return db.query('DELETE FROM Users WHERE  id= ?',[userid], callback)
  },
  comparePassword: (candidatePassword, hash, callback) =>{
    bcrypt.compare(candidatePassword, hash, (err, ismatch)=>{
      if(err) throw err;
      callback(null, ismatch)
    })
  },
  updatePassword: (username, password, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err
        return db.query('UPDATE Users SET password=?, verifyCode= NULL, request_date= NULL  WHERE username=?',[hash,username], callback)
      })
    })
  },
  updateDate: (userid, date, callback) => {
    return db.query('UPDATE Users set last_login=? WHERE id=?',[date,userid], callback)
  },
  verifyUser: (userid, callback) => {
    return db.query('UPDATE Users set verifycode = NULL, isVerify=1  WHERE id=?', [userid],callback)
  },
  genCode: (userid, code, request_date, callback) =>{
    return db.query('UPDATE Users set verifycode = ?, request_date=?  WHERE id=?', [code, request_date, userid],callback)
  }
}

module.exports = User