---
title: "screen.so: Linux client (i3wm), macOS host時に右のWindowsキーを⌘として使用する"
date: 2020-04-07T14:31:05.000Z
categories:
  - Linux
id: "26006613546526470"
draft: false
---
状況が特殊すぎて自分以外に参考にならないと思うので簡単なメモ

i3にて`$mod Mod4`して普段はWindowsキーを使って画面移動等を行なっている。
そのままだとscreen.soでホスト側を操作する場合にコピペ等ができない。


## 追記: 2020-04-20
xmodmapだとキーボードを再接続した時や、スリープからの復帰時に内容がリセットされてしまうためxkbで設定できないか模索中。


```
setxkbmap -option "lv3:lwin_switch"
```

これを設定すると、左の⌘が`ISO_Level3_Shift`に変換される。これはmod5にあたるので、i3では`$mod Mod5`することで良い感じに運用できそう。(他のPCと共有している設定なので他のPCでも設定しておかないと。。)
`xorg.conf`から設定できるので、永続化も簡単。


## 過去の対処法

mod3が空いているのでxmodmapでとりあえず割り当ててしまう。
```
remove mod4 = Super_R
add mod3 = Super_R
```

ちょうど自分の環境ではmod3を使っていないし、右のWindowsキーを殆んど使っていないので良い機会だしこういった設定にした。

