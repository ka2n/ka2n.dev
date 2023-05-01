---
title: Configspecを使ってみた
date: 2014-04-26T15:27:02.000Z
id: "12921228815722757689"
draft: false
---
最近Chef疲れが激しく、ちょうど仕事でそれを話す機会があった。Configspecの話題も出たのだけど実際には動かしたことがなかったConfigspecを使ってみました。


そしたら、ほとんど動いていないようだったのでちょっと触っています。
結局`serverspec/serverspec`からコピペする所と(別プロジェクトとはいえあんまり乖離しないほうが良いと思った)、`serverspec/specinfra`に手を入れる所がありプロジェクトを行き来するのは少し面倒だった。もうちょっと書いたらPRしてみよう。

あと、SpecInfra::Backend::Base.method_missingはメソッド名が`/^check/`の場合はそのまま同名のCommandモジュールのメソッドを実行して終了コードが0かチェックする。
けど副作用をもたらすコマンド向けにはどんなprefixが良いか悩んだ。
今のところは`make`と`change`を追加した。最初は`make`だけにしてたけど
`make_mode_changed`よりは`change_mode`の方が良いと思って追加しmasita。


* https://github.com/ka2n/configspec
* https://github.com/ka2n/specinfra
