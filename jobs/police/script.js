// police/script.js
// Firebase Auth を使った簡易保護の雛形。
// 運用メモ：管理者は Firebase Console -> Authentication -> "ユーザーを追加" で
// メールに staffcode@hogta.local のように登録してパスワードを渡してください。
// フロントは「スタッフコード」を受け取り、内部的に staffcode@hogta.local として扱います。

// ====== ここに Firebase の設定を入れてください ======
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  // プロジェクトに応じて続きを追加
};
// =====================================================

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase config が未設定です。index.html の firebaseConfig を更新してください。");
}

// 初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const btnLogin = document.getElementById("btn-login");
const btnDemo = document.getElementById("btn-demo");
const btnLogout = document.getElementById("btn-logout");
const staffInput = document.getElementById("staff-code");
const passInput = document.getElementById("password");
const loginMsg = document.getElementById("login-msg");
const currentUser = document.getElementById("current-user");

const fineForm = document.getElementById("fine-form");
const btnCalc = document.getElementById("btn-calc");
const btnClear = document.getElementById("btn-clear");
const fineTotalElem = document.getElementById("fine-total");
const fineResult = document.getElementById("fine-result");

// Helpers
function showLoginMsg(msg) { loginMsg.textContent = msg; setTimeout(()=>{ loginMsg.textContent = ""; }, 6000); }
function staffToEmail(staff) {
  // スタッフコードをemailにマッピングするルール
  // 管理者が Firebase で登録する時も同じルールにすること
  // 例: POL1234 -> POL1234@hogta.local
  return `${staff}@hogta.local`;
}

// ログイン
btnLogin.addEventListener("click", async () => {
  const staff = (staffInput.value || "").trim();
  const pw = (passInput.value || "").trim();
  if (!staff || !pw) { showLoginMsg("スタッフコードとパスワードを入力してください。"); return; }

  // optional: basic client-side validation（桁数制限など）
  if (staff.length < 4) { showLoginMsg("スタッフコードが短すぎます。"); return; }

  const email = staffToEmail(staff);
  try {
    await auth.signInWithEmailAndPassword(email, pw);
    // onAuthStateChanged が呼ばれて画面が切り替わる
  } catch (e) {
    console.error(e);
    showLoginMsg("ログイン失敗：" + e.message);
  }
});

// デモボタン（開発用）: ログインせずに内容を見る（本番では削除推奨）
btnDemo.addEventListener("click", () => {
  alert("デモ表示：本番ではこのボタンを削除してください。");
  document.body.classList.add("demo");
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  currentUser.textContent = "DEMO";
});

// ログアウト
btnLogout.addEventListener("click", async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.error(e);
    showLoginMsg("ログアウトに失敗しました。");
  }
});

// Firebase の認証状態を監視
auth.onAuthStateChanged(user => {
  if (user) {
    // ログイン済み
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    currentUser.textContent = user.email || user.uid;
  } else {
    // 未ログイン
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    currentUser.textContent = "—";
  }
});

// ======= 罰金計算ロジック（チェックボックスの合算） =======
btnCalc.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll("#fine-items input[type=checkbox]");
  let total = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const amt = parseInt(cb.getAttribute("data-amount") || "0", 10);
      if (!isNaN(amt)) total += amt;
    }
  });
  fineTotalElem.textContent = `¥${total.toLocaleString()}`;
  fineResult.classList.remove("hidden");
});

btnClear.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll("#fine-items input[type=checkbox]");
  checkboxes.forEach(cb => cb.checked = false);
  fineResult.classList.add("hidden");
});

// Optional: キーボード Enter でログイン
[staffInput, passInput].forEach(inp => {
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") btnLogin.click();
  });
});