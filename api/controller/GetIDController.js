const connection = require('../util/dbcon')
const DBPrefix = require('../util/config').getDBPrefix
exports.getIdlist=(req,res,next)=>{
    connection.query(`Select id from ${DBPrefix}__sellacious_products`,(err,rows)=>{
        if(err){
            return res.status(500).end()
        }else{
            res.locals.id_list = rows
            next()
        }
    })
}