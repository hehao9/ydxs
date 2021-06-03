import json
import requests
import re
from hashlib import md5
from pyquery import PyQuery
import urllib3
urllib3.disable_warnings()


def request_url(url, song_name):
    params = {
        'callback': '',
        'keyword': song_name,
        'page': 1,
        'pagesize': 30,
        'bitrate': 0,
        'isfuzzy': 0,
        'tag': 'em',
        'inputtype': 0,
        'platform': 'WebFilter',
        'userid': -1,
        'clientver': 2000,
        'iscorrection': 1,
        'privilege_filter': 0,
        'srcappid': 2919,
        'clienttime': 1616490162653,
        'mid': 1616490162653,
        'uuid': 1616490162653,
        'dfid': '-',
    }
    sign_lst = [
        'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt',
        f'bitrate={params["bitrate"]}',
        f'callback={params["callback"]}',
        f'clienttime={params["clienttime"]}',
        f'clientver={params["clientver"]}',
        f'dfid={params["dfid"]}',
        f'inputtype={params["inputtype"]}',
        f'iscorrection={params["iscorrection"]}',
        f'isfuzzy={params["isfuzzy"]}',
        f'keyword={params["keyword"]}',
        f'mid={params["mid"]}',
        f'page={params["page"]}',
        f'pagesize={params["pagesize"]}',
        f'platform={params["platform"]}',
        f'privilege_filter={params["privilege_filter"]}',
        f'srcappid={params["srcappid"]}',
        f'tag={params["tag"]}',
        f'userid={params["userid"]}',
        f'uuid={params["uuid"]}',
        'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt',
    ]
    params['signature'] = md5(''.join(sign_lst).encode('utf8')).hexdigest()
    response = requests.get(url, params=params, verify=False)
    return response.json()


def get_music_search(song_name):
    song_list = []
    if song_name.strip():
        url = 'https://complexsearch.kugou.com/v2/search/song'
        resp_json = request_url(url, song_name)
        if resp_json.get('status') == 1:
            songs = resp_json.get('data').get('lists')
            for song in songs:
                millis = int(song.get('Duration'))
                seconds = int(millis % 60)
                seconds = f'0{seconds}' if seconds < 10 else seconds
                minutes = int(millis / 60)
                minutes = f'0{minutes}' if minutes < 10 else minutes
                duration = f'{minutes}:{seconds}'
                is_vip = 0
                if song.get('trans_param') and song.get('trans_param').get('hash_offset') and \
                        song.get('trans_param').get('hash_offset').get('end_ms'):
                    is_vip = 1
                song_list.append({
                    'id': song.get('ID'),
                    'name': song.get('SongName').replace('<em>', '').replace('</em>', ''),
                    'singer': song.get('SingerName').replace('<em>', '').replace('</em>', ''),
                    'album': song.get('AlbumName'),
                    'album_pic': '',
                    'duration': duration,
                    'hash': song.get('FileHash'),
                    'album_id': song.get('AlbumID'),
                    # 'is_only': 0,
                    # 'has_mv': 0,
                    # 'mv_url': "",
                    'is_vip': is_vip,
                })
    return song_list


def get_music_detail(song_album_id, song_hash):
    url = 'https://wwwapi.kugou.com/yy/index.php'
    params = {
        'r': 'play/getdata',
        'callback': '',
        'hash': song_hash,
        'dfid': '3LJU5C366X0m3eWiYv22uBHs',
        'mid': '81bd157c0801a143219e2b7e401b0029',
        'platid': 4,
        'album_id': song_album_id,
        '_': 1616635942567,
    }
    response = requests.get(url, params=params, verify=False)
    resp_json = response.json()
    song_url = ''
    song_lyric = []
    if resp_json.get('status') == 1:
        song_url = resp_json.get('data').get('play_url')
        lyric = resp_json.get('data').get('lyrics')
        line_lyrics = lyric.split('\r\n')
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
    url = 'https://www.kugou.com/yy/html/rank.html'
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    }
    response = requests.get(url, headers=headers, verify=False)
    doc = PyQuery(response.text)
    for pc_rank in doc('.pc_temp_side > .pc_rank_sidebar').items():
        lis = []
        for li in pc_rank('ul > li').items():
            lis.append({
                'title': li('a').text(),
                'src': re.search('background-image:url\((.*?)\);', li('a > span').attr('style')).group(1),
                'top_id': re.search('1-(.*?).html', li('a').attr('href')).group(1),
            })
        top_list.append({
            'title': pc_rank('h3 > a').text(),
            'list': lis,
        })
    return top_list


def get_top_list_search(top_id):
    song_list = []
    url = f'https://www.kugou.com/yy/rank/home/1-{top_id}.html?from=rank'
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    }
    response = requests.get(url, headers=headers, verify=False)
    for song in json.loads(re.search('global.features = (.*?)}];', response.text).group(1) + '}]'):
        millis = int(song.get('timeLen'))
        seconds = int(millis % 60)
        seconds = f'0{seconds}' if seconds < 10 else seconds
        minutes = int(millis / 60)
        minutes = f'0{minutes}' if minutes < 10 else minutes
        duration = f'{minutes}:{seconds}'
        song_list.append({
            'id': song.get('encrypt_id'),
            'name': song.get('FileName'),
            'singer': song.get('FileName'),
            'album': '',
            'album_pic': '',
            'duration': duration,
            'hash': song.get('Hash'),
            'album_id': song.get('album_id'),
            # 'is_only': 0,
            # 'has_mv': 0,
            # 'mv_url': "",
            # 'is_vip': 0,
        })
    return song_list


if __name__ == '__main__':
    # print(get_music_search('寂寞沙洲冷'))
    # print(get_music_detail(964612, '843E2868FC13FA5D59322C629216FD59'))
    # get_top_list()
    get_top_list_search('8888')
