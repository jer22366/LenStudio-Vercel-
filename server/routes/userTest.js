import express from 'express'
import multer from 'multer'
import moment from 'moment'
import core from 'cors'
import jwt from 'jsonwebtoken'

const upload = multer();
const whiteList = ['http://localhost:5500', 'http://localhost:3000','https://lenstudio.vercel.app']
const corsOptions = {
  credentials: true,
  origin(origin, callback){
    if(!origin || whiteList.includes(origin)){
      callback(null, true)
    }else{
      callback(new Error('不允許連線'))
    }
  }
}

const router = express.Router();

router.use(core(corsOptions));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/user', (req, res) => {
  res.json({status: "success", data: null, message: "首頁"});
})

router.list(3005, ()=>{
  console.log("API 運行中...");
})


