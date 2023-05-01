---
title: PySideを使ってみる (OSX 10.9, Python3.3)
date: 2014-03-30T16:22:18.000Z
id: "12921228815721019150"
draft: false
---
<p><span itemscope itemtype="http://schema.org/Photograph"><img src="http://cdn-ak.f.st-hatena.com/images/fotolife/k/ka2nn/20140331/20140331103123.png" alt="f:id:ka2nn:20140331103123p:plain" title="f:id:ka2nn:20140331103123p:plain" class="hatena-fotolife" itemprop="image"></span></p>



[http://ka2n.hatenablog.com/entry/2014/03/31/node-webkit:title]

今やっている用途には向かなかったので結局PySideにした
`pip install PySide`とかじゃ上手く行かなくて辛い。

```shell
$ python3 setup.py bdist_egg --version=1.2.1 --qmake=/opt/boxen/homebrew/Cellar/qt/HEAD/bin/qmake
```

時間かかりそうだしとりあえずこれを実行して寝る。


-----

追記

失敗してた。`1.2.1`だとビルドできない。`1.3.0dev`でできた。
```shell
$ python3 setup.py bdist_egg --qmake=/opt/boxen/homebrew/Cellar/qt/HEAD/bin/qmake --no-examples
$ eazy_install ./dist/PySide-1.3.0dev-py3.3-macosx-10.9-x86_64.egg
```

```python
from PySide import QtGui
```

インポートがうまくいかない。ライブラリがロードされていないと言われる。
存在してるけど。

```
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    from PySide import QtGui
ImportError: dlopen(/Users/user/.virtualenvs/myenv/lib/python3.3/site-packages/PySide-1.3.0dev-py3.3-macosx-10.9-x86_64.egg/PySide/QtGui.so, 2): Library not loaded: libpyside.cpython-33m.1.2.dylib
  Referenced from: /Users/user/.virtualenvs/myenv/lib/python3.3/site-packages/PySide-1.3.0dev-py3.3-macosx-10.9-x86_64.egg/PySide/QtGui.so
  Reason: image not found
```

[https://github.com/PySide/pyside-setup#id26:title]
ここをよく見たら`pyside_postinstall.py -install`をする必要があった。書いてある通りにやれば動くから十分かな。でももっと楽にできると良い。こういうの好まないけど優秀な人はいるから。


main.py
```python
# -*- coding: utf-8 -*-

import sys
from PySide import QtGui

def main():
    app = QtGui.QApplication(sys.argv)
    win = QtGui.QWidget()

    win.resize(320, 240)
    win.setWindowTitle("Hello")
    win.show()

    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
```


<p><span itemscope itemtype="http://schema.org/Photograph"><img src="http://cdn-ak.f.st-hatena.com/images/fotolife/k/ka2nn/20140331/20140331083724.png" alt="f:id:ka2nn:20140331083724p:plain" title="f:id:ka2nn:20140331083724p:plain" class="hatena-fotolife" itemprop="image"></span></p>


なんでsetup.pyでできないのか後で調べる。

-----
追記

`pyside_postinstall.py -install`でやっていること

- 実行ファイル(`shiboken`,`patchelf`)に実行権限を追加
- `*.so`に`patchelf`コマンドでrpathをセット

`rpath`ってのはLDみたいなやつか。



[https://nixos.org/patchelf.html:title]
> PatchELF is a small utility to modify the dynamic linker and RPATH of ELF executables.

ELFってのは`.so`とかの事を指す([Wikipedia調べ](http://ja.wikipedia.org/wiki/Executable_and_Linkable_Format))


`.egg`ではインストール後にスクリプトを実行できないのかな.
`.egg`のフォーマットを調べよう。そのうち。
