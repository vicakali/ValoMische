alert('Script loaded!');

// Valorant API Base URL
const VALORANT_API = 'https://valorant-api.com/v1';

// Global State
let gameMode = null;
let selectedMap = null;
let selectedAgents = [];
let allAgents = [];
let allMaps = [];

const BANNED_MAPS = ["Skirmish A", "Skirmish B","Skirmish C","District","Kasbah", "Drift", "Glitch","Piazza","Basic Training","The Range"];

// Team Composition Presets
const compPresets = {
    balanced: { duelist: 1, initiator: 1, controller: 1, sentinel: 2 },
    aggressive: { duelist: 2, initiator: 1, controller: 1, sentinel: 1 },
    defensive: { duelist: 1, initiator: 1, controller: 1, sentinel: 2 },
    'utility-heavy': { duelist: 1, initiator: 2, controller: 1, sentinel: 1 }
};

// DOM Elements
const startScreen = document.getElementById('startScreen');
const manualScreen = document.getElementById('manualScreen');
const videoIntroOverlay = document.getElementById('videoIntroOverlay');
const soloBtn = document.getElementById('soloBtn');
const teamBtn = document.getElementById('teamBtn');
const mapsGrid = document.getElementById('mapsGrid');
const agentsGrid = document.getElementById('agentsGrid');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const generateManualBtn = document.getElementById('generateManualBtn');
const manualTeamDisplay = document.getElementById('manualTeamDisplay');
const manualTeamGrid = document.getElementById('manualTeamGrid');
const backToStartBtn2 = document.getElementById('backToStartBtn2');

// Modal Elements
const impressumModal = document.getElementById('impressum-modal');
const datenschutzModal = document.getElementById('datenschutz-modal');
const impressumLink = document.querySelector('.impressum-link');
const datenschutzLink = document.querySelector('.datenschutz-link');
const closeModals = document.querySelectorAll('.close-modal');

// Event Listeners
soloBtn.addEventListener('click', () => selectGameMode('solo'));
teamBtn.addEventListener('click', () => selectGameMode('team'));
selectAllBtn.addEventListener('click', selectAllAgents);
deselectAllBtn.addEventListener('click', deselectAllAgents);
generateManualBtn.addEventListener('click', generateTeamManual);
backToStartBtn2.addEventListener('click', () => goToScreen('start'));

// Video Skip
videoIntroOverlay.addEventListener('click', skipVideo);

// Modals
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

// Load data immediately
alert('Loading API data...');
loadValorantData();

// Functions
function skipVideo() {
    videoIntroOverlay.classList.add('hidden');
}

function selectGameMode(mode) {
    gameMode = mode;
    skipVideo();
    goToScreen('manual');
}

function goToScreen(screen) {
    startScreen.classList.remove('active');
    manualScreen.classList.remove('active');

    if (screen === 'start') {
        startScreen.classList.add('active');
    } else if (screen === 'manual') {
        manualScreen.classList.add('active');
    }
}

async function loadValorantData() {
    try {
        alert('Fetching agents...');
        const agentsResponse = await fetch(`${VALORANT_API}/agents`);
        const agentsData = await agentsResponse.json();
        allAgents = agentsData.data.filter(agent => !agent.isLocked && agent.fullPortrait);
        alert(`Agents loaded: ${allAgents.length}`);

        alert('Fetching maps...');
        const mapsResponse = await fetch(`${VALORANT_API}/maps`);
        const mapsData = await mapsResponse.json();
        alert(`All maps: ${mapsData.data.length}`);

        allMaps = mapsData.data.filter(map => map.displayName && map.splash && 
            !BANNED_MAPS.includes(map.displayName)
        );
        alert(`Filtered maps: ${allMaps.length}`);

    } catch (error) {
        alert('ERROR: ' + error.message);
    }
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
    document.querySelectorAll('.map-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
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
                <div class="agent-role">${agent.role.displayName.toLowerCase()}</div>
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

    const availableAgents = allAgents.filter(agent => selectedAgents.includes(agent.uuid));
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
        card.className = 'agent-card team-member';
        card.innerHTML = `
            <img src="${agent.fullPortrait}" alt="${agent.displayName}" class="agent-image">
            <div class="agent-info">
                <div class="agent-name">${agent.displayName}</div>
                <div class="agent-role">${agent.role.displayName.toLowerCase()}</div>
            </div>
        `;
        manualTeamGrid.appendChild(card);
    });

    manualTeamDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Override goToScreen for manual mode
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

function openModal(modal) {
    modal.classList.add('show');
}

function closeModal(modal) {
    modal.classList.remove('show');
}
