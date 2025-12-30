// Initialization
let users = JSON.parse(localStorage.getItem('stepData')) || [];

const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 },
    { name: "🏃 10K Club", goal: 10000 },
    { name: "🔥 Week Warrior", goal: 50000 },
    { name: "👑 Step Legend", goal: 100000 }
];

// --- USER MANAGEMENT ---

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a name");
    
    users.push({ 
        name: name, 
        steps: 0, 
        badges: [] 
    });
    
    nameInput.value = "";
    saveAndRefresh();
    if (navigator.vibrate) navigator.vibrate(50);
}

function deleteUser() {
    const userIndex = document.getElementById('user-select').value;
    
    if (userIndex === "" || userIndex === null) {
        alert("Please select a friend from the dropdown first!");
        return;
    }

    const userName = users[parseInt(userIndex)].name;
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
        users.splice(parseInt(userIndex), 1);
        saveAndRefresh();
        if (navigator.vibrate) navigator.vibrate(100);
    }
}

function resetAllData() {
    if (confirm("⚠️ DELETE EVERYTHING? This will remove all friends and all steps forever.")) {
        users = [];
        saveAndRefresh();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

// --- STEP UPDATES ---

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
    if (isNaN(amount) || amount <= 0) return alert("Please enter a valid number of steps");

    users[parseInt(userIndex)].steps += amount;
    checkBadges(users[parseInt(userIndex)]);
    amountInput.value = "";
    saveAndRefresh();
    if (navigator.vibrate) navigator.vibrate(60);
}

// --- LOGIC ---

function checkBadges(user) {
    let newBadgeEarned = false;
    GOALS.forEach(g => {
        if (user.steps >= g.goal && !user.badges.includes(g.name)) {
            user.badges.push(g.name);
            newBadgeEarned = true;
        }
    });

    if (newBadgeEarned) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#818cf8', '#2dd4bf', '#ffffff']
        });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function render() {
    // 1. Leaderboard
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    
    if (users.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5;">No friends added yet. Go to the "+" tab!</p>';
    } else {
        list.innerHTML = sorted.map((u, i) => {
            const nextGoal = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
            const percent = Math.min((u.steps / nextGoal.goal) * 100, 100);
            const level = Math.floor(u.steps / 5000) + 1;
            
            return `
                <div class="row">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span><b>#${i+1}</b> ${u.name} <small style="color:var(--accent); margin-left:5px;">Lvl ${level}</small></span>
                        <span style="font-weight:bold;">${u.steps.toLocaleString()}</span>
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

    // 3. Badges Update
    const badgeList = document.getElementById('badges-list');
    if (users.length === 0) {
        badgeList.innerHTML = '<p style="text-align:center; opacity:0.5;">Add friends to see achievements.</p>';
    } else {
        badgeList.innerHTML = users.map(u => `
            <div class="card" style="margin-bottom:15px;">
                <div style="margin-bottom:10px"><b>${u.name}</b> Achievements</div>
                <div class="badge-grid">
                    ${GOALS.map(g => `
                        <div class="badge-item ${u.badges.includes(g.name) ? 'unlocked' : ''}">
                            ${g.name.split(' ')[0]}
                        </div>
                    `).join('')}
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

// Initial Run
render();
