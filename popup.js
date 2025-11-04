(function() {
  const $ = (id) => document.getElementById(id);

  function getActiveTabId() {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs && tabs[0] ? tabs[0].id : null));
    });
  }

  function getActiveTab() {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs && tabs[0] ? tabs[0] : null));
    });
  }

  async function sendToActive(msg) {
    const tabId = await getActiveTabId();
    if (!tabId) throw new Error('No active tab');
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, msg, (resp) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(resp);
      });
    });
  }

  function setStatus(text) { $('status').textContent = text; }

  async function refreshStatus() {
    const resp = await sendToActive({ action: 'GET_STATUS' });
    if (!resp) {
      setStatus('Not on a tweet page. Navigate to a tweet URL like /status/<id>.');
      return;
    }
    const limTxt = resp.noLimit ? '∞' : `${resp.count}/${resp.limit}`;
    setStatus(`Collected ${limTxt}${resp.running ? ' • scraping…' : ''}${resp.tweetId ? ' • conversation '+resp.tweetId : ''}`);
  }

  $('startBtn').addEventListener('click', async () => {
    const limit = parseInt($('limit').value, 10) || 500;
    const noLimit = !!$('noLimit').checked;
    await sendToActive({ action: 'START_SCRAPE', limit, noLimit });
    refreshStatus();
  });

  $('stopBtn').addEventListener('click', async () => {
    await sendToActive({ action: 'STOP_SCRAPE' });
    refreshStatus();
  });

  $('saveJsonBtn').addEventListener('click', async () => {
    const resp = await sendToActive({ action: 'GET_DATA' });
    if (!resp || !resp.items) { setStatus('No data to save.'); return; }
    const { items, tweetId } = resp;
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: `replies_${tweetId || 'tweet'}.json`, saveAs: true }, () => {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
  });

  $('savePdfBtn').addEventListener('click', async () => {
    const resp = await sendToActive({ action: 'GET_DATA' });
    if (!resp || !resp.items) { setStatus('No data to print.'); return; }
    const tab = await getActiveTab();
    const payload = {
      items: resp.items,
      tweetId: resp.tweetId || null,
      url: tab && tab.url ? tab.url : '',
      title: tab && tab.title ? tab.title : '',
      generatedAt: new Date().toISOString()
    };
    chrome.storage.local.set({ __repliesPrintData: payload }, () => {
      const url = chrome.runtime.getURL('print.html');
      chrome.tabs.create({ url });
    });
  });

  $('openViewerBtn').addEventListener('click', () => {
    const url = chrome.runtime.getURL('viewer.html');
    chrome.tabs.create({ url });
  });

  // Auto-refresh status while popup is open
  refreshStatus();
  const timer = setInterval(refreshStatus, 1000);
  window.addEventListener('unload', () => clearInterval(timer));
})();
