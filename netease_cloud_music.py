import codecs
import json
import random
import base64
import re
import requests
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from pyquery import PyQuery
import urllib3
urllib3.disable_warnings()


def make_random_str():
    s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    random_str = ''
    for i in range(16):
        index = random.randint(0, len(s) - 1)
        random_str += s[index]
    return random_str


def aes_encrypt(text, key):
    iv = '0102030405060708'
    encryptor = AES.new(key.encode(), AES.MODE_CBC, iv.encode())
    encrypt_aes = encryptor.encrypt(pad(text.encode(), AES.block_size))
    encrypt_text = base64.encodebytes(encrypt_aes).decode()
    return encrypt_text


def rsa_encrypt(text):
    text = text[::-1]
    pub_key = '010001'
    modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee' \
              '341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe487' \
              '5d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'
    rs = int(codecs.encode(text.encode('utf-8'), 'hex_codec'), 16) ** int(pub_key, 16) % int(modulus, 16)
    return format(rs, 'x').zfill(256)


def sign(text):
    key = '0CoJUm6Qyw8W8jud'
    random_str = make_random_str()
    enc_text = aes_encrypt(aes_encrypt(json.dumps(text), key), random_str)
    enc_sec_key = rsa_encrypt(random_str)
    return enc_text, enc_sec_key


def request_url(url, text):
    params, enc_sec_key = sign(text)
    data = {
        'params': params,
        'encSecKey': enc_sec_key,
    }
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    }
    response = requests.post(url, data=data, headers=headers, verify=False)
    return response.json()


def get_music_search(song_name):
    song_list = []
    if song_name.strip():
        url = 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token='
        text = {"hlpretag": "<span class=\"s-fc7\">", "hlposttag": "</span>", "s": song_name, "type": "1",
                "offset": "0", "total": "true", "limit": "30", "csrf_token": ""}
        resp_json = request_url(url, text)
        if resp_json.get('code') == 200:
            songs = resp_json.get('result').get('songs')
            for song in songs:
                millis = int(song.get('dt'))
                seconds = int((millis / 1000) % 60)
                seconds = f'0{seconds}' if seconds < 10 else seconds
                minutes = int(millis / (1000 * 60))
                minutes = f'0{minutes}' if minutes < 10 else minutes
                duration = f'{minutes}:{seconds}'
                is_vip = 0
                if (song['privilege']['fee'] == 0 or song['privilege']['payed']) and song['privilege']['pl'] > 0 and \
                        song['privilege']['dl'] == 0:
                    is_vip = 1
                if song['privilege']['dl'] == 0 and song['privilege']['pl'] == 0:
                    is_vip = 1
                song_list.append({
                    'id': song.get('id'),
                    'name': song.get('name'),
                    'singer': song.get('ar')[0].get('name'),
                    'album': song.get('al').get('name'),
                    'album_pic': song.get('al').get('picUrl'),
                    'duration': duration,
                    # 'is_only': 0,
                    'has_mv': 1 if song.get('mv') > 0 else 0,
                    'mv_url': f"https://music.163.com/#/mv?id={song.get('mv')}",
                    'is_vip': is_vip,
                })
    return song_list


def get_music_detail(song_id):
    url = 'https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token='
    text = {"ids": [song_id], "level": "standard", "encodeType": "aac", "csrf_token": ""}
    resp_json = request_url(url, text)
    song_url = ''
    if resp_json.get('code') == 200:
        song_url = resp_json.get('data')[0].get('url')

    url = 'https://music.163.com/weapi/song/lyric?csrf_token='
    text = {"id": song_id, "lv": -1, "tv": -1, "csrf_token": ""}
    resp_json = request_url(url, text)
    song_lyric = []
    if resp_json.get('code') == 200:
        lyric = resp_json.get('lrc').get('lyric')
        line_lyrics = lyric.split('\n')
        for line_lyric in line_lyrics:
            if line_lyric != '' and line_lyric.split(']')[1] != '':
                time_str = line_lyric.split(']')[0].split('[')[1]
                song_lyric.append({
                    't': int(time_str.split(':')[0]) * 60 + float(time_str.split(':')[1]),
                    'c': line_lyric.split(']')[1],
                })
    return {'url': song_url, 'lyric': song_lyric}


def get_top_list():
    top_list = []
    url = 'https://music.163.com/discover/toplist'
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    }
    response = requests.get(url, headers=headers)
    doc = PyQuery(response.text)
    for h2 in doc('#toplist .n-minelst h2').items():
        lis = []
        for li in h2.next('ul').children('li').items():
            lis.append({
                'title': li('a.avatar img').attr('alt'),
                'src': li('a.avatar img').attr('src').replace('40y40', '120y120'),
                'top_id': re.search('id=(.*)', li('a.avatar').attr('href')).group(1),
            })
        top_list.append({
            'title': h2.text(),
            'list': lis,
        })
    return top_list


if __name__ == '__main__':
    # print(get_music_search('寂寞沙洲冷'))
    # print(get_music_detail(1822207727))
    get_top_list()
