const DEFAULT_COLOR = '#2563eb';
let globalData = [];
let selectedRowIndex = null;

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderDetailValue(rawValue) {
  const val = (rawValue || '').toString().trim();
  if (!val || val.toUpperCase() === 'N/A') {
    return `<div class="detail-value detail-value--empty">N/A</div>`;
  }
  return `<div class="detail-value">${escapeHtml(val)}</div>`;
}

function getPastelTheme(hexColor) {
  const hex = (hexColor || DEFAULT_COLOR).replace('#', '');
  let r = 0, g = 0, b = 0;
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return {
      accent: DEFAULT_COLOR,
      pastelBg: 'rgba(37, 99, 235, 0.05)',
      pastelBorder: 'rgba(37, 99, 235, 0.15)'
    };
  }

  return {
    accent: `#${hex}`,
    pastelBg: `rgba(${r}, ${g}, ${b}, 0.06)`,
    pastelBorder: `rgba(${r}, ${g}, ${b}, 0.2)`
  };
}

window.switchTab = function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
};

window.handleSearch = function handleSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    renderSocieties(globalData);
    return;
  }

  const filtered = globalData.filter(item => {
    const fields = [
      item['society-name'], item['department'], item['society-chair'],
      item['society-secretary'], item['secretary'], item['society-publicity'],
      item['publicity-officer'], item['publicity'], item['society-founder'],
      item['founder'], item['association'], item['desc1'], item['desc2'], item['desc3']
    ];
    return fields.some(val => (val || '').toLowerCase().includes(q));
  });

  renderSocieties(filtered);
};

function renderSocieties(data) {
  const container = document.getElementById('societies-container');
  if (!container) return;
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p class="empty-state">No matching societies found.</p>';
    return;
  }

  const groupedData = {};
  data.forEach((item) => {
    const assoc = item['association'] || 'General Directory';
    if (!groupedData[assoc]) groupedData[assoc] = [];
    groupedData[assoc].push(item);
  });

  for (const [association, societies] of Object.entries(groupedData)) {
    const assocGroup = document.createElement('div');
    assocGroup.className = 'association-group';

    const assocTitle = document.createElement('div');
    assocTitle.className = 'association-title';
    assocTitle.textContent = association;
    assocGroup.appendChild(assocTitle);

    societies.forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-row';
      if (selectedRowIndex === item._id) row.classList.add('selected');
      row.id = `row-${item._id}`;
      row.onclick = () => showSocietyDetail(item._id);

      const dotColor = item.color && item.color.trim() !== '' ? item.color.trim() : DEFAULT_COLOR;

      row.innerHTML = `
        <div class="list-left">
          <span class="color-dot" style="background-color: ${dotColor};"></span>
          <span class="society-name">${escapeHtml(item['society-name']) || 'Society'}</span>
        </div>
      `;

      assocGroup.appendChild(row);
    });

    container.appendChild(assocGroup);
  }
}

function formatMediaLinks(rawLinks) {
  if (!rawLinks) return 'N/A';
  
  const parts = rawLinks.split(/[,|;]/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) return 'N/A';

  return parts.map(link => {
    const href = link.startsWith('http') ? link : `https://${link}`;
    
    let label = link;
    if (link.includes('instagram.com')) label = 'Instagram Page';
    else if (link.includes('nlcscosmos.com')) label = 'COSMOS Portal';
    else if (link.includes('youtube.com')) label = 'YouTube Channel';
    else if (link.includes('facebook.com')) label = 'Facebook Page';
    else if (link.length > 30) label = 'External Link';

    return `<a href="${href}" target="_blank" rel="noopener" class="theme-link overflow-link" title="${escapeHtml(link)}">${escapeHtml(label)} &rarr;</a>`;
  }).join('<br>');
}

function formatMediaLinksStyled(rawLinks) {
  const result = formatMediaLinks(rawLinks);
  if (result === 'N/A') {
    return `<span class="detail-value--empty">No links listed</span>`;
  }
  return result;
}

function showSocietyDetail(id, isNavigatingHistory = false) {
  const item = globalData.find(d => d._id === id);
  if (!item) return;

  if (selectedRowIndex !== null) {
    const prevRow = document.getElementById(`row-${selectedRowIndex}`);
    if (prevRow) {
      prevRow.classList.remove('selected');
      prevRow.style.removeProperty('--active-color');
      prevRow.style.removeProperty('--active-bg');
    }
  }
  selectedRowIndex = id;

  const theme = getPastelTheme(item.color);
  const mainPane = document.getElementById('main-pane');
  
  if (mainPane) {
    mainPane.style.setProperty('--theme-accent', theme.accent);
    mainPane.style.setProperty('--theme-pastel-bg', theme.pastelBg);
    mainPane.style.setProperty('--theme-border', theme.pastelBorder);
  }
  document.documentElement.style.setProperty('--theme-accent', theme.accent);
  document.documentElement.style.setProperty('--theme-pastel-bg', theme.pastelBg);
  document.documentElement.style.setProperty('--theme-border', theme.pastelBorder);
  
  const currentRow = document.getElementById(`row-${id}`);
  if (currentRow) {
    currentRow.classList.add('selected');
    currentRow.style.setProperty('--active-color', theme.accent);
    currentRow.style.setProperty('--active-bg', theme.pastelBg);
  }

  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('detail-view').style.display = 'block';

  const signupUrl = item['signup-form'] || '#';
  const founderVal = item['society-founder'] || item['founder'] || 'N/A';
  const secretaryVal = item['society-secretary'] || item['secretary'] || 'N/A';
  const publicityVal = item['society-publicity'] || item['publicity-officer'] || item['publicity'] || 'N/A';

  const bottomBar = document.getElementById('signup-bottom-bar');
  if (bottomBar) {
    bottomBar.style.display = 'block';
    bottomBar.innerHTML = `
      <a href="${signupUrl}" class="btn-signup-header" target="_blank" rel="noopener">Sign Up Form &rarr;</a>
    `;
  }

  const badgeEl = document.getElementById('panel-assoc-badge');
  if (badgeEl) badgeEl.textContent = item['association'] || 'General Directory';

  const titleEl = document.getElementById('panel-title');
  if (titleEl) {
    const societyNameText = item['society-name'] || 'Society Details';
    titleEl.innerHTML = `${escapeHtml(societyNameText)}`;
  }

  const societyName = item['society-name'] || '';
  const logoPath = `images/logos/${encodeURIComponent(societyName)}.png`;

  const contentEl = document.getElementById('panel-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="detail-split-layout">
        <main class="detail-main-col">
          <div class="society-banner-container" id="society-banner-wrap">
            <img 
              src="${logoPath}" 
              alt="${escapeHtml(societyName)} Logo" 
              class="society-banner-img"
              onerror="this.parentElement.style.display='none';" 
            />
          </div>

          <div class="chair-banner">
            <div class="detail-label">Chair</div>
            ${renderDetailValue(item['society-chair'])}
          </div>

          <div class="tab-bar" role="tablist">
            <button class="tab-button active" data-tab="overview" onclick="switchTab('overview')">Overview</button>
            <button class="tab-button" data-tab="activities" onclick="switchTab('activities')">Activities</button>
            <button class="tab-button" data-tab="highlights" onclick="switchTab('highlights')">Highlights</button>
            <button class="tab-button" data-tab="info" onclick="switchTab('info')">Info</button>
          </div>

          <div class="tab-panel active" id="tab-overview">
            ${item['desc1']
              ? `<div class="info-section"><div class="info-section-title">Overview</div><div class="info-section-body">${escapeHtml(item['desc1'])}</div></div>`
              : `<p class="empty-state">No overview provided for this society.</p>`}
          </div>

          <div class="tab-panel" id="tab-activities">
            ${item['desc2']
              ? `<div class="info-section"><div class="info-section-title">Activities</div><div class="info-section-body">${escapeHtml(item['desc2'])}</div></div>`
              : `<p class="empty-state">No activities listed for this society.</p>`}
          </div>

          <div class="tab-panel" id="tab-highlights">
            ${item['desc3']
              ? `<div class="info-section"><div class="info-section-title">Highlights</div><div class="info-section-body">${escapeHtml(item['desc3'])}</div></div>`
              : `<p class="empty-state">No highlights listed for this society.</p>`}
          </div>

          <div class="tab-panel" id="tab-info">
            <div class="detail-grid-card">
              <div class="detail-item">
                <div class="detail-label">Chair</div>
                ${renderDetailValue(item['society-chair'])}
              </div>
              <div class="detail-item">
                <div class="detail-label">Secretary</div>
                ${renderDetailValue(secretaryVal === 'N/A' ? '' : secretaryVal)}
              </div>
              <div class="detail-item">
                <div class="detail-label">Publicity</div>
                ${renderDetailValue(publicityVal === 'N/A' ? '' : publicityVal)}
              </div>
              <div class="detail-item">
                <div class="detail-label">Founder</div>
                ${renderDetailValue(founderVal === 'N/A' ? '' : founderVal)}
              </div>
              <div class="detail-item">
                <div class="detail-label">Department</div>
                ${renderDetailValue(item['department'])}
              </div>
              <div class="detail-item">
                <div class="detail-label">Teacher Lead</div>
                ${renderDetailValue(item['link-teacher'])}
              </div>
              <div class="detail-item">
                <div class="detail-label">Meeting Room</div>
                ${renderDetailValue(item['meetingroom'])}
              </div>
              <div class="detail-item">
                <div class="detail-label">Meeting Time</div>
                ${renderDetailValue(item['meetingtime'])}
              </div>
            </div>
          </div>
        </main>

        <aside class="detail-sidebar-col" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="info-section">
            <div class="info-section-title">Media & External Links</div>
            <div class="info-section-body">${formatMediaLinksStyled(item['media-links'])}</div>
          </div>
        </aside>
      </div>
    `;
  }

  if (!isNavigatingHistory) {
    history.pushState({ id: id }, '', `#society-${id}`);
  }
}

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.id !== undefined) {
    showSocietyDetail(e.state.id, true);
  }
});

fetch('data.json')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  })
  .then(data => {
    globalData = data.map((item, index) => ({ ...item, _id: index }));
    renderSocieties(globalData);

    const hash = window.location.hash;
    if (hash && hash.startsWith('#society-')) {
      const id = parseInt(hash.replace('#society-', ''), 10);
      if (!isNaN(id)) showSocietyDetail(id, true);
    }
  })
  .catch(err => {
    console.error('Fetch error:', err);
    const container = document.getElementById('societies-container');
    if (container) {
      container.innerHTML = `<p class="empty-state" style="color:#ef4444;">Failed to load directory data.</p>`;
    }
  });
