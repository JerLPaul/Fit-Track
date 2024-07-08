from flask import Flask, render_template, request, redirect, url_for
from src import app


@app.route('/')
def index():
    return '<h1>Hello, World!</h1>'