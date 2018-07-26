const db = require('../dbconn.js');
const Sequelize = require('sequelize');

const NoteStyle = db.define('NoteStyle', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: Sequelize.STRING,
    card_generator: Sequelize.STRING,
    templates: Sequelize.TEXT,
});

NoteStyle.sync();

module.exports = NoteStyle;
