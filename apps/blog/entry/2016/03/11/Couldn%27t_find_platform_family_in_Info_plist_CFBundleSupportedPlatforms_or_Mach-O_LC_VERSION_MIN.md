---
title: Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN
date: 2016-03-11T10:37:34.000Z
id: "10328537792366658479"
draft: false
---
iOSアプリをビルドするとき表題のエラーに遭遇したので対処方法をメモしておく.

```bash
2016-03-11 19:11:18.514 xcodebuild[60812:3928219] [MT] DVTAssertions: Warning in /Library/Caches/com.apple.xbs/Sources/DVTFrameworks/DVTFrameworks-9544/DVTFoundation/FoundationClassCategories/DVTNSBundleAdditions.m:123
Details:  Error Domain=DVTFoundationErrorDomain Code=-1 "Couldn't determine platform family for <TheLib>." UserInfo={NSFilePath=/Users/ka2n/Library/Developer/Xcode/Archives/2016-03-11/Alice 2016-03-11 19.06.10.xcarchive/Products/Applications/Alice.app/Frameworks/AliceUI.framework/<TheLib>.framework.dSYM/Contents/Resources/DWARF/<TheLib>, NSLocalizedDescription=Couldn't determine platform family for <TheLib>., NSLocalizedRecoverySuggestion=None of the available platform families (iOS, OS X, tvOS, and watchOS) matched an LC_VERSION_MIN load command.}
Object:   <NSBundle>
Method:   +dvt_platformFamilyForBundleAtPath:error:
Thread:   <NSThread: 0x7fd630d14b60>{number = 1, name = main}
Please file a bug at http://bugreport.apple.com with this warning message and any useful information you can provide.
2016-03-11 19:11:18.514 xcodebuild[60812:3928219] [MT] IDEDistribution: Step failed: <IDEDistributionSummaryStep: 0x7fd633abbf80>: Error Domain=DVTFoundationNSBundleAdditionsErrorDomain Code=1 "Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN for <TheLib>" UserInfo={NSLocalizedDescription=Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN for <TheLib>}
error: exportArchive: Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN for <TheLib>

Error Domain=DVTFoundationNSBundleAdditionsErrorDomain Code=1 "Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN for <TheLib>" UserInfo={NSLocalizedDescription=Couldn't find platform family in Info.plist CFBundleSupportedPlatforms or Mach-O LC_VERSION_MIN for <TheLib>}

** EXPORT FAILED **
[19:11:18]: Exit status: 70
```


`Build Phases` > `Copy Bundle Resources` にライブラリのdSYMが入っていないかを確認する。  あれば削除。
ちなみに自分の場合、[Carthage](https://github.com/Carthage/Carthage)を使っていて、一部OSX用設定を間違えて適用していたのが原因だった。iOSの場合は`/usr/local/bin/carthage copy-frameworks`がその辺を面倒見てくれるようなので不要。
