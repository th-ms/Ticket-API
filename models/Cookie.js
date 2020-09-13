const mongoose = require('mongoose');

const CookieSchema = mongoose.Schema({
    ntbcc: String,
    vvv: String
})

module.exports = mongoose.model('Cookies', CookieSchema)