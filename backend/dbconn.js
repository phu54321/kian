const Sequelize = require('sequelize');
const { database, user, password} = require('./secret');

const db = new Sequelize(
    database,
    user,
    password,
    {
        host: 'localhost',
        dialect: 'mysql',

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

        operatorsAliases: false
    }
);

module.exports = db;
