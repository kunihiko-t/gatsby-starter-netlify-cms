---
templateKey: blog-post
title: Serverless Framework + SAM CLI + Golangで開発を始める準備をした時のメモ
date: '2018-09-11T18:11:09+09:00'
description: Serverless Framework利用時のローカル開発、GolangのWAF利用について調べたのでメモを残しておきます
tags:
  - Serverless
  - Golang
  - Lambda
  - AWS
---
## はじめに

* [Serverless Framework](https://github.com/serverless/serverless) (AWS Lambda 利用)
* SAM CLI

を使ってGolangのウェブアプリを開発する準備をした時のメモです。

主に

* ローカルで開発する時どうするのか
* GolangのWAF([chi](https://github.com/go-chi/chi)とか)を動かすにはどうすれば良いか

がイマイチわかってなかったでそのあたりを中心調べました。

## オフライン開発

オフライン開発には[serverless-offline](https://github.com/dherault/serverless-offline)というプラグインがあるらしいので試してみましたが、Golangに対応していないようなので違う方法を探すことにしました。

色々と調べてるとAWSが出しているSAM CLIというローカル開発用のツール提供されているようだったのでとりあえずこれを使ってみることにしました。

Python2系だとインストールに失敗するようなので、Macを使っている人はpyenvなどで3を入れておきましょう。

```
pip install --user aws-sam-cli
```

さらに調べていると

[Running Go AWS Lambdas locally with SLS framework and SAM](https://medium.com/a-man-with-no-server/running-go-aws-lambdas-locally-with-sls-framework-and-sam-af3d648d49cb)

というちょうど良い記事があったのでこちらを参考に諸々セットアップしてオフライン開発のほうは準備完了です。

## Golangのウェブアプリケーションフレームワーク対応

これもちょっと調べたらライブラリがあって、こちらを使うと一瞬で終わりました。

<https://github.com/akrylysov/algnhsa>

```
lambda.Start(Handler)
```

となっている箇所を消して`algnhsa.ListenAndServe`を使えば完了です。

すべてリクエストを受けて内部のルータで処理するために、serverless.yml template.yml共にpathとmethodを下記のように書き換えておいてください。

```
path: /{proxy+}
method: ANY
```

`/`アクセス時のみmissing tokenとか出て正常処理できないのはバグみたいです。

<https://github.com/awslabs/aws-sam-cli/issues/437>

APIサーバとして利用したいので特に問題なかったです。

## まとめ

* Serverless FrameworkでLambda+Golangの組み合わせを選択する時はオフライン開発にSAM CLIを使うと楽
* Lambda上でGolang製のウェブアプリを動かしたい時は[algnhsa](https://github.com/akrylysov/algnhsa)を使うと楽

もうちょっと色々触ると問題点も色々と出てきそうですが、とりあえずこれで開発準備が整いました。
