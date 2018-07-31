const db = require('../dbconn.js');
const Sequelize = require('sequelize');

const NoteStyle = require('./noteStyle');


const Note = db.define('Note', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    preview: Sequelize.TEXT,
    fields: Sequelize.TEXT,
});

Note.belongsTo(NoteStyle);

Note.sync();

module.exports = Note;
