---
title: Github ActionsでCloud Firestoreセキュリティールールのテストを実行する
date: 2020-01-16T08:15:23.000Z
id: "26006613498465845"
draft: false
---
.github/workflows/security-rules.yml

```yaml
name: security rules

on:
  pull_request:
    paths:
      - "packages/internal/__tests__/**/*"
      - "packages/internal/*.rules"
      - "packages/internal/scripts/test-firestore.sh"

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      FIREBASE_EMULATORS_PATH: ${{ github.workspace }}/emulator-cache
      FIREBASE_TOOLS_VERSION: 7.12.1
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node_version: 10
      - uses: actions/cache@v1
        with:
          path: ~/.cache/yarn
          key: ${{ runner.os }}-yarn-${{ hashFiles(format('{0}{1}', github.workspace, '/yarn.lock')) }}
          restore-keys: |
            ${{ runner.os }}-yarn-

      - name: emulator cache patch
        run: |
          mkdir -p $FIREBASE_EMULATORS_PATH
          echo $FIREBASE_TOOLS_VERSION > "$FIREBASE_EMULATORS_PATH/VERSION"
        working-directory: "./packages/internal"

      - name: cache Emulator
        uses: actions/cache@v1
        with:
          path: ${{ env.FIREBASE_EMULATORS_PATH }}
          key: ${{ runner.os }}-firebase-emulators-${{ hashFiles(format('{0}{1}', github.workspace, '/emulator-cache/**')) }}
        continue-on-error: true

      - name: setup env
        run: |
          echo "::set-env name=GOPATH::$(go env GOPATH)"
          echo "::add-path::$(go env GOPATH)/bin"

      - run: yarn install --frozen-lockfile --prefer-offline
        working-directory: "./packages/internal"

      - run: scripts/test-firestore.sh 
        working-directory: "./packages/internal"
```

packages/internal/scripts/test-firestore.sh

```sh
#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CWD="$(pwd)"

echo "Running in ${CWD}"
echo "Running with node: $(which node)"
echo "Running with npm: $(which npm)"

echo "Ensuring CLI tools..."
npm list -g firebase-tools || npm install --global firebase-tools@${FIREBASE_TOOLS_VERSION:-7.12.1}
go get github.com/ka2n/waitport/cmd/waitport/...
echo "Ensured CLI tools:"
echo -e "\t$(which firebase)"
echo -e "\t$(which waitport)"

export FIRESTORE_EMULATOR_HOST=localhost:8080

firebase emulators:start --only firestore &
PID="$!"
waitport -listen $FIRESTORE_EMULATOR_HOST -timeout 2m

yarn test --ci

kill -INT $PID
wait

# TODO: test functions, hosting,,etc...
```

テスト失敗した場合の処理はどうせ掃除されると見越して雑です。
