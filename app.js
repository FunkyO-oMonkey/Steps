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

// --- ACTIONS ---

function processStepEntry(user, amount) {
    const now = new Date();
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    if (amount > (user.pb || 0)) {
        user.pb = amount;
    }

    user.entries = user.entries || [];
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

// --- SHARE LOGIC ---

function shareLeaderboard() {
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    const totalSteps = users.reduce((sum, u) => sum + u.steps, 0);

    let text = "🏆 STEPBUDDY PRO RANKINGS\n";
    text += "------------------------\n";
    sorted.forEach((u, i) => {
        text += `${i+1}. ${u.name}: ${u.steps.toLocaleString()} (PB: ${u.pb ? u.pb.toLocaleString() : 0})\n`;
    });
    text += "------------------------\n";
    text += `👥 GROUP TOTAL: ${totalSteps.toLocaleString()} steps\n`;
    text += `⭐ RECORD: ${globalRecord.amount.toLocaleString()} by ${globalRecord.holder}`;

    if (navigator.share) {
        navigator.share({ title: 'StepBuddy Rankings', text: text });
    } else {
        navigator.clipboard.writeText(text);
        alert("Rankings and Group Total copied to clipboard!");
    }
}

// --- RENDERING ---

function render() {
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    
    // Calculate Group Total
    const totalSteps = users.reduce((sum, u) => sum + (u.steps || 0), 0);

    let html = `
        <div class="group-total-card">
            <span style="font-size: 11px; text-transform: uppercase; color: var(--accent);">Combined Effort</span>
            <span class="group-total-val">${totalSteps.toLocaleString()}</span>
            <span style="font-size: 10px; opacity: 0.8;">Total Steps</span>
        </div>
        <div class="record-box">⭐ Record Personal Best: <b>${globalRecord.amount.toLocaleString()}<b> by ${globalRecord.holder} ⭐</div>
    `;
    
    html += sorted.map((u, i) => {
        const nextGoalObj = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
        const percent = Math.min((u.steps / nextGoalObj.goal) * 100, 100);
        const level = Math.floor(u.steps / 5000) + 1;
        const miniBadges = (u.badges || []).map(b => b.split(' ')[0]).join('');

        return `
            <div class="row">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>#${i+1}</b> ${u.name} ${u.streak > 1 ? '🔥'+u.streak : ''}</span>
                    <div style="text-align:right;">
                        <span style="font-weight:900; display:block;">${u.steps.toLocaleString()}</span>
                        <span style="font-size:9px; opacity:0.6;">PB: ${u.pb ? u.pb.toLocaleString() : 0}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--accent); margin-top: 6px;">
                    <div style="display:flex; align-items:center;">
                        <span>Lvl ${level}</span>
                        <div class="mini-badge-list">${miniBadges}</div>
                    </div>
                    <span>Goal: ${nextGoalObj.goal.toLocaleString()}</span>
                </div>
                <div class="progress-container"><div class="progress-bar" style="width:${percent}%"></div></div>
            </div>`;
    }).join('');

    if(users.length > 0) html += `<button class="btn-secondary" style="width:100%; margin-top:10px;" onclick="shareLeaderboard()">📤 Share Stats & Rankings</button>`;
    list.innerHTML = html;

    // Dropdown update
    document.getElementById('user-select').innerHTML = '<option value="">-- Choose Friend --</option>' + 
        users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');

    // Achievements Update (sorted by steps)
    document.getElementById('badges-list').innerHTML = sorted.map(u => `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <div>
                    <b style="font-size:1.1rem;">${u.name}</b>
                    <span class="pb-badge">PB: ${u.pb ? u.pb.toLocaleString() : 0}</span>
                </div>
                <span style="font-size:0.7rem; color:var(--primary); font-weight:800;">${(u.badges || []).length}/12</span>
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
                    </div>`).join('') : '<div style="font-size:11px; opacity:0.5;">No history yet...</div>'}
            </div>
        </div>`).join('');
}

// Helper functions
function updateRecord(amount, name) {
    if (amount > globalRecord.amount) {
        globalRecord = { amount, holder: name };
        localStorage.setItem('globalRecord', JSON.stringify(globalRecord));
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
}

function updateStreak(user) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (!user.lastUpdate) { user.streak = 1; } else {
        const lastDay = new Date(new Date(user.lastUpdate).getFullYear(), new Date(user.lastUpdate).getMonth(), new Date(user.lastUpdate).getDate()).getTime();
        if (today === lastDay + oneDay) { user.streak = (user.streak || 0) + 1; } 
        else if (today > lastDay + oneDay) { user.streak = 1; }
    }
    user.lastUpdate = now.getTime();
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function switchTab(direction) {
    let nextIndex = currentSectionIndex + direction;
    if (nextIndex >= 0 && nextIndex < SECTIONS.length) {
        if (navigator.vibrate) navigator.vibrate(15);
        
        // Determine animation direction
        const animClass = direction > 0 ? 'slide-from-right' : 'slide-from-left';
        
        const targetId = SECTIONS[nextIndex];
        const targetBtn = document.querySelectorAll('.nav-btn')[nextIndex];
        
        showSection(targetId, targetBtn, animClass);
    }
}

function showSection(id, btn, animClass = 'slide-from-right') {
    document.querySelectorAll('section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('slide-from-right', 'slide-from-left');
    });

    const target = document.getElementById(id);
    target.style.display = 'block';
    
    // Apply the specific direction class
    target.classList.add(animClass);

    // Nav Buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentSectionIndex = SECTIONS.indexOf(id);
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

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    if (!nameInput.value.trim()) return;
    users.push({ name: nameInput.value.trim(), steps: 0, badges: [], streak: 0, lastUpdate: null, pb: 0, entries: [] });
    nameInput.value = "";
    saveAndRefresh();
}

function deleteUser() {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex !== "" && confirm("Delete friend?")) { users.splice(parseInt(userIndex), 1); saveAndRefresh(); }
}

function resetAllData() {
    if (confirm("Reset everything?")) { users = []; globalRecord = { amount: 0, holder: "No one" }; localStorage.clear(); saveAndRefresh(); }
}

// Swipe detection logic
let touchstartX = 0; let touchendX = 0;
function handleGesture() {
    if (touchendX < touchstartX - 70) {
        switchTab(1); // Swiping Left moves to next tab (content comes from right)
    }
    if (touchendX > touchstartX + 70) {
        switchTab(-1); // Swiping Right moves to prev tab (content comes from left)
    }
}
document.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX, {passive: true});
document.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleGesture(); }, {passive: true});

render();
