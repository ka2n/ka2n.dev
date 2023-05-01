---
title: now.shとFastlyを組み合せる場合の設定
date: 2020-03-13T16:49:11.000Z
id: "26006613534841594"
draft: false
---
now.shを好んで使っているが、CDNレイヤーの挙動が満足いかない事がありFastlyを試してみている。

[ドキュメント](https://zeit.co/docs/v2/network/caching#cacheable-responses)によると、now.sh自体のCDNをバイパスするにはいくつか条件があるみたいだけど、リクエストパラメーターに`?_now_no_cache=1`が付与されていれば良い模様。

[![Image from Gyazo](https://i.gyazo.com/c65955c8351378d1fea7c89ee5290d58.png)](https://gyazo.com/c65955c8351378d1fea7c89ee5290d58)

レスポンスヘッダーに`x-now-cache: BYPASS`が入るようになり、`Cache-Control`ヘッダーも勝手に修正されなくなった。

これをVCLで実現するには以下のようなVCL Snippetを追加すればそれでOKらしい。

```vcl
set req.url = querystring.add(req.url, "_now_no_cache", "1");
```

簡単にできて面白い。
