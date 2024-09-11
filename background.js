chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.sync.get('configs', function(data) {
            const configs = data.configs || [];
            const matchingConfig = configs.find(config => config.enabled && tab.url.startsWith(config.url));
            
            if (matchingConfig) {
                fetchAndInjectCode(tabId, matchingConfig.serverUrl, matchingConfig.targetDiv);
            }
        });
    }
});

function fetchAndInjectCode(tabId, serverUrl, targetDiv) {
    Promise.all([
        fetch(`${serverUrl}/index.html`).then(response => response.text()),
        fetch(`${serverUrl}/script.js`).then(response => response.text()),
        fetch(`${serverUrl}/styles.css`).then(response => response.text())
    ]).then(([htmlCode, jsCode, cssCode]) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: injectAll,
            args: [htmlCode, jsCode, cssCode, targetDiv]
        });
        startAutoReload(tabId, serverUrl, targetDiv);
    }).catch(error => {
        console.error('Error fetching resources:', error);
        showNotification('Error', 'Failed to fetch resources from the local server.');
    });
}

function injectAll(htmlCode, jsCode, cssCode, targetDiv) {
    injectHTML(htmlCode, targetDiv);
    injectJS(jsCode, targetDiv);
    injectCSS(cssCode, targetDiv);
}

function startAutoReload(tabId, serverUrl, targetDiv) {
    setInterval(() => {
        fetchAndInjectCode(tabId, serverUrl, targetDiv);
    }, 5000); // Reload every 5 seconds
}

function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message
    });
}

function injectHTML(code, targetDiv) {
    if (targetDiv) {
        const targetElement = document.getElementById(targetDiv);
        if (targetElement) {
            const injectedContent = document.createElement('div');
            injectedContent.innerHTML = code;
            targetElement.innerHTML = '';
            targetElement.appendChild(injectedContent);
            console.log('HTML injected successfully into target div');
        } else {
            console.error(`Target div with id "${targetDiv}" not found`);
        }
    } else {
        console.log('No target div specified, skipping HTML injection');
    }
}

function injectJS(code, targetDiv) {
    const script = document.createElement('script');
    script.textContent = code;
    if (targetDiv) {
        const targetElement = document.getElementById(targetDiv);
        if (targetElement) {
            targetElement.appendChild(script);
            console.log('JavaScript injected successfully into target div');
        } else {
            console.error(`Target div with id "${targetDiv}" not found, injecting into head`);
            (document.head || document.documentElement).appendChild(script);
        }
    } else {
        (document.head || document.documentElement).appendChild(script);
        console.log('JavaScript injected successfully into head');
    }
}

function injectCSS(code, targetDiv) {
    const style = document.createElement('style');
    style.textContent = code;
    if (targetDiv) {
        const targetElement = document.getElementById(targetDiv);
        if (targetElement) {
            targetElement.appendChild(style);
            console.log('CSS injected successfully into target div');
        } else {
            console.error(`Target div with id "${targetDiv}" not found, injecting into head`);
            document.head.appendChild(style);
        }
    } else {
        document.head.appendChild(style);
        console.log('CSS injected successfully into head');
    }
}