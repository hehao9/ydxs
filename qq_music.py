import base64
import random
import string

import requests
import hashlib
import urllib3

urllib3.disable_warnings()


def get_music_search(song_name):
    song_list = []
    if song_name.strip():
        url = f'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.center&searchid=41625092196446078&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=1&n=20&w={song_name}&g_tk_new_20200303=1821604477&g_tk=1821604477&loginUin=1152921504958843334&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0'
        response = requests.get(url, verify=False)
        resp_json = response.json()
        if resp_json.get('code') == 0:
            songs = resp_json.get('data').get('song').get('list')
            for song in songs:
                millis = int(song.get('interval'))
                seconds = int(millis % 60)
                seconds = f'0{seconds}' if seconds < 10 else seconds
                minutes = int(millis / 60)
                minutes = f'0{minutes}' if minutes < 10 else minutes
                duration = f'{minutes}:{seconds}'
                song_list.append({
                    'id': song.get('id'),
                    'name': song.get('title'),
                    'singer': song.get('singer')[0].get('name'),
                    'album': song.get('album').get('name'),
                    'duration': duration,
                    'mid': song.get('mid'),
                    'is_only': 1 if song.get('isonly') == 1 else 0,
                    'has_mv': 1 if song.get('mv').get('id') > 0 and song.get('mv').get('vid') else 0,
                    'mv_url': f"https://y.qq.com/n/yqq/mv/v/{song.get('mv').get('vid')}.html",
                    'is_vip': 1 if song.get('pay').get('pay_month') and song.get('pay').get('pay_month') > 0 and
                                   song.get('pay').get('pay_play') > 0 else 0,
                })
    return song_list


def get_sign(data):
    sign = 'zza'
    sign += ''.join(random.sample(string.ascii_lowercase + string.digits, random.randint(10, 16)))
    sign += hashlib.md5(f'CJBPACrRuNy7{data}'.encode(encoding="UTF-8")).hexdigest()
    return sign


def get_music_detail(mid):
    song_url = ''
    song_lyric = []
    # 获取歌曲URL地址
    data = '{"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"7125111008","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"7125111008","songmid":["' + mid + '"],"songtype":[0],"uin":"1152921504958843334","loginflag":1,"platform":"20"}},"comm":{"uin":"1152921504958843334","format":"json","ct":24,"cv":0}}'
    sign = get_sign(data)
    url = f'https://u.y.qq.com/cgi-bin/musics.fcg?-=getplaysongvkey6979654640577382&g_tk=1821604477&sign={sign}&loginUin=1152921504958843334&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data={data}'
    response = requests.get(url, verify=False)
    resp_json = response.json()
    if resp_json.get('code') == 0:
        song_url = 'http://ws.stream.qqmusic.qq.com/' + resp_json.get('req_0').get('data').get('midurlinfo')[0].get(
            'purl')
    # 获取歌词
    url = f'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?-=MusicJsonCallback_lrc&pcachetime=1618968162761&songmid={mid}&g_tk_new_20200303=1821604477&g_tk=1821604477&loginUin=1152921504958843334&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0'
    headers = {
        'referer': 'https://y.qq.com/',
    }
    response = requests.get(url, headers=headers, verify=False)
    resp_json = response.json()
    if resp_json.get('code') == 0:
        lyric = resp_json.get('lyric')
        lyric = base64.b64decode(lyric).decode("utf-8")
        line_lyrics = lyric.split('\r\n' if '\r\n' in lyric else '\n')
        for line_lyric in line_lyrics:
            if line_lyric != '' and line_lyric.split(']')[1] != '':
                time_str = line_lyric.split(']')[0].split('[')[1]
                song_lyric.append({
                    't': int(time_str.split(':')[0]) * 60 + float(time_str.split(':')[1]),
                    'c': line_lyric.split(']')[1],
                })
    return {'url': song_url, 'lyric': song_lyric}


if __name__ == '__main__':
    # print(get_music_search('分身'))
    print(get_music_detail('000RFNJc4AmUuD'))
