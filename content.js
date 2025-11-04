(() => {
  const state = { mainTweetId: null, items: new Map(), running: false, limit: 500, noLimit: false };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const getMainTweetId = () => {
    const m = location.pathname.match(/status\/(\d+)/);
    return m ? m[1] : null;
  };

  const getTweetId = (article) => {
    const a = article.querySelector('a[href*="/status/"]');
    if (!a) return null;
    const href = a.getAttribute('href') || '';
    const m = href.match(/status\/(\d+)/);
    return m ? m[1] : null;
  };

  const getUserAndDisplay = (article) => {
    const nameDiv = article.querySelector('div[data-testid="User-Name"]');
    let user = null; let display_name = null;
    if (nameDiv) {
      const span = nameDiv.querySelector('span');
      display_name = (span && span.textContent ? span.textContent : '').trim();
      const handleLink = Array.from(nameDiv.querySelectorAll('a[href^="/"]')).find(a => /^\/[A-Za-z0-9_]+$/.test(a.getAttribute('href') || ''));
      if (handleLink) user = handleLink.getAttribute('href').slice(1);
    }
    return { user, display_name };
  };

  const getContent = (article) => {
    const blocks = article.querySelectorAll('div[data-testid="tweetText"]');
    if (!blocks || blocks.length === 0) return '';
    return Array.from(blocks).map(n => (n.textContent || '').trim()).join('\n').trim();
  };

  const getDate = (article) => {
    const t = article.querySelector('time');
    return (t && t.dateTime) ? t.dateTime : null;
  };

  const getNumeric = (s) => {
    if (!s) return 0;
    const cleaned = s.replace(/[^\d]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const getCountFromButton = (article, testid) => {
    const el = article.querySelector(`div[data-testid="${testid}"]`);
    if (!el) return 0;
    const span = el.querySelector('span');
    return getNumeric(span && span.textContent ? span.textContent : '');
  };

  const getQuoteCount = (article) => {
    const a = article.querySelector('a[href$="/retweets/with_comments"] span');
    if (a) return getNumeric(a.textContent || '');
    return 0;
  };

  const parseArticle = (article) => {
    const id = getTweetId(article);
    if (!id) return null;
    const { user, display_name } = getUserAndDisplay(article);
    const content = getContent(article);
    const date = getDate(article);
    const likeCount = getCountFromButton(article, 'like');
    const retweetCount = getCountFromButton(article, 'retweet');
    const quoteCount = getQuoteCount(article);
    const reply_to = id !== state.mainTweetId ? state.mainTweetId : null;
    return { id, date, user, display_name, content, reply_to, likeCount, retweetCount, quoteCount };
  };

  const scanOnce = () => {
    const articles = document.querySelectorAll('article');
    let added = 0;
    articles.forEach(article => {
      const item = parseArticle(article);
      if (!item) return;
      if (!state.items.has(item.id)) {
        state.items.set(item.id, item);
        added++;
      }
    });
    return added;
  };

  async function autoScrollLoop() {
    let idle = 0;
    const idleMax = 8;
    while (state.running && (state.noLimit || state.items.size < state.limit)) {
      const added = scanOnce();
      if (!state.noLimit && state.items.size >= state.limit) break;
      window.scrollBy(0, Math.max(400, window.innerHeight * 0.9));
      await sleep(900);
      if (!state.noLimit) {
        idle = added === 0 ? idle + 1 : 0;
        if (idle >= idleMax) break;
      }
    }
    state.running = false;
  }

  function start(limit, noLimit) {
    state.mainTweetId = getMainTweetId();
    state.limit = Number(limit) || 500;
    state.noLimit = Boolean(noLimit);
    state.running = true;
    scanOnce();
    autoScrollLoop();
  }

  function stop() {
    state.running = false;
  }

  function getData() {
    return Array.from(state.items.values());
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.action) return;

    if (msg.action === 'START_SCRAPE') {
      start(msg.limit, msg.noLimit);
      sendResponse({ ok: true });
      return true;
    }
    if (msg.action === 'STOP_SCRAPE') {
      stop();
      sendResponse({ ok: true });
      return;
    }
    if (msg.action === 'GET_STATUS') {
      sendResponse({ running: state.running, count: state.items.size, limit: state.limit, noLimit: state.noLimit, tweetId: state.mainTweetId });
      return true;
    }
    if (msg.action === 'GET_DATA') {
      sendResponse({ items: getData(), tweetId: state.mainTweetId });
      return true;
    }
  });
})();
