---
title: Home Assistant x co2mini
date: 2021-04-12T01:17:08.000Z
id: "26006613715161287"
draft: true
---
co2メーターのco2miniを便利に使っている。
コロナ自粛がはじまってすぐの頃にモノタロウで購入した。


[https://twitter.com/ka2nJa/status/1253130907306741760:embed]


こいつは設定したしきい値になったらランプを緑からオレンジにしたり、赤にしたりできるのでパット確認するのにとても便利で、狭い作業部屋の空気品質の管理に一役買っている。


これを最近導入したHomeAssistantと連携させてみた。
おおまかな流れ


* co2miniに接続しているPC(常に起動している)からUSB経由でデータ取得
* HomeAssistantを動かしているminiPC(nanoPi Neo2)にSSHでデータを送る
* HomeAssistantの`sensor type=command_line`でデータを取り込む



