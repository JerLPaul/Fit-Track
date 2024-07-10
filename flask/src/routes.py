from ast import arg
from flask import Flask, render_template, request, redirect, url_for
from flask_restx import Resource, fields, reqparse, abort
from src import app, ns, db
from src.models import Users


user_args = reqparse.RequestParser()
user_args.add_argument("username", type=str, help="Username is required", required=True)
user_args.add_argument("email", type=str, help="Email is required", required=True)
user_args.add_argument("password", type=str, help="Password is required", required=True)

user_fields = ns.model('User', {
    'username': fields.String(required=True, description='The user username'),
    'email': fields.String(required=True, description='The user email'),
    'password': fields.String(required=True, description='The user password')
    }
)

arg_model = ns.model('args', {
    'username': fields.String(required=True, description='The user username'),
    'email': fields.String(required=True, description='The user email'),
    'password': fields.String(required=True, description='The user password')
    }
)

@ns.route('/')
class UsersList(Resource):
    @ns.marshal_list_with(user_fields)
    def get(self):
        """List all users"""
        users = Users.query.all()
        return users
    
    @ns.expect(arg_model)
    @ns.marshal_with(user_fields)
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
    
    @ns.expect(arg_model)
    @ns.marshal_with(user_fields)
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
    
    @ns.expect(arg_model)
    @ns.marshal_with(user_fields)
    def delete(self):
        """Delete a user by email"""
        args = user_args.parse_args()
        user = Users.query.filter_by(email=args["email"]).first()
        if not user:
            abort(404, message="User not found")
        db.session.delete(user)
        db.session.commit()
        return '', 204
    

@ns.route('/<int:user_id>')
@ns.response(404, 'User not found')
class User(Resource):
    @ns.marshal_with(user_fields)
    def get(self, user_id):
        """Get a user by ID"""
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        return user, 200

    @ns.expect(arg_model)
    @ns.marshal_with(user_fields)
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
    

@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'