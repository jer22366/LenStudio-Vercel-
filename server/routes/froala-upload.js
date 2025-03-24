import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 設置目錄路徑
const uploadDir = path.join(process.cwd(), 'public/image/article-content');

export async function POST(request) {
  try {
    // 確保上傳目錄存在
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('目錄已存在或無法創建', err);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "沒有找到文件" }, { status: 400 });
    }

    const type = new URL(request.url).searchParams.get('type') || 'image';
    console.log('上傳類型:', type);
    console.log('文件名:', file.name);
    console.log('文件大小:', file.size, '位元組');

    // 生成唯一文件名
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 獲取文件副檔名
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // 寫入文件
    await writeFile(filePath, buffer);
    console.log(`文件已上傳至 ${filePath}`);

    // 返回符合 Froala 要求的格式
    return NextResponse.json({
      link: `/image/article-content/${fileName}`
    });

  } catch (error) {
    console.error('上傳錯誤:', error);
    return NextResponse.json({ error: `上傳失敗: ${error.message}` }, { status: 500 });
  }
}