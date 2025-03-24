import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// 取得當前檔案目錄
const __dirname = dirname(fileURLToPath(import.meta.url));
// 讀取 Firebase 服務帳戶金鑰
const serviceAccount = JSON.parse(
  readFileSync(__dirname + "/firebase-service-account.json", "utf-8")
);

// 初始化 Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id, // ✅ 確保這裡的 project_id 正確
      });
}

// **驗證 Firebase Token**
export const verifyFirebaseToken = async (token) => {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error("❌ Firebase Token 驗證失敗:", error);
      return null;
    }
  };

export default admin;