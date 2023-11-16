from flask import Flask, jsonify, request, render_template, Response, redirect, url_for, abort, session, send_file
from flask_session import Session
from flask_pymongo import PyMongo
import pyrebase
import json
import pymongo
from gridfs import GridFS
from bson import ObjectId
from mutagen.mp3 import MP3
from datetime import timedelta
from werkzeug.utils import secure_filename
import os

firebase_config = {
    'apiKey': "AIzaSyDVF0P5cuUU8lv2dNt-uc2_JyMOKTl8tBg",
    'authDomain': "music-player-4e33a.firebaseapp.com",
    'projectId': "music-player-4e33a",
    'storageBucket': "music-player-4e33a.appspot.com",
    'messagingSenderId': "441637056363",
    'appId': "1:441637056363:web:541532b9bd0e98e8c2a62e",
    'measurementId': "G-KJMCYXCE8Q",
    'databaseURL':'None'
  }

firebase=pyrebase.initialize_app(firebase_config)
auth=firebase.auth()

app=Flask(__name__)
app.config['SECRET_KEY'] = '$wX2RjLzA3bTkH1iGfSg4MnC5QoDpUqV8xYvZ9sE6uF7tIyPwN'

app.config["SESSION_TYPE"] = "mongodb"

mongo_uri="mongodb+srv://maitybristi53:SllXwJZSpfEqQcpm@cluster0.r0oeefw.mongodb.net/UserData?ssl=true"

mongo=PyMongo(app,mongo_uri,port=9999)
db=mongo.db
fs = GridFS(db)

app.config["SESSION_MONGODB"] = pymongo.MongoClient(
    host="mongodb+srv://maitybristi53:SllXwJZSpfEqQcpm@cluster0.r0oeefw.mongodb.net/?ssl=true"
)
app.config["SESSION_MONGODB_DB"] = "UserSessions"
app.config["SESSION_MONGODB_COLLECT"] = "sessions"
app.config['SONG_UPLOAD_FOLDER'] = 'static/assets'
app.config['IMG_UPLOAD_FOLDER'] = 'static/images'
Session(app)

def Register_user(name,email):
    collection=db.Users
    data={'Email':email.lower(),'Name':name,"IsAdmin":False}
    collection.insert_one(data)
    return True


@app.route('/upload_song', methods=['POST'])
def upload_song():
    song_name = request.form['name']
    artist_name = request.form['artist']
    category = request.form['category']
    song_file = request.files['song']
    image_file = request.files['image']

    if song_name and artist_name and  category and song_file and image_file:
        # Save the audio file to the /static/assets folder
        song_filename = secure_filename(song_file.filename)
        song_path = os.path.join(app.config['SONG_UPLOAD_FOLDER'], song_filename)
        song_file.save(song_path)

        # Save the image file to the /static/assets folder
        image_filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['IMG_UPLOAD_FOLDER'], image_filename)
        image_file.save(image_path)

        # Fetch audio duration using mutagen
        audio = MP3(song_path)
        duration = str(timedelta(seconds=int(audio.info.length)))[2:]

        song_count = db['SongDetails'].count_documents({})
        count = song_count

        # Store the file paths in the database
        song_details = {
            'id': count,
            'name': song_name,
            'artist': artist_name,
            'category': category,
            'song_path': song_path,
            'image_path': image_path,
            'duration': duration  # Store the duration in H:M:S format
        }

        song_details_id = db['SongDetails'].insert_one(
            song_details).inserted_id

        return jsonify({'message': 'Song details uploaded successfully', 'song_details_id': str(song_details_id)}), 200

    return jsonify({'message': 'Missing data or files for upload'}), 400


@app.route('/get_songs', methods=['GET'])
def get_songs():
    # Retrieving all songs, excluding the _id field
    email=session.get('email')
    user= db.Users.find_one({'Email': email})
    if "Favourites" in user:
        favs = user["Favourites"]
    else:
        favs = []
    print(favs)
    songs = list(db['SongDetails'].find({}, {'_id': 0}))
    for i in range(len(songs)):
        song=songs[i]
        if str(song['id']) in favs:
            song['liked']=True
        else:
            song['liked']=False
    return jsonify({'songs': songs}), 200


@app.route('/get_song/<song_id>', methods=['GET'])
def get_song(song_id):
    # Retrieve the song file using its ID from GridFS
    song_file = fs.get(ObjectId(song_id))
    if song_file is not None:
        return send_file(song_file, as_attachment=False,conditional=False, mimetype='audio/mpeg')
    return jsonify({'message': 'Song not found'}), 404


@app.route('/get_image/<image_id>', methods=['GET'])
def get_image(image_id):
    # Retrieve the image file using its ID from GridFS
    image_file = fs.get(ObjectId(image_id))
    if image_file is not None:
        # Set the MIME type explicitly
        return send_file(image_file, mimetype='application/octet-stream')
    return jsonify({'message': 'Image not found'}), 404


@app.get("/")
def index():
    return Home_page()



@app.post('/register')
def register():
    data=request.get_json()
    email=data.get('mail')
    name=data.get('name')
    password=data.get('password')
    if not email or not name or not password:
        return jsonify({'message':"wrong inputs"}),404
    try:
        # Create a new user in Firebase Authentication
        user = auth.create_user_with_email_and_password(email, password)
        # Send email verification
        auth.send_email_verification(user['idToken'])
        response_data = {
            'message': 'User registration successful. Email verification sent.',
        }
        Register_user(name, email)
        return jsonify(response_data), 200

    except Exception as e:
       print(e)
       error_message = str(e)
       # Find the start and end positions of the 'error' object
       start_idx = error_message.find('{')
       error_object = error_message[start_idx:]
       error = json.loads(error_object)
       error = error['error']
       #print(error)
       error_message = ' '.join(error.get('message', 'Undefined').split('_'))
       return jsonify({'code': error.get('code', '400'), 'message': error_message}),  error.get('code', 400)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('mail', '').lower()
    password = data.get('password', '')  # Get the password from the request
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        session['email']=email
        print(session.get('email',''))
        return jsonify({'code': 200, 'message': 'Login Success'}), 200
        
    except Exception as e:
        error_message = str(e)
        print(e)
        # Find the start and end positions of the 'error' object
        start_idx = error_message.find('{')
        error_object = error_message[start_idx:]
        error = json.loads(error_object)
        error=error['error']
        error_message = ' '.join(error.get('message', 'Undefined').split('_'))
        return jsonify({'code': error.get('code', '400'), 'message':error_message}),  error.get('code', 400)

@app.get('/logout')
def logout():
    session.pop('email','')
    return jsonify({"message":"success"})

@app.get('/home')
def Home_page():
    if 'email' in session:
        collection = db.Users
        user = collection.find_one({'Email': session.get('email')})
        return render_template('index.html', user=user)
    else:
        return render_template('login.html',user={})

@app.get('/search')
def get_search():
    return render_template('search.html')

@app.get('/playlist')
def get_playlist():
    return render_template('playlist.html')

@app.get('/upgrade')
def upgrade():
    return render_template('upgrade.html')

@app.post('/like')
def like():
    data=request.get_json()
    email=session.get('email')
    collection = db.Users
    user = collection.find_one({'Email': session.get('email')})
    if "Favourites" in user:
        fav = user["Favourites"]
    else:
        fav=[]
    song_name=data["id"]
    if song_name in fav:
        fav.remove(song_name)
    else:
        fav.append(song_name)
    collection.update_one({'Email': email}, {
        '$set': {'Favourites':fav }})
    return jsonify({"message":"success"}),200

@app.get('/get_favourites')
def fav():
    collection = db.Users
    user = collection.find_one({'Email': session.get('email')})
    if "Favourites" in user:
        fav = user["Favourites"]
    else:
        fav = []
    return jsonify({"favs":fav})

if __name__=="__main__":
    app.run(port=8080)
