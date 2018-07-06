---
templateKey: blog-post
title: Planet Understanding the Amazon from Spaceをやる
date: '2018-07-06T14:17:09+09:00'
description: Fast.AIのPart1 Lesson3あたり
tags:
  - Deep Learning
  - Fast.AI
---
## 下準備

KaggleのCLIを使えるようにしてデータをダウンロードし、解凍します。
7zを解凍する必要があるのでついでに解凍用のソフトもインストールします。

```
!pip install kaggle
!mkdir -p /root/.kaggle
!echo '{"username":"YOUR USER NAME","key":"YOUR TOKEN"}' > /root/.kaggle/kaggle.json
!chmod 600 /root/.kaggle/kaggle.json

!apt-get update
!apt-get install p7zip-full
!kaggle competitions download -c planet-understanding-the-amazon-from-space
!ln -s /root/.kaggle/competitions/ /notebooks/data

import os
os.chdir('/notebooks/data/')
!mv planet-understanding-the-amazon-from-space planet


import os
os.chdir('/notebooks/data/planet/')

!7z x train-jpg.tar.7z
!tar -xvf train-jpg.tar

!7z x test-jpg.tar.7z
!tar -xvf test-jpg.tar

!unzip -o train_v2.csv.zip 

```

planet.pyを使うので、[このファイル](https://github.com/fastai/fastai/blob/master/courses/dl1/planet.py)をアップロードしておきます。


## 実装


```python
import os
os.chdir('/notebooks/')

%reload_ext autoreload
%autoreload 2
%matplotlib inline

from fastai.conv_learner import *

PATH = 'data/planet/'

# Data preparation steps if you are using Crestle:

os.makedirs('data/planet/models', exist_ok=True)
os.makedirs('/cache/planet/tmp', exist_ok=True)

!ln -s /datasets/kaggle/planet-understanding-the-amazon-from-space/train-jpg {PATH}
!ln -s /datasets/kaggle/planet-understanding-the-amazon-from-space/test-jpg {PATH}
!ln -s /datasets/kaggle/planet-understanding-the-amazon-from-space/train_v2.csv {PATH}
!ln -s /cache/planet/tmp {PATH}

from fastai.plots import *

```



Multi-label classificationはDogs vs Cats Reduxのようにサブディレクトリを作って分類することができないので、from_csvを利用します。

