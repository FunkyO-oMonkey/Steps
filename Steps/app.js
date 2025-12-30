let users = JSON.parse(localStorage.getItem('stepData')) || [];

function addUser() {
    const name = document.getElementById('new-user-name').value;
    if (!name) return;
    users.push({ name: name, steps: 0, badges: [] });
    saveAndRefresh();
}

function addSteps() {
    const userIndex = document.getElementById('user-select').value;
    const amount = parseInt(document.getElementById('step-amount').value);
    if (isNaN(amount)) return;

    users[userIndex].steps += amount;
    checkBadges(users[userIndex]);
    saveAndRefresh();
}

function checkBadges(user) {
    const goals = [
        { name: "5k Walker", goal: 5000 },
        { name: "10k Pro", goal: 10000 },
        { name: "Marathoner", goal: 40000 }
    ];
    goals.forEach(g => {
        if (user.steps >= g.goal && !user.badges.includes(g.name)) {
            user.badges.push(g.name);
            alert(`${user.name} unlocked ${g.name}!`);
        }
    });
}

function saveAndRefresh() {
    localStorage.setItem('stepData', JSON.stringify(users));
    render();
}

function render() {
    // Render Leaderboard
    const list = document.getElementById('leaderboard-list');
    const sorted = [...users].sort((a, b) => b.steps - a.steps);
    list.innerHTML = sorted.map((u, i) => `
        <div class="row">
            <span>#${i+1} <b>${u.name}</b></span>
            <span>${u.steps.toLocaleString()} steps</span>
        </div>
    `).join('');

    // Update Dropdown
    const select = document.getElementById('user-select');
    select.innerHTML = users.map((u, i) => `<option value="${i}">${u.name}</option>`).join('');
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

render(); // Initial load
