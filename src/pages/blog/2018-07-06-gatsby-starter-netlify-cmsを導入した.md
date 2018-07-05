---
templateKey: blog-post
title: gatsby-starter-netlify-cmsを導入した
date: '2018-07-06T00:29:32+09:00'
description: 導入方法など
tags:
  - Netlify
  - Netlify CMS
  - Gatsby
---
![null](/img/スクリーンショット-2018-07-06-0.50.49.png)

## 動機

ちょっと前にNetlify + Gatsby + Contentful関連の記事を読んで、とりあえず

<https://github.com/greglobinski/gatsby-starter-personal-blog>

こちらのstarterのデザインがいい感じだったのでテンプレートとして導入してブログを書いてみたのですが、デフォルトだとファイルシステムからコンテンツを読むようになっていて、contentfulに対応させようと色々と変更してみたものの思ったより手間がかかりそうで放置していました。

そして今日ふとgatsbyのstarterでいい感じのものがないかなぁと[このあたり](https://www.gatsbyjs.org/docs/gatsby-starters/)を漁っていて見つけたのが[gatsby-starter-netlify-cms](https://github.com/AustinGreen/gatsby-starter-netlify-cms)です。

デモを確認したところデザインがシンプルで自分好みであり、[Netlify CMS](https://www.netlifycms.org/)というcontentfulのようなCMS機能を持ったサービスを使っていて、VS CodeでゴリゴリMarkdownを書いてgithubにわざわざpushしなくて良くなると思い導入することにしました。

## 導入方法

これはめちゃくちゃ簡単で、[gatsby-starter-netlify-cms](https://github.com/AustinGreen/gatsby-starter-netlify-cms)にアクセスし、Deploy to Netlifyをクリックするだけです。

クリックするとgithubアカウントの認証&認可画面になるので、許可を行うと自分のgithub repositoryに新しいrepositoryが作成されNetlify側でビルドが始まります。

Netlifyにログインするとたぶんビルドが成功していて、表示されているリンクからアクセスできます。

![null](/img/netlify.png)

私は自分ドメインを設定しているので自分のドメイン名表示されていますが、Netlifyから割当てられたURLが表示されているはずです。

もしドメインをお持ちでしたらDomain settingsから簡単に設定できます。

Let's Encrypt を利用したhttps化の設定も非常に楽にできます。

あとは

https://割当てられたURL/admin にアクセスするとログイン画面になりますので別途飛んできていたメールからアカウントを認証し、その情報を使ってログインしてみてください。

ここまでできたらあとは記事を書くだけです。

エディタもそこそこ使いやすいんじゃないでしょうか。

![null](/img/edit.png)

## おまけ

細かいところを修正します。

* [Productページは今必要ないので消しておく](https://github.com/kunihiko-t/gatsby-starter-netlify-cms/blob/3ad6ed1016d3c7a7de4e4f2e5fcd69fdc862ed8e/src/components/Navbar.js#L22)
* [ロゴを差し替える](https://github.com/kunihiko-t/gatsby-starter-netlify-cms/blob/3ad6ed1016d3c7a7de4e4f2e5fcd69fdc862ed8e/src/components/Navbar.js#L15)
* [Productページは今必要ないので消しておく](https://github.com/kunihiko-t/gatsby-starter-netlify-cms/blob/3ad6ed1016d3c7a7de4e4f2e5fcd69fdc862ed8e/src/components/Navbar.js#L22)
* Markdownの機能拡張
  * gatsby-remark-prismjs
  * gatsby-remark-katex
  * gatsby-remark-smartypants
  * [gatsby-remark-prismjsはスタイルがblumaと一部コンフリクトするのでスタイルを追加する](https://github.com/kunihiko-t/gatsby-starter-netlify-cms/blob/3ad6ed1016d3c7a7de4e4f2e5fcd69fdc862ed8e/src/layouts/all.sass#L45)
* [各種SNSのシェアボタン追加](https://github.com/kunihiko-t/gatsby-starter-netlify-cms/blob/3ad6ed1016d3c7a7de4e4f2e5fcd69fdc862ed8e/src/templates/blog-post.js#L49)

こんな感じでちょこちょこ改造していけばいい感じになりそうです。
