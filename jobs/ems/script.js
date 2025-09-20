// Firebase 設定（警察/猫カフェ/Elysium/メカニックと同じプロジェクトでOK）
const firebaseConfig = {
  apiKey: "AIzaSyD2mw2TylqiQ6rtALqfcHvyEWDGISDeQ6k",
  authDomain: "hogta-ems.firebaseapp.com",
  projectId: "hogta-ems",
  storageBucket: "hogta-ems.firebasestorage.app",
  messagingSenderId: "100912744028",
  appId: "1:100912744028:web:a28a854ed3634c348ac899"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const staffInput = document.getElementById("staff-code");
const passInput = document.getElementById("password");
const loginMsg = document.getElementById("login-msg");
const currentUser = document.getElementById("current-user");

// スタッフコード → 疑似メール
function staffToEmail(staff) {
  return `${staff}@hogta.local`; 
}

// ログイン
btnLogin.addEventListener("click", async () => {
  const staff = staffInput.value.trim();
  const pw = passInput.value.trim();
  if (!staff || !pw) { loginMsg.textContent = "入力してください"; return; }

  const email = staffToEmail(staff);
  try {
    await auth.signInWithEmailAndPassword(email, pw);
  } catch (e) {
    loginMsg.textContent = "ログイン失敗：" + e.message;
  }
});

// ログアウト
btnLogout.addEventListener("click", async () => {
  await auth.signOut();
});

// 認証状態を監視
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    currentUser.textContent = user.email.split("@")[0]; // HOEMS-001 部分だけ表示
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    currentUser.textContent = "—";
  }
});

