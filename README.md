# 🌈 Color Flow - 斬新なパズルゲーム

![Color Flow Game](https://img.shields.io/badge/Game-Color%20Flow-rainbow?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Color Flowは、色の流れを制御して全てのタイルを同じ色にする、斬新なパズルゲームです。

## 🎮 ゲームの特徴

- **斬新なパズル体験**: 色の混合を利用した独特のゲームプレイ
- **レベル進行システム**: 徐々に難しくなる挑戦的なレベル
- **美しいアニメーション**: 色の流れを視覚的に楽しめる
- **レスポンシブデザイン**: PC・スマホ・タブレット対応
- **直感的な操作**: タップやクリックで簡単操作

## 🎯 遊び方

1. **色の源泉をクリック**: 光っているタイル（色源泉）をクリックして色を流す
2. **色の混合**: 色が隣接するタイルに流れて混ざり合う
3. **目標達成**: 限られた手数ですべてのタイルを目標色に近づける
4. **レベルアップ**: より複雑なパズルに挑戦

## 🚀 GitHub Pagesでプレイ

このゲームは GitHub Pages でホストされており、ブラウザで直接プレイできます。

**🎮 [今すぐプレイ！](https://miya123123.github.io/test_repo_3_miya123123/)**

## 🛠️ セットアップ手順

### 1. リポジトリのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/miya123123/test_repo_3_miya123123.git
cd test_repo_3_miya123123

# 初回コミット
git add .
git commit -m "🎮 Color Flow Game - 初回リリース"
git push origin main
```

### 2. GitHub Pagesの有効化

1. GitHubリポジトリページにアクセス
2. **Settings** → **Pages** に移動
3. **Source** で「GitHub Actions」を選択
4. 自動でワークフローが実行され、デプロイが完了

### 3. 自動デプロイの確認

- `main` ブランチにプッシュすると自動でデプロイが実行されます
- **Actions** タブでデプロイ状況を確認できます
- デプロイ完了後、GitHub PagesのURLでゲームがプレイできます

## 📁 ファイル構成

```
test_repo_3_miya123123/
├── index.html          # メインのHTMLファイル
├── style.css           # スタイルシート
├── script.js           # ゲームロジック
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions ワークフロー
└── README.md           # このファイル
```

## 🎨 ゲームの技術的特徴

### 色の混合システム
- RGB値を使った色の混合計算
- 隣接するタイルへの色の流れアニメーション
- 色の近似判定による勝利条件

### レベル設計
- 動的な難易度調整
- 色源泉の数とパターンの変化
- 手数制限による戦略性

### UI/UX
- モダンなガラスモーフィズムデザイン
- 直感的なアニメーション
- レスポンシブレイアウト

## 🔧 カスタマイズ

### ゲームパラメータの調整

`script.js` で以下のパラメータを調整できます：

```javascript
// ボードサイズ
this.boardSize = 7;

// 色の定義
this.colors = {
    // 新しい色を追加可能
};

// 勝利条件（目標色の割合）
return targetTiles / totalTiles >= 0.8;
```

### スタイルのカスタマイズ

`style.css` でデザインをカスタマイズできます：

```css
/* 背景グラデーション */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* タイルのサイズ */
.tile {
    width: 60px;
    height: 60px;
}
```

## 🤝 コントリビューション

1. フォークしてください
2. 新しいブランチを作成してください (`git checkout -b feature/new-feature`)
3. 変更をコミットしてください (`git commit -am 'Add new feature'`)
4. ブランチにプッシュしてください (`git push origin feature/new-feature`)
5. プルリクエストを作成してください

## 📄 ライセンス

このプロジェクトはMITライセンスで公開されています。

## 🎉 楽しんでプレイしてください！

Color Flowで色の世界を探索し、創造性を発揮してください。バグ報告や改善提案は、Issuesまでお気軽にどうぞ！