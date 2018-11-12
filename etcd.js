const { Etcd3 } = require('etcd3')
const config = require('./config')
const ETCD_HOST = config.get('etcd').hostname
const ETCD_PORT = config.get('etcd').port
const Url = {'hosts': ETCD_HOST+':'+ETCD_PORT}

const client = new Etcd3(Url)

const Etcd = {
  addRecord: async (namespace, hostname, value) =>{
    return await client.namespace(namespace).put(hostname).value(value)
  },
  getRecord: async (namespace, hostname) => {
    return await client.namespace(namespace).get(hostname).string()
  },
  deleteRecord: async (namespace, hostname) => {
    return await client.namespace(namespace).delete().key(hostname)
  },
  deleteNamespace: async (namespace) => {
    return await client.namespace(namespace).delete().all()
  }
}
module.exports=Etcd