const express = require('express');
const path = require('path');
const convertHandler = require('./api/convert.js');

const app = express();
const port = 3001;

// 静的ファイルの提供
app.use(express.static('public'));

// API エンドポイント
app.all('/api/convert', async (req, res) => {
  try {
    await convertHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ルートは index.html を返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 WebP Converter V2 開発サーバーが起動しました`);
  console.log(`📱 ブラウザで http://localhost:${port} にアクセスしてください`);
  console.log(`🔧 開発モード: api/convert.js をテスト中`);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
  console.log('\n👋 サーバーを停止しています...');
  process.exit(0);
});