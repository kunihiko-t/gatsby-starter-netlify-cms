---
templateKey: blog-post
title: 手持ちのredux-observableのboilerplateをTypeScript+Hooks化した
date: '2019-06-11T16:08:55+09:00'
description: '手持ちのredux-observableのboilerplateをTypeScript+Hooks化して公開した時の話。 '
tags:
  - React
  - redux-observable
  - typescript
  - hooks
---
何か開発を始める時に度々使っていたredux-observableのboilerplateがちょっと古くなってきたので、この際TypeScript化してHooksも使うようにしてrxjsも5系から6系に上げよう！と思いたち、なんとか動くところまで持っていけたので、同じような事をしようとしてる人達と自分の振り返りのために記事として残すことにしました。

ちなみにrepositoryはここ。

 <https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate>

## 1. とりあえず土台を作る

フルスクラッチで１つ１つ設定など書いていくのが面倒だったので

` create-react-app my-app --typescript`

してからejectしました。

typescript-eslintなどの設定はこちらを参考にさせていただきました。(実際のところ全部終わってから追加しましたが)

<http://watanabeyu.blogspot.com/2019/02/typescript-eslinttypescriptlinteslintai.html>

そして既存のファイルを\*.js -> \*.ts, \*.jsx -> \*.tsx にしてとりあえず突っ込んでいきました。

## 2.　型周りエラーを地道に修正していく

コンポーネント周りなど普通にesで書いてると型定義とかもちろんないのでエラーが出まくります。

例えばこんな感じで書いてるとitemsのlengthがないぞとかで怒られるお思います。
```javascript
const repositoryList = ({ items, total_count, isLoading }) => {
    const totalCountElem = items.length > 0 ? (<div>Total Count: {total_count}</div>) : (<></>)
........
```

このように全てのパラメータに型を定義していきます。
```typescript
const repositoryList: React.FC<{ items: GithubRepository[], total_count: number, isLoading: boolean }> = ({ items, total_count, isLoading }) => {
......
}
```
最初はめんどくさいなーとか思ってやってましたが、ちゃんと型定義することでPropTypesとか書かなくて良くなり無駄なコードが減ってエディタの補完にも優しくフロントでも型あったほうが良いなぁと思うようになりました。

## 3. ライブラリの型がない
だいたいの新しめのライブラリには型定義があり、 `yarn add @types/ライブラリ名`　でインストールできます。

ただ、新しすぎるライブラリや古いライブラリなどは型定義がないものもあるようで、今回[Hooks](https://react-redux.js.org/next/api/hooks)のために入れた
react-redux 7.1.0も型定義がありませんでした。

`yarn add @tyes/react-redux@7.1.0` とかやってみると、指定されたバージョンの型定義がないからリストから選べって言われてしまいます。

どうしたもんかなと思ったんですが、ライブラリに型定義がない場合は自分で追加することもできるらしく、tsconfig.jsonのtypeRootsプロパティに設定されたディレクトリ以下に`react-redux.d.ts`みたいなファイルを作って型定義を行うことで型定義がない関数なども利用可能になるようです。
自分の場合はtypeRootsの定義がこんな感じなので
```
    "typeRoots": [
      "node_modules/@types",
      "src/@types"
    ],
```
`src/@types/react-redux.d.ts`を作りそこに型定義を書きました。
[https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/%40types/react-redux.d.ts](https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/%40types/react-redux.d.ts)

## 4. typescript-fsaの導入
せっかくTypeScript化したのだからその恩恵をもっと受けようと思い[typescript-fsa](https://github.com/aikoven/typescript-fsa)を導入しました。

これの何が嬉しいのかというと、これが↓
```javascript
import keyMirror from 'fbjs/lib/keyMirror';

export const ActionTypes = keyMirror({
    USER_LOGIN_REQUEST: undefined,
    USER_LOGIN_SUCCESS: undefined,
    USER_LOGIN_FAILURE: undefined,
})

export function login() {
    return {
        type: ActionTypes.USER_LOGIN_REQUEST,
        payload: { id: 'test' },
    };
}
```

こうなり、
```typescript
const keyMirror = require('fbjs/lib/keyMirror')

export const ActionTypes = keyMirror({
    USER_LOGIN: undefined,
})


import actionCreatorFactory from 'typescript-fsa'

const ac = actionCreatorFactory()

interface LoginParam {
    id: string
}

interface LoginResult {
    data: any
}

interface LoginError {
    error: string
}

export default {
    login: ac.async<LoginParam, LoginResult, LoginError>(ActionTypes.USER_LOGIN),
    }
```

`typescript-fsa-reducers`を併せて使うことで
reducerもこんな感じで書けるようになってコードとてもスッキリします。

```typescript
import immutable from 'immutability-helper'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import actions from '../actions/user'

export const userState = {
    isAuthenticated: false,
    status: 'idle',
}

export default {
    user: reducerWithInitialState(userState)
        .case(actions.login.started, (state, action) => {
            return immutable(state, {
                status: { $set: 'running' },
            })
        })
        .case(actions.login.done, (state, action) => {
            return immutable(state, {
                status: { $set: 'idle' },
                isAuthenticated: { $set: true },
            })
        })
        .case(actions.login.failed, (state, action) => {
            return immutable(state, {
                status: { $set: 'running' },
                isAuthenticated: { $set: false },
            })
        }) ........
```
今回はredux-observableも利用するので[typescript-fsa-redux-observable](https://github.com/m0a/typescript-fsa-redux-observable)も導入しました。
こちらを利用することで
```typescript
ofAction(actions.login.started)
```
のようにepicを書くことができてとても嬉しいのですが、１点注意事項があって、`yarn add typescript-fsa-redux-observable` でインストールできるtypescript-fsa-redux-observableはちょっと古いようで、githubのrepositoryにあるREADMEのような記述をするには`yarn add https://github.com/m0a/typescript-fsa-redux-observable`と直接githubのrepositoryを指定する必要がありました。

## 5. Epicの修正 rxjs5->6
自分が使っていたrxjsが5系だったので、ついでだから6系に上げようと思ったら結構仕様が変わっていて、さらにTypeScript化することもあいまってなかなか大変でした。

rxjs5系では . で繋げてこんな感じで書いていたのですが
```javascript
export function fetchRepositories(action$) {
    return action$
        .ofType(ActionTypes.FETCH_REPOSITORIES_REQUEST)
        .delay(1000)
        .mergeMap(param =>
            Observable.defer(() =>
                Observable.fromPromise(
                    axios.get(
                        `${ApiBaseUrl}/github/repositories?installation_id=${
                            param.payload.installationID
                        }`
                    )
                )
            ).map(data => {
                return {
                    type: ActionTypes.FETCH_REPOSITORIES_SUCCESS,
                    payload: { response: data.data },
                };
            })
        )
        .catch(error =>
            Observable.of({
                type: ActionTypes.FETCH_REPOSITORIES_FAILURE,
                payload: { error },
                error: true,
            })
        );
}
```

rxjs6 + typescript-fsa-redux-observable　ではちょっと内容が違いますがこんなノリになります。
pipeで繋げる感じになって、method chainで呼び出すのではなく、関数を個別で呼び出す感じです。
```typescript
export const fetchRepositories: Epic<AnyAction> = (action$) => action$.pipe(
    ofAction(actions.fetchRepositories.started),
    debounceTime(1000),
    mergeMap((param) =>
        ajax.getJSON(`https://api.github.com/search/repositories?q=+language:javascript+created:%3E2016-10-01&sort=stars&order=desc`).pipe(
            map(data => {
                return actions.fetchRepositories.done({
                    params: param.payload,
                    result: { repositories: data },
                })
            }),
            catchError(error =>
                Observable.of(actions.fetchRepositories.failed({
                    params: param.payload,
                    error: error,
                })),
            ),
        ),
    ),
)
```
[https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/epics/github.ts](https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/epics/github.ts)

コードはすっきりしてこの書き方のほうが好きなんですが、型エラーがでた時にエラーメッセージがすさまじく長くて一体どこの型どうまずいのか非常に分かりにくくて辛かったです。

## 6. React ReduxのHooks利用
React側のHooks使うんだから、Reduxでも用意されてるHooksを使いたいと思い、対応している7.1.0-rc.1も出ていたので使っていくことにしました。（この記事執筆時点で丁度7.1.0が出ましたが型定義は7.0.9のまま。。）

導入は割と楽にできて、`connect`や`mapStateToProps`が不要なり、代わりに`useSelector`を使うようにしたり、propsから取ってきていたdispatchを`userDispatch`から取得したりするだけで簡単に移行できました。
コード見たほうが早いと思います。
[https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/routes/Home.tsx](https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/routes/Home.tsx)

## 7. やってみた感想

epic周りのエラーを修正している時が一番しんどかったです。
React ReduxのHooksやtype-script-fsaのおかげでコードがシンプルになり、TypeScriptのおかげでエディタの補完機能がいい感じに効くようになるのはかなり良いなぁと思いました。
最近next.jsで`next export`という機能があると知ったので次はnext.jsで動くようにしたいと思っています。
