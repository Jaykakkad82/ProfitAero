from flask import Flask, Response, request, json, jsonify, render_template
from flask_cors import CORS
import traceback


# app = Flask(__name__,static_folder='static/',static_url_path='/')
app = Flask(__name__)
CORS(app)

@app.route('/')
def api_root():
    try:
        print(app._static_folder)
        return app.send_static_file('index.html')
        # return render_template('index.html')
    except Exception as e:
        print(e)


def make_error(error, error_msg):
    message = {
        'status': error,
        'message': error_msg,
    }
    return message, error


@app.errorhandler(404)
def not_found(error=None):
    message = {
            'status': 404,
            'message': 'Not Found: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 404
    return resp
  
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)