// Firebase 設定（Firebase コンソール -> プロジェクト設定 -> SDK設定からコピー）
const firebaseConfig = {
  apiKey: "AIzaSyCuXg2pZyr38uVbAb0sHzhC-0USN5hk06Y",
  authDomain: "hogta-6d9e8.firebaseapp.com",
  projectId: "hogta-6d9e8",
  storageBucket: "hogta-6d9e8.firebasestorage.app",
  messagingSenderId: "790339383128",
  appId: "1:790339383128:web:52e2df5bc651b5ff25ff2d"
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

const btnCalc = document.getElementById("btn-calc");
const btnClear = document.getElementById("btn-clear");
const fineTotalElem = document.getElementById("fine-total");
const fineResult = document.getElementById("fine-result");

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
    currentUser.textContent = user.email.split("@")[0]; // HOPD-001 部分だけ表示
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    currentUser.textContent = "—";
  }
});

// 罰金計算
btnCalc.addEventListener("click", () => {
  const checks = document.querySelectorAll("#fine-items input[type=checkbox]");
  let total = 0;
  checks.forEach(cb => { if (cb.checked) total += parseInt(cb.dataset.amount); });
  fineTotalElem.textContent = `¥${total.toLocaleString()}`;
  fineResult.classList.remove("hidden");
});

btnClear.addEventListener("click", () => {
  document.querySelectorAll("#fine-items input[type=checkbox]").forEach(cb => cb.checked = false);
  fineResult.classList.add("hidden");
});
