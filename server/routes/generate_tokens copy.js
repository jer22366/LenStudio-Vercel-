import jwt from 'jsonwebtoken';

// 設定你的 JWT 密鑰 (secretKey)
const secretKey = '你的密鑰'; // 請確保這個密鑰與你的系統中一致

// 要生成 Token 的用戶資料
const users = [
  {
    id: 49,
    account: "pk",
    name: "吉娃娃",
    nickname: "吉娃娃",
    mail: "pk@pk.com",
    head: "/uploads/(勿刪)49的頭貼-吉娃娃.jpg",
    level: 0,
    birthday: null
  },
  {
    id: 50,
    account: "50",
    name: "中壢大谷祥平",
    nickname: "中壢大谷祥平",
    mail: "50@50.com",
    head: "/uploads/(勿刪)50的頭貼-中壢大谷祥平.jpg",
    level: 0,
    birthday: "1990-01-01"
  },
  {
    id: 51,
    account: "51",
    name: "攝影浩哥",
    nickname: "攝影浩哥",
    mail: "51@51.com",
    head: "/uploads/(勿刪)51的頭貼-攝影浩哥.jpg",
    level: 0,
    birthday: "1990-01-01"
  },
  {
    id: 52,
    account: "52",
    name: "攝影ㄟAndy",
    nickname: "攝影ㄟAndy",
    mail: "52@52.com",
    head: "/uploads/(勿刪)52的頭貼-攝影ㄟAndy.jpg",
    level: 0,
    birthday: "1990-01-01"
  },
  {
    "id": 53,
    "account": "53",
    "name": "山道一支刺",
    "nickname": "山道一支刺",
    "mail": "53@53.com",
    "head": "/uploads/(勿刪)53的頭貼-山道一支刺.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 54,
    "account": "54",
    "name": "山道攝手",
    "nickname": "山道攝手",
    "mail": "54@54.com",
    "head": "/uploads/(勿刪)54的頭貼-山道攝手.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 55,
    "account": "55",
    "name": "不可以攝攝",
    "nickname": "不可以攝攝",
    "mail": "55@55.com",
    "head": "/uploads/(勿刪)55的頭貼-不可以攝攝.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 56,
    "account": "56",
    "name": "陳氏攝影",
    "nickname": "陳氏攝影",
    "mail": "56@56.com",
    "head": "/uploads/(勿刪)56的頭貼-陳氏攝影.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 57,
    "account": "57",
    "name": "雲台🐒哥",
    "nickname": "雲台🐒哥",
    "mail": "57@57.com",
    "head": "/uploads/(勿刪)57的頭貼-雲台🐒哥.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 58,
    "account": "58",
    "name": "Jasmine Shih",
    "nickname": "Jasmine Shih",
    "mail": "58@58.com",
    "head": "/uploads/(勿刪)58的頭貼-Jasmine Shih.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 59,
    "account": "59",
    "name": "虎shine🐱",
    "nickname": "虎shine🐱",
    "mail": "59@59.com",
    "head": "/uploads/(勿刪)59的頭貼-虎shine🐱.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 60,
    "account": "60",
    "name": "杰哥",
    "nickname": "杰哥",
    "mail": "60@60.com",
    "head": "/uploads/(勿刪)60的頭貼-杰哥.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 61,
    "account": "61",
    "name": "狠享愛",
    "nickname": "狠享愛",
    "mail": "61@61.com",
    "head": "/uploads/(勿刪)61的頭貼-狠享愛.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 62,
    "account": "62",
    "name": "又双叒叕",
    "nickname": "又双叒叕",
    "mail": "62@62.com",
    "head": "/uploads/(勿刪)62的頭貼-又双叒叕.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 63,
    "account": "63",
    "name": "大哥沒有輸",
    "nickname": "大哥沒有輸",
    "mail": "63@63.com",
    "head": "/uploads/(勿刪)63的頭貼-大哥沒有輸.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 64,
    "account": "64",
    "name": "北七記囧",
    "nickname": "北七記囧",
    "mail": "64@64.com",
    "head": "/uploads/(勿刪)64的頭貼-北七記囧.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 65,
    "account": "65",
    "name": "洗勒考",
    "nickname": "洗勒考",
    "mail": "65@65.com",
    "head": "/uploads/(勿刪)65的頭貼-洗勒考.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 66,
    "account": "66",
    "name": "黃媽媽廚房",
    "nickname": "黃媽媽廚房",
    "mail": "66@66.com",
    "head": "/uploads/(勿刪)66的頭貼-黃媽媽廚房.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 67,
    "account": "67",
    "name": "Zhu Pai",
    "nickname": "Zhu Pai",
    "mail": "67@67.com",
    "head": "/uploads/(勿刪)67的頭貼-Zhu Pai.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 68,
    "account": "68",
    "name": "母湯哦～",
    "nickname": "母湯哦～",
    "mail": "68@68.com",
    "head": "/uploads/(勿刪)68的頭貼-母湯哦～.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 69,
    "account": "69",
    "name": "花媽❤️",
    "nickname": "花媽❤️",
    "mail": "69@69.com",
    "head": "/uploads/(勿刪)69的頭貼-花媽❤️.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 70,
    "account": "70",
    "name": "飛魚卵香腸",
    "nickname": "飛魚卵香腸",
    "mail": "70@70.com",
    "head": "/uploads/(勿刪)70的頭貼-飛魚卵香腸.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 71,
    "account": "71",
    "name": "雅婷",
    "nickname": "雅婷",
    "mail": "71@71.com",
    "head": "/uploads/(勿刪)71的頭貼-雅婷.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 72,
    "account": "72",
    "name": "起司蛋餅",
    "nickname": "起司蛋餅",
    "mail": "72@72.com",
    "head": "/uploads/(勿刪)72的頭貼-起司蛋餅.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 73,
    "account": "73",
    "name": "瓜仔肉",
    "nickname": "瓜仔肉",
    "mail": "73@73.com",
    "head": "/uploads/(勿刪)73的頭貼-瓜仔肉.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 74,
    "account": "74",
    "name": "放開那個大叔",
    "nickname": "放開那個大叔",
    "mail": "74@74.com",
    "head": "/uploads/(勿刪)74的頭貼-放開那個大叔.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 75,
    "account": "75",
    "name": "啊不就==",
    "nickname": "啊不就==",
    "mail": "75@75.com",
    "head": "/uploads/(勿刪)75的頭貼-啊不就==.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 76,
    "account": "76",
    "name": "麻糬醬",
    "nickname": "麻糬醬",
    "mail": "76@76.com",
    "head": "/uploads/(勿刪)76的頭貼-麻糬醬.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 77,
    "account": "77",
    "name": "Chill see",
    "nickname": "Chill see",
    "mail": "77@77.com",
    "head": "/uploads/(勿刪)77的頭貼-Chill see.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 78,
    "account": "78",
    "name": "果咩納賽",
    "nickname": "果咩納賽",
    "mail": "78@78.com",
    "head": "/uploads/(勿刪)78的頭貼-果咩納賽.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 79,
    "account": "79",
    "name": "肥宅(￣▽￣)ノ",
    "nickname": "肥宅(￣▽￣)ノ",
    "mail": "79@79.com",
    "head": "/uploads/(勿刪)79的頭貼-肥宅(￣▽￣)ノ.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 80,
    "account": "80",
    "name": "川普",
    "nickname": "川普",
    "mail": "80@80.com",
    "head": "/uploads/(勿刪)80的頭貼-川普.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 81,
    "account": "81",
    "name": "小明",
    "nickname": "小明",
    "mail": "81@81.com",
    "head": "/uploads/(勿刪)81的頭貼-小明.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 82,
    "account": "82",
    "name": "金色狂風",
    "nickname": "金色狂風",
    "mail": "82@82.com",
    "head": "/uploads/(勿刪)82的頭貼-金色狂風.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 83,
    "account": "83",
    "name": "修但幾勒",
    "nickname": "修但幾勒",
    "mail": "83@83.com",
    "head": "/uploads/(勿刪)83的頭貼-修但幾勒.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 84,
    "account": "84",
    "name": "蒙奇D能兒",
    "nickname": "蒙奇D能兒",
    "mail": "84@84.com",
    "head": "/uploads/(勿刪)84的頭貼-蒙奇D能兒.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 85,
    "account": "85",
    "name": "歐嚕嚕",
    "nickname": "歐嚕嚕",
    "mail": "85@85.com",
    "head": "/uploads/(勿刪)85的頭貼-歐嚕嚕.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 86,
    "account": "86",
    "name": "賣勾靠杯",
    "nickname": "賣勾靠杯",
    "mail": "86@86.com",
    "head": "/uploads/(勿刪)86的頭貼-賣勾靠杯.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 87,
    "account": "87",
    "name": "霍金的移動輪椅",
    "nickname": "霍金的移動輪椅",
    "mail": "87@87.com",
    "head": "/uploads/(勿刪)87的頭貼-霍金的移動輪椅.jpg",
    "level": 0,
    "birthday": "1990-01-01"
  },
  {
    "id": 88,
    "account": "88",
    "name": "(⁠・⁠∀⁠・⁠)",
    "nickname": "(⁠・⁠∀⁠・⁠)",
    "mail": "88@88.com",
    "head": "/uploads/(勿刪)88的頭貼-(⁠・⁠∀⁠・⁠).jpg",
    "level": 0,
    "birthday": "1990-01-01"
  }
];

// 迴圈生成每個用戶的 JWT
users.forEach(user => {
  const token = jwt.sign(user, secretKey, { expiresIn: '7d' });
  console.log(`用戶 ${user.account} 的 JWT Token: \n${token}\n`);
});
