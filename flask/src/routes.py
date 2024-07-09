import marshal
from flask import Flask, render_template, request, redirect, url_for
from flask_restful import Resource, reqparse, marshal_with, abort
from src import app, api, db
from src.models import Users


user_args = reqparse.RequestParser()
user_args.add_argument("email", type=str, help="Email is required", required=True)
user_args.add_argument("password", type=str, help="Password is required", required=True)

user_fields = {
    "id": int,
    "email": str,
    "password": str
}

class UsersList(Resource):
    @marshal_with(user_fields)
    def get(self):
        users = Users.query.all()
        return users

class User(Resource):
    @marshal_with(user_fields)
    def get(self, user_id):
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        return user, 200

    @marshal_with(user_fields)
    def post(self, user_id):
        args = user_args.parse_args()
        user = Users.query.filter_by(id=user_id).first()
        if user:
            abort(409, message="User already exists")
        user = Users(id=user_id, email=args["email"], password=args["password"])
        db.session.add(user)
        db.session.commit()
        return user, 201

    @marshal_with(user_fields)
    def put(self, user_id):
        args = user_args.parse_args()
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        user.email = args["email"]
        user.password = args["password"]
        db.session.commit()
        return user, 200

    def delete(self, user_id):
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            abort(404, message="User not found")
        db.session.delete(user)
        db.session.commit()
        return '', 204
    
api.add_resource(User, "/api/users/<int:user_id>")
api.add_resource(UsersList, "/api/users")

@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'