(function(){
  const API_BASE = 'http://localhost:3000';

  async function ask(prompt, options = {}) {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ...options })
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({error:'Unknown error'}));
      throw new Error(err.error || 'Request gagal');
    }
    const data = await res.json();
    return data.text || '';
  }

  async function health() {
    const res = await fetch(`${API_BASE}/api/ai/health`);
    return res.json();
  }

  window.AI = { ask, health };
})();
