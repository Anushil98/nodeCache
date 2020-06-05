const connection = require('./dbcon')
const memCache = require('../util/cache')
exports.getConfig = () =>{
    let key = 'config'
    let memContent = memCache.get(key)
    if(memContent){
        res.locals.config = memContent
        next()
    }else{
        connection.query("SELECT a.params FROM nh7zm_sellacious_config AS a WHERE a.context = 'com_sellacious' AND a.subcontext = 'core'",(err,rows)=>{
            if(err){
                res.statuc(500).end()
            }else{
                res.locals.config = rows
                memCache.put(key,rows,0)
                next()
            }
        })
    }
}


exports.getDBPrefix = "" 

