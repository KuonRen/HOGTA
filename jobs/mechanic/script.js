// Firebase 設定（他ジョブと同じプロジェクトでOK）
const firebaseConfig = {
  apiKey: "AIzaSyCURTYxFHj4tM_NgbNZltmTcwW3hCME3Uo",
  authDomain: "hogta-mechanic.firebaseapp.com",
  projectId: "hogta-mechanic",
  storageBucket: "hogta-mechanic.firebasestorage.app",
  messagingSenderId: "838133214812",
  appId: "1:838133214812:web:dea88460127cd104c58099"
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
const feeTotalElem = document.getElementById("fee-total");
const feeResult = document.getElementById("fee-result");

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
    currentUser.textContent = user.email.split("@")[0]; // MEC001 部分だけ表示
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    currentUser.textContent = "—";
  }
});

// 料金計算
btnCalc.addEventListener("click", () => {
  const checks = document.querySelectorAll("#fee-items input[type=checkbox]");
  let total = 0;
  checks.forEach(cb => { if (cb.checked) total += parseInt(cb.dataset.amount); });
  feeTotalElem.textContent = `¥${total.toLocaleString()}`;
  feeResult.classList.remove("hidden");
});

btnClear.addEventListener("click", () => {
  document.querySelectorAll("#fee-items input[type=checkbox]").forEach(cb => cb.checked = false);
  feeResult.classList.add("hidden");
});

