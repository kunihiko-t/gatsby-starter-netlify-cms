---
templateKey: blog-post
title: Github Actionsを使ってPull Request毎にPreview環境を作った時のメモ
date: '2020-03-20T01:09:07+09:00'
description: >-
  GitOps的なPreview環境が欲しいよねという話になり、k8s(EKS), Skaffold1.2.0, Helm3
  を使ってチームで作った時のメモ。ついでにローカル開発に使える環境も作った
tags:
  - kubernetes
  - helm
  - skaffold
  - github actions
  - EKS
  - AWS
  - GitOps
---
# はじめに

スプリントレビューやデザインレビュー用にPull RequestごとのPreview環境あったら良いよねっていう話になって作った時の備忘録的なやつです

# 使ったプラットフォームや技術スタックやツールなど

- AWS
  - EKS
- terraform
- Skaffold 1.2.0
- Helm 3.0.0
- [jx](https://github.com/jenkins-x/jx) (jx contextが便利だから使っていただけ、別いにいらないです。Docker for Mac使っているならマウスでポチポチすればコンテキスト切り替えれます)
- [Octant](https://github.com/vmware-tanzu/octant)(EKSを使っていたためGKEのようにダッシュボードがいい感じじゃないので確認用に採用しました。とても使いやすい。)

# なぜGKEじゃなくてEKSなのか

他のAWSサービスとの連携がしたいとか政治的な都合とかがなければGKEの方が絶対楽だと思います。

EKS自体のManagement feeが取られるのも微妙だなーと思っていましたが、今年6月からGKEも取るようなのでそこはまぁいいかという感じです。

一番きついのはPODに割当可能なIPアドレスの制限です。せめてLargeぐらいないと全然Preview環境がはやせません。

[https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html]([https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html])

# まずはAWS上に環境構築

terraformでやるのが良いかと思います。

ECR,IAM,各種ネットワーク、DBを共用するならRDS、あとはEKSクラスタなどをここで作ってしまいます。
今回はノードにt3.largeインスタンスを利用しました。

リソース的にはもっと小さいインスタンスで良かったんですが、使えるIPの個数に制限があるため大きめのものにしました。
t3.largeだと36個のIPが利用できるとようです。

Fargate for EKSは今回ALBしか使えない関係で使いませんでした。
[https://dev.classmethod.jp/cloud/aws/outline-about-fargate-for-eks/](https://dev.classmethod.jp/cloud/aws/outline-about-fargate-for-eks/)

# 最低限必要なものや全体で使いそうなものをk8sクラスタに入れていく

- [grafana](https://grafana.com/)
- [mailhog](https://github.com/mailhog/MailHog)
- [nginx-ingress](https://github.com/kubernetes/ingress-nginx)
- [prometheus](https://prometheus.io/)
- [sealed-secret](https://github.com/bitnami-labs/sealed-secrets)(パスワードなどの管理用)

あたりは　`/charts`　みたいなディレクトリを切ってパッケージごとにvalues.yamlを置いていってMakefileに下記のような感じで書いてインストールしていきました。
```
helm upgrade --install nginx-ingress stable/nginx-ingress -f charts/nginx-ingress/values.yaml --namespace kube-system --wait
helm upgrade --install sealed-secrets stable/sealed-secrets -f charts/sealed-secrets/values.yaml --namespace kube-system --wait
```

ローカルでまず試す時、docker for macのKubernetesは`Reset Kubernetes Cluseter`ボタンをポチッと押すだけで環境が初期化され、何度も１から入れ直して動作を確認するのにとても便利でした。

Makefileをちゃんと書いてくと再インストールも楽々です。

秘密情報の格納方法としては[sealed-secret](https://github.com/bitnami-labs/sealed-secrets)が便利そうだったので使うことにしました。



# Preview環境を構築する

## Helm か Kustomizeか

Preview環境も生やしたいけど、Local開発にも流用したい。

そのうちStaging環境にも流用したいという感じだったので、そういうことが実現できるツールを探しました。

[Kustomize](https://github.com/kubernetes-sigs/kustomize)が王道っぽくシンプルだったのでKustomizeで始めたのですが、なんか痒いところに手が届かず無理やりsedとか使う感じになってたので[Helm](https://github.com/helm/charts)に切り替えました。



## local環境とpreviewの差異をどう扱うか

```
charts/a-base
charts/a-local
charts/a-preview
```
みたいに構成にしてbaseのtemplates以下に共通部分を書き、localやpreview側では
Chart.yamlにdependenciesを定義しました。
```yaml
dependencies:
  - name: a-base
    version: 0.1.0
    repository: file://../a-base
    alias: base
```
この状態で例えばpreviewのvalues.yamlに下記のような感じで書けば依存先のvalues.yamlを上書きできます。

完全に追加が必要な部分はtemplatesに追加すればいいです。
```yaml
base:
  variantName: preview
  api:
    terminationGracePeriodSeconds: 1
    imageName: "xxxxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/api"
    env:
      APP_NAME: "preview-A_API"
      DB_HOST: "your-db-host"
```

## skaffold.yamlを書く

skaffoldを使って動かすのでskaffold.yamlを定義します。

デフォルトでskaffold devした時はローカルで動かしたいのでノリとしては下記yamlのような感じです。

preview用のものはprofilesで分けていて、profileを指定せずに`skaffold dev -n a -v info --cleanup=false; helm delete a-local -n a
`した時は一番上に定義したもの（local用）が動くようにしてます。

`--cleanup=false; helm delete a-local -n a` とかしてるのはskaffold1.2がhelm3に対応していなかったためです。

```yaml
... 省略 ....
apiVersion: skaffold/v2alpha2
kind: Config
build:
  tagPolicy:
    gitCommit: {}
  artifacts:
  - image: api
    context: .
    docker:
      dockerfile: docker/api/Dockerfile
    sync:
      <<: *apiSync
  local:
    push: false
    useBuildkit: true
    concurrency: 0
deploy:
  helm:
    flags:
      upgrade:
      - --install
    releases:
    - name: a-local
      chartPath: k8s/charts/a-local
      wait: true
      values:
        base.api.imageName: api
        base.worker.imageName: api
      setValueTemplates:
        base.nameOverride: a-local
        base.fullnameOverrid: a-local
        base.variantName: local

profiles:
- name: preview
  build:
    tagPolicy:
      gitCommit: {}
    artifacts:
    - image: xxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/api
      context: .
      docker:
        dockerfile: docker/api/Dockerfile
    - image: xxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/front
      context: .
      docker:
        dockerfile: docker/front/Dockerfile
        buildArgs:
          ENVIRONMENT: "preview"
          API_ROOT: "https://pr{{.PR_NUMBER}}.api.dev-a.com/api"
    local:
      push: true
      useBuildkit: true
      concurrency: 0
  deploy:
    helm:
      flags:
        upgrade:
          - --install
      releases:
        - name: a-preview-pr{{.PR_NUMBER}}
          chartPath: k8s/charts/a-preview
          wait: true
          values:
            base.api.imageName: xxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/api
            base.worker.imageName: xxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/api
            base.front.imageName: xxxx.dkr.ecr.ap-northeast-1.amazonaws.com/a/front
          setValueTemplates:
            base.nameOverride: a-preview-pr{{.PR_NUMBER}}
            base.fullnameOverride: a-preview-pr{{.PR_NUMBER}}
            base.variantName: preview
            base.api.env.APP_NAME: "pr{{.PR_NUMBER}}-A_API"
            base.api.env.APP_URL: "https://pr{{.PR_NUMBER}}.api.dev-a.com"
            base.ingress.api.host: "pr{{.PR_NUMBER}}.api.dev-a.com"
... 省略 ...            

```

skaffold.yamlからPull Requestの番号をhelmに渡しています。これは後述するGithub Actionsから渡されている値です。


### Github Actionsで動かす

Pull Requestからpreview環境を生やしたいわけなので、Github Actionsの設定を行います。
`.github/workflows/create_preview.yml`とか適当に置いてそこに設定してみましょう。

本当はPushされたらすぐPreview環境が用意されると良いと思うのですが、今回はIPアドレスの制限もあるので欲しい時だけ作るようにしました。
`/preview` とコメントした時だけpreview環境を作成します。

こんな感じで判定できます。
```yaml
if: github.event.issue.pull_request != '' && startsWith(github.event.comment.body, '/preview')

```
あとは環境変数にPull Requestの番号を格納し、諸々必要なツールをインストールしたらこんな感じでネームスペースを作ってあげて
```yaml
- name: Create Namespace
run: |-
  if [[ -z $(kubectl get ns | grep ^pr$PR_NUMBER) ]]; then
    kubectl create ns pr$PR_NUMBER
  fi

```

skaffoldでpreview環境を構築します。
構築が終わったらコメントにURLを出してあげると親切だと思います。
```
helm dependency update --skip-refresh k8s/charts/a-preview
skaffold run -v info -p preview -n pr$(PR_NUMBER)
```


Ingressを下記のような感じで定義していると、prXXX.dev-a.comみたいなノリでアクセスできるようになっていると思います。

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
... 省略 ...
spec:
  rules:
    - host: {{ .Values.ingress.api.host }}
      http:
        paths:
          - backend:
              serviceName: {{ template "a-base.api.fullname" . }}
              servicePort: 80
            path: /
... 省略 ...
{{- end }}

```

### Pull RequestがマージされたりCloseされたらちゃんと消す

消さないとリソースを食いつぶします。
これもGithub Actionsでやってしまいましょう。
namespaceを消せば終わりです。

## やってみた感想

- EKSはGKEと比べてめんどくさい
    - IPアドレスの数の制限や、GKEだとある機能がなかったりなど面倒でした
- Helmのテンプレート書きにくい
    - HelmというかGoのTemplateなんですが、 `indent 4` みたいな書き方どうも苦手です
- 使い勝手はとても良くてチームのリソース使ってやる価値はありました
- 新規メンバーが参画した時も「おま環」問題が発生しにくくなり良かったんじゃないだろーかと思いました
- 何より色々知見が貯まってよかったです
