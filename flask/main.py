import flask
import os

app = flask.Flask(__name__)

@app.route('/api/food-calories', methods=['POST'])
def food_calories_post():
    food = flask.request.json['food']
    # Call the external API

@app.route('/api/auth', methods=['POST'])
def auth_post():
    username = flask.request.json['username']
    password = flask.request.json['password']
    # Get from DB or from firebase