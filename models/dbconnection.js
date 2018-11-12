const mysql = require('mysql')
const config = require('../config.js')

// Create Pool Mysql
const connection= mysql.createPool({
  host: config.get('db').host,
  port: config.get('db').port || 3306,
  database: config.get('db').database,
  user:config.get('db').user,
  password: config.get('db').password
})

module.exports=connection
