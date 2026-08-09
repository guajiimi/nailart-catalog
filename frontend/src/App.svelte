<script>
  import { onMount } from 'svelte';
  import { getDesigns, getCategories } from './lib/api.js';

  let designs = $state([]);
  let categories = $state([]);
  let search = $state('');
  let activeCat = $state('all');
  let view = $state('grid');
  let selected = $state(null);

  onMount(async () => {
    try {
      designs = await getDesigns();
      categories = await getCategories();
    } catch (e) {
      console.error('Load failed:', e);
    }
  });

  let filtered = $derived.by(() => {
    const q = search.toLowerCase();
    return designs.filter(d => {
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
      const matchCat = activeCat === 'all' || d.category === activeCat;
      return matchSearch && matchCat;
    });
  });

  function waUrl(name) {
    return `https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20booking%20${encodeURIComponent(name)}`;
  }

  function selectCat(cat) {
    activeCat = cat;
  }

  function selectDesign(d) {
    selected = d;
  }

  function closeDetail() {
    selected = null;
  }

  function setViewMode(mode) {
    view = mode;
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') selected = null; }} />

<div class="app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo"><div class="logo-dot"></div> Nail Studio</div>
      <div class="tagline">Premium nail art & care</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Browse</div>
      <button class="nav-item" class:active={activeCat === 'all'} onclick={() => selectCat('all')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        All Designs <span class="count">{designs.length}</span>
      </button>
      <div class="divider"></div>
      <div class="nav-label">Categories</div>
      {#each categories as cat}
        <button class="nav-item" class:active={activeCat === cat.category} onclick={() => selectCat(cat.category)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
          {cat.category} <span class="count">{cat.count}</span>
        </button>
      {/each}
    </nav>
    <div class="sidebar-footer">
      <a href="https://wa.me/6281234567890" class="wa-link" target="_blank" aria-label="Chat WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Chat WhatsApp
      </a>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div class="topbar-left">
        <h1>Gallery</h1>
        <span class="count-badge">{filtered.length} desain</span>
      </div>
      <div class="topbar-right">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Cari desain..." bind:value={search} class="search">
        </div>
        <div class="view-toggle">
          <button class="view-btn" class:active={view === 'grid'} onclick={() => setViewMode('grid')} aria-label="Grid view">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button class="view-btn" class:active={view === 'list'} onclick={() => setViewMode('list')} aria-label="List view">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="cta-banner">
      <div class="cta-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></div>
      <div class="cta-body">
        <div class="cta-title">Konsultasi Gratis</div>
        <div class="cta-sub">Belum yakin pilih desain? Chat kami untuk konsultasi gratis</div>
      </div>
      <a href="https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20konsultasi%20nail%20art" class="cta-btn" target="_blank">Chat Sekarang</a>
    </div>

    <div class="content">
      <div class="grid-wrap">
        {#if filtered.length === 0}
          <div class="no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg>
            <p>Tidak ada desain yang cocok</p>
          </div>
        {:else}
          <div class="grid" class:list-view={view === 'list'}>
            {#each filtered as d (d.id)}
              <button class="card" class:selected={selected?.id === d.id} onclick={() => selectDesign(d)}>
                {#if d.badge}<span class="badge">{d.badge}</span>{/if}
                <div class="card-img"><img src={d.image_url || 'https://picsum.photos/seed/placeholder/300/300'} alt={d.name} loading="lazy"></div>
                <div class="card-info">
                  <div class="card-cat">{d.category}</div>
                  <div class="card-name">{d.name}</div>
                  <div class="card-price">{d.price_formatted}</div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      {#if selected}
        <div class="detail open">
          <div class="detail-img">
            <img src={selected.image_url || 'https://picsum.photos/seed/placeholder/500/375'} alt={selected.name}>
            <button class="detail-close" onclick={closeDetail} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="detail-body">
            <div class="detail-cat">{selected.category}</div>
            <h2>{selected.name}</h2>
            <p class="desc">{selected.description}</p>
            <div class="detail-meta">
              <div class="meta-row"><span class="meta-label">Durasi</span><span class="meta-val">{selected.duration}</span></div>
              <div class="meta-row"><span class="meta-label">Ketahanan</span><span class="meta-val">{selected.durability}</span></div>
              <div class="meta-row"><span class="meta-label">Kategori</span><span class="meta-val">{selected.category}</span></div>
            </div>
            <div class="detail-price">{selected.price_formatted}</div>
            <a href={waUrl(selected.name)} class="detail-wa" target="_blank">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Booking via WhatsApp
            </a>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) {
    font-family: 'Outfit', -apple-system, sans-serif;
    background: #FAFAF9; color: #1C1917;
    -webkit-font-smoothing: antialiased;
    height: 100%; overflow: hidden;
  }
  :global(html) { height: 100%; }
  .app { display: flex; height: 100vh; overflow: hidden; }

  .sidebar { width: 272px; min-width: 272px; background: #F5F0EC; border-right: 1px solid #E7E5E4; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; position: relative; }
  .sidebar-header { padding: 2rem 1.5rem 1rem; position: relative; z-index: 1; }
  .logo { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; display: flex; align-items: center; gap: 0.5rem; }
  .logo-dot { width: 8px; height: 8px; background: #C2956B; border-radius: 50%; }
  .tagline { font-size: 0.7rem; color: #A8A29E; margin-top: 0.35rem; }
  .sidebar-nav { padding: 0 0.75rem; flex: 1; position: relative; z-index: 1; }
  .nav-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #A8A29E; padding: 1.5rem 0.75rem 0.5rem; }
  .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; font-size: 0.85rem; color: #A8A29E; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: inherit; border-radius: 6px; transition: all 0.2s; }
  .nav-item:hover { color: #1C1917; background: rgba(0,0,0,0.03); }
  .nav-item.active { color: #1C1917; font-weight: 500; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
  .nav-item :global(svg) { width: 16px; height: 16px; opacity: 0.4; flex-shrink: 0; }
  .nav-item.active :global(svg) { opacity: 0.8; }
  .count { margin-left: auto; font-size: 0.65rem; color: #A8A29E; font-weight: 500; background: rgba(0,0,0,0.04); padding: 0.15rem 0.5rem; border-radius: 100px; }
  .nav-item.active .count { background: #EDE4DB; color: #C2956B; }
  .divider { height: 1px; background: #E7E5E4; margin: 0.5rem 1.25rem; }
  .sidebar-footer { padding: 1.25rem; border-top: 1px solid #E7E5E4; position: relative; z-index: 1; }
  .wa-link { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.65rem 1rem; background: #25D366; color: #fff; text-decoration: none; font-size: 0.8rem; font-weight: 600; border-radius: 6px; transition: all 0.2s; }
  .wa-link:hover { background: #128C7E; transform: translateY(-1px); }

  .main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .topbar { padding: 1rem 2rem; border-bottom: 1px solid #E7E5E4; display: flex; align-items: center; justify-content: space-between; background: #fff; }
  .topbar-left { display: flex; align-items: center; gap: 0.75rem; }
  .topbar h1 { font-size: 1.15rem; font-weight: 600; letter-spacing: -0.02em; }
  .count-badge { font-size: 0.7rem; color: #A8A29E; font-weight: 500; background: #FAFAF9; padding: 0.2rem 0.6rem; border-radius: 100px; }
  .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
  .search-wrap { position: relative; }
  .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #A8A29E; pointer-events: none; }
  .search { padding: 0.5rem 0.85rem 0.5rem 2.25rem; border: 1px solid #E7E5E4; background: #FAFAF9; font-family: inherit; font-size: 0.8rem; width: 220px; outline: none; border-radius: 6px; transition: all 0.2s; }
  .search:focus { border-color: #C2956B; box-shadow: 0 0 0 3px rgba(194,149,107,0.1); }
  .view-toggle { display: flex; border: 1px solid #E7E5E4; border-radius: 6px; overflow: hidden; }
  .view-btn { padding: 0.45rem 0.65rem; background: #fff; border: none; cursor: pointer; color: #A8A29E; transition: all 0.15s; }
  .view-btn:hover { color: #1C1917; }
  .view-btn.active { background: #1C1917; color: #fff; }
  .view-btn :global(svg) { width: 14px; height: 14px; display: block; }

  .cta-banner { margin: 1rem 2rem 0; background: #fff; border: 1px solid #E7E5E4; border-radius: 6px; display: flex; align-items: center; padding: 1rem 1.25rem; gap: 1rem; }
  .cta-icon { width: 44px; height: 44px; background: #EDE4DB; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .cta-icon :global(svg) { width: 20px; height: 20px; color: #C2956B; }
  .cta-body { flex: 1; }
  .cta-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.1rem; }
  .cta-sub { font-size: 0.75rem; color: #A8A29E; }
  .cta-btn { padding: 0.5rem 1rem; background: #25D366; color: #fff; text-decoration: none; font-size: 0.75rem; font-weight: 600; border-radius: 6px; white-space: nowrap; }
  .cta-btn:hover { background: #128C7E; }

  .content { flex: 1; display: flex; overflow: hidden; }
  .grid-wrap { flex: 1; overflow-y: auto; padding: 1.5rem 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
  .grid.list-view { grid-template-columns: 1fr; gap: 0.75rem; }

  .card { background: #fff; border: 1px solid #E7E5E4; cursor: pointer; transition: all 0.25s; overflow: hidden; border-radius: 6px; position: relative; text-align: left; font-family: inherit; width: 100%; padding: 0; }
  .card:hover { border-color: #C2956B; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transform: translateY(-2px); }
  .card.selected { border-color: #C2956B; box-shadow: 0 0 0 2px rgba(194,149,107,0.2); }
  .badge { position: absolute; top: 0.6rem; left: 0.6rem; background: #C2956B; color: #fff; font-size: 0.55rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.2rem 0.5rem; border-radius: 3px; z-index: 2; }
  .card-img { width: 100%; aspect-ratio: 1; background: #EDE4DB; overflow: hidden; }
  .card-img :global(img) { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
  .card:hover .card-img :global(img) { transform: scale(1.05); }
  .card-info { padding: 0.85rem 1rem; }
  .card-cat { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #C2956B; margin-bottom: 0.3rem; }
  .card-name { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.2rem; color: #1C1917; }
  .card-price { font-size: 0.85rem; font-weight: 600; color: #1C1917; }

  .grid.list-view .card { display: flex; align-items: stretch; }
  .grid.list-view .card-img { width: 100px; min-width: 100px; aspect-ratio: 1; }
  .grid.list-view .card-info { display: flex; align-items: center; gap: 1rem; flex: 1; }
  .grid.list-view .card-name { margin-bottom: 0; }

  .no-results { text-align: center; padding: 4rem 2rem; color: #A8A29E; }
  .no-results p { margin-top: 1rem; font-size: 0.9rem; }

  .detail { width: 380px; min-width: 380px; border-left: 1px solid #E7E5E4; background: #fff; overflow-y: auto; display: flex; flex-direction: column; }
  .detail-img { width: 100%; aspect-ratio: 4/3; background: #EDE4DB; overflow: hidden; position: relative; }
  .detail-img :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .detail-close { position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(255,255,255,0.9); border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
  .detail-body { padding: 1.5rem; flex: 1; }
  .detail-cat { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #C2956B; margin-bottom: 0.5rem; }
  .detail-body h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
  .desc { font-size: 0.85rem; color: #A8A29E; line-height: 1.7; margin-bottom: 1.25rem; }
  .detail-meta { display: flex; flex-direction: column; gap: 0.65rem; padding: 1rem 0; border-top: 1px solid #E7E5E4; border-bottom: 1px solid #E7E5E4; margin-bottom: 1.25rem; }
  .meta-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
  .meta-label { color: #A8A29E; }
  .meta-val { font-weight: 500; }
  .detail-price { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.25rem; }
  .detail-wa { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #25D366; color: #fff; text-decoration: none; font-size: 0.85rem; font-weight: 600; border-radius: 6px; transition: all 0.2s; }
  .detail-wa:hover { background: #128C7E; transform: translateY(-1px); }

  @media (max-width: 900px) {
    .sidebar { display: none; }
    .view-toggle { display: none; }
    .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
    .grid-wrap { padding: 1rem; }
    .topbar { padding: 0.75rem 1rem; }
    .detail { position: fixed; right: 0; top: 0; height: 100vh; width: 100vw; z-index: 301; }
  }
  @media (max-width: 480px) {
    .grid { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
  }
</style>
