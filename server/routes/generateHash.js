import bcrypt from 'bcrypt';

const plainPassword = '12345';

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error('生成密碼哈希失敗', err);
  } else {
    console.log('新密碼哈希：', hash);
  }
});
