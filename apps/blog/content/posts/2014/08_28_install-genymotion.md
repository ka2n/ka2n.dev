---
title: Genymotion
date: 2014-08-28T23:00:00.000Z
id: "12921228815731515309"
draft: false
---
最近Androidを使うようになり、そろそろ開発を始めようと手をつけ始めました。

[http://www.genymotion.com]

VirtualBoxにAndroid入れて動かせば早いよね！という製品。
商用で展開していたんですね。上位プランはより実機に近いパラメータのエミュレートやセンサーの操作、Genymotion側のサポートが利用できる模様。
利用するにはVirtualBoxのインストールと[http://www.genymotion.com/:title]でアカウント作成が必要。

### How to use

インストールとGenymotion Shellの起動

```
$ brew cask install genymotion
$ open /Applications/Genymotion.app
```

あとは`Add`ボタンを押し、仮想マシンの種類やOSのバージョンを選ぶだけで環境が手に入った。
Virtual devicesから作成した環境を選んでPlayボタンを押すとデバイスが起動する。簡単ですね。

### 設定

実は最初は起動しなかった。VirtualBoxのHost-Onlyネットワークの設定とGenymotionが通信に使おうとするIPアドレスがずれてしまっていたのが原因っぽい。
Genymotionが通信に使おうとするIPアドレスが`192.168.56.0/24`になっているみたいで、設定で変えられるようなGUIは見当たらなかった。

VirtualBoxで `Command - ,` > `Host-only Network`の設定を開く。
`vboxnet0` を編集し、IPv4アドレスやDHCPサーバを上記の範囲で動くように設定した。
余っているvboxnet**x**に同じ設定をして、GenymotionのVMのネットワークアダプタに指定する方が他にVMがある場合はその方が良い。

### そのほか

Genymotion Shellというのがあり、ワクワクしたが仮想マシンの作成はできなかった。残念だね。
作成済みのものを管理するためのシェルかな。

```
$ open /Applications/Genymotion\ Shell.app

Welcome to Genymotion Shell
Genymotion Shell > help

List of available commands:
---------------------------
android             informations related to Android system included in Genymotion distribution
battery             actions and informations related to battery sensor
devices             generic actions related to virtual devices (listing, selection, ...)
exit                quit this application
genymotion          informations related to Genymotion system
gps                 actions and informations related to Global Positioning System sensor
help                display this help and display help for each verb
pause               make a pause (useful for automatic tests)
quit                quit this application
rotation            actions related to the rotation of virtual device
version             display version number of running Genyshell

```
