import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// ✅ Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyBqOn5DkBcsvZwHNKT8HkQyXMeDuicsuCg",
  authDomain: "react--login-811e8.firebaseapp.com",
  projectId: "react--login-811e8",
  storageBucket: "react--login-811e8.firebasestorage.app",
  messagingSenderId: "83739524414",
  appId: "1:83739524414:web:5373859ad8df584083c06f"
};

// ✅ 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Google 登入方法
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("🔥 Firebase 使用者資訊:", user);

    const idToken = await user.getIdToken();
    const email = user.email || "no-email@gmail.com"; // 防止 email 為空
    const name = user.displayName;
    const picture = user.photoURL;

    // ✅ 發送請求到後端
    const response = await fetch("https://lenstudio.onrender.com/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken, email, name, picture }),
    });

    if (!response.ok) throw new Error("後端驗證失敗");

    const data = await response.json();
    console.log("✅ 後端回應:", data);

    // ✅ 確保 account 存到 localStorage
    localStorage.setItem("loginWithToken", data.data.token);
    // localStorage.setItem("account", data.data.user.account);
    localStorage.setItem("profilePic", picture);

    return data.user;
  } catch (error) {
    console.error("❌ Google 登入錯誤:", error);
    throw error;
  }
};

// ✅ 登出方法
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("loginWithToken");
    localStorage.removeItem("profilePic");
  } catch (error) {
    console.error("登出失敗:", error);
  }
};

export { auth };
