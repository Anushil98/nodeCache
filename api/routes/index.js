const express = require('express')
const Router = express.Router()

Router.post('/id_list',
    GetIdList,
    getConfig,
    FetchProductInfo,
    SaveCacheMemory,
    SendData
)

module.exports = Router