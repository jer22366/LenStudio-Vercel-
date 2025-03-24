// metadata 主要是用來設置 SEO 相關的標籤，這樣的設置能夠幫助搜尋引擎爬蟲抓取網頁的標題和描述，對網站的 SEO 有幫助。
// 但目前不知道怎麼引入才會出現，先放著
'use client'
import Head from 'next/head'

export default function CustomHead() {
  return (
    <Head>
      <title>LENSTUDIO | 紀錄每一刻光影</title>
      <meta name="description" content="讓靈感自由成像 從一台好相機開始" />
    </Head>
  )
}