let users = JSON.parse(localStorage.getItem('stepData')) || [];
let globalRecord = JSON.parse(localStorage.getItem('globalRecord')) || { amount: 0, holder: "No one" };

const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 }, { name: "🏃 10K Club", goal: 10000 },
    { name: "🥉 Bronze", goal: 25000 }, { name: "🔥 Week Warrior", goal: 50000 },
    { name: "🥈 Silver", goal: 75000 }, { name: "👑 Step Legend", goal: 100000 },
    { name: "🥇 Gold", goal: 150000 }, { name: "💎 Diamond", goal: 200000 },
    { name: "🚀 Orbit", goal: 300000 }, { name: "🌋 Volcano", goal: 400000 },
    { name: "🌌 Galaxy", goal: 500000 }, { name: "🏆 Immortal", goal: 1000000 }
];

const SECTIONS = ['leaderboard', 'add-steps', 'badges'];
let currentSectionIndex = 0;

// --- GESTURE LOGIC ---
let touchstartX = 0; let touchendX = 0;
function handleGesture() {
    if (touchendX < touchstartX - 70) switchTab(1); // Swipe Left -> Next
    if (touchendX > touchstartX + 70) switchTab(-1); // Swipe Right -> Prev
}
function switchTab(direction) {
    let nextIndex = currentSectionIndex + direction;
    if (nextIndex >= 0 && nextIndex < SECTIONS.length) {
        if (navigator.vibrate) navigator.vibrate(15);
        const animClass = direction > 0 ? 'slide-from-right' : 'slide-from-left';
        showSection(SECTIONS[nextIndex], document.querySelectorAll('.nav-btn')[nextIndex], animClass);
    }
}
document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX, {passive: true});
document.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleGesture(); }, {passive: true});

// --- ACTIONS ---
function processStepEntry(user, amount) {
    const now = new Date();
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (amount > (user.pb || 0)) user.pb = amount;
    user.entries = user.entries || [];
    user.entries.unshift({ amount, date: dateString });
    if (user.entries.length > 20) user.entries.pop();
    user.steps += amount;
    updateRecord(amount, user.name);
    updateStreak(user);
    checkBadges(user);
    saveAndRefresh();
}
function quickAdd(amount) {
    const idx = document.getElementById('user-select').value;
    if (idx !== "") processStepEntry(users[parseInt(idx)], amount);
}
function addSteps() {
    const idx = document.getElementById('user-select').value;
    const amt = parseInt(document.getElementById('step-amount').value);
    if (idx !== "" && !isNaN(amt)) {
        processStepEntry(users[parseInt(idx)], amt);
        document.getElementById('step-amount').value = "";
    }
}
function updateRecord(amt, name) {
    if (amt > globalRecord.amount) {
        globalRecord = { amount: amt, holder: name };
        localStorage.setItem('globalRecord', JSON.stringify(globalRecord));
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}
function updateStreak(user) {
    const today = new Date().setHours(0,0,0,0);
    const oneDay = 86400000;
    if (!user.lastUpdate) user.streak = 1;
    else {
        const last = new Date(user.lastUpdate).setHours(0,0,0,0);
        if (today === last + oneDay) user.streak++;
        else if (today > last + oneDay) user.streak = 1;
    }
    user.lastUpdate = Date.now();
}
function checkBadges(user) {
    GOALS.forEach(g => { if (user.steps >= g.goal && !user.badges.includes(g.name)) user.badges.push(g.name); });
}

// --- UI & RENDER ---
function showSection(id, btn, animClass = 'slide-from-right') {
    document.querySelectorAll('section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('slide-from-right', 'slide-from-left');
    });
    const target = document.getElementById(id);
    target.style.display = 'block';
    target.classList.add(animClass);
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSectionIndex = SECTIONS.indexOf(id);
}

function shareLeaderboard() {
    const sorted = [...users].sort((a,b) => b.steps - a.steps);
    const total = users.reduce((s, u) => s + u.steps, 0);
    let txt = `🏆 STEPBUDDY RANKINGS\nTotal Group Steps: ${total.toLocaleString()}\n\n`;
    sorted.forEach((u, i) => txt += `${i+1}. ${u.name}: ${u.steps.toLocaleString()} (PB: ${u.pb || 0})\n`);
    if (navigator.share) navigator.share({ text: txt }); else { navigator.clipboard.writeText(txt); alert("Copied!"); }
}

function saveAndRefresh() { localStorage.setItem('stepData', JSON.stringify(users)); render(); }

function render() {
    const sorted = [...users].sort((a,b) => b.steps - a.steps);
    const total = users.reduce((s, u) => s + (u.steps || 0), 0);
    
    // Leaderboard
    document.getElementById('leaderboard-list').innerHTML = `
        <div class="group-total-card"><span style="font-size:10px;opacity:0.8">GROUP TOTAL</span><span class="group-total-val">${total.toLocaleString()}</span></div>
        <div class="record-box">⭐ Record: ${globalRecord.amount.toLocaleString()} by ${globalRecord.holder}</div>
        ${sorted.map((u, i) => {
            const next = GOALS.find(g => u.steps < g.goal) || GOALS[11];
            return `<div class="row">
                <div style="display:flex;justify-content:space-between">
                    <span>#${i+1} ${u.name} ${u.streak > 1 ? '🔥'+u.streak : ''}</span>
                    <div style="text-align:right"><b>${u.steps.toLocaleString()}</b><br><small style="opacity:0.6">PB: ${u.pb||0}</small></div>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width:${Math.min(u.steps/next.goal*100, 100)}%"></div></div>
            </div>`;
        }).join('')}
        ${users.length > 0 ? `<button class="btn-secondary" onclick="shareLeaderboard()">📤 Share Stats</button>` : ''}`;

    // Achievements
    document.getElementById('badges-list').innerHTML = sorted.map(u => `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <b>${u.name} <span class="pb-badge">PB: ${u.pb||0}</span></b>
                <small>${u.badges.length}/12</small>
            </div>
            <div class="badge-grid">${GOALS.map(g => `<div class="badge-item ${u.badges.includes(g.name)?'unlocked':''}"><span>${g.name.split(' ')[0]}</span><small style="font-size:8px">${g.name.split(' ')[1]}</small></div>`).join('')}</div>
            <div class="history-list">${(u.entries||[]).map(e => `<div class="history-item"><span>${e.date}</span><b>+${e.amount.toLocaleString()}</b></div>`).join('')}</div>
        </div>`).join('');

    document.getElementById('user-select').innerHTML = '<option value="">-- Friend --</option>' + users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');
}

// User Management
function addUser() {
    const input = document.getElementById('new-user-name');
    if (input.value.trim()) { users.push({name: input.value.trim(), steps: 0, badges: [], streak: 0, lastUpdate: null, pb: 0, entries: []}); input.value = ""; saveAndRefresh(); }
}
function deleteUser() { const idx = document.getElementById('user-select').value; if (idx !== "" && confirm("Delete?")) { users.splice(idx, 1); saveAndRefresh(); } }
function resetAllData() { if (confirm("Reset All?")) { users = []; globalRecord = {amount:0, holder:"No one"}; localStorage.clear(); saveAndRefresh(); } }

render();