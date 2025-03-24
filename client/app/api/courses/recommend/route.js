import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 從後端 API 獲取推薦課程
    const response = await fetch('https://lenstudio.onrender.com/api/courses?sort=popular', {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`後端 API 返回錯誤: ${response.status}`);
      // 如果後端 API 失敗，返回空數組
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    // 確保返回的是數組，並且只取前 4 個課程
    const recommendedCourses = Array.isArray(data) ? data.slice(0, 4) : [];
    
    return NextResponse.json(recommendedCourses);
  } catch (error) {
    console.error('獲取推薦課程失敗:', error);
    // 出錯時返回空數組，確保前端不會崩潰
    return NextResponse.json([]);
  }
}