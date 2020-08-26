const mongoose = require('mongoose');

const CookieSchema = mongoose.Schema({
    ntbcc: String
})

module.exports = mongoose.model('Cookies', CookieSchema)