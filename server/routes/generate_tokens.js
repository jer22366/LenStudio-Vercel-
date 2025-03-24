import jwt from 'jsonwebtoken';

// 設定你的 JWT 密鑰 (secretKey)
const secretKey = '你的密鑰'; // 請確保這個密鑰與你的系統中一致

// 要生成 Token 的用戶資料
const users = [
  {
    "id": 6,
    "account": "06",
    "name": "黃小茜",
    "nickname": "小茜",
    "mail": "456465@gmail.com",
    "head": "/uploads/(勿刪)6的頭貼-黃小茜.jpg",
    "level": 0,
    "birthday": "1991-02-22"
  },
  {
    "id": 7,
    "account": "07",
    "name": "王小花",
    "nickname": "",
    "mail": "aa123458@gmail.com",
    "head": "/uploads/(勿刪)7的頭貼-王小花.jpg",
    "level": 0,
    "birthday": "1994-01-31"
  },
  {
    "id": 8,
    "account": "08",
    "name": "徐小瑜",
    "nickname": "🐷🐷",
    "mail": "a1155@132.com",
    "head": "/uploads/(勿刪)8的頭貼-徐小瑜.jpg",
    "level": 0,
    "birthday": "2000-09-25"
  },
  {
    "id": 9,
    "account": "09",
    "name": "王大明",
    "nickname": "阿明",
    "mail": "qwe12349@gmail.com",
    "head": "/uploads/(勿刪)9的頭貼-王大明.jpg",
    "level": 0,
    "birthday": "1998-05-07"
  },
  {
    "id": 10,
    "account": "10",
    "name": "黃瑜",
    "nickname": "瑜👻",
    "mail": "a48491489@gmail.com",
    "head": "/uploads/(勿刪)10的頭貼-黃瑜.jpg",
    "level": 0,
    "birthday": "1900-07-02"
  }, {
    "id": 11,
    "account": "11",
    "name": "張小咪",
    "nickname": "卡哇七寶媽",
    "mail": "zcx444@yahoo.com.tw",
    "head": "/uploads/(勿刪)11的頭貼-張小咪.jpg",
    "level": 0,
    "birthday": "1992-01-23"
  },
  {
    "id": 12,
    "account": "12",
    "name": "蘇佩玲",
    "nickname": "",
    "mail": "lulu8433375@gmail.com",
    "head": "/uploads/(勿刪)12的頭貼-蘇佩玲.jpg",
    "level": 0,
    "birthday": "2001-05-22"
  },
  {
    "id": 13,
    "account": "13",
    "name": "林信君",
    "nickname": "",
    "mail": "kk115555@123.com",
    "head": "/uploads/(勿刪)13的頭貼-林信君.jpg",
    "level": 0,
    "birthday": "1988-01-24"
  },
  {
    "id": 14,
    "account": "14",
    "name": "王二男",
    "nickname": "",
    "mail": "coco88762@gmail.com",
    "head": "/uploads/(勿刪)14的頭貼-王二男.jpg",
    "level": 0,
    "birthday": "1990-05-11"
  },
  {
    "id": 15,
    "account": "15",
    "name": "王寶",
    "nickname": "Chindy",
    "mail": "4848497@123.com",
    "head": "/uploads/(勿刪)15的頭貼-王寶.jpg",
    "level": 0,
    "birthday": "1987-02-03"
  },
  {
    "id": 16,
    "account": "16",
    "name": "蔡承保",
    "nickname": "色即是空",
    "mail": "aa49498a@123.com",
    "head": "/uploads/(勿刪)16的頭貼-蔡承保.jpg",
    "level": 0,
    "birthday": "1999-10-13"
  }, {
    "id": 17,
    "account": "17",
    "name": "蔡欣穎",
    "nickname": "",
    "mail": "yu498498@gmail.com",
    "head": "/uploads/(勿刪)17的頭貼-蔡欣穎.jpg",
    "level": 0,
    "birthday": "1998-09-05"
  },
  {
    "id": 18,
    "account": "18",
    "name": "王人帥",
    "nickname": "Steve",
    "mail": "a449487@gmail.com",
    "head": "/uploads/(勿刪)18的頭貼-王大帥.jpg",
    "level": 0,
    "birthday": "1997-02-25"
  },
  {
    "id": 19,
    "account": "19",
    "name": "王小美",
    "nickname": "",
    "mail": "rr45894@gmail.com",
    "head": "/uploads/(勿刪)19的頭貼-王小美.jpg",
    "level": 0,
    "birthday": "1997-01-11"
  },
  {
    "id": 20,
    "account": "20",
    "name": "王小帥",
    "nickname": "",
    "mail": "a284984949@gmail.com",
    "head": "/uploads/(勿刪)20的頭貼-王小帥.jpg",
    "level": 0,
    "birthday": "2001-05-23"
  },
  {
    "id": 21,
    "account": "21",
    "name": "蘇再",
    "nickname": "Jennie❤️",
    "mail": "gg4894@gmail.com",
    "head": "/uploads/(勿刪)21的頭貼-蘇再.jpg",
    "level": 0,
    "birthday": "1999-04-23"
  },
  {
    "id": 22,
    "account": "22",
    "name": "郭玲玲",
    "nickname": "",
    "mail": "serr123@gmail.com",
    "head": "/uploads/(勿刪)22的頭貼-郭玲玲.jpg",
    "level": 0,
    "birthday": "1994-07-23"
  }, {
    "id": 23,
    "account": "23",
    "name": "王陸",
    "nickname": "",
    "mail": "zxc4984@gmail.com",
    "head": "/uploads/(勿刪)23的頭貼-王陸.jpg",
    "level": 0,
    "birthday": "1995-11-30"
  },
  {
    "id": 24,
    "account": "24",
    "name": "張梧",
    "nickname": "",
    "mail": "hh4546@gmail.com",
    "head": "/uploads/(勿刪)24的頭貼-張梧.jpg",
    "level": 0,
    "birthday": "1992-01-30"
  },
  {
    "id": 25,
    "account": "25",
    "name": "張麗娜",
    "nickname": "",
    "mail": "vv45461@gmail.com",
    "head": "/uploads/(勿刪)25的頭貼-張麗娜.jpg",
    "level": 0,
    "birthday": "2000-09-27"
  },
  {
    "id": 26,
    "account": "26",
    "name": "kiki",
    "nickname": "kiki",
    "mail": "asddsa4564@gmail.com",
    "head": "/uploads/(勿刪)26的頭貼-kiki.jpg",
    "level": 0,
    "birthday": "2000-11-11"
  },
  {
    "id": 27,
    "account": "27",
    "name": "黃大明",
    "nickname": "",
    "mail": "5678@gmail.com",
    "head": "/uploads/(勿刪)27的頭貼-黃大明.jpg",
    "level": 0,
    "birthday": "1995-01-22"
  },
  {
    "id": 28,
    "account": "28",
    "name": "蘇小倩dd",
    "nickname": "",
    "mail": "145462dsd3@gmail.com",
    "head": "/uploads/(勿刪)28的頭貼-蘇小倩dd.jpg",
    "level": 0,
    "birthday": "2000-02-23"
  }
];

// 迴圈生成每個用戶的 JWT
users.forEach(user => {
  const token = jwt.sign(user, secretKey, { expiresIn: '7d' });
  console.log(`用戶 ${user.account} 的 JWT Token: \n${token}\n`);
});
