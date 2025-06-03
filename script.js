// Utility shortcut
function $(id) {
  return document.getElementById(id);
}

// App state
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '{}');
let gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
let dailyBonusClaimed = JSON.parse(localStorage.getItem('dailyBonus') || '{}');

// Switch between login and signup
function switchAuth(mode) {
  $('loginForm').classList.toggle('hidden', mode !== 'login');
  $('signupForm').classList.toggle('hidden', mode !== 'signup');
}

// Sign up
$('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const user = $('signupUser').value;
  const pass = $('signupPass').value;
  if (users[user]) return alert('Username already exists');
  users[user] = { password: pass, wallet: 100 };
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful!');
  switchAuth('login');
});

// Login
$('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const user = $('loginUser').value;
  const pass = $('loginPass').value;
  if (!users[user] || users[user].password !== pass) return alert('Invalid credentials');
  currentUser = user;
  $('authScreen').classList.add('hidden');
  $('gameScreen').classList.remove('hidden');
  updateWallet();
  updateHistory();
  updateLeaderboard();
});

// Logout
function logout() {
  currentUser = null;
  $('authScreen').classList.remove('hidden');
  $('gameScreen').classList.add('hidden');
}

// Game logic
function playGame() {
  const num = parseInt($('numberInput').value);
  const bet = parseInt($('betAmount').value);
  if (isNaN(num) || num < 0 || num > 9) return alert('Choose number between 0-9');
  if (isNaN(bet) || bet <= 0) return alert('Enter valid bet amount');
  if (users[currentUser].wallet < bet) return alert('Not enough funds');

  const winNumber = Math.floor(Math.random() * 10);
  let resultText = `Winning number: ${winNumber}. `;

  if (num === winNumber) {
    users[currentUser].wallet += bet * 10;
    resultText += "You Win!";
    $('winSound').play();
  } else {
    users[currentUser].wallet -= bet;
    resultText += "You Lose!";
    $('loseSound').play();
  }

  gameHistory.push({ user: currentUser, bet, number: num, winNumber });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

  updateWallet();
  updateHistory();
  updateLeaderboard();
  $('result').innerText = resultText;
}

// Wallet update
function updateWallet() {
  $('wallet').innerText = users[currentUser].wallet;
}

// Game history
function updateHistory() {
  const userHistory = gameHistory.filter(g => g.user === currentUser).slice(-10).reverse();
  $('history').innerHTML = "<h3>Game History</h3>" + userHistory.map(g => 
    `Number: ${g.number}, Winning: ${g.winNumber}, Bet: ${g.bet}`
  ).join('<br>');
}

// Leaderboard
function updateLeaderboard() {
  const leaderboard = Object.entries(users)
    .map(([user, data]) => ({ user, wallet: data.wallet }))
    .sort((a, b) => b.wallet - a.wallet)
    .slice(0, 10);

  $('leaderboardList').innerHTML = leaderboard.map(entry =>
    `<li>${entry.user}: $${entry.wallet}</li>`
  ).join('');
}

// Export history to CSV
function exportHistory() {
  const data = gameHistory.map(h => `${h.user},${h.number},${h.winNumber},${h.bet}`).join('\n');
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'game_history.csv';
  a.click();
}

// Toggle dark mode
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

// Claim daily bonus
function claimBonus() {
  const today = new Date().toISOString().split('T')[0];
  if (dailyBonusClaimed[currentUser] === today) {
    alert('Bonus already claimed today!');
    return;
  }
  users[currentUser].wallet += 50;
  dailyBonusClaimed[currentUser] = today;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('dailyBonus', JSON.stringify(dailyBonusClaimed));
  updateWallet();
  alert('You claimed your daily bonus! +$50');
}

// User list toggle
function toggleUserList() {
  const list = $('userList');
  list.classList.toggle('hidden');
  list.innerHTML = '<strong>Users:</strong><br>' + Object.keys(users).join('<br>');
}
