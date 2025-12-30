let users = JSON.parse(localStorage.getItem('stepData')) || [];

// Define Badge Goals
const GOALS = [
    { name: "🚶 Early Bird", goal: 5000 },
    { name: "🏃 10K Club", goal: 10000 },
    { name: "🔥 Week Warrior", goal: 50000 },
    { name: "🏆 Step Legend", goal: 100000 }
];

function addUser() {
    const nameInput = document.getElementById('new-user-name');
    if (!nameInput.value) return;
    users.push({ name: nameInput.value, steps: 0, badges: [] });
    nameInput.value = "";
    saveAndRefresh();
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amount = parseInt(document.getElementById('step-amount').value);
    if (isNaN(amount) || userIndex === "") return;

    users[userIndex].steps += amount;
    
    // Check for new badges
    GOALS.forEach(g => {
        if (users[userIndex].steps >= g.goal && !users[userIndex].badges.includes(g.name)) {
            users[userIndex].badges.push(g.name);
        }
    });

    document.getElementById('step-amount').value = "";
    saveAndRefresh();
}

function render() {
    // 1. Render Leaderboard
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    list.innerHTML = sorted.map((u, i) => `
        <div class="row">
            <span><b>#${i+1}</b> ${u.name}</span>
            <span>${u.steps.toLocaleString()}</span>
        </div>
    `).join('');

    // 2. Update Dropdown
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">Select Friend</option>' + 
        users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');

    // 3. Render Badges for everyone
    const badgeList = document.getElementById('badges-list');
    badgeList.innerHTML = users.map(u => `
        <div style="margin-bottom: 20px;">
            <h3>${u.name}</h3>
            <div class="badge-grid">
                ${GOALS.map(g => `
                    <div class="badge-item ${u.badges.includes(g.name) ? 'unlocked' : ''}">
                        ${g.name}<br><small>${g.goal.toLocaleString()} steps</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Replace the internal part of your sorted.map in the render() function:
list.innerHTML = sorted.map((u, i) => {
    // Find the next goal the user hasn't reached yet
    const nextGoal = GOALS.find(g => u.steps < g.goal) || GOALS[GOALS.length - 1];
    const percent = Math.min((u.steps / nextGoal.goal) * 100, 100);

    return `
        <div class="row" style="flex-direction: column; align-items: flex-start;">
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <span><b>#${i+1}</b> ${u.name}</span>
                <span>${u.steps.toLocaleString()} steps</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
            <small class="next-goal-text">
                ${u.steps >= 100000 ? '👑 Max Level' : `Next Badge: ${nextGoal.name} (${nextGoal.goal.toLocaleString()})`}
            </small>
        </div>
    `;
}).join('');
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

render();
