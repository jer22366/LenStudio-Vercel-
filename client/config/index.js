// 直接從環境變數取得NODE_ENV(npm run dev or npm run start)
const env = process.env.NODE_ENV
// 本機環境 OR 營運環境 (true: 本機環境, false: 營運環境)
export const isDev = env === 'development'

// 本機環境
const local = {
    apiURL: 'https://lenstudio.onrender.com/api',
}

export const apiURL = isDev ? local.apiURL : production.apiURL