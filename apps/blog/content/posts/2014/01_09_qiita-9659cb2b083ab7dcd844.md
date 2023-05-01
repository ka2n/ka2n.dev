---
title: Dockerを使ってWebアプリケーションをデプロイする
date: 2014-01-09T15:00:00.000Z
categories:
  - Web
id: "26006613540518346"
draft: false
---
*この記事は[Qiita](https://qiita.com/ka2n/items/9659cb2b083ab7dcd844)の記事をエクスポートしたものです。内容が古くなっている可能性があります。*

```
この記事は2014年01月頃に書いた記事のため現在では内容が古く、正確でないかもしれません。
```

Dockerを使うと、隔離された環境でアプリケーションを動かすことができます。
今回は実際の開発中のアプリケーションの代わりに、Sentryをデプロイしてみます。


# はじめに

**Docker**
[Docker, Inc](http://blog.docker.io/)が公開している、Linuxコンテナを使って隔離された環境を構築できるソフトウェア

- [仮想環境構築に docker を使う - apatheia.info](http://apatheia.info/blog/2013/06/17/docker/)
- [Rebuild: 14: DevOps with Docker, chef and serverspec (naoya, mizzy)](http://rebuild.fm/14/)


**Sentry**
Pythonで書かれたエラーログギングツール。サービスとして利用することもできるが、自分で構築することもできる。Djangoベース
今回は実際のアプリケーションを想定してgithubから最新版のソースコードをチェックアウトします。

- https://getsentry.com/


# 環境
| | | 備考 |
|:-----------|:-----------|:--: |
|ホスト(Vagrant + VirtualBox) | Ubuntu 12.04 LTS| http://files.vagrantup.com/precise64.box |
|Docker |0.7.2, build 28b162e | |

ユーザー名: `ka2n`
ホームディレクトリ: `/home/ka2n/`

# 構成

Web <-> Host:80 <-> nginx <-> Docker container:4900-4990

Dockerを利用してSentryのコンテナを走らせ、nginx経由で外部に公開します。Sentryが保存するデータはホスト側に保持します。

# セットアップ

## Dockerのインストール

[ドキュメント](http://docs.docker.io/en/latest/installation/ubuntulinux/#ubuntu-precise)通りにインストールします。

Ubuntu12.04のカーネルだと不具合があるため、13.04のカーネルに更新

```bash
# カーネルを更新
sudo apt-get update
sudo apt-get install -y linux-image-generic-lts-raring linux-headers-generic-lts-raring
# 再起動
sudo reboot
```

Docker自体のインストールはすごく楽で、ワンライナーでまとめて実行してくれます。
中身はaptのソースを追加して`apt-get install`しているだけ。

```bash
sudo apt-get install -y curl # curlがなければ
curl -s https://get.docker.io/ubuntu/ | sudo sh
```

インストールされたか確認

```bash
sudo docker run -i -t ubuntu /bin/bash
# ubuntuコンテナで/bin/bashが立ち上がる。`exit`で閉じる
```

## イメージファイルを作成

次にDockerイメージをビルドするため、2つのDockerfileを作ります。

- ベース: 言語やライブラリをセットアップした環境
- アプリケーション: ベースにさらにgithubから最新のコードをチェックアウトしたコンテナ

### Dockerfile

```docker:~/sentry/base/Dockerfile
# ubuntuイメージからスタート
FROM ubuntu

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

# よく使うコマンドを追加
RUN apt-get install -y curl sudo git-core vim 
RUN apt-get install -y build-essential gcc

###### Python #####

RUN apt-get -y -q install python python-dev

# setuptoolsをインストール
ADD https://bitbucket.org/pypa/setuptools/raw/0.8/ez_setup.py /tmp/ez_setup.py
RUN python /tmp/ez_setup.py

# pipをインストール
ADD https://raw.github.com/pypa/pip/master/contrib/get-pip.py /tmp/get-pip.py
RUN python /tmp/get-pip.py

```

```docker:~/sentry/app/Dockerfile
# baseイメージからスタート
FROM ka2n/base

###### アプリケーションをセットアップ #####

# アプリケーションのコードをコンテナの/appに追加
ADD /src /app

# インストール(`bundle install`とか`npm install`とか)
RUN pip install /app

# 設定ファイルを追加
ADD /conf/sentry.conf.py /sentry.conf.py


##### Docker ####

EXPOSE 9000 # Sentryが起動するHTTPサーバのポート
ENTRYPOINT ["sentry", "--config=/sentry.conf.py"]
CMD ["start"]

```

## アプリケーションの設定

Sentry用の設定ファイルを作ります。
ポイントとしては、環境変数から設定値を書き込むように変更してあります。

```python:~/sentry/conf/sentry.conf.py
import os.path
import os

CONF_ROOT = os.path.dirname(__file__)

DB_NAME = os.environ.get('SENTRY_DB', os.path.join(CONF_ROOT, 'sentry.db'))
DB_USER = os.environ.get('SENTRY_DB_USER', '')
DB_PASS = os.environ.get('SENTRY_DB_PASS', '')
DB_HOST = os.environ.get('SENTRY_DB_HOST', '127.0.0.1')
DB_PORT = os.environ.get('SENTRY_DB_PORT', '')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',

        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}


SENTRY_PUBLIC = False
SENTRY_ALLOW_REGISTRATION = False

################
## Web Server ##
################

# You MUST configure the absolute URI root for Sentry:
SENTRY_URL_PREFIX = os.environ.get('SENTRY_URL_PREFIX', 'http://sentry.example.com')

ALLOWED_HOSTS = ["*"]

SENTRY_WEB_HOST = '0.0.0.0'
SENTRY_WEB_PORT = os.environ.get('SENTRY_PORT', 9000)
SENTRY_WEB_OPTIONS = {
    'workers': 3,  # the number of gunicorn workers
    'limit_request_line': 0,  # required for raven-js
    'secure_scheme_headers': {'X-FORWARDED-PROTO': 'https'},
}


###########
## etc. ##
###########

SECRET_KEY = '<Your Secret Key>'
```

ちなみにこれはテスト用途の設定のため、実運用では別途設定値を追加する必要があります。


## 操作用スクリプト

イメージのビルドと実行をするために`build.sh`と`run.sh`を作ります。

### ~/sentry/build.sh

```bash:build.sh
#!/bin/bash

APP_IMAGE_NAME=ka2n/sentry

# アプリケーションを更新
pushd ./app/src
git fetch origin
git reset --hard origin/master
popd

# アプリケーションイメージをビルド
docker build -t=$APP_IMAGE_NAME ./app

```
最新のソースコードのチェックアウトと、インストールまで行ったイメージを作成します。

### ~/sentry/run.sh

```bash:run.sh
#!/bin/bash

APP_IMG_NAME=ka2n/sentry
APP_VHOST=sentry.example.com

# 同じタグで実行中のコンテナをリストアップ
CURRENT_CONTAINERS=`docker ps | grep $APP_IMG_NAME | awk '{print $1}'`
echo "[Running containers]"
echo "$CURRENT_CONTAINERS"

# ファイル永続化用のディレクトリを作成
mkdir -p /var/app/sentry

# 新しいコンテナを起動する
echo "[Launch new container]"
docker run \
    -d \
    -v /var/app/sentry:/sentry/state \
    -e SENTRY_DB=/sentry/state/sentry.db \
    -e SENTRY_URL_PREFIX="http://$APP_VHOST" \
    -e SENTRY_PORT=9000 \
    -p 9000 \
   $APP_IMG_NAME

# コンテナの情報を取得
NEW_ID=`docker ps -l -q`
NEW_ADDR=`docker port $NEW_ID 9000`
NEW_PORT=${NEW_ADDR#0.0.0.0:}
NEW_IP=`docker inspect --format="{{ .NetworkSettings.IPAddress }}" $NEW_ID`

echo "[New container info]"
echo "CONTAINER ID: ${NEW_ID}"
echo "IP: ${NEW_IP}"

sleep 1

# NGINX用の設定ファイルを生成
echo "[Write new nginx config]"
cat <<EOF > ./nginx-app.conf
upstream container-sentry { server 127.0.0.1:$NEW_PORT; }
server {
    listen   80;
    server_name $APP_VHOST;

    proxy_set_header   Host                 \$http_host;
    proxy_set_header   X-Real-IP            \$remote_addr;
    proxy_set_header   X-Forwarded-For      \$proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto    \$scheme;
    proxy_redirect     off;

    location / {
        proxy_set_header Host \$host;
        proxy_pass http://container-sentry;
        break;
    }
}
EOF

# NGINXをリロード
service nginx reload

# 古いコンテナをシャットダウン
echo "[Shutting down old containers]"
if [ -n "$CURRENT_CONTAINERS" ]; then
    docker kill $CURRENT_CONTAINERS
fi

echo "[Done]"

```

新しいコンテナを立ち上げます。
データベースなどの情報は環境変数を通じてこの時に渡します。
今回はsqliteを使用するので、データベースファイルを保存する永続化用のディレクトリパスを環境変数`SENTRY_DB`に指定しています。

また、コンテナを破棄&nbsp;起動するたびにホストへフォーワードされるポート番号が変化するのでnginxの設定を更新する必要があります。
このシェルスクリプトはコンテナを立ち上げた後、nginx用の設定を`~/sentry/nginx-app.conf`に出力します。


## ファイル構成

最終的なファイル構成は以下のようになりました。

```bash
~/sentry
├── state # 永続化するデータを保存するディレクトリ
├── nginx-app.conf # 自動生成されるNGINX用の設定ファイル
├── app
│   ├── Dockerfile
│   ├── conf
│   │   └── sentry.conf.py # アプリケーション設定
│   └── src # アプリケーション本体
├── base
│   └── Dockerfile
├── build.sh         # ソースコードのアップデート, イメージのビルド
└── run.sh           # コンテナ実行、nginxへの登録, 古いコンテナの破棄
```


## Webサーバの設定

ホスト側にインストールされているNGINXの`nginx.conf`の`http`ディレクティブ内に以下の設定を追記します

```nginx
http {
	# …
	include /home/ka2n/sentry/nginx-*.conf;
}
```


## アプリケーションのビルド

ベースイメージをビルドします。
初回とベースのDockerfileを更新した場合のみこのビルドから実行します。

```bash
sudo docker build -t=ka2n/base ~/sentry/base
```

次にベースイメージを元にしてアプリケーションイメージをビルドします。

```bash
cd ~/sentry
sudo ./build.sh
```


## アプリケーションの実行

```bash
cd ~/sentry
sudo ./run.sh
```

古いコンテナが破棄され、新しいコンテナが起動します。
データベースの接続情報などはこの時点で初めてアプリケーションに注入されます。
アプリケーションのソースコードが更新された場合でも`build.sh` -> `run.sh`を実行するだけでコンテナごと新しいものに差し替えることができます。

## まとめ

Dockerを使うことで、herokuなどのPaaSに移行したり逆にherokuからDockerへと移行したりと、可搬性の高いアプリケーションにすることができます。

- http://www.docker.io/

