from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

app = Flask(__name__)

# Auth and app data now live in Supabase (see /db/supabase_schema.sql).
# This service is a thin, stateless proxy in front of the FatSecret nutrition
# API so the FatSecret client secret never reaches the browser.

api = Api(app, version='1.0', title='Fit-Track Nutrition API',
          description='Proxy for nutrition lookups',
          doc='/api/docs'
        )

# Restrict CORS to the configured frontend origin(s) instead of "*".
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*')
origins = [o.strip() for o in allowed_origins.split(',')] if allowed_origins != '*' else '*'
CORS(app, resources={r"/*": {"origins": origins}})

from src import routes
