let users = JSON.parse(localStorage.getItem('stepData')) || [];

const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 },
    { name: "🏃 10K Club", goal: 10000 },
    { name: "🔥 Week Warrior", goal: 50000 },
    { name: "👑 Step Legend", goal: 100000 }
];

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    if (!nameInput.value) return;
    users.push({ name: nameInput.value, steps: 0, badges: [] });
    nameInput.value = "";
    saveAndRefresh();
    alert("Friend added!");
}

function quickAdd(amount) {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex === "") return alert("Please select a friend first!");
    
    if (navigator.vibrate) navigator.vibrate(40);
    users[userIndex].steps += amount;
    checkBadges(users[userIndex]);
    saveAndRefresh();
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amount = parseInt(document.getElementById('step-amount').value);
    if (isNaN(amount) || userIndex === "") return alert("Enter steps and select a friend!");

    users[userIndex].steps += amount;
    checkBadges(users[userIndex]);
    document.getElementById('step-amount').value = "";
    saveAndRefresh();
}

function checkBadges(user) {
    GOALS.forEach(g => {
        if (user.steps >= g.goal && !user.badges.includes(g.name)) {
            user.badges.push(g.name);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    });
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function render() {
    // 1. Leaderboard
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    list.innerHTML = sorted.map((u, i) => {
        const nextGoal = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
        const percent = Math.min((u.steps / nextGoal.goal) * 100, 100);
        return `
            <div class="row">
                <div style="display:flex; justify-content:space-between">
                    <span><b>#${i+1}</b> ${u.name}</span>
                    <span>${u.steps.toLocaleString()}</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width:${percent}%"></div></div>
            </div>
        `;
    }).join('');

    // 2. Dropdown
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">-- Choose Friend --</option>' + 
        users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');

    // 3. Badges
    const badgeList = document.getElementById('badges-list');
    badgeList.innerHTML = users.map(u => `
        <div class="card" style="margin-bottom:15px;">
            <div style="margin-bottom:10px"><b>${u.name}</b></div>
            <div class="badge-grid">
                ${GOALS.map(g => `<div class="badge-item ${u.badges.includes(g.name) ? 'unlocked' : ''}">${g.name.split(' ')[0]}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    btn.classList.add('active');
}

// Initial Run
render();