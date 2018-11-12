const convict = require('convict');
 
// Define a schema
const config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "PORT",
    arg: "port"
  },
  db: {
    host: {
      doc: "Database host name/IP",
      format: '*',
      default: 'localhost'
    },
    database: {
      doc: "Database name",
      format: String,
      default: 'dyndns'
    },
    port: {
      doc: "Database name",
      format: Number,
      default: 3306
    },
    user: {
      doc: "User Name",
      format: String,
      default: 'root'
    },
    password: {
      doc: "Password",
      format: String,
      default: '123456'
    }
  },
  etcd: {
    hostname: {
      doc: "Etcd host name/IP",
      format:String,
      default: 'localhost'
    },
    port: {
      doc: "Etcd port",
      format: Number,
      default: 2379
    }
  },
  smtp: {
    service: {
      doc: "Etc gmail, yahoo",
      format: String,
      default: "gmail"
    },
    smtp_server: {
      doc: "IP mail server",
      format: String,
      default: "127.0.0.1"
    },
    port: {
      doc: "Port mail server",
      format: Number,
      default: 25
    },
    user: {
      doc: "Email",
      format: String,
      default: "admin@abc.com"
    },
    password :{
      doc: "password",
      format: String,
      default: "123456"
    },
    secure: {
      doc: "IP mail server",
      format: Boolean,
      default: false
    },
    sender: {
      doc: "Sender address",
      format: String,
      default: 'postmaster@abc.com'
    }
  }
});
 
// Load environment dependent configuration
const env = config.get('env');
config.loadFile('./config/' + 'config.json');
 
// Perform validation
config.validate({allowed: 'strict'});
 
module.exports = config;