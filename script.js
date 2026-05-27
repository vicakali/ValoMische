// Valorant API Base URL
const VALORANT_API = 'https://valorant-api.com/v1';

// Global State
let gameMode = null; // 'solo' or 'team'
let selectedMap = null;
let selectedAgents = [];
let allAgents = [];
let allMaps = [];

const BANNED_MAPS = ["Skirmish A", "Skirmish B","Skirmish C","District","Kasbah", "Drift", "Glitch","Piazza","Basic Training","The Range","The Range"];

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

// DOM Elements
const startScreen = document.getElementById('startScreen');
const quickScreen = document.getElementById('quickScreen');
const manualScreen = document.getElementById('manualScreen');
const videoIntroOverlay = document.getElementById('videoIntroOverlay');

const soloBtn = document.getElementById('soloBtn');
const teamBtn = document.getElementById('teamBtn');

const mapSelect = document.getElementById('mapSelect');
const compTypeSelect = document.getElementById('compTypeSelect');
const excludedAgentsInput = document.getElementById('excludedAgents');
const generateBtn = document.getElementById('generateBtn');
const selectedMapSpan = document.getElementById('selectedMap');
const teamGrid = document.getElementById('teamGrid');
const analysisContent = document.getElementById('analysisContent');

const mapsGrid = document.getElementById('mapsGrid');
const agentsGrid = document.getElementById('agentsGrid');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const generateManualBtn = document.getElementById('generateManualBtn');
const manualTeamDisplay = document.getElementById('manualTeamDisplay');
const manualTeamGrid = document.getElementById('manualTeamGrid');

const backToStartBtn = document.getElementById('backToStartBtn');
const backToStartBtn2 = document.getElementById('backToStartBtn2');
const goToManualBtn = document.getElementById('goToManualBtn');
const goToQuickBtn = document.getElementById('goToQuickBtn');

// Modal Elements
const impressumModal = document.getElementById('impressum-modal');
const datenschutzModal = document.getElementById('datenschutz-modal');
const impressumLink = document.querySelector('.impressum-link');
const datenschutzLink = document.querySelector('.datenschutz-link');
const closeModals = document.querySelectorAll('.close-modal');

// Event Listeners - Start Screen
soloBtn.addEventListener('click', () => selectGameMode('solo'));
teamBtn.addEventListener('click', () => selectGameMode('team'));

// Event Listeners - Quick Generate
generateBtn.addEventListener('click', generateTeamQuick);
mapSelect.addEventListener('change', updateMapDisplay);
backToStartBtn.addEventListener('click', () => goToScreen('start'));
goToManualBtn.addEventListener('click', () => goToScreen('manual'));

// Event Listeners - Manual Selection
selectAllBtn.addEventListener('click', selectAllAgents);
deselectAllBtn.addEventListener('click', deselectAllAgents);
generateManualBtn.addEventListener('click', generateTeamManual);
backToStartBtn2.addEventListener('click', () => goToScreen('start'));
goToQuickBtn.addEventListener('click', () => goToScreen('quick'));

// Event Listeners - Video Skip
videoIntroOverlay.addEventListener('click', skipVideo);

// Event Listeners - Modals
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

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadValorantData();
});

// Functions

function skipVideo() {
    videoIntroOverlay.classList.add('hidden');
}

function selectGameMode(mode) {
    gameMode = mode;
    skipVideo();
    goToScreen('manual');  // Go directly to manual selection instead of 'quick'

}

function goToScreen(screen) {
    startScreen.classList.remove('active');
    quickScreen.classList.remove('active');
    manualScreen.classList.remove('active');

    switch(screen) {
        case 'start':
            startScreen.classList.add('active');
            break;
        case 'quick':
            quickScreen.classList.add('active');
            break;
        case 'manual':
            manualScreen.classList.add('active');
            break;
    }
}

async function loadValorantData() {
    try {
        // Load Agents
        const agentsResponse = await fetch(`${VALORANT_API}/agents`);
        const agentsData = await agentsResponse.json();
        allAgents = agentsData.data.filter(agent => !agent.isLocked && agent.fullPortrait);

        // Load Maps
        const mapsResponse = await fetch(`${VALORANT_API}/maps`);
        const mapsData = await mapsResponse.json();
        allMaps = mapsData.data.filter(map => map.displayName && map.splash && 
            !BANNED_MAPS.includes(map.displayName)
        );

        // Populate map select in quick mode
        populateMapSelect();

        console.log('Valorant data loaded successfully');
    } catch (error) {
        console.error('Error loading Valorant data:', error);
    }
}

function populateMapSelect() {
    const mapOptions = mapSelect.querySelectorAll('option');
    mapOptions.forEach((option, index) => {
        if (index > 0) option.remove();
    });

    allMaps.forEach(map => {
        const option = document.createElement('option');
        option.value = map.uuid;
        option.textContent = map.displayName;
        mapSelect.appendChild(option);
    });
}

function updateMapDisplay() {
    const selectedMapId = mapSelect.value;
    if (selectedMapId === 'random') {
        selectedMapSpan.textContent = 'Random (will be selected on generation)';
    } else {
        const map = allMaps.find(m => m.uuid === selectedMapId);
        selectedMapSpan.textContent = map ? map.displayName : 'Unknown';
    }
}

function getExcludedAgents() {
    const input = excludedAgentsInput.value;
    return input
        .split(',')
        .map(agent => agent.trim().toLowerCase())
        .filter(agent => agent.length > 0);
}

function getAgentRole(agent) {
    if (!agent.role) return 'unknown';
    return agent.role.displayName.toLowerCase();
}

function generateTeamQuick() {
    let selectedMapId = mapSelect.value;
    const compType = compTypeSelect.value;
    
    let compConfig;
    if (compType === 'random') {
        const types = Object.keys(compPresets);
        compConfig = compPresets[types[Math.floor(Math.random() * types.length)]];
    } else {
        compConfig = compPresets[compType];
    }
    
    if (selectedMapId === 'random') {
        selectedMapId = allMaps[Math.floor(Math.random() * allMaps.length)].uuid;
    }

    const excluded = getExcludedAgents();
    const availableAgents = allAgents.filter(agent => 
        !excluded.includes(agent.displayName.toLowerCase())
    );

    const team = [];
    for (const [role, count] of Object.entries(compConfig)) {
        const roleAgents = availableAgents.filter(agent => 
            getAgentRole(agent) === role
        );

        for (let i = 0; i < count; i++) {
            if (roleAgents.length > 0) {
                const agent = roleAgents[Math.floor(Math.random() * roleAgents.length)];
                team.push(agent);
            }
        }
    }

    const mapData = allMaps.find(m => m.uuid === selectedMapId);
    displayTeamQuick(team, mapData);
}

function displayTeamQuick(team, mapData) {
    teamGrid.innerHTML = '';
    selectedMapSpan.textContent = mapData ? mapData.displayName : 'Unknown';

    team.forEach(agent => {
        const card = document.createElement('div');
        card.className = `agent-card team-member`;
        card.innerHTML = `
            <img src="${agent.fullPortrait}" alt="${agent.displayName}" class="agent-image">
            <div class="agent-info">
                <div class="agent-name">${agent.displayName}</div>
                <div class="agent-role">${getAgentRole(agent)}</div>
            </div>
        `;
        teamGrid.appendChild(card);
    });
}

function loadMapsManual() {
    mapsGrid.innerHTML = '';
    allMaps.forEach(map => {
        const card = document.createElement('div');
        card.className = 'map-card';
        card.innerHTML = `
            <img src="${map.splash}" alt="${map.displayName}" class="map-image">
            <div class="map-name">${map.displayName}</div>
        `;
        card.addEventListener('click', () => selectMapManual(map, card));
        mapsGrid.appendChild(card);
    });
}

function selectMapManual(map, cardElement) {
    // Deselect previous
    document.querySelectorAll('.map-card.selected').forEach(card => {
        card.classList.remove('selected');
    });

    // Select new
    selectedMap = map;
    cardElement.classList.add('selected');
}

function loadAgentsManual() {
    agentsGrid.innerHTML = '';
    allAgents.forEach(agent => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.setAttribute('data-agent-uuid', agent.uuid);
        card.innerHTML = `
            <img src="${agent.fullPortrait}" alt="${agent.displayName}" class="agent-image">
            <div class="agent-info">
                <div class="agent-name">${agent.displayName}</div>
                <div class="agent-role">${getAgentRole(agent)}</div>
            </div>
        `;
        card.addEventListener('click', () => toggleAgentSelection(agent.uuid, card));
        agentsGrid.appendChild(card);
    });
}

function toggleAgentSelection(agentUuid, cardElement) {
    if (selectedAgents.includes(agentUuid)) {
        selectedAgents = selectedAgents.filter(uuid => uuid !== agentUuid);
        cardElement.classList.remove('selected');
    } else {
        selectedAgents.push(agentUuid);
        cardElement.classList.add('selected');
    }
}

function selectAllAgents() {
    selectedAgents = allAgents.map(agent => agent.uuid);
    document.querySelectorAll('.agents-grid .agent-card').forEach(card => {
        card.classList.add('selected');
    });
}

function deselectAllAgents() {
    selectedAgents = [];
    document.querySelectorAll('.agents-grid .agent-card').forEach(card => {
        card.classList.remove('selected');
    });
}

function generateTeamManual() {
    if (!selectedMap) {
        alert('Please select a map!');
        return;
    }

    if (selectedAgents.length === 0) {
        alert('Please select at least one agent!');
        return;
    }

    const availableAgents = allAgents.filter(agent => 
        selectedAgents.includes(agent.uuid)
    );

    const team = [];
    const teamSize = gameMode === 'solo' ? 1 : 5;

    for (let i = 0; i < teamSize && availableAgents.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableAgents.length);
        team.push(availableAgents[randomIndex]);
    }

    displayTeamManual(team);
}

function displayTeamManual(team) {
    manualTeamDisplay.style.display = 'block';
    manualTeamGrid.innerHTML = '';

    team.forEach(agent => {
        const card = document.createElement('div');
        card.className = `agent-card team-member`;
        card.innerHTML = `
            <img src="${agent.fullPortrait}" alt="${agent.displayName}" class="agent-image">
            <div class="agent-info">
                <div class="agent-name">${agent.displayName}</div>
                <div class="agent-role">${getAgentRole(agent)}</div>
            </div>
        `;
        manualTeamGrid.appendChild(card);
    });

    // Scroll to result
    manualTeamDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Override screen navigation for manual mode
const originalGoToScreen = goToScreen;
goToScreen = function(screen) {
    if (screen === 'manual') {
        loadMapsManual();
        loadAgentsManual();
        selectedAgents = [];
        selectedMap = null;
        manualTeamDisplay.style.display = 'none';
    }
    originalGoToScreen.call(this, screen);
};

// Modal Functions
function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}
