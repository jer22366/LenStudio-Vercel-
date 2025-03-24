// 伺服器的總入口，負責：
// 1.啟動 Express 伺服器
// 2.掛載 API 路由
// 3.定義首頁 /
// 4.全域設定 (如 CORS、解析 JSON)
// 5.監聽特定的 PORT，讓伺服器運行

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sessionFileStore from 'session-file-store'
import session from 'express-session'
import db from './db.js'
import http from 'http';

import path from 'path'
import coursesRouter from './routes/courses.js'
import teachersRouter from './routes/teachers.js'
import authRouter from "./routes/auth.js";
import productRoutes from './routes/product.js'
import rentalRouter from './routes/rental.js'
import rentalMasterRouter from './routes/rental-master.js'
import ecpayRouter from './routes/ecpay.js'
import articleRoutes from './routes/article.js'
import commentsRouter from './routes/comments.js'
import likesRouter from './routes/likes.js'
import users from './routes/users.js'
import ordersRouter from './routes/orders.js'
import linePayRouter from './routes/linePay.js'
import addressRouter from './routes/address.js'
import { serverConfig } from './config/server.config.js'
import courseCtUploadRouter from './routes/courses-ct-upload.js'
import courseCvUploadRouter from './routes/courses-cv-upload.js'
import teacherUploadRouter from './routes/teacher-upload.js'
import couponRouter from './routes/coupon.js'
import collect from './routes/collect.js'
import myorders from './routes/myorders.js'
import getCpRouter from './routes/getCoupon.js'
import uploadsRouter from './routes/uploads.js';
import supportRouter from './routes/support.js'
import { Server } from "socket.io";
import forgot from './routes/forgot.js'


// 讀取 .env 設定
dotenv.config()

const app = express()
const server = http.createServer(app);




const whiteList = ['http://localhost:5500', 'http://localhost:3000','https://lenstudio.vercel.app']
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('不允許連線'))
    }
  },
}
let sessionStore = null


if (serverConfig.sessionStoreType === 'redis') {
  // 使用redis記錄session
  let redisClient = createClient({
    url: process.env.REDIS_URL,
  })

  // 連線redis
  redisClient.connect().catch(console.error)

  // 初始化redisStore
  sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'express-vercel:',
  })
} else {
  // 使用檔案記錄session
  const FileStore = sessionFileStore(session)
  sessionStore = new FileStore({ logFn: function () { } })
}

const isDev = process.env.NODE_ENV === 'development'

const options = isDev
  ? { maxAge: 30 * 86400000 }
  : {
    domain: serverConfig.domain,
    maxAge: 30 * 86400000, // session保存30天
    httpOnly: true, // 無法透過JavaScript讀取
    secure: true, // HTTPS才能使用
    sameSite: 'none', // 跨域時也能使用
  }

app.use(
  session({
    store: sessionStore, // 使用檔案記錄session
    name: 'SESSION_ID', // cookie名稱，儲存在瀏覽器裡
    secret: '67f71af4602195de2450faeb6f8856c0', // 安全字串，應用一個高安全字串
    proxy: !isDev, // 是否信任反向代理，預設false
    cookie: options,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(cors(corsOptions)) // 允許跨域請求
app.use(express.json({ limit: '150mb' })) // 解析 JSON 格式的請求
app.use(express.urlencoded({ extended: true, limit: '150mb' }))

// 設定 API 路由
app.get('/', (req, res) => {
  res.send('API 運行中...')
})

app.use('/api/product', productRoutes)

app.use('/api/courses', coursesRouter)
app.use('/api/teachers', teachersRouter)
app.use("/api/auth", authRouter);
app.use("/api/course-ct-upload", courseCtUploadRouter);
app.use("/api/course-cv-upload", courseCvUploadRouter);
app.use("/api/teacher-upload", teacherUploadRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "/public/uploads")));
app.use("/api/support", supportRouter)


app.use('/api/rental', rentalRouter)
app.use('/api/rental-master', rentalMasterRouter)

app.use('/api/address', addressRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/getCp', getCpRouter)
app.use('/api/ecpay', ecpayRouter)
app.use('/api/linePay', linePayRouter)
app.use('/api/orders', ordersRouter)

app.use('/api/articles', articleRoutes)
app.use('/api/comments', commentsRouter)
app.use('/api/article_comments', commentsRouter)
app.use('/api/likes', likesRouter)

app.use('/api/users', users)
app.use('/api/collect', collect)
app.use('/api/myorders', myorders)
app.use('/api/uploads', uploadsRouter);//聊天室用
app.use('/api/forgot', forgot)



const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// 確保靜態檔案目錄可訪問
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));//聊天室用

// 設定伺服器監聽埠號
const PORT = process.env.PORT || 8000
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const DB_PORT = process.env.DB_PORT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY


server.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
});
