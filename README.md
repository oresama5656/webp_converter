# WebP Converter V2 🔥

高品質画像変換ツール -  アップスケール対応

## ✨ 特徴

- **🚀 高品質アップスケール**: 小さい画像を拡大してから指定縮小率で変換
- **📁 フォルダ対応**: ドラッグ&ドロップでフォルダごと一括処理
- **⚡ 高速処理**: Sharp.jsによる最適化された画像処理
- **🌐 マルチプラットフォーム**: Vercel、Netlify、独自ドメイン対応
- **📱 レスポンシブ**: モバイル・デスクトップ完全対応

## 🎯 変換ロジック

1. **アップスケール判定**
   - 400px以下: 3倍拡大
   - 800px以下: 2倍拡大  
   - 1200px以下: 1.5倍拡大
   - 1200px超: そのまま

2. **縮小処理**: 指定した縮小率で最終サイズに調整
3. **WebP変換**: 高品質設定で最適化

## 🚀 デプロイ方法

### Vercel（推奨）

```bash
cd webp-converter-v2
npm install
vercel --prod
```

### Netlify

```bash
cd webp-converter-v2
npm install
# GitHubにプッシュしてNetlifyで自動デプロイ
```

### ローカル開発

```bash
cd webp-converter-v2
npm install
npm run dev
# http://localhost:3000 でアクセス
```

## 📁 プロジェクト構造

```
webp-converter-v2/
├── public/
│   └── index.html          # フロントエンド（SPA）
├── api/
│   └── convert.js          # 画像処理API（Vercel/Netlify対応）
├── package.json
├── vercel.json             # Vercel設定
├── netlify.toml           # Netlify設定
└── README.md
```

## 🔧 技術仕様

- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **バックエンド**: Node.js + Sharp.js + Formidable
- **画像処理**: Sharp.js（高速・高品質）
- **ファイル処理**: Multipart/form-data（Base64回避）
- **デプロイ**: Vercel Functions / Netlify Functions

## 📱 対応形式

- **入力**: PNG, JPG, JPEG, WebP
- **出力**: WebP（高品質・最適化済み）

## ⚙️ 設定オプション

- **縮小率**: 0.1 - 1.0（推奨: 0.8）
- **アップスケール**: ON/OFF切り替え可能
- **品質**: 90%固定（最高品質）

## 🔍 従来版との違い

| 項目 | 従来版 | V2 |
|------|--------|-----|
| アーキテクチャ | Express + Netlify Functions | 統一API（Vercel/Netlify対応） |
| ファイル処理 | Base64変換 | Multipart直接処理 |
| UI/UX | 基本的 | モダン・レスポンシブ |
| エラーハンドリング | 限定的 | 包括的 |
| デプロイ安定性 | 問題あり | 高安定性 |

## 🎨 UI特徴

- **モダンデザイン**: グラデーション・アニメーション
- **リアルタイム進捗**: ファイル別ステータス表示
- **直感的操作**: ドラッグ&ドロップ + ファイル選択
- **レスポンシブ**: モバイル最適化

## 📊 パフォーマンス

- **処理速度**: Sharp.js最適化による高速変換
- **メモリ効率**: Base64回避による省メモリ
- **ファイルサイズ**: 最大50MB × 20ファイル対応
- **変換品質**: Lanczos3フィルタによる高品質変換# webp_converter
