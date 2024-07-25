from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
api = Api(app, version='1.0', title='User API',
          description='A simple User API',
          doc='/api/docs'
        )
CORS(app, resources={r"*": {"origins": "*"}})

db = SQLAlchemy(app)

from src import routes
