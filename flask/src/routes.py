from ast import arg
import token
from flask import Flask, render_template, request, redirect, url_for
from flask_restx import Resource, fields, reqparse, abort
from src import app, api, db
from src.models import Users
from flask import request
import requests, os
from rauth.service import OAuth2Service


user_args = reqparse.RequestParser()
user_args.add_argument("username", type=str, help="Username is required", required=True)
user_args.add_argument("email", type=str, help="Email is required", required=True)
user_args.add_argument("password", type=str, help="Password is required", required=True)

nutrition_args = reqparse.RequestParser()
nutrition_args.add_argument("name", type=str, help="Food name is required", required=True)

user_ns = api.namespace('users', description='User operations')
nutrition_ns = api.namespace('nutrition', description='Nutrition API operations')


user_fields = user_ns.model('User', {
    'username': fields.String(required=True, description='The user username'),
    'email': fields.String(required=True, description='The user email'),
    'password': fields.String(required=True, description='The user password')
    }
)

nutrition_model = nutrition_ns.model('Nutrition', {
    'name': fields.String(required=True, description='The food name')
    }
)

@user_ns.route('/')
class UsersList(Resource):
    @user_ns.marshal_list_with(user_fields)
    def get(self):
        """List all users"""
        users = Users.query.all()
        return users
    
    @user_ns.expect(user_fields)
    @user_ns.marshal_with(user_fields)
    def post(self):
        """Create a new user"""
        args = user_args.parse_args()
        user = Users.query.filter_by(email=args["email"]).first()
        if user:
            abort(409, message="User already exists")
        user = Users(username=args["username"], email=args["email"], password=args["password"])
        db.session.add(user)
        db.session.commit()
        return user, 201
    
    @user_ns.expect(user_fields)
    @user_ns.marshal_with(user_fields)
    def put(self):
        """Update a user by email"""
        args = user_args.parse_args()
        user = Users.query.filter_by(email=args["email"]).first()
        if not user:
            abort(404, message="User not found")
        user.username = args["username"]
        user.email = args["email"]
        user.password = args["password"]
        db.session.commit()
        return user, 200
    
    @user_ns.expect(user_fields)
    @user_ns.marshal_with(user_fields)
    def delete(self):
        """Delete a user by email"""
        args = user_args.parse_args()
        user = Users.query.filter_by(email=args["email"]).first()
        if not user:
            abort(404, message="User not found")
        db.session.delete(user)
        db.session.commit()
        return 'Account deleted successfully', 204
    

@user_ns.route('/<int:user_id>')
@user_ns.response(404, 'User not found')
class User(Resource):
    @user_ns.marshal_with(user_fields)
    def get(self, user_id):
        """Get a user by ID"""
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        return user, 200

    @user_ns.expect(user_fields)
    @user_ns.marshal_with(user_fields)
    def put(self, user_id):
        """Update a user by ID"""
        args = user_args.parse_args()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        user.username = args["username"]
        user.email = args["email"]
        user.password = args["password"]
        db.session.commit()
        return user, 200

    def delete(self, user_id):
        """Delete a user by ID"""
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        db.session.delete(user)
        db.session.commit()
        return '', 204
    
consumer_key = os.environ.get('API_KEY')
consumer_secret = os.environ.get('API_SECRET')

def get_auth_token():
        """Geth the Authentification token"""
        token_url = "https://oauth.fatsecret.com/connect/token"
        response = requests.post(token_url, data= {
            'client_id': consumer_key,
            'client_secret': consumer_secret,
            'grant_type': 'client_credentials',
        })

        if response.status_code == 200:
            return response.json()['access_token']
        
auth_token = get_auth_token()

@nutrition_ns.route('/')
@nutrition_ns.response(404, 'Nutrition not found')
class Nutrition(Resource):
    @nutrition_ns.expect(nutrition_model)
    @nutrition_ns.marshal_with(nutrition_model)
    def post(self):
        """Call the API to get nutrition facts"""
        
        args = nutrition_args.parse_args()
        search_url = "https://platform.fatsecret.com/rest/server.api"
        headers = {
            'Authorization': f'Bearer {auth_token}'
        }
        params = {
            'method': 'food.search',
            'search_expression': args['name'],
            'format': 'json',
        }

        response = requests.get(search_url, headers=headers, params=params)

        if response.status_code == 200:
            print(response.json())
            return response.json()
        else:
            abort(response.status_code, message=response.json())

@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'