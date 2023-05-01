---
title: Facebook/Tweaks
date: 2014-04-02T16:26:31.000Z
id: "12921228815721199120"
draft: false
---
便利

# Facebook/Tweaks とは

iOS用のライブラリで、これを組み込むと、端末を振ったら設定画面がでてくるようになる。
その設定画面から値を変更することができる。
アニメーションの調整とかでいちいち再ビルドする必要がなくて便利。

こうすると
```objc
CGFloat animationDuration = FBTweakValue(@"Category", @"Group", @"Duration", 0.5);
```

`animationDuration`の値を設定画面から変更することができる。


こういう工夫があるとエンジニアとデザイナーで協力して調整するときにハードルを下げられる。((Githubには設定値をメールできるようにする[PR](https://github.com/facebook/Tweaks/pull/12)があがっていた))
小さいライブラリだけどこういった形でちゃんとまとめてリリースしたり、
`Objective-C`のランタイムを使っている所とかFacebookカッコいいなと思う。
