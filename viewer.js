(function(){
  const $ = (id) => document.getElementById(id);

  let data = [];
  let filtered = [];

  function normalizeItems(items){
    return (items || []).map(it => ({
      id: it.id || '',
      date: it.date ? new Date(it.date) : null,
      user: it.user || '',
      display_name: it.display_name || '',
      content: it.content || '',
      reply_to: (typeof it.reply_to === 'undefined') ? null : it.reply_to,
      likeCount: Number(it.likeCount || 0),
      retweetCount: Number(it.retweetCount || 0),
      quoteCount: Number(it.quoteCount || 0),
    }));
  }

  function render(){
    const list = $('list');
    list.innerHTML = '';
    // Split: mains (no reply_to) and replies
    let mains = filtered.filter(it => !it.reply_to);
    let replies = filtered.filter(it => !!it.reply_to);

    // Fallback: if no main found, choose earliest date as main
    if (mains.length === 0 && filtered.length > 0) {
      const byDate = filtered.slice().sort((a,b) => (a.date? a.date.getTime():0) - (b.date? b.date.getTime():0));
      mains = byDate.slice(0,1);
      const mainIds = new Set(mains.map(m => m.id));
      replies = filtered.filter(it => !mainIds.has(it.id));
    }

    // Sort replies by current selection
    const sortBy = $('sortBy').value;
    const dir = sortBy.endsWith('Desc') ? -1 : 1;
    const field = sortBy.startsWith('likes') ? 'likeCount' : sortBy.startsWith('retweets') ? 'retweetCount' : 'date';
    replies.sort((a,b) => {
      const va = (field === 'date') ? (a.date ? a.date.getTime() : 0) : a[field];
      const vb = (field === 'date') ? (b.date ? b.date.getTime() : 0) : b[field];
      return (va === vb ? 0 : (va > vb ? 1 : -1)) * dir;
    });

    const makeCard = (it, type) => {
      const card = document.createElement('article');
      card.className = `card ${type}`;
      const dateText = it.date ? it.date.toISOString() : '';
      card.innerHTML = `
        <div class="row">
          <div class="user">${escapeHtml(it.display_name)}</div>
          <div class="handle">@${escapeHtml(it.user)}</div>
          <div class="date">${escapeHtml(dateText)}</div>
        </div>
        <div class="content">${escapeHtml(it.content)}</div>
        <div class="counts">
          <div>Likes: ${it.likeCount}</div>
          <div>Retweets: ${it.retweetCount}</div>
          <div>Quotes: ${it.quoteCount}</div>
          <div style="margin-left:auto;">ID: ${escapeHtml(it.id)}</div>
        </div>
      `;
      return card;
    };

    mains.forEach(m => list.appendChild(makeCard(m, 'main')));
    replies.forEach(r => list.appendChild(makeCard(r, 'reply')));

    $('stats').textContent = `Showing ${mains.length + replies.length} of ${data.length} (main: ${mains.length}, replies: ${replies.length})`;
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  }

  function doFilter(){
    const q = ($('q').value || '').trim().toLowerCase();
    if (!q){
      filtered = data.slice();
    } else {
      filtered = data.filter(it => (it.content || '').toLowerCase().includes(q) || ('@'+it.user).toLowerCase().includes(q));
    }
    doSort();
  }

  function doSort(){
    // Sorting is applied only to replies inside render
    render();
  }

  function onFile(ev){
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const json = JSON.parse(String(reader.result || '[]'));
        data = normalizeItems(json);
        filtered = data.slice();
        doSort();
      } catch(e){
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(f);
  }

  function onClear(){
    $('q').value = '';
    $('file').value = '';
    filtered = data.slice();
    doSort();
  }

  function init(){
    $('file').addEventListener('change', onFile);
    $('q').addEventListener('input', doFilter);
    $('sortBy').addEventListener('change', doSort);
    $('clear').addEventListener('click', onClear);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
