const db = require('./dbconnection')

const Hostname = {
  addHostname: (name, domain, user, callback) => {
    return db.query('INSERT INTO hostnames(name, domainid, userid)  VALUES(?,?,?)',[name, domain, user], callback)
  },
  getAllHostname: (callback) => {
    return db.query('SELECT hostnames.id, hostnames.name, hostnames.last_updated, hostnames.ip, domains.domainname FROM hostnames INNER JOIN domains ON hostnames.domainid=domains.id', callback)
  },
  getHostnameByName: (name, callback) => {
    return db.query('SELECT hostnames.id, hostnames.name, hostnames.last_updated, hostnames.ip, domains.domainname FROM hostnames INNER JOIN domains ON hostnames.domainid=domains.id WHERE hostnames.name=?',[name], callback)
  },
  getHostnameById: (id, callback) => {
    return db.query('SELECT hostnames.id, hostnames.name, hostnames.userid ,hostnames.last_updated, hostnames.ip, domains.domainname FROM hostnames INNER JOIN domains ON hostnames.domainid=domains.id WHERE hostnames.id=?',[id], callback)
  },
  getHostnameByUser: (user, callback) => {
    return db.query('SELECT hostnames.id, hostnames.name, hostnames.last_updated, hostnames.ip, domains.domainname FROM hostnames INNER JOIN domains ON hostnames.domainid=domains.id   WHERE userid=?',[user], callback)
  },
  deleteHostnameByUser: (user, callback) => {
    return db.query('DELETE FROM hostnames WHERE userid=?',[user], callback)
  },
  deleteHostnameByDomain: (domainid, callback) => {
    return db.query('DELETE FROM hostnames WHERE domainid=?',[domainid], callback)
  },
  getHostnameByDomain: (domain, callback) => {
    return db.query('SELECT hostnames.id, hostnames.name, hostnames.last_updated, hostnames.ip, domains.domainname FROM hostnames INNER JOIN domains ON hostnames.domainid=domains.id  WHERE domainid=?',[domain], callback)
  },
  deleteHostnameById: (id, callback) => {
    return db.query('DELETE FROM hostnames WHERE id= ?',[id], callback)
  },
  updateHostname: (id, ip, last_updated, callback) =>{
    return db.query('UPDATE hostnames SET ip=?, last_updated=? WHERE id=?',[ip, last_updated, id], callback)
  }
}

module.exports=Hostname