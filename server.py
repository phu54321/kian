from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

# Import routing table.
import api

if __name__ == '__main__':
    app.run(port=28735)
