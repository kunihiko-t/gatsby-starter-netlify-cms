---
templateKey: blog-post
title: Dogs vs. Cats Reduxを解いてKaggleにsubmitした時のメモ
date: '2018-07-02T17:47:25+09:00'
description: 'Fast.AIのPart1 Lesson1,2あたり'
tags:
  - Deep Learning
  - Fast.AI
  - kaggle
---
[Fast.ai](http://www.fast.ai/)の[Deep Learning Part 1: Practical Deep Learning for Coders](http://course.fast.ai/)の動画を観たり課題を解いたりした時のメモです。

今回は[Dogs vs. Cats Redux: Kernels Edition](https://www.kaggle.com/c/dogs-vs-cats-redux-kernels-edition/discussion/27613)を[このJupyter Notebook](https://github.com/fastai/fastai/blob/master/courses/dl1/lesson1-vgg.ipynb)を参考にしながらPaperspace上で動かしてKaggleへSubmitするところまでやります。

## 環境構築

まず、動作させる環境について確認しました。

最初は無料だしGoogle Colabを使おうとしていたのですが、確認のためJupyter Notebookを動作させているとメモリが足らずエラーが出始めたり、別タブに移動して時間が経つと動作が中断されたりといった感じで厳しそうだったので、ストレスなく作業するために動画内でも言及されていた[Paperspace](https://www.paperspace.com/)で作業することにしました。

ログインしてメニューを眺めているとGRADIENTというものがあり、これは最近リリースされたもので、起動するとすぐにJupyter Notebookを利用できて、Fast.AIのテンプレートもあるようだったのでこちらを利用することにしました。

一番安いGPUを使うとここでもまたOut of Memoryで怒られたのでP5000というものを選択しました。
各GPUの価格は[このあたり](https://www.paperspace.com/gpus)を参考に。
私の[Referral Code](https://www.paperspace.com/&R=QM07TPE)を使って登録すると$5分のクレジットが貰えるようです。
登録後はGradientを選択し、Paperspace + Fast.AI -> P5000 と選択しNotebookを作成し、OpenをクリックするとJupyter Notebookを開けます。

使用後はStopするのを忘れずに。

## Kaggleからデータのダウンロード&下準備

データのダウンロードにはKaggleへのユーザ登録と当該Competitionのルールの確認と同意が必要なので済ませておきます。

次に、[KaggleのCLIツール](https://github.com/Kaggle/kaggle-api)を使いたいのでMy Accountへ移動し、Create New API Tokenからトークンを作成します。

ここまでできたら下記コマンドを実行し、設定ファイルを作成します。
これでkaggleコマンドが利用可能になります。

```
!pip install kaggle
!mkdir -p /root/.kaggle
!echo '{"username":"YOUR USER NAME","key":"YOUR TOKEN"}' > /root/.kaggle/kaggle.json
!chmod 600 /root/.kaggle/kaggle.json
```

必要なデータをダウンロードします。

```
!kaggle competitions download -c dogs-vs-cats-redux-kernels-edition
```

ダウンロードが完了すると`/root/.kaggle/competitions/dogs-vs-cats-redux-kernels-edition`にデータがダウンロードされるので扱いやすいようにシンボリックリンクを作成します。

```
!ln -s /root/.kaggle/competitions/ /notebooks/data
```

データを解凍します。

```python
import os
os.chdir('/notebooks/data/dogs-vs-cats-redux-kernels-edition')

!unzip train.zip
!unzip test.zip
```

必要なディレクトリを作成します。

```
!mkdir -p /notebooks/data/dogs-vs-cats-redux-kernels-edition/train/dogs
!mkdir -p /notebooks/data/dogs-vs-cats-redux-kernels-edition/train/cats
!mkdir -p /notebooks/data/dogs-vs-cats-redux-kernels-edition/valid/dogs
!mkdir -p /notebooks/data/dogs-vs-cats-redux-kernels-edition/valid/cats
```

犬と猫の画像をそれぞれdogsとcatsに移動します。

```
import os
os.chdir('/notebooks/data/dogs-vs-cats-redux-kernels-edition/train/')

!mv dog.*.jpg dogs/
!mv cat.*.jpg cats/
```

検証用のデータセットを作成します。

```python
import os
from glob import glob
import numpy as np
os.chdir('/notebooks/data/dogs-vs-cats-redux-kernels-edition/train/dogs')
g = glob('*.jpg')
shuf = np.random.permutation(g)
for i in range(2000):
    os.rename(shuf[i], os.path.join('/notebooks/data/dogs-vs-cats-redux-kernels-edition/valid/dogs', shuf[i]))
    
os.chdir('/notebooks/data/dogs-vs-cats-redux-kernels-edition/train/cats')
g = glob('*.jpg')
shuf = np.random.permutation(g)
for i in range(2000):
    os.rename(shuf[i], os.path.join('/notebooks/data/dogs-vs-cats-redux-kernels-edition/valid/cats', shuf[i]))
```

## 実装

[動画](https://youtu.be/JNxcznsrRb8?t=1h14m9s)で言及されている

**Easy steps to train a world-class image classifier**

1. Enable data augmentation, and `precompute=True`
2. Use `lr_find()` to find highest learning rate where loss is still clearly improving
3. Train last layer from precomputed activations for 1–2 epochs
4. Train last layer with data augmentation (i.e. `precompute=False`) for 2–3 epochs with `cycle_len=1`
5. Unfreeze all layers
6. Set earlier layers to 3x-10x lower learning rate than next higher layer. Rule of thumb: 10x for ImageNet like images, 3x for satellite or medical imaging
7. Use `lr_find()` again (Note: if you call `lr_find` having set differential learning rates, what it prints out is the learning rate of the last layers.)
8. Train full network with `cycle_mult=2` until over-fitting

を参考に実装してみることにしました。

まず必要なライブラリの読み込みなどを行います。
Fast.AIのテンプレートを利用しているのでライブラリをダウンロードする必要はありません。

```python
%reload_ext autoreload
%autoreload 2
%matplotlib inline

from fastai.imports import *

from fastai.transforms import *
from fastai.conv_learner import *
from fastai.model import *
from fastai.dataset import *
from fastai.sgdr import *
from fastai.plots import *

PATH = "/notebooks/data/dogs-vs-cats-redux-kernels-edition/"
sz=224
arch=vgg16
bs=64
```

画像のサイズは224x224
アーキテクチャはvgg16
Batch Sizeは64を指定します。

次にデータの読み込みです。

```python
data = ImageClassifierData.from_paths(PATH, tfms=tfms_from_model(arch, sz), test_name='test')
```

1. Enable data augmentation, and `precompute=True`

に従い`precompute=True`を指定し、モデルを作成します。

```python
learn = ConvLearner.pretrained(arch, data, precompute=True)
```

2. Use `lr_find()` to find highest learning rate where loss is still clearly improving

に従い効率の良いLearning Rateを探します。

```python
#Find Learning Rate
lrf=learn.lr_find() 
learn.sched.plot()
```

![Learning Rate1](/img/lr1.png)

0.1あたりですね。

3. Train last layer from precomputed activations for 1–2 epochs

Learning Rate0.1で2エポック回します。

```python
learn.fit(0.1, 2)
```

4. Train last layer with data augmentation (i.e. `precompute=False`) for 2–3 epochs with `cycle_len=1`

cycle_lenが設定されているとstochastic gradient descent with restarts (SGDR)が有効になります。

```python
learn.precompute = False
learn.fit(0.1, 3, cycle_len=1)
```

1. Unfreeze all layers

固定されているパラメータをUnfreezeします。

```python
learn.unfreeze() 
learn.bn_freeze(True) 
```

6. Set earlier layers to 3x-10x lower learning rate than next higher layer. Rule of thumb: 10x for ImageNet like images, 3x for satellite or medical imaging
7. Use `lr_find()` again (Note: if you call `lr_find` having set differential learning rates, what it prints out is the learning rate of the last layers.)

![Learning Rate1](/img/lr2.png)

最後のLayerに0.001を指定してみました。

```
learn.fit([1e-5, 1e-4,1e-3], 1, cycle_len=1)
```

ここで1エポック回す必要があったか分からないのですが回してみました。(多分必要ないかも？)

8. Train full network with `cycle_mult=2` until over-fitting

```python
learn.fit(1e-4, 3, cycle_len=1, cycle_mult=2)
```

Epochに3、cycle_lenに1、cycle_multに3が設定されていると合計で7エポックが実行されます。

cycle_lenが1で3 epochなので、まず1 epoch目が走ります。

↓

２エポック目が走りますが、cycle_lenが1、cycle_multが2なので1*2でcycle_len=2となり合計２エポックが走ります。(ここまで３エポック)

↓

３エポック目が走るがcycle_lenが2、cycle_multが2なのでcycle_len=4となり合計４エポックが走る　→ 全部で1 + 2 + 4 で合計７エポックとなります。

| epoch | trn_loss | val_loss | accuracy |
| ----- | -------- | -------- | -------- |
| 0     | 0.028313 | 0.028708 | 0.99125  |
| 1     | 0.031285 | 0.028988 | 0.99225  |
| 2     | 0.020249 | 0.028794 | 0.992    |
| 3     | 0.015215 | 0.031133 | 0.991    |
| 4     | 0.016653 | 0.029284 | 0.992    |
| 5     | 0.01551  | 0.028878 | 0.992    |
| 6     | 0.016349 | 0.028807 | 0.992    |

これで学習が終わったので念の為モデルを保存しておきます。

```python
learn.save('tmp2')
```

## 確認と提出

あとは結果の確認と提出です。

is_test=Trueを指定することで検証用データセットの代わりにテスト用データを利用します。
`'NoneType' object is not iterable`とか言われた場合はデータ読み込み時のtest_nameに正しいテスト用ディレクトリ名がセットされているか確認してください。

```python
log_preds, y = learn.TTA(is_test=True)
probs = np.mean(np.exp(log_preds), axis=0)
```

次にData Frameの作成です。

```python
ds = pd.DataFrame(probs)
ds.columns = data.classes
#Insert a new column at position zero named id. Remove first 5 and last 4 letters since we just need IDs (a file name looks like test/0042d6bf3e5f3700865886db32689436.jpg)
ds.insert(0, 'id', [o[5:-4] for o in data.test_ds.fnames])
```

提出フォーマットを見るとヘッダ部分が`id, label`になっていますが、作成したData Frameでは`id, cats, dogs`となっているので整形します。

labelには画像が犬である確率を入れれば良いようなのでcatsの列を削除し、dogsの列をlabelにリネームします。

```python
ds = ds.drop(['cats'], axis=1)
ds = ds.rename(columns={'dogs': 'label'})
ds.head()
```

![Data Frame](/img/table.png)

これで正しい形式になったのでCSVにして保存します。

```python
SUBM = f'{PATH}sub/' 
os.makedirs(SUBM, exist_ok=True) 
ds.to_csv(f'{SUBM}subm.gz', compression='gzip', index=False)
```

提出して終了です

```python
!kaggle competitions submit -c dogs-vs-cats-redux-kernels-edition -f /notebooks/data/dogs-vs-cats-redux-kernels-edition/sub/subm.gz -m "My first submission"
```

![Submit](/img/submit.png)

## 感想

Fast.AIの各パートは2-3時間程度の動画ですが、1回観ただけで理解することは難しく、Jupyter Notebookを読み、動かし、wikiからリンクされている各種リンクやForumを参照したりと結構時間がかかる感じでした。
[この方](https://medium.com/@hiromi_suenaga)のLesson Noteにかなり助けられました。

頑張って継続したい。
