import os
from waitress import serve
from src import app

if __name__ == '__main__':
    if os.getenv('FLASK_ENV') == 'development':
        app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
    else:
        serve(app, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
