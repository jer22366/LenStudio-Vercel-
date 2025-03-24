import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const folder = formData.get('folder') || 'article';
    
    if (!file) {
      return NextResponse.json({ error: '沒有檔案' }, { status: 400 });
    }
    
    // 讀取檔案緩衝區
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 創建唯一檔案名稱
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const extension = path.extname(originalName);
    const fileName = `${Date.now()}-${uuidv4().substring(0, 8)}${extension}`;
    
    // 確保目錄存在
    const publicDir = path.join(process.cwd(), 'public', 'images', folder);
    try {
      await mkdir(publicDir, { recursive: true });
    } catch (err) {
      console.log('目錄已存在或創建失敗');
    }
    
    // 寫入檔案
    await writeFile(path.join(publicDir, fileName), buffer);
    
    // 返回可訪問的 URL
    const imageUrl = `/images/${folder}/${fileName}`;
    
    return NextResponse.json({ 
      success: true,
      imageUrl 
    });
  } catch (error) {
    console.error('上傳錯誤:', error);
    return NextResponse.json({ error: '上傳失敗' }, { status: 500 });
  }
}