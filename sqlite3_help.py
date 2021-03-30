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
    # db.create_table('song_play_list', ['visitor_id', 'song_id', 'song_name', 'song_singer', 'song_album',
    #                                    'song_duration', 'song_platform', 'song_album_id', 'song_hash'])
    # db.insert_data("song_play_list", {'visitor_id': '93900461f5b249e998e9ce7128d47021', 'song_id': '190072',
    #                                   'song_name': '黄昏', 'song_singer': '周传雄', 'song_album': '忘记 transfer',
    #                                   'song_duration': '05:44', 'song_platform': 'netease-cloud',
    #                                   'song_album_id': '', 'song_hash': ''})
    # db.execute('delete from song_play_list where song_id = "190072"')
    # db.execute('drop table song_play_list')
    print(db.query_data("select * from song_play_list where visitor_id = '93900461f5b249e998e9ce7128d47021'"))
    db.close()
