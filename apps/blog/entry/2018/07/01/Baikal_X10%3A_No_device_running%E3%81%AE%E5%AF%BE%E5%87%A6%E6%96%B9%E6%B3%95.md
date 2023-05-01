---
title: "Baikal X10: No device runningの対処方法"
date: 2018-07-01T03:10:01.000Z
id: "10257846132596934385"
draft: false
---
Baikal X10のコントロールボードのファームウェアを焼き直すことで、この状態から復帰できた。

## エラーの時に何が起こっているか

### ソフトウェアの状態

- 管理画面
  - Minerはオンラインだが、デバイスが一切認識されず、`No devices running`とエラーが表示される
- マイニングプログラム
  - ASICにsshでログインして`sudo screen -r`でマイニングプログラム(sgminer)を表示し、Device listを表示してもUSBデバイスが1つも認識されていない状態になる

### ハードウェアの状態

- 各ボードの赤いLEDのみが点灯し、他のLEDは消灯している

## 問題への対処

各ボードのFPGAにイメージを書き込み直すと、再認識されることがある

### 対処手順

#### 1. FPGA用データをFWから抽出する

公開されているFWをダウンロードする。
Baikal X10の場合は[こちら](https://github.com/baikalminer/GX10/tree/master/orangepi)にリンクがあるはず。
現在公開されている最新のFWである`PiZero_GX10_180410_V1.2.img`を`/tmp/PiZero_GX10_180410_V1.2.img`に保存。

次に、ダウンロードしたイメージファイルからコントロールボード用のイメージを抽出する。
FWのブートローダーパーティションに存在するので、目的のパーティションの位置を調べ、mountする。

```
$ fdisk -l -u ./PiZero_GX10_180410_V1.2.img
Disk ./PiZero_GX10_180410_V1.2.img: 428.6 MiB, 449443328 bytes, 877819 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x0007a4f5

Device                         Boot  Start     End Sectors  Size Id Type
./PiZero_GX10_180410_V1.2.img1       40960  172031  131072   64M  b W95 FAT32
./PiZero_GX10_180410_V1.2.img2      172032 7544831 7372800  3.5G 83 Linux
```

セクターサイズが`512bytes`, 目的のブートローダーパーティションはStartが`40960`にある。
マウント先を作成してから、`セクターサイズ * Start `をoffsetとして指定してマウントして、ファイルを保存する。

```
$ sudo mkdir /mnt/pizero
$ sudo mount -t vfat -o loop,offset=20971520 ./PiZero_GX10_180410_V1.2.img /mnt/pizero/
```

```
$ ls -la /mnt/pizero
total 4.6M
-rwxr-xr-x 1 root root  535 11月 22  2016  boot.scr*
-rwxr-xr-x 1 root root  17K  4月 11 01:47  GX10.bin*
-rwxr-xr-x 1 root root  35K 10月 20  2017  script.bin*
drwxr-xr-x 2 root root  512 12月 13  2016 'System Volume Information'/
-rwxr-xr-x 1 root root 4.5M 11月 22  2016  uImage*
$ cp /mnt/pizero/GX10.bin ~/
```

`GX10.bin`がコントロールボード用のイメージであり、実際にASICで稼働する際は`/media/boot/GX10.bin`に配置され、初回起動時に`/media/boot/G*.bin`にファイルが存在する場合にコントロールボードである`STM32F407`へ書き込みを行う仕組み。
初回起動時に何らかの理由で書き込みに失敗すると、今回のような状態になる場合がある。

#### 2. コントロールボード用データをASICに転送

ASICが接続されているネットワークに接続し、取り出した`GX10.bin`を転送する。もちろんASICから取り出したSDカードに直接配置しても良い。
ちなみにsshでログインするには`ユーザー名: baikal, パスワード: baikal`を使用する。

```
$ scp ./GX10.bin baikal@<ASICのIPアドレス>:/tmp/GX10.bin
$ ssh baikal@<ASICのIPアドレス> sudo cp /tmp/GX10.bin /media/boot/GX10.bin
```

#### 3. コントロールボード用データを書き込む

配置した段階で起動時に自動的に書き込まれるはずではあるが、出力が見えないのでSSHでログインして書き込みを実行する。

```
$ ssh baikal@<ASICのIPアドレス>
$ su -
# check_update.py


Downloading... /media/boot/GX10.bin
dfu-util 0.8

Copyright 2005-2009 Weston Schmidt, Harald Welte and OpenMoko Inc.
Copyright 2010-2014 Tormod Volden and Stefan Schmidt
This program is Free Software and has ABSOLUTELY NO WARRANTY
Please report bugs to dfu-util@lists.gnumonks.org

dfu-util: Invalid DFU suffix signature
dfu-util: A valid DFU suffix will be required in a future dfu-util release!!!
Opening DFU capable USB device...
ID 0483:df11
Run-time device DFU version 011a
Claiming USB DFU Interface...
Setting Alternate Setting #0 ...
Determining device status: state = dfuERROR, status = 10
dfuERROR, clearing status
Determining device status: state = dfuIDLE, status = 0
dfuIDLE, continuing
DFU mode device DFU version 011a
Device returned transfer size 2048
DfuSe interface name: "Internal Flash  "
Downloading to address = 0x08000000, size = 16616
Download        [=========================] 100%        16616 bytes
Download done.
File downloaded successfully
Transitioning to dfuMANIFEST state
Done
```

## 参考リンク

- [【Linux】ディスクイメージをマウントする【ループバックデバイス】 - Man On a Mission](https://oplern.hatenablog.com/entry/2017/06/30/231027)
- [sgminer: Baikal Giant X10 / N / B - Open Source - Confirmed OC Giant B!](https://bitcointalk.org/index.php?topic=3206908.60)
- [Baikal X10 ⚡OVERCLOCK⚡ Claim reward 0.2 BTC for TUTORIAL HOW TO :)⚡⚡⚡⚡](https://bitcointalk.org/index.php?topic=2790982.msg29642597#msg29642597)
- [Giant X10 stop working every few days or hours · Issue #2 · baikalminer/GX10 · GitHub](https://github.com/baikalminer/GX10/issues/2)


## 最後に

これでもダメならメーカーに相談しよう
