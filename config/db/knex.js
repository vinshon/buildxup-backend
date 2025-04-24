const knex = require('knex');
require('dotenv').config();
module.exports = knex({ client: 'pg', connection: process.env.DATABASE_URL });