import datetime
import random
import string
from flask import Flask, jsonify, request
from flask import render_template
from flask_cors import cross_origin
import netease_cloud_music
import kugou_music
import qq_music
from sqlite3_help import Sqlite3DB
import io
from io import BytesIO
from PIL import Image
import requests

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('home.html')


@app.route('/music')
def music():
    results = [{
        'platform': '网易云音乐',
        'alias': 'netease-cloud',
        'top_list': netease_cloud_music.get_top_list(),
    }, {
        'platform': '酷狗音乐',
        'alias': 'kugou',
        'top_list': kugou_music.get_top_list(),
    }, {
        'platform': 'QQ音乐',
        'alias': 'qq',
        'top_list': qq_music.get_top_list(),
    }]
    return render_template('music.html', results=results)


@app.route('/music/top/list/search', methods=['post'])
def music_top_list_search():
    result = {}
    song_platform = request.form['song_platform']
    if song_platform == 'netease-cloud':
        result = {
            'platform': '网易云音乐',
            'alias': 'netease-cloud',
            'song_list': netease_cloud_music.get_top_list_search(request.form['top_id']),
        }
    if song_platform == 'kugou':
        result = {
            'platform': '酷狗音乐',
            'alias': 'kugou',
            'song_list': kugou_music.get_top_list_search(request.form['top_id']),
        }
    if song_platform == 'qq':
        result = {
            'platform': 'QQ音乐',
            'alias': 'qq',
            'song_list': qq_music.get_top_list_search(request.form['top_id']),
        }
    return render_template('song_list.html', result=result)


@app.route('/music/play/list', methods=['post'])
def music_play_list():
    db = Sqlite3DB()
    results = db.query_data(f"select * from song_play_list where visitor_id = '{request.form['visitor_id']}'")
    db.close()
    return jsonify(results)


@app.route('/music/play/list/add', methods=['post'])
def music_play_list_add():
    db = Sqlite3DB()
    db.insert_data("song_play_list", {'visitor_id': request.form['visitor_id'],
                                      'song_id': request.form['song_id'],
                                      'song_name': request.form['song_name'],
                                      'song_singer': request.form['song_singer'],
                                      'song_duration': request.form['song_duration'],
                                      'song_album_pic': request.form['song_album_pic'],
                                      'song_platform': request.form['song_platform'],
                                      'song_album_id': request.form['song_album_id'],
                                      'song_hash': request.form['song_hash'],
                                      'song_mid': request.form['song_mid']})
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/music/play/list/del', methods=['post'])
def music_play_list_del():
    db = Sqlite3DB()
    if request.form["song_id"] == 'all':
        db.execute(f'delete from song_play_list where visitor_id = "{request.form["visitor_id"]}";')
    else:
        db.execute(f'delete from song_play_list where visitor_id = "{request.form["visitor_id"]}" and song_id = {request.form["song_id"]};')
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/music/search', methods=['post'])
def music_search():
    result = {}
    song_name = request.form['song_name']
    song_platform = request.form['song_platform']
    if song_platform == 'netease-cloud':
        result = {
            'platform': '网易云音乐',
            'alias': 'netease-cloud',
            'song_list': netease_cloud_music.get_music_search(song_name),
        }
    if song_platform == 'kugou':
        result = {
            'platform': '酷狗音乐',
            'alias': 'kugou',
            'song_list': kugou_music.get_music_search(song_name),
        }
    if song_platform == 'qq':
        result = {
            'platform': 'QQ音乐',
            'alias': 'qq',
            'song_list': qq_music.get_music_search(song_name),
        }
    return render_template('song_list.html', result=result)


@app.route('/music/play/detail', methods=['post'])
def music_detail():
    song_platform = request.form['song_platform']
    if song_platform == 'netease-cloud':
        return jsonify(netease_cloud_music.get_music_detail(request.form['song_id']))
    if song_platform == 'kugou':
        return jsonify(kugou_music.get_music_detail(request.form['song_album_id'], request.form['song_hash']))
    if song_platform == 'qq':
        return jsonify(qq_music.get_music_detail(request.form['song_mid']))


@app.route('/image')
def image():
    db = Sqlite3DB()
    results = db.query_data("select distinct a.id, a.name, (select count(1) from image_list b where b.cat_tag = a.id) as count from image_cat_tag a")
    db.close()
    return render_template('image.html', results=results)


@app.route('/image/list', methods=['post'])
def image_list():
    db = Sqlite3DB()
    cat_tag = request.form['cat_tag']
    results = db.query_data(f"select a.*, b.name cat from image_list a left join image_cat_tag b on a.cat_tag = b.id where a.cat_tag = '{cat_tag}'")
    db.close()
    return jsonify(results)


@app.route('/image/list/add', methods=['post'])
@cross_origin()
def image_list_add():
    db = Sqlite3DB()
    results = db.query_data(f"select * from image_list where link = '{request.form['link']}'")
    if len(results) > 0:
        db.close()
        return jsonify({'status': 0, 'msg': '重复收藏！'})
    else:
        res = requests.get(request.form['link']).content
        img = Image.open(BytesIO(res))
        db.insert_data("image_list", {'cat_tag': '0',
                                      'link': request.form['link'],
                                      'size': f'{img.width} × {img.height}',
                                      'file_size': f'{round(len(io.BytesIO(res).read()) / 1000)} KB',
                                      'type': img.format,
                                      'create_time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M')})
        db.close()
        return jsonify({'status': 1, 'msg': '收藏成功！'})


@app.route('/image/list/del', methods=['post'])
def image_list_del():
    db = Sqlite3DB()
    db.execute(f'delete from image_list where link = "{request.form["link"]}";')
    db.close()
    return jsonify({'status': 1, 'msg': '删除成功！'})


@app.route('/image/cat_tag/add', methods=['post'])
def image_cat_tag_add():
    db = Sqlite3DB()
    id_str = ''.join(random.sample(string.ascii_letters + string.digits, 6))
    db.insert_data('image_cat_tag', {'id': id_str, 'name': request.form['name']})
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/image/cat_tag/del', methods=['post'])
def image_cat_tag_del():
    db = Sqlite3DB()
    db.execute(f'delete from image_cat_tag where id = "{request.form["id"]}";')
    db.close()
    return jsonify({'status': 1, 'msg': 'success'})


@app.route('/poetry')
def poetry():
    db = Sqlite3DB()
    results = [{
        'platform': '唐诗',
        'alias': 'ts',
        'poetry_list': db.query_data(f"select * from poetry_list where type = 'ts'"),
    }, {
        'platform': '宋词',
        'alias': 'sc',
        'poetry_list': db.query_data(f"select * from poetry_list where type = 'sc'"),
    }]
    db.close()
    return render_template('poetry.html', results=results)


@app.route('/video')
def video():
    return render_template('video.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
