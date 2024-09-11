// This script will receive and execute injected code
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INJECT_JS') {
        injectScript(message.code);
    } else if (message.type === 'INJECT_CSS') {
        injectCSS(message.code);
    }
});

function injectScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

function injectCSS(code) {
    const style = document.createElement('style');
    style.textContent = code;
    document.head.appendChild(style);
}