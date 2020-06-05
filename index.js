const express = require(express)
const app = express()
// const os = require('os')
// const cluster = require("cluster")

const routes = require('./api/routes/index')
if(cluster.isMaster){
  let cpus = os.cpus().length
  for(let i=1;i<=cpus;i++){
    cluster.fork()
  }
  cluster.on('online', function(worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
});

cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
});
}else{
  app.use('/fetchData',routes)
  app.listen(3000)
}

