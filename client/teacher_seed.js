import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 建立資料庫連線
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const teachersData = [
    {
      id: 1,
      name: '張道慈',
      email: 'daoci@example.com',
      image: '/images/teachers/張道慈.jpg',
      bio: '曾經抱持著要解決病毒演化起源這樣艱深問題的夢想,進入了微生物相關領域的研究所，並一路攻讀至博士。最後抱著一台相機離開學術圈，離開補教界，就像 Felix  Baumgartner 一樣，沒有任何安全繩索沒有回頭路，往下一跳。 \n\n從事攝影工作數年，除了以婚禮紀錄、寫真婚紗等工作性質的拍攝以外，時常拍攝街頭人像，旅行記實以及為喜愛的樂團拍攝花絮。\n\n「我都ok啊」YouTube 頻道創辦兼主持人\n\n「有人在米倉」系列講座共同主持人\n\n「究晚」系列講座創辦兼主持人\n\n《預視》、《單燈人像：預視現場，用一支閃燈打出各種可能》作者',
      website: 'https://張道慈.com',
      facebook: 'https://facebook.com/daoci',
      instagram: 'https://instagram.com/daoci',
      youtube: 'https://youtube.com/daoci'
    },
    {
      id: 2,
      name: 'Edo Lo',
      email: 'edolo@example.com',
      image: '/images/teachers/edolo.jpg',
      bio: 'Edo 為台灣元老街舞傳奇團體 "Popcorn Crew" 團員之一，對舞蹈音樂及街頭文化擁有強烈熱誠，\n在視覺藝術與音樂有相當的敏銳度，從於加拿大長大並讓他打開眼界吸收更多資訊與國際視野。\n\n2002 年 ——\n從加拿大回台灣後繼續從事音樂及舞蹈工作，\n從事街舞行業超過 20 年並與許多知名歌手藝人合作，擁有相當豐富的資歷。\n\n2004 年 ——\n成立 Merry Monarc 舞蹈學校，為目前台灣最大型舞蹈學校之一，\n並孕育了許多新生代的職業舞者，該學校至今已有超過 10,000 個會員。\n\n2010 年 ——\n成立 Hedonic 音樂團隊，積極提倡音樂文化並且挖掘 & 分享許多鮮為人知的好聽音樂，\nHedonic音樂團隊成立後隨即精心策劃了大大小音樂派對，與許多台灣一流的 DJ合作創造許多美好的深夜派對，並於 2012 年與國際手錶廠商 G-SHOCK 合作舉辦了台灣嬉哈史上最巨型的活動”Street Vibes Connection”，此活動特別邀請了日本享譽國際的知名DJ與音樂製作人”DJ Mitsu The Beats”來台表演，\n吸引了超過千人參加活動。\n\n2011 年 ——\n逐漸將重心轉移至影像創作，並開始擔任藝術總監與導演的職位，擅長將音樂節拍與旋律，情感與動態影像結合剪輯成細緻的作品，並詳細捕捉人物的情感與形體創作出具有個人風格的影像作品！',
      website: 'https://edolo.com',
      facebook: 'https://facebook.com/edolo',
      instagram: 'https://instagram.com/edolo',
      youtube: 'https://youtube.com/c/edolo'
    },
    {
      id: 3,
      name: 'DingDong',
      email: 'dingdong@example.com',
      image: '/images/teachers/dingdong叮咚.jpg',
      bio: 'Dingdong Lee 攝影師 擅長在生活時光中自然擷取，為平凡的日常拍下充滿柔軟的瞬間！ 商業作品拍攝過Sony、Whiplë、全聯福利中心、台灣高鐵、雅虎購物中心、綠藤生機、老爺酒店等品牌，並為Sony RX100M7相機與 Xperia手機代言人。',
      website: 'https://dingdong叮咚.com',
      facebook: 'https://facebook.com/dingdong',
      instagram: 'https://instagram.com/dingdong',
      youtube: 'https://youtube.com/c/dingdong'
    },
    {
      id: 4,
      name: '子雍 Tzu-Yung',
      email: 'tzuyung@example.com',
      image: '/images/teachers/子雍tzuyung.jpg',
      bio: '「能透過照片來傳遞自己的故事還有情感，才算是攝影。」 台北影視音實驗學校 - 攝影專題創作講師、自由影像工作者、導演。 美國 AVA 影片獎項入圍、第 28 屆金曲獎最佳演唱組合入圍。',
      website: 'https://子雍tzuyung.com',
      facebook: 'https://facebook.com/tzuyung',
      instagram: 'https://instagram.com/tzuyung',
      youtube: 'https://youtube.com/c/tzuyung'
    },
    {
      id: 5,
      name: '大景哥 x SyuyaFujikawa',
      email: 'xsyuyafujikawa@example.com',
      image: '/images/teachers/大景哥xsyuyafujikawa.jpg',
      bio: '多次獲得 EPSON、ILPOTY、SWPA 等國際頂尖攝影獎項，為台灣現代風景攝影發起人\n讓多次獲得 EPSON、ILPOTY、SWPA⋯等國際頂尖攝影獎項的大景哥，攜手曾替 Microsoft、誠品、國泰人壽、不來梅創意⋯等企業提供資訊設計、教育訓練相關服務的 Syuya Fujikawa 共同打造課程，完整帶你學習「現代風景攝影」的必備觀念與技術！\n台灣現代風景攝影發起人，多次獲得 EPSON、ILPOTY、SWPA 等國際頂尖攝影大獎！曾與NIKON、小米、華為⋯等品牌合作攝影相關服務、並受邀 SKM PHOTO 國際攝影聯展 參展\n\n在本課程中，大景哥將用數年閱覽無數世界景觀與豐富的國際級拍攝與教學經驗，手把手帶你將作品邁向世界級風景攝影！',
      website: 'https://xsyuyafujikawa.com',
      facebook: 'https://facebook.com/xsyuyafujikawa',
      instagram: 'https://instagram.com/xsyuyafujikawa',
      youtube: 'https://youtube.com/c/xsyuyafujikawa'
    },
    {
      id: 6,
      name: '林殊宇',
      email: 'shuyu565@example.com',
      image: '/images/teachers/林殊宇.jpg',
      bio: '林殊宇 Taylor Shulin (b. 1990) ，是首位獲選錄取至英國國家電影學院（National Film and Television School）的台灣攝影師。\n\n他的攝影作品被選入超過二十五個國際影展，並在 2021 年獲得第七十五屆英國影藝學院獎 (BAFTA) 的肯定。\n\n在英國創作的期間，殊宇接受傳奇攝影大師個別指導，包括 Roger Deakins、Chris Menges、Billy Williams、Brian Tufano、Oliver Stapleton、Stuart Harris 等人，並於 2021 年獲得皇家藝術學院 (Royal College of Art) 授與的碩士學位。\n\n除了平時的電影創作、攝影創作、廣告拍之外，殊宇也在國立臺北藝術大學電影創作學系、中影培育中心教授電影攝影，並於新竹縣照海華德福實驗學校、衛福部少年之家擔任攝影課老師，他十分珍惜每個和學生分享影像藝術的機會。',
      website: 'https://shuyu.com',
      facebook: 'https://facebook.com/shuyu',
      instagram: 'https://instagram.com/shuyu',
      youtube: 'https://youtube.com/c/shuyu'
    },
    {
      id: 7,
      name: 'peterhuang王逸丞',
      email: 'peterhuang65@example.com',
      image: '/images/teachers/peterhuang王逸丞.jpg',
      bio: '接觸攝影約二年，主要強項為人像攝影及活動攝影。從大二接任社團資訊組幹部後，開始接觸攝影，剛開始因為個人資金不足，沒有買任何一台相機，所以都是以手機作為練習工具。也因為用手機拍了快一年，在購入第一台單眼時，深刻體會到想法的重要性，也一直嘗試用有限的器材創作自己的作品。也因為自身的經驗，和朋友開設了這門手機攝影課程，希望讓大家可以清楚了解，不用一定要昂貴的器材，只要具備攝影的視角及想法，一支手機，也找能拍出有質感且具個人風格的照片。',
      website: 'https://peterhuang.com',
      facebook: 'https://facebook.com/peterhuang',
      instagram: 'https://instagram.com/peterhuang',
      youtube: 'https://youtube.com/c/peterhuang'
    },
    {
      id: 8,
      name: 'Cherry',
      email: 'cherry122@example.com',
      image: '/images/teachers/cherry.jpg',
      bio: '至今擁有超過 7 萬粉絲追蹤、部落格瀏覽量破千萬次、任 SONY 本色攝影大使\n\n現為旅行部落客、Instagram 創作者、同時也是旅行作家與攝影師\n2016年 參與「澳門嚐飽途，美味講座」（與愛評網、澳門旅遊局、吉光旅遊合作）\n2017年 參與「網路吸睛圖文數」（與中國生產力中心合作）\n2019年 參與 淡江大學—攝影社旅行攝影講座分享\n2020年 參與 Pinkoi 品品學堂「旅行攝影講座課程」\n2020年 參與 「攝影及設計美學 講座培訓課程」（交通部協助受重大疫情影響觀光相關產業轉型培訓課程）\n2020年 參與 企業遠端攝影教學課程（不公開活動）\n立榮航空、香港航空、麗星郵輪、KLOOK、五福旅遊、上順旅遊、東森旅遊、常旅遊LaviTrip、雅比斯國際創意策略股份有限公司（花東縱谷、阿里山部落工作假期）、SONY、Canon、IKEA、Panasonic、Western Digital（WD 威騰）、 BALMUDA、痞客邦 Pixnet、窩客島、愛評網、乾唐軒、NESCAFÉ（雀巢咖啡）、台中金典綠園道、王品集團、新東陽、統一集團、遠東飯店、寒舍集團、赫士盟餐飲集團、Perrier沛綠雅、agnes b、Kiehl’s、桐花餐飲集團、金色三麥、王德傳茶莊、台灣啤酒…。',
      website: 'https://cherry.com',
      facebook: 'https://facebook.com/cherry',
      instagram: 'https://instagram.com/cherry',
      youtube: 'https://youtube.com/c/cherry'
    },
    {
      id: 9,
      name: '邢正康',
      email: 'zhengkang23@example.com',
      image: '/images/teachers/邢正康.jpg',
      bio: '曾任山野釣遊雜誌總編輯，個人著作包括：《台灣經典高山路線：適合新手的10條百岳路線》、《戶外攝影實戰祕笈：帶你從海底拍到山頂》，與黃福森合著：《戶外裝備輕量化完全實戰BOOK》⋯⋯等，有任職攝影器材和戶外裝備產業界的經驗，擁有豐富的戶外活動與攝影知識，是此領域的資深愛好者。',
      website: 'https://zhengkang.com',
      facebook: 'https://facebook.com/zhengkang',
      instagram: 'https://instagram.com/zhengkang',
      youtube: 'https://youtube.com/c/zhengkang'
    },
    {
      id: 10,
      name: '余惟',
      email: 'yuwei2220@example.com',
      image: '/images/teachers/余惟.jpg',
      bio: '透過專業攝影角度捕捉生活細節，細膩的文字賦予影像更豐富的生命力。\n\n在 Instagram 上擁有將近二十萬粉絲，從事攝影近八年，擅長拍攝女性時尚，合作過品牌包含 Chanel、Dior、Nike、BVLGARI 和 Cartier 等。\n\n拍攝過賈靜雯、孫芸芸、陳庭妮、楊謹華等無數明星，也遠赴歐洲四大時裝週擔任品牌及藝人專屬攝影師。',
      website: 'https://yuwei.com',
      facebook: 'https://facebook.com/yuwei',
      instagram: 'https://instagram.com/yuwei',
      youtube: 'https://youtube.com/c/yuwei'
    },
    {
      id: 11,
      name: '郭堯中 Nkwo',
      email: 'nkwoooo01@example.com',
      image: '/images/teachers/郭堯中nkwo.jpg',
      bio: '「對畫面有多少要求，畫面就會給你多少回應。對拍攝有多少苛求，拍攝就會給你多少完美。」\n擅長用影像表達靈魂深處的密碼，從不停下腳步，跟著時代提升，追求身為攝影師的極致表現。透過作品的大膽嘗試，把每一次嘗試轉化為向前邁進的養分。\n\nFlux Reel Hair Boutique 助理大賽評省，並受邀擔任多家髮廊的攝影講師。NET 長期配合攝影師、奇哥 長期配合攝影師、節目『小明星大跟班』指定攝影師。\n\n個人形象拍攝\n吳宗憲、蕭敬騰、陶晶瑩、林宥嘉、周湯豪、周興哲、CoCo 李玟、信、范曉萱、陶喆、9m88、小宇 宋念宇、楊乃文、玖壹壹、潘瑋柏、J.Sheon、梁文音、戴佩妮、魏如萱、岑寧兒、LuLu 黃路梓茵、吳克群、呂士軒、Leo王、許允樂、劉隽\n\n合作過品牌\nVOGUE 雜誌、ELLE girl 雜誌、JUSKY 街星、MORE BYLEWAY、EverSimple、Dazzling Dazzlin、PESARO &MONOspace、Sisjeans、Essence 、Caspia LiLi 、LOVFEE、星采星和醫學美容診所',
      website: 'https://nkwoooo.com',
      facebook: 'https://facebook.com/nkwoooo',
      instagram: 'https://instagram.com/nkwoooo',
      youtube: 'https://youtube.com/c/nkwoooo'
    },
    {
      id: 12,
      name: 'Ada Lin',
      email: 'adalin88@example.com',
      image: '/images/teachers/adalin.jpg',
      bio: 'Ada，學習平面以及產品設計專業，2014 年接觸到攝影的領域，之後就開始沈溺在這個充滿色彩以及形狀的美好當中。2017 開始花藝設計創作，以花藝搭配攝影創作豐富畫面，同時也承接花束、桌花之設計創作。攝影的創作風格多以各式的顏色以及花卉的搭配去襯托攝影主體。創作領域包含攝影、影片製作、花藝設計、平面設計、策展規劃、插畫設計。於 2020 成立攝影工作室：林居工作室。',
      website: 'https://adalin.com',
      facebook: 'https://facebook.com/adalin',
      instagram: 'https://instagram.com/adalin',
      youtube: 'https://youtube.com/c/adalin'
    },
    {
      id: 13,
      name: '周育存',
      email: 'zhouyucun33@example.com',
      image: '/images/teachers/周育存.jpg',
      bio: '周育存，商業攝影師 ( 複眼攝影工作室 )\n2009 年開始全職商業攝影接案\n2017 年開始從事商業攝影教學，目前在 Hahow 已有兩個五星評價線上燈光課程\n作品集 : http://www.cephoto.com.tw\n複眼攝影 FB 粉專 : https://www.facebook.com/cephoto.tw/\nYoutube 頻道 : https://www.youtube.com/alokechou\nIG : https://www.instagram.com/aloke.chou/',
      website: 'https://zhouyucun.com',
      facebook: 'https://facebook.com/zhouyucun',
      instagram: 'https://instagram.com/zhouyucun',
      youtube: 'https://youtube.com/c/zhouyucun'
    },
    {
      id: 14,
      name: 'Oni Lai',
      email: 'onilai55@example.com',
      image: '/images/teachers/onilai.jpg',
      bio: 'Hello 大家好，我是 Oni！\n\n現為 Lai Photo Studio 攝影工作室負責人，也是王品集團、天仁茗茶、珍煮丹、桂格、㟢本生吐司等多家品牌合作攝影師。想知道我過往的作品可以參考以下內容：\n\nFacebook：facebook.com/onilai.photo\nInstagram：instagram.com/onilaiiiii',
      website: 'https://onilai.com',
      facebook: 'https://facebook.com/onilai',
      instagram: 'https://instagram.com/onilai',
      youtube: 'https://youtube.com/c/onilai'
    },
    {
      id: 15,
      name: '武敬凱Jing Wu',
      email: 'jingwu@example.com',
      image: '/images/teachers/武敬凱jingwu.jpg',
      bio: '已連續 3 年，每年受邀開設超過 100 場「影音行銷」講座，目前共 322 場(截至 2021 年三月)。曾於 10 家公司擔任行銷顧問，並協助遠見雜誌數位轉型，製作出歷年觀看人次最高作品。\n\n在政治、旅遊、音樂、財經、教育、運動等領域的影音作品，合計被媒體分享百次以上，在社群擁有高流量。',
      website: 'https://jingwu.com',
      facebook: 'https://facebook.com/jingwu',
      instagram: 'https://instagram.com/jingwu',
      youtube: 'https://youtube.com/c/jingwu'
    },
    {
      id: 16,
      name: '李歐',
      email: 'leoleo235@example.com',
      image: '/images/teachers/李歐.jpg',
      bio: '我目前是位全職影音創作者兼任講師，大學主修淡江大學大眾傳播，學生時代從幫社團拍攝影片到企業的小型拍攝都有接過，例如保溫瓶品牌 Driver、私人健身房開幕宣傳影片、服飾品牌 Vepristy 及各類型婚宴尾牙活動影片，甚至幫助過網紅 Sam Lin 拍攝過他的音樂 MV。在教學的部分，曾經在北一女社團授課 Premiere 教學、今年在國立中央大學傳播中心也有開班授課。',
      website: 'https://leoleo.com',
      facebook: 'https://facebook.com/leoleo',
      instagram: 'https://instagram.com/leoleo',
      youtube: 'https://youtube.com/c/leoleo'
    },
    {
      id: 17,
      name: 'rice&shine',
      email: 'riceshine@example.com',
      image: '/images/teachers/riceshine.jpg',
      bio: '大家好，我們是 rice&shine！ 連續 1000 天的日常紀錄當中，我們收穫了「國民鄰居」的稱號、收穫了社群上的多人關注，更收穫了生活當中滿滿的美好。\n紀錄生活！我們的影片當中，雖然看似每個人都在做自己的事、也沒有特定的影片主軸，不過保留生活片段，拼湊在一起還是會有意想不到的驚喜。',
      website: 'https://riceshine.com',
      facebook: 'https://facebook.com/riceshine',
      instagram: 'https://instagram.com/riceshine',
      youtube: 'https://youtube.com/c/riceshine'
    },
    {
      id: 18,
      name: '藍諾',
      email: 'lan66623@example.com',
      image: '/images/teachers/藍諾.jpg',
      bio: '專一影音有限公司負責人及導演，同時也是『藍諾 Eleanor Jiang』YouTube 頻道主持人。\n\n『藍諾 Eleanor Jiang』YouTube 頻道成立於 2016 年。初期由藍諾獨自籌畫腳本，拍攝，剪輯與發行，爾後於 2018 年登記成為專一影音工作室Too Focused Productions 並擴大製作團隊至 6 人。頻道內容包含攝影與剪輯教學，也製作華人世界少見的"影片剖析"，讓觀眾了解技術之外的製片巧思。頻道總觀看次數至今已超過 460 萬觀看次數。\n\n專一影音有限公司合作包含：星宇航空、紐西蘭航空、中華航空、Porsche、老爺酒店集團、台北愛樂交響樂團、KKday、DJI、Bose、Sony、Artlist＆Artgrid、Panasonic 等跨國企業。\n\n於 2020 年開始擔任 Sony 官方講師，FX6 台灣首部試片導演及 A7SIII 推廣夥伴。\n\n學歷：北一女中，紐西蘭南方理工學院電影系',
      website: 'https://lanno.com',
      facebook: 'https://facebook.com/lanno',
      instagram: 'https://instagram.com/lanno',
      youtube: 'https://youtube.com/c/lanno'
    },
    {
      id: 19,
      name: 'Anna 韓筠青',
      email: 'anna36546@example.com',
      image: '/images/teachers/anna韓筠青.jpg',
      bio: 'Anna 為舊金山藝術大學 MFA 攝影碩士，2014 年於台北天母創辦 ONFOTO STUDIO 攝影私塾與藝廊，以新一代教育者之姿開啟了台灣新型態攝影創作思潮，與工作團隊致力於發掘、培養台灣本土新銳攝影師。\n\nAnna 曾獲新光三越攝影比賽首獎、貳獎殊榮，並受邀至 TEDx 演講。她的攝影作品以 Storytelling（故事敘事法）以及自拍方式表述，並使用十九世紀古典化學方法（Historical Process）印製與展出。',
      website: 'https://anna.com',
      facebook: 'https://facebook.com/anna',
      instagram: 'https://instagram.com/anna',
      youtube: 'https://youtube.com/c/anna'
    },
    {
      id: 20,
      name: '安妮與陳 攝影工作室',
      email: 'annyandchen@example.com',
      image: '/images/teachers/安妮與陳攝影工作室.jpg',
      bio: '安妮與陳攝影工作室，由「安妮」+「老陳」兩位專業攝影師組成。我們接觸攝影10年，有多年商業攝影經歷，並長期在IG、FB上連載《1分鐘攝影小教室》，廣受熱烈回應。我們擅長把枯燥的攝影知識，輕鬆有趣的教給你！\n',
      website: 'https://anyandchen.com',
      facebook: 'https://facebook.com/anyandchen',
      instagram: 'https://instagram.com/anyandchen',
      youtube: 'https://youtube.com/c/anyandchen'
    },
    {
      id: 21,
      name: 'YOTTA 友讀',
      email: 'yotta@example.com',
      image: '/images/teachers/yotta友讀.jpg',
      bio: '台灣領先的線上教育品牌之一，提供設計、商業、科技、語言、生活五大領域線上課程。讓你用最小的時間和金錢成本，帶走多元新知識，探索職涯新可能。目前累積超過 600 堂線上課程，獲得逾 35 萬學員支持。\n\n從興趣到專業，從夢想到實踐，自學路上有我們陪你一起，讓我們成為「陪你成長的學習夥伴」吧！',
      website: 'https://yotta.com',
      facebook: 'https://facebook.com/yotta',
      instagram: 'https://instagram.com/yotta',
      youtube: 'https://youtube.com/c/yotta'
    },
    {
      id: 22,
      name: 'Robert Chang Chien',
      email: 'robertchangchien@example.com',
      image: '/images/teachers/robertchangchien.jpg',
      bio: 'Robert Chang Chien（張簡長倫），旅英台灣導演、攝影師、跨界藝術家、設計師，15年影像經驗。\n\n畢業於英國皇家藝術學院(Royal College of Art)動態影像組資訊體驗設計所、國立成功大學建築所建築設計組雙碩士，曾舉辦攝影個展、出版攝影集，並擔任短片電影、劇情MV、廣告、紀錄片與實驗電影之導演，亦為倫敦時裝周設計師品牌影像導演，其作品曾於英國倫敦、法國巴黎、日本東京、美國紐約、冰島雷克雅維克、韓國光州、台北與台南等地展出。\n\nRobert之電影作品曾獲倫敦獨立影展最佳實驗短片獎、入選巴黎ARFF國際影展評審團環球獎與最佳學生電影；投影作品獲東京國際投影映射大賞優秀賞，並獲邀於空總台灣當代文化實驗場(C-Lab)與韓國光州媒體藝術平台(G.MAP)以沈浸式電影展出；平面攝影作品多次獲美國IPA、法國PX3國際攝影比賽之廣告、藝術、人像類金、銀、榮譽入圍等數十個獎項。創作領域涵蓋電影、攝影、繪畫 、新媒體藝術、音像藝術、沈浸式體驗、裝置藝術等，持續探索跨領域創作的可能性，作品具豐富故事感、電影感與詩意。',
      website: 'https://robertchangchien.com',
      facebook: 'https://facebook.com/robertchangchien',
      instagram: 'https://instagram.com/robertchangchien',
      youtube: 'https://youtube.com/c/robertchangchien'
    },
    {
      id: 23,
      name: 'Paddy Chao 趙培均',
      email: 'paddychao@example.com',
      image: '/images/teachers/paddychao趙培均.jpg',
      bio: '在人手一支智慧型手機的時代，如何用使輕便的手機掌握瞬間光影，將生活中的美好片刻紀錄下來？你我是否也都想知道，如何用手機照片呈現出當下的故事？\n\n你知道嗎？毫無攝影基礎的我，其實自三年前才開始以手機拍攝日常生活與旅遊中的景致。然而透過我的攝影學習心法，在近兩年分別以手機拍攝的作品獲得國家地理攝影大賽、法國 Px3、美國 MPA 及 IPPAWARDS 等國際攝影獎；現為 Apple 及 HUAWEI 的特約手機攝影師。\n\n在這堂課程中我將完整地分享我的學習心法以及構圖技巧，透過精心安排的課程設計，讓上完課後的你在各種場景，拍出觸動人心的照片。',
      website: 'https://paddychao.com',
      facebook: 'https://facebook.com/paddychao',
      instagram: 'https://instagram.com/paddychao',
      youtube: 'https://youtube.com/c/paddychao'
    },
    {
      id: 24,
      name: '陳羽恆',
      email: 'yuhunnn@example.com',
      image: '/images/teachers/陳羽恆.jpg',
      bio: '嗨~我是Janan老師\n\n我雖然是資訊工程研究所畢業，但平常都在不務正業，沒事喜歡亂培養興趣跳舞、轉筆、魔術、吉他、攝影、photoshop都在我的興趣清單中唷但其中最大的興趣非攝影和PS莫屬。\n\n我喜歡創作超現實合成攝影，把天馬行空的想像化為真實。什麼是超現實合成攝影呢？就是利用攝影結合PS合成後製，來創造出現實中不可能出現的畫面。套一句合成大師Erik Joahnsson說過的話：「對其他攝影師來說，按下快門是結束。對我來說，按下快門是開始。」',
      website: 'https://yuhunnn.com',
      facebook: 'https://facebook.com/yuhunnn',
      instagram: 'https://instagram.com/yuhunnn',
      youtube: 'https://youtube.com/c/yuhunnn'
    },
    {
      id: 25,
      name: 'Ivan Lee',
      email: 'ivanlee@example.com',
      image: '/images/teachers/ivanlee.jpg',
      bio: '「以我的角度，記錄世上美好的時刻。」\n哈囉，我是一名獨立影片製作者，平常自己接案子，曾與香港大學、第二語言學習平台mlang等客戶合作。由商業廣告，婚禮攝錄，企業形象，和訪談影片均有涉獵。\n\n接觸影片製作已有6年，醉心拍攝，初心未變。',
      website: 'https://ivanlee.com',
      facebook: 'https://facebook.com/ivanlee',
      instagram: 'https://instagram.com/ivanlee',
      youtube: 'https://youtube.com/c/ivanlee'
    },
    {
      id: 26,
      name: 'TOMMY YAN',
      email: 'tommyyan@example.com',
      image: '/images/teachers/tommyyan.jpg',
      bio: '*2019 35國際攝影大賽\n時尚類年度最佳百大攝影師*\nTOMMY 擅長將設計概念融入攝影廣告當中，擁有10年以上藝術指導經驗的他，設計作品09年獲得德國IF設計獎與台灣金點設計獎殊榮，並開始發展多元設計，執行星空傳媒電視劇包裝，台灣金音獎頒獎典禮現場視覺效果，多位藝人宣傳MV，14年至今執行時尚廣告專案更跨足中、英、美，全方位的經歷發展出獨特美學，也因為跨界所以解決視覺問題靈活，在教授課程當中用概念引導技術思維，試圖讓學員不只會吃魚還會釣魚，真正進步。',
      website: 'https://tommyyan.com',
      facebook: 'https://facebook.com/tommyyan',
      instagram: 'https://instagram.com/tommyyan',
      youtube: 'https://youtube.com/c/tommyyan'
    },
    {
      id: 27,
      name: 'ANCAJAIER 章潔',
      email: 'ancajaier@example.com',
      image: '/images/teachers/ancajaier章潔.jpg',
      bio: '擅長藝術影像創作的章潔，作品曾獲得多個國際攝影獎殊榮，登上 TIMES, CNN 等媒體採訪報導，也受邀紐約蘋果旗艦、康乃爾大學與多所大學演講。除了藝術創作外，她也擅長把藝術思維加入商業品牌概念，合作對象：VOGUE, Marie Claire 美麗佳人, Shiseido 資生堂, ASUS 華碩, Samsung 三星, 華研唱片, 歌手伍佰等。出生臺北，現居紐約，在美國藝術學院取得攝影碩士學位後，曾任職於馬格蘭攝影通訊社紐約辦事處，現為自由接案的藝術攝影師、導演與品牌創意總監。',
      website: 'https://ancajaier.com',
      facebook: 'https://facebook.com/ancajaier',
      instagram: 'https://instagram.com/ancajaier',
      youtube: 'https://youtube.com/c/ancajaier'
    },
    {
      id: 28,
      name: 'Johnny',
      email: 'johnny@example.com',
      image: '/images/teachers/johnny.jpg',
      bio: '專門不務正業的男人\n從大學開始亂念有的沒的，唯一不變的就是對數位影像的愛好，持續至今10幾年，並曾在中國電影公司受訓並擔任過影視調色師\n\n出來工作後，最擅長的還是拿起相機、錄影機東拍西錄；然後拿起相機，卻開始不務正業，\n人家想的是拿來拍照，我卻想著拿來拍片搞kuso是不是更有趣。\n\n座右銘是："成功的路並不難，因為能撐到最後的人並不多"',
      website: 'https://johnny.com',
      facebook: 'https://facebook.com/johnny',
      instagram: 'https://instagram.com/johnny',
      youtube: 'https://youtube.com/c/johnny'
    },
    {
      id: 29,
      name: '雪糕人',
      email: 'snowman@example.com',
      image: '/images/teachers/雪糕人.jpg',
      bio: 'TVBS、壹電視採訪「男友拍照課」三立、中天、各大報採訪「淡江女孩月曆」google「京都婚紗」、「形象照」關鍵字第一名\n\n用攝影跟不同的人事物交流是我的熱情所在。\n\n我希望用一張張照片，留下每個人最好美好的瞬間。\n\n著有 《2*sweets Okinawa輕旅行寫真集》',
      website: 'https://snowman.com',
      facebook: 'https://facebook.com/snowman',
      instagram: 'https://instagram.com/snowman',
      youtube: 'https://youtube.com/c/snowman'
    },
    {
      id: 30,
      name: '張馬克',
      email: 'mark8123@example.com',
      image: '/images/teachers/張馬克.jpg',
      bio: '2005年開始攝影，現為專業自由接案攝影師，擅長精緻、細膩的人像攝影，攝影服務項目包括商業攝影、婚禮攝影、人像棚拍與外拍、服裝攝影等。目前為Gooday Studio攝影工作室負責人，曾任大俠攝影教室專任講師，新竹布列松攝影學苑 專任講師，SEVENTEEN攝影學院老師，華邦電子攝影社講師，聯發科攝影社講師。已出版過的著作有\n《Flash!超閃時尚人像 活用光與影的閃燈×棚燈魔術》\n《玩美閃燈 不敗的人像外拍用光攻略》\n《Flash!超閃人像再進化：專業攝影師不傳用光之術》\n《WOW!原來專業攝影師這樣打光：棚內、外拍人像控光超圖解 教你打出Pro級燈法》',
      website: 'https://mark8123.com',
      facebook: 'https://facebook.com/mark8123',
      instagram: 'https://instagram.com/mark8123',
      youtube: 'https://youtube.com/c/mark8123'
    },
    {
      id: 31,
      name: '南哥 JiHan',
      email: 'jihan@example.com',
      image: '/images/teachers/南哥jihan.jpg',
      bio: '「廣告畫面要有吸引人的重點，是我的攝影原則 」\n\n\n郭聰南 鉅瀚商業攝影 創辦人。\n商品攝影經驗20年！ 攝影教學課程達60場以上。\n【客戶經歷】黑橋牌食品、五花馬水餃館、瓜瓜園、\n牛頭牌沙茶醬、大成長城企業。',
      website: 'https://jihan.com',
      facebook: 'https://facebook.com/jihan',
      instagram: 'https://instagram.com/jihan',
      youtube: 'https://youtube.com/c/jihan'
    },
    {
      id: 32,
      name: '阿滴',
      email: 'adi5435613@example.com',
      image: '/images/teachers/阿滴.jpg',
      bio: 'YouTube 頻道「阿滴英文」創作者阿滴，擅長於用多元的主題內容及流暢的剪輯分享自身學習經驗。從 2015 年 1 月上傳的第一支影片開始，至今頻道已累積 350 部以上的教學影片。在 2019 年 1 月成為台灣第一位突破200萬訂閱的知識型 YouTuber。',
      website: 'https://adienglish.com',
      facebook: 'https://facebook.com/adienglish',
      instagram: 'https://instagram.com/adienglish',
      youtube: 'https://youtube.com/c/adienglish'
    },
    {
      id: 33,
      name: '王喜米',
      email: 'shimimi@example.com',
      image: '/images/teachers/王喜米.jpg',
      bio: '王喜米(Samuel Wang) - 台藝大視覺傳達設計系，在科技業擔任視覺設計師十餘年，因為本身是設計師的關係所以對Adobe的軟體相當熟悉進而對後製修片有極大興趣，接觸攝影六年左右，使用的器材從Canon 70d片幅升級到Canon 5D3全幅，平常休假就外出拍照，熱愛攝影！ ',
      website: 'https://shimimi.com',
      facebook: 'https://facebook.com/shimimi',
      instagram: 'https://instagram.com/shimimi',
      youtube: 'https://youtube.com/c/shimimi'
    },
    {
      id: 34,
      name: 'app_what_i_use',
      email: 'appwhatiuse@example.com',
      image: '/images/teachers/app_what_i_use.jpg',
      bio: '小余太太，經營 Instagram「app_what_i_use」，致力於分享調色心法、好用手機拍照、濾鏡 App 分享與 Lightroom App 教學，製作分享數百種色調。',
      website: 'https://appwhatiuse.com',
      facebook: 'https://facebook.com/appwhatiuse',
      instagram: 'https://instagram.com/appwhatiuse',
      youtube: 'https://youtube.com/c/appwhatiuse'
    },
    {
      id: 35,
      name: '強尼',
      email: 'johnny333@example.com',
      image: '/images/teachers/強尼.jpg',
      bio: '數位攝影與影像編修的熱愛者',
      website: 'https://johnny.com',
      facebook: 'https://facebook.com/johnny',
      instagram: 'https://instagram.com/johnny',
      youtube: 'https://youtube.com/c/johnny'
    },
    {
      id: 36,
      name: '二棲知學 Motioner',
      email: 'motioner@example.com',
      image: '/images/teachers/二棲知學motioner.jpg',
      bio: '【Motioner 二棲知學】集結臺灣最專業的設計業界師資，為你打造最完整扎實的動態設計課程，搭起學界與業界的橋樑，成為每位學員在設計路上的學習嚮導！',
      website: 'https://motioner.com',
      facebook: 'https://facebook.com/motioner',
      instagram: 'https://instagram.com/motioner',
      youtube: 'https://youtube.com/c/motioner'
    },
    {
      id: 37,
      name: '謝小蜜&王卉竺',
      email: 'xiewang@example.com',
      image: '/images/teachers/謝小蜜王卉竺.jpg',
      bio: '沒有高深的編劇理論，而是扎實的實務經驗。從劇本開發到拍攝殺青，到底要經過多少關卡？兩個擁有二十年編劇資歷，同時擁有製作人經驗的資深編劇，在這條路上可以告訴你的各種闖關方法！',
      website: 'https://xiewang.com',
      facebook: 'https://facebook.com/xiewang',
      instagram: 'https://instagram.com/xiewang',
      youtube: 'https://youtube.com/c/xiewang'
    },
    {
      id: 38,
      name: '壹間學校 YIYICLASS',
      email: 'yiyiclass@example.com',
      image: '/images/teachers/壹間學校yiyiclass.jpg',
      bio: '壹間學校由影視工作者 Yvonne 創辦，Yvonne 參與超過 50 部電影行銷，並曾於樂視影業擔任市場管理部總經理，協助其建立數據管理內容體系，完成一年發行 10 部影片步步破億的成績。期待透過壹間學校，將多年來系統化和數據化的創意管理經驗與所有內容工作者分享。',
      website: 'https://yiyiclass.com',
      facebook: 'https://facebook.com/yiyiclass',
      instagram: 'https://instagram.com/yiyiclass',
      youtube: 'https://youtube.com/c/yiyiclass'
    },
    {
      id: 39,
      name: '城邦自慢塾',
      email: 'citetw@example.com',
      image: '/images/teachers/城邦自慢塾.jpg',
      bio: '城邦媒體集團第一個結合線上課程與實體課程的知識學習平台。',
      website: 'https://citetw.com',
      facebook: 'https://facebook.com/citetw',
      instagram: 'https://instagram.com/citetw',
      youtube: 'https://youtube.com/c/citetw'
    },
    {
      id: 40,
      name: '休伯特',
      email: 'hubert2297@example.com',
      image: '/images/teachers/休伯特.jpg',
      bio: '專精於人像、旅遊與商業攝影。擁有超過 15 年的攝影經驗，他曾與多家知名品牌合作，為時尚、餐飲與生活風格領域打造精彩作品。休伯特的攝影風格獨具個性，擅長運用自然光線與構圖技巧，捕捉畫面中的故事與情感。他不僅是位優秀的攝影師，同時也是一位熱情的教育者，曾受邀至各大攝影工作坊與學院授課，幫助學員掌握從基礎理論到高級技術的攝影知識。他的教學方式生動有趣，強調實作與互動，讓學員能夠迅速提升攝影技巧，並發掘個人風格。',
      website: 'https://hubert.com',
      facebook: 'https://facebook.com/hubert',
      instagram: 'https://instagram.com/hubert',
      youtube: 'https://youtube.com/c/hubert'
    },
  ];

// 插入資料
async function seedDatabase() {
    try {
      const connection = await pool.getConnection();
  
      for (const teacher of teacherData) {
        await connection.query(
          `INSERT INTO courses 
          (title, category, teacher_id, image_url, original_price, sale_price, description, chapter, duration, student_count, content, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            course.title,
            course.category,
            course.teacher_id,
            course.image_url,
            course.original_price,
            course.sale_price,
            course.description,
            course.chapter,
            course.duration,
            course.student_count,
            course.content,
            course.status,
          ]
        );
      }
  
      console.log('✅ 假資料插入完成！');
      connection.release();
      process.exit();
    } catch (error) {
      console.error('❌ 插入假資料失敗:', error);
      process.exit(1);
    }
  }
  
  // 執行
  seedDatabase();