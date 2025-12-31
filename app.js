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

// --- CORE LOGIC ---

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    if (!nameInput.value.trim()) return;
    users.push({ 
        name: nameInput.value.trim(), 
        steps: 0, 
        badges: [], 
        streak: 0, 
        lastUpdate: null,
        pb: 0,       // Personal Best
        entries: []  // History
    });
    nameInput.value = "";
    saveAndRefresh();
}

function processStepEntry(user, amount) {
    const now = new Date();
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Update Personal Best
    if (amount > (user.pb || 0)) {
        user.pb = amount;
    }

    // Add to History (keep last 20 entries)
    user.entries.unshift({ amount, date: dateString });
    if (user.entries.length > 20) user.entries.pop();

    user.steps += amount;
    updateRecord(amount, user.name);
    updateStreak(user);
    checkBadges(user);
}

function quickAdd(amount) {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex === "") return alert("Select friend!");
    processStepEntry(users[parseInt(userIndex)], amount);
    saveAndRefresh();
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amount = parseInt(document.getElementById('step-amount').value);
    if (userIndex === "" || isNaN(amount)) return alert("Select friend!");
    processStepEntry(users[parseInt(userIndex)], amount);
    document.getElementById('step-amount').value = "";
    saveAndRefresh();
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
        const miniBadges = u.badges.map(b => b.split(' ')[0]).join('');

        return `
            <div class="row">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>#${i+1}</b> ${u.name} ${streakHtml}</span>
                    <div style="text-align:right;">
                        <span style="font-weight:900; display:block;">${u.steps.toLocaleString()}</span>
                        <span style="font-size:9px; opacity:0.6;">PB: ${u.pb ? u.pb.toLocaleString() : 0}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--accent); margin-top: 6px;">
                    <div style="display:flex; align-items:center;">
                        <span>Lvl ${Math.floor(u.steps/5000)+1}</span>
                        <div class="mini-badge-list">${miniBadges}</div>
                    </div>
                    <span>Goal: ${nextGoalObj.goal.toLocaleString()}</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width:${percent}%"></div></div>
            </div>`;
    }).join('');

    if(users.length > 0) html += `<button class="btn-secondary" style="width:100%; margin-top:10px;" onclick="shareLeaderboard()">📤 Share Rankings</button>`;
    list.innerHTML = html;

    // Achievements & History Tab
    document.getElementById('badges-list').innerHTML = sorted.map(u => `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div>
                    <b style="font-size:1.1rem;">${u.name}</b>
                    <span class="pb-badge">PB: ${u.pb ? u.pb.toLocaleString() : 0}</span>
                </div>
                <span style="font-size:0.7rem; color:var(--primary); font-weight:800;">${u.badges.length}/12</span>
            </div>
            
            <div class="badge-grid">
                ${GOALS.map(g => {
                    const unlocked = (u.badges || []).includes(g.name);
                    return `<div class="badge-item ${unlocked ? 'unlocked' : ''}">
                        <div class="badge-emoji">${g.name.split(' ')[0]}</div>
                        <div class="badge-info">${g.name.split(' ').slice(1).join(' ')}</div>
                    </div>`;
                }).join('')}
            </div>

            <div class="history-list">
                <span class="section-label">Activity History</span>
                ${u.entries && u.entries.length > 0 ? u.entries.map(e => `
                    <div class="history-item">
                        <span class="history-date">${e.date}</span>
                        <span class="history-amount">+${e.amount.toLocaleString()}</span>
                    </div>
                `).join('') : '<div style="font-size:11px; opacity:0.5;">No history yet...</div>'}
            </div>
        </div>`).join('');

    // Dropdown
    document.getElementById('user-select').innerHTML = '<option value="">-- Choose Friend --</option>' + 
        users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');
}

// (Keep all other functions like showSection, updateRecord, updateStreak, handleGesture from previous app.js)
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
    else { navigator.clipboard.writeText(text); alert("Copied!"); }
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(id);
    target.style.display = 'block';
    target.style.animation = 'none';
    target.offsetHeight; 
    target.style.animation = null; 
    btn.classList.add('active');
    currentSectionIndex = SECTIONS.indexOf(id);
}

// Swipe handling (Keep this exactly as before)
let touchstartX = 0;
let touchendX = 0;
function handleGesture() {
    if (touchendX < touchstartX - 70) switchTab(1);
    if (touchendX > touchstartX + 70) switchTab(-1);
}
function switchTab(direction) {
    let nextIndex = currentSectionIndex + direction;
    if (nextIndex >= 0 && nextIndex < SECTIONS.length) {
        if (navigator.vibrate) navigator.vibrate(15);
        showSection(SECTIONS[nextIndex], document.querySelectorAll('.nav-btn')[nextIndex]);
    }
}
document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX, {passive: true});
document.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleGesture(); }, {passive: true});

render();