---
templateKey: blog-post
title: 'House Prices: Advanced Regression Techniquesをやった時にハマったこと'
date: '2018-11-30T17:54:07+09:00'
description: 'KaggleのHouse Prices: Advanced Regression Techniquesをやった時にハマったことのメモです'
tags:
  - Machine Learning
  - Kaggle
---
簡単そうなKaggleのCompetitionに参加してみようと思い、House Prices: Advanced Regression Techniquesをやってみました。

<https://www.kaggle.com/c/house-prices-advanced-regression-techniques/leaderboard>

特徴量エンジニアリングなどはこのあたりを参考しました。

<https://www.kaggle.com/pmarcelino/comprehensive-data-exploration-with-python>

上記の記事には学習のことまでは書いてなかったので、そこは自分でやって提出までしてみるかーと思って挑戦したのですが思いの外色々と勝手を知らなすぎてハマったで以下にまとめます。



## テストデータへの特徴量エンジニアリング適用時の問題

学習用のデータを変換していたり、削った列などがあったのでこれをテストデータにも適用しないとなーと考え同じように適用していったのですが、何故かカラム数あ合わなくなってしましました。

### get_dummiesでカラム数がずれていた
get_dummiesはカテゴリ変数をダミー変数（One-Hot-Encodingのように値ごとに列を作り0か1を入れる）に変換する関数なのですが、テストデータと学習用データで入っているカテゴリに違いがあったためカラム数が変わってしまったようです。
次元数が変わってしまうと学習に使えないので
```python
train_objs_num = len(df_train) 
concatDataset = pd.concat(objs=[df_train, df_test], axis=0) 
dataset_preprocessed = pd.get_dummies(concatDataset) 
#convert categorical variable into dummy
train_preprocessed = dataset_preprocessed[:train_objs_num] 
test_preprocessed = dataset_preprocessed[train_objs_num:] 

df_train = train_preprocessed
df_test = test_preprocessed
```
こんな感じで一度学習用データとテスト用データを結合し、ダミー変数用のカラムを作ってから再び切り離すことで解決しました。

## 学習時に発生した問題
