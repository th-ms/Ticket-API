const mongoose = require('mongoose');

const ClientSchema = mongoose.Schema({
    discord: String,
    api_key: String,
    requests: Number,
    email: String,
})

module.exports = mongoose.model('Clients', ClientSchema)