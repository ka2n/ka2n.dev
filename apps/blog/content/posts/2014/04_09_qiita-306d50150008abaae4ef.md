---
title: モーダルの表示などをアプリケーションテストで行う際のTips
date: 2014-04-09T15:00:00.000Z
categories:
  - iOS
id: "26006613540518849"
draft: false
---
*この記事は[Qiita](https://qiita.com/ka2n/items/306d50150008abaae4ef)の記事をエクスポートしたものです。内容が古くなっている可能性があります。*

KiwiなどでiOSのアプリケーションテストを書いている時、モーダルビューの表示をさせたい場合がある。

```objc
UIViewController *parentVC = [[UIViewController alloc] init];
UIViewController *targetVC = [[UIViewController alloc] init];
[parentVC presentViewController:targetVC animated:NO completion:nil];

it(@"モーダルとして表示されている", ^{
    [[[targetVC isMyModal] should] beYes]; // 例
});
```
しかし、テストコードを動かしてみると実際にモーダルビューを表示した時と挙動が違う場合がある。
モーダルに限らず、こういう場合は予め`UIWindow`の階層に入れてやるとうまくいく。

```objc                
[UIApplication sharedApplication].keyWindow.rootViewController = parentVC;
```

なお、ViewController内部の部品(ボタンとか)があることを確認したいだけであれば以下の様でOK

```objc
UIViewController *targetVC = [[UIViewController alloc] init];
[targetVC view]; // viewDidLoad等が実行される
```
