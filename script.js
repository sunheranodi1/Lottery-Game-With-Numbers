let user = null;
let users = JSON.parse(localStorage.getItem("users")) || {};
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let wallet = 100;
let history = [];
let lastBonusDate = null;

function switchAuth(mode) {
  document.getElementById("loginForm").classList.toggle("hidden", mode !== "login");
  document.getElementById("signupForm").classList.toggle("hidden", mode !== "signup");
}

document.getElementById("signupForm").onsubmit = function (e) {
  e.preventDefault();
  const userVal = signupUser.value;
  const passVal = signupPass.value;
  if (users[userVal]) return alert("User exists!");
  users[userVal] = { password: passVal, balance: 100 };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signed up! Please login.");
  switchAuth("login");
};

document.getElementById("loginForm").onsubmit = function (e) {
  e.preventDefault();
  const userVal = loginUser.value;
  const passVal = loginPass.value;
  if (!users[userVal] || users[userVal].password !== passVal) return alert("Invalid credentials!");
  user = userVal;
  wallet = users[user].balance || 100;
  history = [];
  updateWallet();
  updateLeaderboard();
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
};

function logout() {
  if (user) {
    users[user].balance = wallet;
    localStorage.setItem("users", JSON.stringify(users));
  }
  user = null;
  document.getElementById("gameScreen").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
}

function updateWallet() {
  document.getElementById("wallet").textContent = wallet;
}

function playGame() {
  const guess = parseInt(document.getElementById("numberInput").value);
  const bet = parseInt(document.getElementById("betAmount").value);
  const resultDiv = document.getElementById("result");

  if (isNaN(guess) || guess < 0 || guess > 9 || isNaN(bet) || bet <= 0) {
    alert("Invalid input!");
    return;
  }
  if (wallet < bet) {
    alert("Not enough funds!");
    return;
  }

  const number = Math.floor(Math.random() * 10);
  let result;
  let win = 0;

  if (guess === number) {
    win = bet * 9;
    wallet += win;
    result = 🎉 You won! Winning number: ${number}. +$${win};
    document.getElementById("winSound").play();
  } else {
    wallet -= bet;
    result = ❌ You lost. Winning number: ${number}. -$${bet};
    document.getElementById("loseSound").play();
  }

  updateWallet();
  resultDiv.textContent = result;
  addToHistory(result);
  updateLeaderboard();
}

function addToHistory(msg) {
  const historyDiv = document.getElementById("history");
  const entry = document.createElement("div");
  const time = new Date().toLocaleTimeString();
  entry.textContent = ${time} - ${msg};
  history.unshift(entry.textContent);
  historyDiv.prepend(entry);
}

function updateLeaderboard() {
  if (!user) return;
  leaderboard = leaderboard.filter(entry => entry.username !== user);
  leaderboard.push({ username: user, balance: wallet });
  leaderboard.sort((a, b) => b.balance - a.balance);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = ${index + 1}. ${entry.username} - $${entry.balance};
    list.appendChild(li);
  });
}

function exportHistory() {
  const content = history.join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ${user}_history.txt;
  a.click();
}

function claimBonus() {
  const today = new Date().toLocaleDateString();
  if (lastBonusDate === today) {
    alert("Bonus already claimed today!");
    return;
  }
  wallet += 20;
  lastBonusDate = today;
  updateWallet();
  alert("Daily bonus of $20 claimed!");
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function toggleUserList() {
  const listDiv = document.getElementById("userList");
  listDiv.classList.toggle("hidden");
  updateUserList();
}

function updateUserList() {
  const listDiv = document.getElementById("userList");
  const usersData = JSON.parse(localStorage.getItem("users")) || {};
  let html = "";
  for (const [uname, data] of Object.entries(usersData)) {
    html += <div>👤 <strong>${uname}</strong>: ${data.password}</div>;
  }
  listDiv.innerHTML = html;
}