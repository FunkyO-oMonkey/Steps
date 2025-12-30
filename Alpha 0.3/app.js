// Data Persistence
let users = JSON.parse(localStorage.getItem('stepData')) || [];

const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 },
    { name: "🏃 10K Club", goal: 10000 },
    { name: "🔥 Week Warrior", goal: 50000 },
    { name: "👑 Step Legend", goal: 100000 }
];

// --- USER ACTIONS ---

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name");
    
    users.push({ name: name, steps: 0, badges: [] });
    nameInput.value = "";
    saveAndRefresh();
    if (navigator.vibrate) navigator.vibrate(50);
}

function quickAdd(amount) {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex === "") return alert("Please select a friend first!");
    
    users[parseInt(userIndex)].steps += amount;
    checkBadges(users[parseInt(userIndex)]);
    saveAndRefresh();
    if (navigator.vibrate) navigator.vibrate(40);
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amountInput = document.getElementById('step-amount');
    const amount = parseInt(amountInput.value);

    if (userIndex === "") return alert("Please select a friend first!");
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid number of steps");

    users[parseInt(userIndex)].steps += amount;
    checkBadges(users[parseInt(userIndex)]);
    amountInput.value = "";
    saveAndRefresh();
    if (navigator.vibrate) navigator.vibrate(60);
}

function deleteUser() {
    const userIndex = document.getElementById('user-select').value;
    if (userIndex === "") return alert("Select a friend to delete!");

    const userName = users[parseInt(userIndex)].name;
    if (confirm(`Delete ${userName}? This cannot be undone.`)) {
        users.splice(parseInt(userIndex), 1);
        saveAndRefresh();
        if (navigator.vibrate) navigator.vibrate(100);
    }
}

function resetAllData() {
    if (confirm("⚠️ RESET EVERYTHING? All friends and steps will be deleted.")) {
        users = [];
        saveAndRefresh();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

// --- APP LOGIC ---

function checkBadges(user) {
    let earned = false;
    GOALS.forEach(g => {
        if (user.steps >= g.goal && !user.badges.includes(g.name)) {
            user.badges.push(g.name);
            earned = true;
        }
    });

    if (earned) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function render() {
    // 1. Leaderboard Rendering
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    
    if (users.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:40px;">No friends yet.<br>Go to the "+" tab to add some!</p>';
    } else {
        list.innerHTML = sorted.map((u, i) => {
            const nextGoal = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
            const percent = Math.min((u.steps / nextGoal.goal) * 100, 100);
            const level = Math.floor(u.steps / 5000) + 1;
            
            return `
                <div class="row">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span><b>#${i+1}</b> ${u.name} <small style="color:var(--accent); margin-left:4px;">Lvl ${level}</small></span>
                        <span style="font-weight:900;">${u.steps.toLocaleString()}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width:${percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Dropdown Update
    const select = document.getElementById('user-select');
    let options = '<option value="">-- Choose Friend --</option>';
    users.forEach((u, i) => {
        options += `<option value="${i}">${u.name}</option>`;
    });
    select.innerHTML = options;

    // 3. Achievements Rendering (With Text)
    const badgeList = document.getElementById('badges-list');
    if (users.length === 0) {
        badgeList.innerHTML = '<p style="text-align:center; opacity:0.5;">Add friends to track badges.</p>';
    } else {
        badgeList.innerHTML = users.map(u => `
            <div class="card" style="margin-bottom:20px;">
                <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    <b style="font-size: 1.1rem;">${u.name}</b>
                    <span style="font-size: 0.7rem; font-weight:800; color: var(--primary);">${u.badges.length}/${GOALS.length} BADGES</span>
                </div>
                <div class="badge-grid">
                    ${GOALS.map(g => {
                        const isUnlocked = u.badges.includes(g.name);
                        const parts = g.name.split(' ');
                        const emoji = parts[0];
                        const label = parts.slice(1).join(' ');
                        
                        return `
                            <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
                                <div class="badge-emoji">${emoji}</div>
                                <div class="badge-info">${label}<br><span style="opacity:0.6; font-weight:normal;">${(g.goal/1000)}k</span></div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }
}

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    btn.classList.add('active');
    if (navigator.vibrate) navigator.vibrate(15);
}

// Initial Render
render();
