document.addEventListener('DOMContentLoaded', function () {
    loadConfigs();
    document.getElementById('newConfig').addEventListener('click', createNewConfig);
});

function loadConfigs() {
    chrome.storage.sync.get('configs', function (data) {
        const configs = data.configs || [];
        const configList = document.getElementById('configList');
        configList.innerHTML = '';
        configs.forEach((config, index) => {
            const configElement = createConfigElement(config, index);
            configList.appendChild(configElement);
        });
    });
}

function createConfigElement(config, index) {
    const div = document.createElement('div');
    div.className = 'config';
    div.innerHTML = `
        <div class="config-header">
            <input type="checkbox" class="config-enabled" ${config.enabled ? 'checked' : ''}>
            <span class="config-name">${config.url || 'New Config'}</span>
            <button class="toggle-button">▼</button>
        </div>
        <div class="config-details" style="display: none;">
            <input type="text" class="config-url" value="${config.url || ''}" placeholder="Target URL">
            <input type="text" class="config-server-url" value="${config.serverUrl || ''}" placeholder="Local Server URL">
            <input type="text" class="config-target-div" value="${config.targetDiv || ''}" placeholder="Target Div ID">
            <button class="delete-button">Delete</button>
        </div>
    `;

    const enabledCheckbox = div.querySelector('.config-enabled');
    const urlInput = div.querySelector('.config-url');
    const serverUrlInput = div.querySelector('.config-server-url');
    const targetDivInput = div.querySelector('.config-target-div');
    const deleteButton = div.querySelector('.delete-button');
    const toggleButton = div.querySelector('.toggle-button');
    const configHeader = div.querySelector('.config-header');
    const configDetails = div.querySelector('.config-details');

    enabledCheckbox.addEventListener('change', (e) => {
        e.stopPropagation();
        updateConfig(index, { enabled: e.target.checked });
    });

    urlInput.addEventListener('change', (e) => {
        updateConfig(index, { url: e.target.value });
        div.querySelector('.config-name').textContent = e.target.value || 'New Config';
    });

    serverUrlInput.addEventListener('change', (e) => {
        updateConfig(index, { serverUrl: e.target.value });
    });

    targetDivInput.addEventListener('change', (e) => {
        updateConfig(index, { targetDiv: e.target.value });
    });

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteConfig(index);
    });

    configHeader.addEventListener('click', () => {
        configDetails.style.display = configDetails.style.display === 'none' ? 'block' : 'none';
        toggleButton.textContent = configDetails.style.display === 'none' ? '▼' : '▲';
    });

    return div;
}

function createNewConfig() {
    chrome.storage.sync.get('configs', function (data) {
        const configs = data.configs || [];
        configs.push({ enabled: false, url: '', serverUrl: '', targetDiv: '' });
        chrome.storage.sync.set({ configs: configs }, () => {
            loadConfigs();
        });
    });
}

function updateConfig(index, updates) {
    chrome.storage.sync.get('configs', function (data) {
        const configs = data.configs || [];
        configs[index] = { ...configs[index], ...updates };
        chrome.storage.sync.set({ configs: configs }, () => {
            loadConfigs();
        });
    });
}

function deleteConfig(index) {
    chrome.storage.sync.get('configs', function (data) {
        const configs = data.configs || [];
        configs.splice(index, 1);
        chrome.storage.sync.set({ configs: configs }, () => {
            loadConfigs();
        });
    });
}