const sharp = require('sharp');
const { formidable } = require('formidable');
const fs = require('fs').promises;
const path = require('path');

// Vercel用のエクスポート（デフォルト）
module.exports = async (req, res) => {
  return await handler(req, res);
};

// Netlify用のエクスポート
exports.handler = async (event, context) => {
  // Netlify Functionsの場合は、Vercel形式に変換
  const req = {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    url: event.path
  };
  
  const res = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = JSON.stringify(data);
      return this;
    },
    end: function() {}
  };

  await handler(req, res);
  
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body
  };
};

async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Formidableを使用してファイルをパース
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 20,
      keepExtensions: true,
      allowEmptyFiles: false
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    const scale = parseFloat(fields.scale[0] || '0.8');
    const upscale = fields.upscale[0] === 'true';

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'ファイルが選択されていません' 
      });
    }

    if (scale < 0.1 || scale > 1.0) {
      return res.status(400).json({ 
        success: false, 
        error: '縮小率は0.1〜1.0の範囲で指定してください' 
      });
    }

    console.log(`Processing ${uploadedFiles.length} files with scale: ${scale}, upscale: ${upscale}`);

    const convertedFiles = [];

    for (let file of uploadedFiles) {
      try {
        const result = await processImage(file, scale, upscale);
        if (result) {
          convertedFiles.push(result);
          console.log(`Successfully processed: ${file.originalFilename}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.originalFilename}:`, error);
        // 個別ファイルのエラーは無視して続行
      }
    }

    if (convertedFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '変換できるファイルがありませんでした' 
      });
    }

    // 一時ファイルをクリーンアップ
    for (let file of uploadedFiles) {
      try {
        await fs.unlink(file.filepath);
      } catch (error) {
        console.error(`Failed to cleanup ${file.filepath}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      files: convertedFiles,
      message: `${convertedFiles.length}個のファイルの変換が完了しました。`
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ 
      success: false, 
      error: `サーバーエラー: ${error.message}` 
    });
  }
}

async function processImage(file, scale, upscale) {
  try {
    const inputPath = file.filepath;
    const originalName = file.originalFilename;
    const outputName = path.parse(originalName).name + '.webp';

    // 画像の元情報を取得
    const metadata = await sharp(inputPath).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    let pipeline = sharp(inputPath);

    // アップスケール処理
    if (upscale) {
      const maxDimension = Math.max(metadata.width, metadata.height);
      let upscaleFactor = 1.0;

      // 画像サイズに基づいてアップスケール倍率を決定
      if (maxDimension <= 400) {
        upscaleFactor = 3.0;  // 非常に小さい画像は3倍
      } else if (maxDimension <= 800) {
        upscaleFactor = 2.0;  // 小さい画像は2倍
      } else if (maxDimension <= 1200) {
        upscaleFactor = 1.5;  // 中サイズ画像は1.5倍
      }
      // 1200px以上の画像はアップスケールしない

      if (upscaleFactor > 1.0) {
        const newWidth = Math.round(metadata.width * upscaleFactor);
        const newHeight = Math.round(metadata.height * upscaleFactor);
        
        console.log(`Upscaling from ${metadata.width}x${metadata.height} to ${newWidth}x${newHeight} (${upscaleFactor}x)`);
        
        pipeline = pipeline.resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill'
        });
      }
    }

    // 最終的な縮小処理
    const finalWidth = Math.round(metadata.width * scale);
    const finalHeight = Math.round(metadata.height * scale);
    
    console.log(`Final resize to: ${finalWidth}x${finalHeight} (scale: ${scale})`);

    pipeline = pipeline.resize(finalWidth, finalHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    });

    // WebP変換とエンコード
    const outputBuffer = await pipeline
      .webp({ 
        quality: 90,
        effort: 6,
        alphaQuality: 100,
        lossless: false,
        smartSubsample: true
      })
      .toBuffer();

    // Base64エンコード
    const base64Data = outputBuffer.toString('base64');
    
    console.log(`Converted ${originalName} to ${outputName}, size: ${Math.round(outputBuffer.length / 1024)}KB`);

    return {
      name: outputName,
      data: base64Data,
      originalSize: metadata.width + 'x' + metadata.height,
      finalSize: finalWidth + 'x' + finalHeight
    };

  } catch (error) {
    console.error(`Failed to process image ${file.originalFilename}:`, error);
    throw error;
  }
}