from server import app, col
from flask import jsonify


@app.route('/deck/')
def listDeck():
    return jsonify(col().decks.allNames())
