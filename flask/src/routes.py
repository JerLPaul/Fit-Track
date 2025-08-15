from ast import arg
from flask_restx import Resource, fields, reqparse, abort
from src import app, api, db
from src.models import Users
import requests, os


user_args = reqparse.RequestParser()
user_args.add_argument("username", type=str, help="Username is required", required=True)
user_args.add_argument("email", type=str, help="Email is required", required=True)
user_args.add_argument("password", type=str, help="Password is required", required=True)

auth_args = reqparse.RequestParser()
auth_args.add_argument("username", type=str, help="username or email", required=False)
auth_args.add_argument("email", type=str, help="username or email", required=False)
auth_args.add_argument("password", type=str, help="password of the user", required=True)

nutrition_args = reqparse.RequestParser()
nutrition_args.add_argument("name", type=str, help="Food name is required", required=True)

user_ns = api.namespace('users', description='User operations')
nutrition_ns = api.namespace('nutrition', description='Nutrition API operations')
auth_ns = api.namespace('auth', description="authentication options")

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

auth_model = nutrition_ns.model('Login', {
    'username': fields.String(required=False, description='The user username'),
    'email': fields.String(required=False, description='The user email'),
    'password': fields.String(required=True, description='The user password')
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
    def post(self):
        """Call the API to get nutrition facts"""
        args = nutrition_args.parse_args()
        search_url = "https://platform.fatsecret.com/rest/server.api"
        headers = {
            'Authorization': f'Bearer {auth_token}'
        }
        params = {
            'method': 'foods.search',
            'search_expression': args['name'],
            'format': 'json',
        }

        response = requests.get(search_url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json()
        else:
            abort(response.status_code, message=response.json())


@auth_ns.route("/login")
class Login(Resource): 
    @auth_ns.expect(auth_model)
    def post(self):
        args = auth_args.parse_args()

        user = None
        print(args["email"])
        if args["email"] is not None:
            user = Users.query.filter_by(email=args["email"]).first()
        elif args["username"] is not None:
            user = Users.query.filter_by(username=args["username"]).first()

        if user is None:
            abort(404, "User Not Found")

        if user.password != args["password"]:
            abort(409, "Login Incorrect")
        else:
            return user, 200
        

@auth_ns.route("/register")
class Register(Resource):
    @auth_ns.expect(auth_model)
    def post(self):
        args = auth_args.parse_args()

        user_email = None
        user_username = None
        if args["email"] is not None:
            user_email = Users.query.filter_by(email=args["email"])
        elif args["username"] is not None:
            user_username = Users.query.filter_by(username=args["username"]).first()


        if not user_email:
            user = Users(username=args["username"], password=args["password"])
        elif not user_username:
            user = Users(email=args["email"], password=args["password"])
        else:
            abort(409, message="User already exists")

        db.session.add(user)
        db.session.commit()
        return user, 201

@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'