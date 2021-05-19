import sqlite3


class Sqlite3DB:
    def __init__(self, db_name=None):
        self.conn = sqlite3.connect(db_name if db_name else 'system.db')
        self.cursor = self.conn.cursor()

    def create_table(self, table_name: str, field_list: list):
        """
        创建表格
        :param table_name: 表名
        :param field_list: 字段列表,例如：["name","age","gender"]
        :return:
        """
        fields = ",".join([field + " TEXT" for field in field_list])
        sql = f"CREATE TABLE {table_name} ({fields});"
        self.cursor.execute(sql)
        self.conn.commit()

    def insert_data(self, table_name: str, data):
        """
        插入数据，根据传入的数据类型进行判断，自动选者插入方式
        :param table_name: 表名
        :param data: 要插入的数据
        :return:
        """
        if isinstance(data, list):
            for item in data:
                keys = ",".join(list(item.keys()))
                values = ",".join([f"'{x}'" for x in list(item.values())])
                sql = f"INSERT INTO {table_name} ({keys}) VALUES ({values});"
                self.cursor.execute(sql)
        elif isinstance(data, dict):
            keys = ",".join(list(data.keys()))
            values = ",".join([f"'{x}'" for x in list(data.values())])
            sql = f"INSERT INTO {table_name} ({keys}) VALUES ({values});"
            self.cursor.execute(sql)
        self.conn.commit()

    def query_data(self, sql: str) -> list:
        """
        查询数据
        :param sql: 要查询的sql语句
        :return:
        """
        results = []
        self.cursor.execute(sql)
        cols = [desc[0] for desc in self.cursor.description]
        for row in self.cursor.fetchall():
            data = {}
            for i, col in enumerate(cols):
                data[col] = row[i]
            results.append(data)
        return results

    def execute(self, sql: str):
        """
        查询数据
        :param sql: 要执行的sql语句
        :return:
        """
        self.cursor.execute(sql)
        self.conn.commit()

    def close(self):
        """
        关闭数据库连接
        :return:
        """
        self.cursor.close()
        self.conn.close()


if __name__ == '__main__':
    db = Sqlite3DB()

    # db.execute('drop table song_play_list')
    # db.execute('delete from song_play_list where song_id = "190072"')
    # db.create_table('song_play_list', ['visitor_id', 'song_id', 'song_name', 'song_singer',
    #                                    'song_duration', 'song_album_pic', 'song_platform', 'song_album_id',
    #                                    'song_hash', 'song_mid'])
    # db.insert_data("song_play_list", {'visitor_id': '93900461f5b249e998e9ce7128d47021', 'song_id': '190072',
    #                                   'song_name': '黄昏', 'song_singer': '周传雄', 'song_duration': '05:44',
    #                                   'song_platform': 'netease-cloud', 'song_album_id': '', 'song_hash': '', 'mid': ''})

    # db.execute('delete from image_list where visitor_id = "93900461f5b249e998e9ce7128d47021"')
    # db.create_table('image_list', ['visitor_id', 'link'])
    # db.insert_data("image_list", {'visitor_id': '93900461f5b249e998e9ce7128d47021', 'link': '//hbimg.huabanimg.com/9d9c27876a67a539b9865b2f01ee4fddbdeb955fc204c-cMmH7Q_/fw/480/format/webp'})

    # db.execute('drop table poetry_list')
    # db.create_table('poetry_list', ['title', 'author', 'content', 'type'])
    db.insert_data('poetry_list',
                   {'title': '蝉', 'author': '虞世南', 'content': '垂緌饮清露+++流响出疏桐+++居高声自远+++非是藉秋风', 'type': 'ts'})
    db.insert_data('poetry_list', {'title': '野望', 'author': '王绩',
                                   'content': '东皋薄暮望+++徙倚欲何依+++树树皆秋色+++山山唯落晖+++牧人驱犊返+++猎马带禽归+++相顾无相识+++长歌怀采薇',
                                   'type': 'ts'})
    db.insert_data('poetry_list',
                   {'title': '于易水送人', 'author': '骆宾王', 'content': '此地别燕丹+++壮士发冲冠+++昔时人已没+++今日水犹寒', 'type': 'ts'})
    db.insert_data('poetry_list', {'title': '点绛唇·感兴', 'author': '王禹偁',
                                   'content': '雨恨云愁+++江南依旧称佳丽+++水村渔市+++一缕孤烟细+++天际征鸿+++遥认行如缀+++平生事+++此时凝睇+++谁会凭阑意',
                                   'type': 'sc'})

    print(db.query_data("select * from poetry_list"))

    db.close()
