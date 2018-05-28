from flask import Flask

app = Flask(__name__)
app.url_map.strict_slashes = False

# Import routing table.
import api

if __name__ == '__main__':
    app.run(port=28735)
