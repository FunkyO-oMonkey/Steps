let users = JSON.parse(localStorage.getItem('stepData')) || [];
let globalRecord = JSON.parse(localStorage.getItem('globalRecord')) || { amount: 0, holder: "No one" };

const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 },
    { name: "🏃 10K Club", goal: 10000 },
    { name: "🥉 Bronze", goal: 25000 },
    { name: "🔥 Week Warrior", goal: 50000 },
    { name: "🥈 Silver", goal: 75000 },
    { name: "👑 Step Legend", goal: 100000 },
    { name: "🥇 Gold", goal: 150000 },
    { name: "💎 Diamond", goal: 200000 },
    { name: "🚀 Orbit", goal: 300000 },
    { name: "🌋 Volcano", goal: 400000 },
    { name: "🌌 Galaxy", goal: 500000 },
    { name: "🏆 Immortal", goal: 1000000 }
];

const SECTIONS = ['leaderboard', 'add-steps', 'badges'];
let currentSectionIndex = 0;

// --- SWIPE LOGIC ---
let touchstartX = 0;
let touchendX = 0;

function handleGesture() {
    if (touchendX < touchstartX - 70) switchTab(1); // Swipe Left -> Next Tab
    if (touchendX > touchstartX + 70) switchTab(-1); // Swipe Right -> Prev Tab
}

function switchTab(direction) {
    let nextIndex = currentSectionIndex + direction;
    if (nextIndex >= 0 && nextIndex < SECTIONS.length) {
        currentSectionIndex = nextIndex;
        const targetId = SECTIONS[currentSectionIndex];
        const targetBtn = document.querySelectorAll('.nav-btn')[currentSectionIndex];
        showSection(targetId, targetBtn);
    }
}

document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
});

// --- CORE LOGIC ---

function updateRecord(amount, name) {
    if (amount > globalRecord.amount) {
        globalRecord = { amount: amount, holder: name };
        localStorage.setItem('globalRecord', JSON.stringify(globalRecord));
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
}

function updateStreak(user) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (!user.lastUpdate) { user.streak = 1; } else {
        const lastDate = new Date(user.lastUpdate);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
        if (today === lastDay + oneDay) { user.streak = (user.streak || 0) + 1; } 
        else if (today > lastDay + oneDay) { user.streak = 1; }
    }
    user.lastUpdate = now.getTime();
}

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    if (!nameInput.value.trim()) return;
    users.push({ name: nameInput.value.trim(), steps: 0, badges: [], streak: 0, lastUpdate: null });
    nameInput.value = "";
    saveAndRefresh();
}

function quickAdd(amount) {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex === "") return alert("Select friend!");
    const user = users[parseInt(userIndex)];
    user.steps += amount;
    updateRecord(amount, user.name);
    updateStreak(user);
    checkBadges(user);
    saveAndRefresh();
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amount = parseInt(document.getElementById('step-amount').value);
    if (userIndex === "" || isNaN(amount)) return alert("Select friend and amount!");
    const user = users[parseInt(userIndex)];
    user.steps += amount;
    updateRecord(amount, user.name);
    updateStreak(user);
    checkBadges(user);
    document.getElementById('step-amount').value = "";
    saveAndRefresh();
}

function deleteUser() {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex !== "" && confirm("Delete friend?")) {
        users.splice(parseInt(userIndex), 1);
        saveAndRefresh();
    }
}

function resetAllData() {
    if (confirm("Reset everything?")) {
        users = [];
        globalRecord = { amount: 0, holder: "No one" };
        localStorage.clear();
        saveAndRefresh();
    }
}

function checkBadges(user) {
    let earned = false;
    GOALS.forEach(g => {
        if (user.steps >= g.goal && !user.badges.includes(g.name)) {
            user.badges.push(g.name);
            earned = true;
        }
    });
    if (earned) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function shareLeaderboard() {
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    let text = "🏆 STEPBUDDY RANKINGS\n\n";
    sorted.forEach((u, i) => text += `${i+1}. ${u.name}: ${u.steps.toLocaleString()} steps\n`);
    text += `\n⭐ Record: ${globalRecord.amount.toLocaleString()} by ${globalRecord.holder}`;
    if (navigator.share) { navigator.share({ title: 'StepBuddy', text: text }); } 
    else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

// --- RENDER LOGIC ---

function render() {
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    
    let html = `<div class="record-box">⭐ Record Update: ${globalRecord.amount.toLocaleString()} by ${globalRecord.holder}</div>`;
    
    html += sorted.map((u, i) => {
        const nextGoalObj = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
        const percent = Math.min((u.steps / nextGoalObj.goal) * 100, 100);
        const streakHtml = u.streak > 1 ? `<span class="streak-badge">🔥 ${u.streak}</span>` : '';
        const level = Math.floor(u.steps / 5000) + 1;

        // Extract emojis for the mini badge display
        const miniBadges = u.badges.map(b => b.split(' ')[0]).join('');

        return `
            <div class="row">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>#${i+1}</b> ${u.name} ${streakHtml}</span>
                    <span style="font-weight:900;">${u.steps.toLocaleString()}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--accent); margin-top: 6px;">
                    <div style="display:flex; align-items:center;">
                        <span>Level ${level}</span>
                        <div class="mini-badge-list">${miniBadges}</div>
                    </div>
                    <span style="opacity:0.8">Goal: ${nextGoalObj.goal.toLocaleString()}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width:${percent}%"></div>
                </div>
            </div>`;
    }).join('');

    if(users.length > 0) html += `<button class="btn-secondary" style="width:100%; margin-top:10px;" onclick="shareLeaderboard()">📤 Share Rankings</button>`;
    list.innerHTML = html;

    // Dropdown
    document.getElementById('user-select').innerHTML = '<option value="">-- Choose Friend --</option>' + 
        users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');

    // Achievements Tab - Sorted by steps (same as leaderboard)
    document.getElementById('badges-list').innerHTML = sorted.map(u => `
        <div class="card">
            <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                <b>${u.name}</b>
                <span style="font-size:0.7rem; color:var(--primary); font-weight:800;">${u.badges.length}/${GOALS.length}</span>
            </div>
            <div class="badge-grid">
                ${GOALS.map(g => {
                    const unlocked = u.badges.includes(g.name);
                    const parts = g.name.split(' ');
                    return `
                        <div class="badge-item ${unlocked ? 'unlocked' : ''}">
                            <div class="badge-emoji">${parts[0]}</div>
                            <div class="badge-info">${parts.slice(1).join(' ')}<br><span style="opacity:0.6;">${(g.goal>=1000000 ? '1M' : (g.goal/1000)+'k')}</span></div>
                        </div>`;
                }).join('')}
            </div>
        </div>`).join('');
}

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    btn.classList.add('active');
    currentSectionIndex = SECTIONS.indexOf(id);
}

render();
