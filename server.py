from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                        'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                        'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Import routing table.
import api

if __name__ == '__main__':
    app.run(port=28735)
