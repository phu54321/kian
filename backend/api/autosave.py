# Add autosave 
from api.connection import col
from api.emit import emitResult
from server import app

@app.route('/autosave', methods=['POST'])
def autosave():
    if col().autosave():
        app.logger.info('Autosave issued')
    return emitResult(True)
