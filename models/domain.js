const db = require('./dbconnection')

// Domain query
const Domain = {
  getAllDomains: (callback) => {
    return db.query("SELECT * FROM domains ORDER BY domainname", callback)
  },
  getDomainById: (id, callback) => {
    return db.query("SELECT * from domains WHERE id=?", [id], callback)
  },
  getDomainByName: (domainname, callback) => {
    return db.query("SELECT * from domains WHERE domainname=?", [domainname], callback)
  },
  addDomain: (domainname, callback) => {
    return db.query("INSERT INTO domains(domainname) values(?)",[domainname], callback)
  },
  deleteDomain: (domainid, callback) => {
      return db.query("DELETE FROM domains WHERE id=?",[domainid], callback)
  }
}


module.exports=Domain