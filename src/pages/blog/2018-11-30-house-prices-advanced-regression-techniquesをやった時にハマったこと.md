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

上記の記事には学習のことまでは書いてなかったので、そこは自分でやって提出までしてみるかーと思って挑戦したのですが思いの外色々と勝手を知らなすぎてハマったので以下にまとめます。

## テストデータへの特徴量エンジニアリング適用時の問題

学習用のデータを変換していたり、削ったカラムなどがあったのでこれをテストデータにも適用しないとなーと考え同じように適用していったのですが、何故かカラム数が合わなくなってしまいました。

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

### 欠損値

学習時はLassoやSGDRegressorなど色々試してみたのですが何故かNaNは処理できないよというエラーが発生いました。

データを確認すると、いくつかのカラムに1件だけデータが入っていないセルありました。
下記のようなコードでデータ欠損値があるカラムを除去していたので１件のみ欠損のあるカラムは残っていたようです。

```python
concatDataset = concatDataset.drop((missing_data[missing_data['Total'] > 1]).index,1)
```

1件でも欠損値があればカラムを消すよう変更しようかと考えたですが、消すとまずそうなカラムも含まれていたので、とりあえず`fillna`で回避しました。

当該行だけ消したほうが良かったかも？

```python
concatDataset.fillna(value=0, inplace=True)
```

### GridSearchCVやKerasのcompile時に渡すmetricsにRMSEが用意されていない

これはどうしたものかと思ったですが、両方とも関数を渡すことができるので

```python
def rmse(y_actual, y_predicted):
   return sqrt(mean_squared_error(y_actual, y_predicted))
```

こういう関数を定義し、とりあえずGridSearchCVに渡してみたのですが、引数を３つ渡そうとしたのに２つしか受けれないよというエラーが出てきました。

どうもこれは`sklearn.metric.make_scorer`で関数をラップしないといけないらしく、こちらを使い

```python
my_scoring = make_scorer(rmse, greater_is_better=False)
```

みたいな感じにすることで解決しました。

しかし、Kerasのcompileにも同じように設定してみるとエラーが発生。

どうもこれはsqrtとかする箇所にKeras側で用意されている関数を使う必要があるらしく

```python
def root_mean_squared_error(y_true, y_pred):
        return K.sqrt(K.mean(K.square(y_pred - y_true), axis=-1)) 
```

とすることで解決しました。

## おわりに

やっぱり機械学習は慣れていないと勝手が分からなすぎて詰まりまくる。

記事とか読んだり動画を観たりしてなんとなく分かった気にならず、ちゃんと手を動かさないとなーと思った。

LeaderBoard観たら2600番代だったのでもうちょい調べてスコアを上げたい。
