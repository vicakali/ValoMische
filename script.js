// Valorant Agents Database
const agents = {
    duelist: [
        { name: 'Jett', abilities: 'Dashes, knives, updraft' },
        { name: 'Phoenix', abilities: 'Curve flare, molly, ultimate run' },
        { name: 'Reyna', abilities: 'Dismiss, devour, empress' },
        { name: 'Raze', abilities: 'Boom bot, blast pack, paint shells' },
        { name: 'Yoru', abilities: 'Fakeout, gatecrash, dimensional drift' },
        { name: 'Neon', abilities: 'Fast lane, relay bolt, overdrive' },
    ],
    initiator: [
        { name: 'Sova', abilities: 'Owl drone, recon bolt, ultimate' },
        { name: 'Breach', abilities: 'Flashpoint, fault line, rolling thunder' },
        { name: 'Skye', abilities: 'Regrowth, trailblazer, guiding light' },
        { name: 'Kay/o', abilities: 'Frag/ment, flashdrive, null/cmd' },
        { name: 'Fade', abilities: 'Prowler, seize, haunt' },
        { name: 'Gekko', abilities: 'Mosh pit, ping, thrash' },
    ],
    controller: [
        { name: 'Brimstone', abilities: 'Stim beacon, smoke, orbital strike' },
        { name: 'Omen', abilities: 'Shadow walk, paranoia, from the shadows' },
        { name: 'Astra', abilities: 'Stars, gravity well, nova pulse' },
        { name: 'Viper', abilities: 'Poison cloud, toxic screen, pit' },
        { name: 'Harbor', abilities: 'High tide, cascade, reckoning' },
    ],
    sentinel: [
        { name: 'Sage', abilities: 'Barrier orb, slow orb, resurrection' },
        { name: 'Cypher', abilities: 'Trapwire, cyber cage, neural theft' },
        { name: 'Killjoy', abilities: 'Turret, alarm bot, lockdown' },
        { name: 'Chamber', abilities: 'Trademark, rendezvous, tour de force' },
        { name: 'Tejo', abilities: 'Discharge, aftershock, flashpoint' },
    ]
};

const maps = {
    haven: { name: 'Haven', sites: '3' },
    split: { name: 'Split', sites: '2' },
    ascent: { name: 'Ascent', sites: '2' },
    lotus: { name: 'Lotus', sites: '2' },
    pearl: { name: 'Pearl', sites: '2' },
    icebox: { name: 'Icebox', sites: '2' },
    breeze: { name: 'Breeze', sites: '2' },
    sunset: { name: 'Sunset', sites: '2' },
    fracture: { name: 'Fracture', sites: '2' },
};

// Team Composition Presets
const compPresets = {
    balanced: {
        duelist: 1,
        initiator: 1,
        controller: 1,
        sentinel: 2
    },
    aggressive: {
        duelist: 2,
        initiator: 1,
        controller: 1,
        sentinel: 1
    },
    defensive: {
        duelist: 1,
        initiator: 1,
        controller: 1,
        sentinel: 2
    },
    'utility-heavy': {
        duelist: 1,
        initiator: 2,
        controller: 1,
        sentinel: 1
    }
};

// Get DOM Elements
const mapSelect = document.getElementById('mapSelect');
const compTypeSelect = document.getElementById('compTypeSelect');
const excludedAgentsInput = document.getElementById('excludedAgents');
const generateBtn = document.getElementById('generateBtn');
const selectedMapSpan = document.getElementById('selectedMap');
const teamGrid = document.getElementById('teamGrid');
const analysisContent = document.getElementById('analysisContent');
const videoIntroOverlay = document.getElementById('videoIntroOverlay');

// Modal Elements
const impressumModal = document.getElementById('impressum-modal');
const datenschutzModal = document.getElementById('datenschutz-modal');
const impressumLink = document.querySelector('.impressum-link');
const datenschutzLink = document.querySelector('.datenschutz-link');
const closeModals = document.querySelectorAll('.close-modal');

// Event Listeners
generateBtn.addEventListener('click', generateTeam);
mapSelect.addEventListener('change', updateMapDisplay);
compTypeSelect.addEventListener('change', () => {});

// Video Intro Skip
videoIntroOverlay.addEventListener('click', skipVideo);

// Modal Event Listeners
impressumLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(impressumModal);
});

datenschutzLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(datenschutzModal);
});

closeModals.forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        closeModal(e.target.closest('.modal'));
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Modal Functions
function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}

// Skip Video Function
function skipVideo() {
    videoIntroOverlay.classList.add('hidden');
}

// Update Map Display
function updateMapDisplay() {
    const selectedMap = mapSelect.value;
    if (selectedMap === 'random') {
        selectedMapSpan.textContent = 'Random (will be selected on generation)';
    } else {
        const mapName = maps[selectedMap]?.name || 'Unknown';
        selectedMapSpan.textContent = mapName;
    }
}

// Get Excluded Agents
function getExcludedAgents() {
    const input = excludedAgentsInput.value;
    return input
        .split(',')
        .map(agent => agent.trim().toLowerCase())
        .filter(agent => agent.length > 0);
}

// Filter Available Agents
function getAvailableAgents(role) {
    const excluded = getExcludedAgents();
    return agents[role].filter(agent => !excluded.includes(agent.name.toLowerCase()));
}

// Generate Random Team
function generateTeam() {
    // Get selected options
    let selectedMap = mapSelect.value;
    const compType = compTypeSelect.value;
    
    // Determine comp type
    let compConfig;
    if (compType === 'random') {
        const types = Object.keys(compPresets);
        compConfig = compPresets[types[Math.floor(Math.random() * types.length)]];
    } else {
        compConfig = compPresets[compType];
    }
    
    // Select random map if needed
    if (selectedMap === 'random') {
        const mapKeys = Object.keys(maps).filter(key => key !== 'random');
        selectedMap = mapKeys[Math.floor(Math.random() * mapKeys.length)];
    }
    
    // Generate team
    const team = [];
    for (const [role, count] of Object.entries(compConfig)) {
        const available = getAvailableAgents(role);
        
        if (available.length === 0) {
            // If all agents of this role are excluded, find any available
            const anyAvailable = Object.values(agents).flat();
            const filtered = anyAvailable.filter(agent => 
                !getExcludedAgents().includes(agent.name.toLowerCase())
            );
            if (filtered.length > 0) {
                for (let i = 0; i < count; i++) {
                    const agent = filtered[Math.floor(Math.random() * filtered.length)];
                    team.push({ ...agent, role });
                }
            }
        } else {
            // Select random agents from available
            for (let i = 0; i < count; i++) {
                const agent = available[Math.floor(Math.random() * available.length)];
                team.push({ ...agent, role });
            }
        }
    }
    
    // Display results
    displayTeam(team, selectedMap);
    displayAnalysis(team, selectedMap);
}

// Display Team
function displayTeam(team, selectedMap) {
    teamGrid.innerHTML = '';
    selectedMapSpan.textContent = maps[selectedMap]?.name || selectedMap;
    
    // Sort by role for better visual organization
    const sortedTeam = team.sort((a, b) => {
        const roleOrder = { duelist: 0, initiator: 1, controller: 2, sentinel: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
    });
    
    sortedTeam.forEach(agent => {
        const card = document.createElement('div');
        card.className = `agent-card ${agent.role}`;
        card.innerHTML = `
            <div class="agent-role">${agent.role}</div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-abilities">${agent.abilities}</div>
        `;
        teamGrid.appendChild(card);
    });
}

// Display Analysis
function displayAnalysis(team, selectedMap) {
    analysisContent.innerHTML = '';
    
    // Count roles
    const roleCounts = {};
    team.forEach(agent => {
        roleCounts[agent.role] = (roleCounts[agent.role] || 0) + 1;
    });
    
    // Team Composition Analysis
    const compAnalysis = document.createElement('div');
    compAnalysis.className = 'analysis-item';
    compAnalysis.innerHTML = `
        <h3>Team Composition</h3>
        <p>
            ${Object.entries(roleCounts).map(([role, count]) => 
                `${count}x ${role.charAt(0).toUpperCase() + role.slice(1)}`
            ).join('<br>')}
        </p>
    `;
    analysisContent.appendChild(compAnalysis);
    
    // Map Strategy
    const mapStrategy = document.createElement('div');
    mapStrategy.className = 'analysis-item';
    mapStrategy.innerHTML = `
        <h3>Map Strategy</h3>
        <p>${maps[selectedMap]?.name || selectedMap} has ${maps[selectedMap]?.sites || '2'} bomb sites. This composition should adapt well to various site executes.</p>
    `;
    analysisContent.appendChild(mapStrategy);
    
    // Strengths
    const strengths = document.createElement('div');
    strengths.className = 'analysis-item';
    strengths.innerHTML = `
        <h3>Team Strengths</h3>
        <p>
            ${roleCounts.duelist ? '✓ Strong entry presence with Duelists<br>' : ''}
            ${roleCounts.initiator ? '✓ Good information gathering with Initiators<br>' : ''}
            ${roleCounts.controller ? '✓ Map control with Controllers<br>' : ''}
            ${roleCounts.sentinel ? '✓ Defensive utility with Sentinels' : ''}
        </p>
    `;
    analysisContent.appendChild(strengths);
    
    // Playstyle
    const playstyle = document.createElement('div');
    playstyle.className = 'analysis-item';
    playstyle.innerHTML = `
        <h3>Recommended Playstyle</h3>
        <p>
            ${roleCounts.duelist >= 2 ? 'Aggressive early rounds with dual entry duelists.' : ''}
            ${roleCounts.controller >= 2 ? 'Control map space with utility and information.' : ''}
            ${roleCounts.sentinel >= 2 ? 'Play defensively and punish aggressive plays.' : ''}
            Focus on coordinated plays and agent synergy.
        </p>
    `;
    analysisContent.appendChild(playstyle);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateMapDisplay();
    
    // Show empty state
    teamGrid.innerHTML = '<div class="empty-state"><p>Click "Generate Team" to create a random team composition!</p></div>';
    analysisContent.innerHTML = '<div class="empty-state"><p>Generate a team to see analysis</p></div>';
});
