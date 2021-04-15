from flask import Flask, jsonify, request
from flask import render_template
from flask_cors import cross_origin
import netease_cloud_music
import kugou_music
from sqlite3_help import Sqlite3DB

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('home.html')


@app.route('/music')
def music():
    return render_template('music.html')


@app.route('/music/play/list', methods=['post'])
def music_play_list():
    db = Sqlite3DB()
    results = db.query_data(f"select * from song_play_list where visitor_id = '{request.form['visitor_id']}'")
    db.close()
    return jsonify(results)


@app.route('/music/play/list/add', methods=['post'])
def music_play_list_add():
    db = Sqlite3DB()
    db.insert_data("song_play_list", {'visitor_id': request.form['visitor_id'], 'song_id': request.form['song_id'],
                                      'song_name': request.form['song_name'], 'song_singer': request.form['song_singer'], 
                                      'song_duration': request.form['song_duration'], 'song_platform': request.form['song_platform'],
                                      'song_album_id': request.form['song_album_id'], 'song_hash': request.form['song_hash']})
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/music/play/list/del', methods=['post'])
def music_play_list_del():
    db = Sqlite3DB()
    db.execute(f'delete from song_play_list where visitor_id = "{request.form["visitor_id"]}" and song_id = {request.form["song_id"]};')
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/music/search/<song_name>')
def music_search(song_name):
    results = [{
        'platform': '网易云',
        'alias': 'netease-cloud',
        'song_list': netease_cloud_music.get_music_search(song_name),
    }, {
        'platform': '酷狗',
        'alias': 'kugou',
        'song_list': kugou_music.get_music_search(song_name),
    }]
    return render_template('song_list.html', results=results)


@app.route('/music/play/detail', methods=['post'])
def music_detail():
    song_platform = request.form['song_platform']
    if song_platform == 'netease-cloud':
        return jsonify(netease_cloud_music.get_music_detail(request.form['song_id']))
    if song_platform == 'kugou':
        return jsonify(kugou_music.get_music_detail(request.form['song_album_id'], request.form['song_hash']))


@app.route('/image')
def image():
    return render_template('image.html')


@app.route('/image/list', methods=['post'])
def image_list():
    db = Sqlite3DB()
    results = db.query_data(f"select * from image_list where visitor_id = '{request.form['visitor_id']}'")
    db.close()
    return jsonify(results)


@app.route('/image/list/add', methods=['post'])
@cross_origin()
def image_list_add():
    db = Sqlite3DB()
    db.insert_data("image_list", {'visitor_id': request.form['visitor_id'], 'link': request.form['link']})
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


if __name__ == '__main__':
    app.run(debug=True)
