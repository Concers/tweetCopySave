(function(){
  function $(id){ return document.getElementById(id); }

  function esc(text){
    if (!text) return '';
    return String(text).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function render(items, header){
    $('title').textContent = header.title || 'Replies';
    const meta = [];
    if (header.url) meta.push(`Source: ${header.url}`);
    if (header.tweetId) meta.push(`Conversation: ${header.tweetId}`);
    if (header.generatedAt) meta.push(`Generated: ${new Date(header.generatedAt).toLocaleString()}`);
    $('meta').textContent = meta.join(' • ');

    const list = $('list');
    list.innerHTML = '';
    items.forEach(it => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="row">
          <div class="user">${esc(it.display_name || '')}</div>
          <div class="handle">@${esc(it.user || '')}</div>
          <div class="date">${esc(it.date || '')}</div>
        </div>
        <div class="content">${esc(it.content || '')}</div>
        <div class="counts">
          <div>Likes: ${it.likeCount ?? 0}</div>
          <div>Retweets: ${it.retweetCount ?? 0}</div>
          <div>Quotes: ${it.quoteCount ?? 0}</div>
          <div class="small">ID: ${esc(it.id)}</div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function init(){
    chrome.storage.local.get(['__repliesPrintData'], ({ __repliesPrintData }) => {
      if (!__repliesPrintData) return;
      render(__repliesPrintData.items || [], __repliesPrintData);
      // optional cleanup
      chrome.storage.local.remove(['__repliesPrintData']);
    });

    document.getElementById('printBtn').addEventListener('click', () => window.print());

    // auto-open print after slight delay
    setTimeout(() => window.print(), 400);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
