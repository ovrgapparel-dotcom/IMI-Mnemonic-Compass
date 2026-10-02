const state = {
  view: 'dashboard',
  data: {
    members: 0,
    courses: 4,
    bookings: 0,
    subscribers: 1248,
    memberList: [],
    bookingList: [],
    subscribersList: [],
    courseModules: {},
    siteContent: {}
  }
};

const titles = {
  dashboard:   'Command Center',
  website:     'Website & Content Manager',
  videohub:    'Video Hub & Media CMS',
  news:        'News Centre & Blog Manager',
  courses:     'Courses & Workshops Manager',
  tools:       'Tools & Resource HUD Manager',
  portfolio:   'Portfolio & Work Showcase Manager',
  members:     'Members & Memberships Manager',
  subscribers: 'Newsletter Subscribers & Email Campaigns Hub',
  messages:    'Member Direct Messages & Strategy Inquiries',
  community:   'Community Exchange & Discussion Moderation',
  bookings:    'Bookings & Calendar Centre',
  analytics:   'Offers, Billing & Analytics',
  links:       'Links & Payments Hub',
  settings:    'Settings'
};

// ── Global Toast Notification System ───────────────────────────────────────
window.imiToast = function(message, type = 'success', duration = 3200) {
  let container = document.getElementById('imi-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'imi-toast-container';
    container.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:99999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success: '#22c55e', error: '#ef4444', info: '#c9a227', warning: '#f59e0b' };
  const icons  = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:#181818; border:1px solid ${colors[type] || colors.info}44;
    border-left:3px solid ${colors[type] || colors.info};
    color:#fff; padding:12px 18px; border-radius:8px;
    font-family:'Outfit',sans-serif; font-size:0.83rem; font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.6); display:flex; align-items:center; gap:10px;
    min-width:240px; max-width:360px; pointer-events:auto;
    opacity:0; transform:translateX(40px); transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
  `;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}" style="color:${colors[type] || colors.info}; font-size:1rem; flex-shrink:0;"></i><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 320);
  }, duration);
};

// ── Global CTA Ripple Effect ────────────────────────────────────────────────
window.bindCTARipple = function(root) {
  const target = root || document;
  target.querySelectorAll('.btn, .button, .primary, .btn-primary, .btn-secondary, .button-gold, .button-outline, [class*="btn-"]').forEach(el => {
    if (el.dataset.rippleBound) return;
    el.dataset.rippleBound = '1';
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px; top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.18); border-radius:50%;
        transform:scale(0); animation:imi-ripple 0.55s linear forwards;
        pointer-events:none; z-index:10;
      `;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
};
// Inject ripple keyframe once
if (!document.getElementById('imi-ripple-style')) {
  const s = document.createElement('style');
  s.id = 'imi-ripple-style';
  s.textContent = '@keyframes imi-ripple { to { transform:scale(3); opacity:0; } }';
  document.head.appendChild(s);
}

// ── Word-Style WYSIWYG Rich Text Editor Component ───────────────────────────
window.createRichEditorHtml = function(fieldId, initialValue = '', placeholder = 'Enter content...', height = '200px') {
  return `
  <div class="rich-editor-wrapper" id="${fieldId}_wrapper" style="border:1px solid rgba(255,255,255,0.14); border-radius:6px; background:#101216; margin-top:6px; overflow:hidden;">
    <!-- TOOLBAR -->
    <div class="rich-editor-toolbar" style="display:flex; flex-wrap:wrap; gap:5px; padding:7px 10px; background:#16191f; border-bottom:1px solid rgba(255,255,255,0.08); align-items:center;">
      <select onchange="formatBlockRich('${fieldId}', this.value); this.selectedIndex=0;" style="background:#222630; color:#fff; border:1px solid rgba(255,255,255,0.18); border-radius:4px; font-size:11px; padding:4px 8px; cursor:pointer;" title="Paragraph & Headings">
        <option value="">Style / Heading ▾</option>
        <option value="p">Normal Paragraph</option>
        <option value="h1">Heading 1 (Large)</option>
        <option value="h2">Heading 2 (Medium)</option>
        <option value="h3">Heading 3 (Small)</option>
        <option value="blockquote">Quote Block</option>
      </select>

      <div style="width:1px; height:18px; background:rgba(255,255,255,0.12); margin:0 2px;"></div>

      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'bold')" title="Bold (Ctrl+B)" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-bold"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'italic')" title="Italic (Ctrl+I)" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-italic"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'underline')" title="Underline (Ctrl+U)" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-underline"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'strikeThrough')" title="Strikethrough" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-strikethrough"></i></button>

      <div style="width:1px; height:18px; background:rgba(255,255,255,0.12); margin:0 2px;"></div>

      <button type="button" class="rich-btn" onclick="insertRichLink('${fieldId}')" title="Insert / Edit Hyperlink" style="padding:4px 9px; background:#222630; border:1px solid var(--gold-border, rgba(201,162,39,0.4)); color:var(--gold, #c9a227); border-radius:4px; cursor:pointer; font-size:11px; font-weight:600;"><i class="fa-solid fa-link" style="margin-right:3px;"></i>Link</button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'unlink')" title="Remove Link" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#aaa; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-link-slash"></i></button>

      <div style="width:1px; height:18px; background:rgba(255,255,255,0.12); margin:0 2px;"></div>

      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'insertUnorderedList')" title="Bulleted List" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-list-ul"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'insertOrderedList')" title="Numbered List" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-list-ol"></i></button>
      <button type="button" class="rich-btn" onclick="formatBlockquote('${fieldId}')" title="Quote Callout Block" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:var(--gold); border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-quote-left"></i></button>

      <div style="width:1px; height:18px; background:rgba(255,255,255,0.12); margin:0 2px;"></div>

      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'justifyLeft')" title="Align Left" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-align-left"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'justifyCenter')" title="Align Center" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-align-center"></i></button>
      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'justifyRight')" title="Align Right" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#fff; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-align-right"></i></button>

      <div style="width:1px; height:18px; background:rgba(255,255,255,0.12); margin:0 2px;"></div>

      <button type="button" class="rich-btn" onclick="execRichCmd('${fieldId}', 'removeFormat')" title="Clear Formatting" style="padding:4px 8px; background:#222630; border:1px solid rgba(255,255,255,0.18); color:#888; border-radius:4px; cursor:pointer; font-size:11px;"><i class="fa-solid fa-eraser"></i></button>

      <div style="flex:1;"></div>

      <button type="button" id="${fieldId}_toggle_btn" class="rich-btn" onclick="toggleRichHtmlMode('${fieldId}')" title="Toggle HTML / Visual View" style="padding:4px 9px; background:#1f232b; border:1px solid rgba(255,255,255,0.22); color:#bbb; border-radius:4px; cursor:pointer; font-size:10px; font-family:monospace;"><i class="fa-solid fa-code" style="margin-right:4px;"></i>&lt;/&gt; HTML</button>
    </div>

    <!-- EDITABLE CANVAS -->
    <div id="${fieldId}_editor" contenteditable="true" class="rich-editor-canvas" oninput="syncRichEditor('${fieldId}')" onblur="syncRichEditor('${fieldId}')" style="min-height:${height}; max-height:480px; overflow-y:auto; padding:14px; background:#0b0d11; color:#fff; font-family:inherit; font-size:0.9rem; line-height:1.7; outline:none;" placeholder="${placeholder}">
      ${initialValue || ''}
    </div>

    <!-- RAW HTML TEXTAREA (TOGGLEABLE) -->
    <textarea id="${fieldId}" style="display:none; width:100%; height:${height}; min-height:${height}; background:#07080a; color:#7dd3fc; border:none; padding:14px; font-family:monospace; font-size:0.83rem; line-height:1.5; outline:none; resize:vertical;" oninput="syncRawToRichEditor('${fieldId}')">${initialValue || ''}</textarea>
  </div>`;
};

window.execRichCmd = function(fieldId, cmd, val = null) {
  const editor = document.getElementById(`${fieldId}_editor`);
  if (!editor) return;
  editor.focus();
  document.execCommand(cmd, false, val);
  window.syncRichEditor(fieldId);
};

window.formatBlockRich = function(fieldId, tag) {
  if (!tag) return;
  const editor = document.getElementById(`${fieldId}_editor`);
  if (!editor) return;
  editor.focus();
  document.execCommand('formatBlock', false, tag);
  window.syncRichEditor(fieldId);
};

window.formatBlockquote = function(fieldId) {
  const editor = document.getElementById(`${fieldId}_editor`);
  if (!editor) return;
  editor.focus();
  document.execCommand('formatBlock', false, 'blockquote');
  window.syncRichEditor(fieldId);
};

window.insertRichLink = function(fieldId) {
  const editor = document.getElementById(`${fieldId}_editor`);
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  const selectedText = selection.toString();
  const url = prompt('Enter Destination URL (e.g. https://example.com or pages/booking.html):', 'https://');
  if (!url || url.trim() === '' || url === 'https://') return;
  
  if (selectedText.length > 0) {
    document.execCommand('createLink', false, url.trim());
  } else {
    const linkHtml = `<a href="${url.trim()}" target="_blank" style="color:var(--gold, #c9a227); text-decoration:underline;">${url.trim()}</a>`;
    document.execCommand('insertHTML', false, linkHtml);
  }
  window.syncRichEditor(fieldId);
};

window.syncRichEditor = function(fieldId) {
  const editor = document.getElementById(`${fieldId}_editor`);
  const textarea = document.getElementById(fieldId);
  if (editor && textarea) {
    textarea.value = editor.innerHTML;
  }
};

window.syncRawToRichEditor = function(fieldId) {
  const editor = document.getElementById(`${fieldId}_editor`);
  const textarea = document.getElementById(fieldId);
  if (editor && textarea) {
    editor.innerHTML = textarea.value;
  }
};

window.toggleRichHtmlMode = function(fieldId) {
  const editor = document.getElementById(`${fieldId}_editor`);
  const textarea = document.getElementById(fieldId);
  const btn = document.getElementById(`${fieldId}_toggle_btn`);
  if (!editor || !textarea || !btn) return;

  if (textarea.style.display === 'none') {
    // Switch to HTML mode
    textarea.value = editor.innerHTML;
    editor.style.display = 'none';
    textarea.style.display = 'block';
    textarea.focus();
    btn.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i> Visual';
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold)';
  } else {
    // Switch to Visual mode
    editor.innerHTML = textarea.value;
    textarea.style.display = 'none';
    editor.style.display = 'block';
    editor.focus();
    btn.innerHTML = '<i class="fa-solid fa-code" style="margin-right:4px;"></i> &lt;/&gt; HTML';
    btn.style.borderColor = 'rgba(255,255,255,0.22)';
    btn.style.color = '#bbb';
  }
};

const app = document.getElementById('app');
const pageTitle = document.getElementById('pageTitle');

// ── Sidebar Navigation ────────────────────────────────────────────────
document.getElementById('sidebarNav').addEventListener('click', e => {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  state.view = btn.dataset.view;
  render();
});

// ── Main Render Pipeline ──────────────────────────────────────────────
async function render() {
  if (pageTitle) pageTitle.textContent = titles[state.view] || 'Command Center';

  if (typeof IMI_AUTH !== 'undefined') {
    try {
      const liveProfiles = await IMI_AUTH.fetchProfiles();
      const liveBookings = await IMI_AUTH.fetchBookings();
      const liveSubs = await IMI_AUTH.fetchSubscribers();
      const dbModules = await IMI_AUTH.fetchCourseModules();
      const siteContent = await IMI_AUTH.fetchSiteContent();

      const activeSession = await IMI_AUTH.getSession();
      const mergedMembers = [...(liveProfiles || [])];

      if (activeSession && activeSession.email) {
        if (!mergedMembers.find(m => m.email.toLowerCase() === activeSession.email.toLowerCase())) {
          mergedMembers.unshift({
            id: activeSession.id || 'usr-active',
            email: activeSession.email,
            full_name: activeSession.name || activeSession.full_name || activeSession.email.split('@')[0],
            role: activeSession.role || 'free',
            joined_at: new Date().toISOString()
          });
        }
      }

      state.data.memberList = mergedMembers;

      // Live member messages & community exchanges
      try {
        const liveMessages = (typeof IMI_AUTH.fetchMemberMessages === 'function') ? await IMI_AUTH.fetchMemberMessages() : [];
        const liveCommunity = (typeof IMI_AUTH.fetchCommunityPosts === 'function') ? await IMI_AUTH.fetchCommunityPosts() : [];
        state.data.memberMessages = liveMessages || [];
        state.data.communityPosts = liveCommunity || [];
        state.data.unreadMessages = (liveMessages || []).filter(m => (m.status || 'unread') === 'unread').length;

        const msgNav = document.querySelector('#sidebarNav [data-view="messages"] span');
        if (msgNav) {
          msgNav.innerHTML = state.data.unreadMessages > 0
            ? `Direct Messages <span style="background:#ef4444; color:#fff; font-size:10px; padding:1px 6px; border-radius:10px; margin-left:6px; font-weight:800;">${state.data.unreadMessages}</span>`
            : 'Direct Messages';
        }
        const commNav = document.querySelector('#sidebarNav [data-view="community"] span');
        if (commNav) {
          const postCount = (state.data.communityPosts || []).length;
          commNav.innerHTML = postCount > 0
            ? `Community Board <span style="background:rgba(96,165,250,0.2); color:#60a5fa; border:1px solid rgba(96,165,250,0.4); font-size:10px; padding:1px 6px; border-radius:10px; margin-left:6px; font-weight:700;">${postCount}</span>`
            : 'Community Board';
        }
      } catch(err) {
        console.warn('Messages state fetch warning:', err);
      }

      // Use only live bookings &rdquo;” no fake/demo data injected
      state.data.bookingList = liveBookings || [];

      state.data.subscribersList = liveSubs || [];
      state.data.courseModules = dbModules || {};
      state.data.siteContent = siteContent || {};

      state.data.members = state.data.memberList.length;
      state.data.bookings = state.data.bookingList.length;
      state.data.subscribers = state.data.subscribersList.length;
    } catch (err) {
      console.warn('Admin state fetch warning:', err);
    }
  }

  const views = {
    dashboard:   dashboard,
    website:     website,
    videohub:    videohub,
    news:        newsManager,
    courses:     courses,
    tools:       toolsManager,
    portfolio:   portfolioManager,
    members:     members,
    subscribers: subscribersManager,
    messages:    messagesCentre,
    community:   communityAdmin,
    bookings:    bookings,
    analytics:   analytics,
    links:       linksManager,
    settings:    settings
  };

  app.innerHTML = (views[state.view] || dashboard)();
  bindActions();
  // Bind ripple to all CTA buttons after every render
  if (window.bindCTARipple) window.bindCTARipple(app);
}

// ── Dashboard View ────────────────────────────────────────────────────
function dashboard() {
  const unreadMsg = state.data.unreadMessages || 0;
  const unreadBanner = unreadMsg > 0 ? `
    <div style="background:rgba(201,162,39,0.12); border:1px solid rgba(201,162,39,0.4); border-left:4px solid var(--gold); border-radius:8px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:38px; height:38px; border-radius:50%; background:rgba(201,162,39,0.2); display:flex; align-items:center; justify-content:center; color:var(--gold); font-size:1.1rem; flex-shrink:0;">
          <i class="fa-solid fa-envelope-open-text"></i>
        </div>
        <div>
          <div style="font-size:0.95rem; font-weight:700; color:#fff;">You have ${unreadMsg} unread member inquiry${unreadMsg > 1 ? 'ies' : ''}</div>
          <div style="font-size:0.75rem; color:var(--silver);">Members are waiting for your response in the Direct Messages centre.</div>
        </div>
      </div>
      <button onclick="document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active')); document.querySelector('.nav-item[data-view=messages]')?.classList.add('active'); state.view='messages'; render();" class="primary" style="font-size:0.78rem; padding:8px 16px; gap:6px;">
        <i class="fa-solid fa-comments"></i> Open Messages &rarr;
      </button>
    </div>
  ` : '';

  return `
  ${unreadBanner}
  <div class="grid stats">
    ${stat('Member Inquiries', (state.data.memberMessages || []).length, unreadMsg + ' Awaiting Reply')}

    ${stat('Active Members', state.data.members, 'Registered Profiles')}
    ${stat('Published Courses', state.data.courses, '4 Unlocked Modules')}
    ${stat('Total Bookings', state.data.bookings, 'Pending & Confirmed')}
    ${stat('Newsletter Leads', state.data.subscribers, '+48 this week')}
  </div>
  <div class="grid two-col">
    <div class="card">
      <div class="card-title"><h3>Recent Activity</h3><span>LIVE FEED</span></div>
      <div class="activity">
        ${activity('Admin control connected to Supabase DB', 'Just now')}
        ${activity('Course modules & media bucket synced', '12 minutes ago')}
        ${activity('Member authentication layer active', '1 hour ago')}
        ${activity('Strategy booking pipeline ready', '2 hours ago')}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><h3>Quick Actions</h3><span>COMMAND</span></div>
      <div class="action-grid">
        ${action('ï¼‹', 'Add Member', 'Create new account')}
        ${action('ï¼‹', 'New Booking', 'Log manual session')}
        ${action('&rarr;‘', 'Upload Media', 'Store a new asset')}
        ${action('â—‡', 'Create Offer', 'Add product or service')}
      </div>
    </div>
  </div>`;
}

function stat(label, value, trend) {
  return `<div class="card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="trend">${trend}</div></div>`;
}

function activity(a, b) {
  return `<div class="activity-row"><i class="activity-dot"></i><div><b>${a}</b><div style="color:var(--muted);margin-top:4px">${b}</div></div></div>`;
}

function action(icon, title, text) {
  return `<button class="action" data-action="${title}"><b>${icon} ${title}</b><span>${text}</span></button>`;
}

function page(title, desc, button, body) {
  return `<div class="section-head"><div><h2>${title}</h2><p>${desc}</p></div>${button ? `<button class="primary" data-action="${button}">ï¼‹ ${button}</button>` : ''}</div>${body}`;
}

// ── Website CMS View (Aligned with Front End Sections) ───────────────
function website() {
  const sc = state.data.siteContent || {};
  return page('Website Content CMS', 'Control headlines, hero media, section copy, ecosystem cards, business solutions, and pricing live across all website sections.', 'Save Website', `
  <div class="notice">Changes saved here are stored in Supabase <code>site_content</code> table and instantly update the public website.</div>

  <!-- STICKY QUICK JUMP NAVIGATION -->
  <div style="position:sticky; top:65px; z-index:100; background:rgba(14,17,23,0.95); backdrop-filter:blur(10px); border:1px solid rgba(201,162,39,0.25); border-radius:8px; padding:10px 14px; margin-bottom:20px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
    <span style="font-size:0.75rem; font-weight:700; color:var(--gold); font-family:var(--font-mono); margin-right:4px;"><i class="fa-solid fa-compass"></i> QUICK JUMP:</span>
    <a href="#sec-hero" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">1. Hero</a>
    <a href="#sec-approach" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">2. Approach</a>
    <a href="#sec-ecosystem" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">3. Ecosystem</a>
    <a href="#sec-solutions-preview" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">4. Solutions Prev</a>
    <a href="#sec-tools-pricing" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">5. Tools Pricing</a>
    <a href="#sec-learning-preview" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">6. Learning Prev</a>
    <a href="#sec-cmo-services" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">7. CMO</a>
    <a href="#sec-power-hours" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">8. Power Hours</a>
    <a href="#sec-dynamic-builder" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">9. Custom Builder</a>
    <a href="#sec-about-diagrams" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">10. Diagrams</a>
    <a href="#sec-page-banners" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">11. Banners</a>
    <a href="#sec-solutions-intro" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">12. Solutions Tab Intro</a>
    <a href="#sec-learning-intro" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">13. Learn Tab Intro</a>
    <a href="#sec-tribe-intro" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">14. Core Tribe Intro</a>
    <a href="#sec-cmo-intro" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">15. CMO Intro</a>
    <a href="#sec-news-intro" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">16. News Intro</a>
    <a href="#sec-block-manager" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:4px;">17. Blocks</a>
    <a href="#sec-video-hub" style="font-size:0.75rem; color:#fff; text-decoration:none; background:rgba(201,162,39,0.18); border:1px solid rgba(201,162,39,0.3); padding:4px 8px; border-radius:4px; font-weight:700;">18. Video Hub CMS</a>
  </div>

  <!-- SECTION 1: HERO & BRANDING -->
  <div class="card" id="sec-hero" style="margin-bottom:20px;">
    <div class="card-title"><h3>1. Homepage Hero & Brand Identity</h3><span>LIVE ON FRONTEND</span></div>
    <div class="form-grid">
      <div class="field">
        <label>Brand Logo Image / Icon URL</label>
        <div style="display:flex; gap:6px;">
          <input id="cms-logo" value="${sc['site.logo'] || 'assets/imi-logo.png'}">
          <input type="file" id="cms-logo-file" style="display:none;" onchange="uploadCMSMedia('site.logo', 'cms-logo', 'cms-logo-file')">
          <button class="secondary" onclick="document.getElementById('cms-logo-file').click()">Upload Logo</button>
        </div>
      </div>

      <div class="field">
        <label>Hero Background Banner Image/Video</label>
        <div style="display:flex; gap:6px;">
          <input id="hero-banner" value="${sc['hero.banner_url'] || ''}" placeholder="https://... or upload banner">
          <input type="file" id="hero-banner-file" style="display:none;" onchange="uploadCMSMedia('hero.banner_url', 'hero-banner', 'hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field"><label>Hero Eyebrow Text</label><input id="hero-eyebrow" value="${sc['hero.eyebrow'] || 'I MAKE IMAGE / STRATEGIC BUSINESS ECOSYSTEM'}"></div>
      <div class="field"><label>Hero Headline (Line 1)</label><input id="hero-line1" value="${sc['hero.line1'] || 'Build Your Brand.'}"></div>
      <div class="field"><label>Hero Headline Highlight (Line 2)</label><input id="hero-line2" value="${sc['hero.line2'] || 'Command Your Marketing.'}"></div>
      <div class="field"><label>Hero Headline Tagline (Line 3)</label><input id="hero-line3" value="${sc['hero.line3'] || 'Grow Your Business.'}"></div>

      <div class="field full"><label>Hero Description Paragraph</label><textarea id="hero-description">${sc['hero.description'] || 'Strategic marketing services, practical education and digital tools designed to help entrepreneurs and businesses turn ideas into intentional systems for growth.'}</textarea></div>

      <div class="field"><label>Primary Button Text</label><input id="hero-btn1" value="${sc['hero.btn1'] || 'Work With IMI'}"></div>
      <div class="field"><label>Primary Button Destination URL</label><input id="hero-btn1-url" value="${sc['hero.btn1_url'] || 'pages/solutions.html'}"></div>
      <div class="field"><label>Secondary Button Text</label><input id="hero-btn2" value="${sc['hero.btn2'] || 'Explore The Ecosystem'}"></div>
      <div class="field"><label>Secondary Button Destination URL</label><input id="hero-btn2-url" value="${sc['hero.btn2_url'] || '#ecosystem'}"></div>
    </div>
  </div>

  <!-- SECTION 2: APPROACH / SYSTEM INTRO -->
  <div class="card" id="sec-approach" style="margin-bottom:20px;">
    <div class="card-title"><h3>2. The IMI Approach Section</h3><span>SYSTEM INTRO, MEDIA & CONNECTING PIECES</span></div>
    <div class="form-grid">
      <div class="field"><label>Approach Section Eyebrow</label><input id="approach-label" value="${sc['approach.label'] || 'THE IMI APPROACH'}"></div>
      <div class="field"><label>Heading Line 1</label><input id="approach-line1" value="${sc['approach.line1'] || 'Your business has pieces.'}"></div>
      <div class="field"><label>Heading Highlight (Line 2)</label><input id="approach-line2" value="${sc['approach.line2'] || 'Do you have a system?'}"></div>
      <div class="field">
        <label>Approach Featured Graphic / Media</label>
        <div style="display:flex; gap:6px;">
          <input id="approach-img" value="${sc['approach.media'] || ''}" placeholder="Upload or image/video URL">
          <input type="file" id="approach-file" style="display:none;" onchange="uploadCMSMedia('approach.media', 'approach-img', 'approach-file')">
          <button class="secondary" onclick="document.getElementById('approach-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Paragraph</label><textarea id="approach-desc">${sc['approach.desc'] || 'Your brand. Your offer. Your content. Your marketing. Your customers. Your time. Your systems.'}</textarea></div>
      <div class="field"><label>Conclusion Heading</label><input id="approach-conc-title" value="${sc['approach.conc_title'] || 'IMI CONNECTS THE PIECES.'}"></div>
      <div class="field full"><label>Conclusion Subtext</label><textarea id="approach-conc-desc">${sc['approach.conc_desc'] || 'Strategy, education, technology and implementation working together as one ecosystem.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 3: ECOSYSTEM & FEATURED MEDIA -->
  <div class="card" id="sec-ecosystem" style="margin-bottom:20px;">
    <div class="card-title"><h3>3. Ecosystem Section & Media Cards</h3><span>FRONTEND ECOSYSTEM GRID</span></div>
    <div class="form-grid">
      <div class="field">
        <label>Solo Corp 101 Featured Banner/Image</label>
        <div style="display:flex; gap:6px;">
          <input id="eco-solocorp-img" value="${sc['eco.solocorp_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="eco-solocorp-file" style="display:none;" onchange="uploadCMSMedia('eco.solocorp_media', 'eco-solocorp-img', 'eco-solocorp-file')">
          <button class="secondary" onclick="document.getElementById('eco-solocorp-file').click()">Upload Media</button>
        </div>
      </div>

      <div class="field">
        <label>Core Tribe Featured Banner/Image</label>
        <div style="display:flex; gap:6px;">
          <input id="eco-tribe-img" value="${sc['eco.tribe_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="eco-tribe-file" style="display:none;" onchange="uploadCMSMedia('eco.tribe_media', 'eco-tribe-img', 'eco-tribe-file')">
          <button class="secondary" onclick="document.getElementById('eco-tribe-file').click()">Upload Media</button>
        </div>
      </div>

      <div class="field">
        <label>Branding Blueprint Course Featured Banner/Image</label>
        <div style="display:flex; gap:6px;">
          <input id="eco-blueprint-img" value="${sc['eco.blueprint_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="eco-blueprint-file" style="display:none;" onchange="uploadCMSMedia('eco.blueprint_media', 'eco-blueprint-img', 'eco-blueprint-file')">
          <button class="secondary" onclick="document.getElementById('eco-blueprint-file').click()">Upload Media</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: BUSINESS SOLUTIONS PREVIEW -->
  <div class="card" id="sec-solutions-preview" style="margin-bottom:20px;">
    <div class="card-title"><h3>4. Business Solutions & Features Section</h3><span>SOLUTIONS COPY & MEDIA</span></div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="solutions-label" value="${sc['solutions.label'] || 'IMI BUSINESS SOLUTIONS'}"></div>
      <div class="field"><label>Title Line 1</label><input id="solutions-line1" value="${sc['solutions.line1'] || 'Your business deserves'}"></div>
      <div class="field"><label>Title Line 2 (Highlight)</label><input id="solutions-line2" value="${sc['solutions.line2'] || 'a marketing system.'}"></div>
      <div class="field">
        <label>Solutions Featured Image / Graphic (Never Masked)</label>
        <div style="display:flex; gap:6px;">
          <input id="solutions-img" value="${sc['solutions.media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="solutions-file" style="display:none;" onchange="uploadCMSMedia('solutions.media', 'solutions-img', 'solutions-file')">
          <button class="secondary" onclick="document.getElementById('solutions-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Solutions Description</label><textarea id="solutions-desc">${sc['solutions.desc'] || 'Strategic marketing leadership and practical implementation for entrepreneurs and organizations ready to move from scattered marketing activities to a coordinated growth system.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 5: DIGITAL TOOLS, APPS & BUNDLES PRICING & MEDIA CMS -->
  <div class="card" id="sec-tools-pricing" style="margin-bottom:20px;">
    <div class="card-title"><h3>5. Digital Tools, Apps & Bundles CMS</h3><span>PRODUCT PRICING, MEDIA & LINKS</span></div>
    <div class="form-grid">
      <div class="field"><label>IMI Compass Price</label><input id="tools-compass-price" value="${sc['tools.compass_price'] || '$9.99 ONE-TIME'}"></div>
      <div class="field"><label>IMI Compass Launch Link</label><input id="tools-compass-url" value="${sc['tools.compass_url'] || 'pages/compass.html'}"></div>
      <div class="field">
        <label>IMI Compass App Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="tools-compass-img" value="${sc['tools.compass_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tools-compass-file" style="display:none;" onchange="uploadCMSMedia('tools.compass_media', 'tools-compass-img', 'tools-compass-file')">
          <button class="secondary" onclick="document.getElementById('tools-compass-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field"><label>iM Time Command Price</label><input id="tools-time-price" value="${sc['tools.time_price'] || '$7.99 ONE-TIME'}"></div>
      <div class="field"><label>iM Time Command Launch Link</label><input id="tools-time-url" value="${sc['tools.time_url'] || 'https://im-time-command.vercel.app/'}"></div>
      <div class="field">
        <label>iM Time Command App Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="tools-time-img" value="${sc['tools.time_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tools-time-file" style="display:none;" onchange="uploadCMSMedia('tools.time_media', 'tools-time-img', 'tools-time-file')">
          <button class="secondary" onclick="document.getElementById('tools-time-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field"><label>Commander Bundle Offer Price</label><input id="pricing-bundle" value="${sc['pricing.bundle'] || '$14.99'}"></div>
      <div class="field">
        <label>Commander Bundle Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="pricing-bundle-img" value="${sc['pricing.bundle_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="pricing-bundle-file" style="display:none;" onchange="uploadCMSMedia('pricing.bundle_media', 'pricing-bundle-img', 'pricing-bundle-file')">
          <button class="secondary" onclick="document.getElementById('pricing-bundle-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field"><label>Core Tribe Monthly Price</label><input id="pricing-tribe" value="${sc['pricing.tribe'] || '$5.00/month'}"></div>
      <div class="field">
        <label>Core Tribe Offer Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="pricing-tribe-img" value="${sc['pricing.tribe_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="pricing-tribe-file" style="display:none;" onchange="uploadCMSMedia('pricing.tribe_media', 'pricing-tribe-img', 'pricing-tribe-file')">
          <button class="secondary" onclick="document.getElementById('pricing-tribe-file').click()">Upload Picture</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 6: IMI LEARNING PREVIEW (HOMEPAGE SECTION) -->
  <div class="card" id="sec-learning-preview" style="margin-bottom:20px;">
    <div class="card-title"><h3>6. IMI Learning Preview (Homepage Welcome Page)</h3><span>LEARNING SECTION & 3 CARDS CMS</span></div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="learn-prev-label" value="${sc['learn_prev.label'] || 'IMI LEARNING'}"></div>
      <div class="field"><label>Section Headline</label><input id="learn-prev-h1" value="${sc['learn_prev.h1'] || 'Learn it. Apply it. Build it.'}"></div>
      <div class="field"><label>Section Subtitle</label><input id="learn-prev-sub" value="${sc['learn_prev.sub'] || 'Knowledge should lead to action.'}"></div>
      <div class="field">
        <label>Learning Preview Featured Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-prev-img" value="${sc['learn_prev.media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-prev-file" style="display:none;" onchange="uploadCMSMedia('learn_prev.media', 'learn-prev-img', 'learn-prev-file')">
          <button class="secondary" onclick="document.getElementById('learn-prev-file').click()">Upload Picture</button>
        </div>
      </div>

      <!-- Card 1: Courses -->
      <div class="field"><label>Card 1 (Courses) Title</label><input id="learn-prev-c1-title" value="${sc['learn_prev.c1_title'] || 'COURSES'}"></div>
      <div class="field"><label>Card 1 Description</label><input id="learn-prev-c1-desc" value="${sc['learn_prev.c1_desc'] || 'Structured programs built around practical outcomes.'}"></div>
      <div class="field"><label>Card 1 Destination Link</label><input id="learn-prev-c1-link" value="${sc['learn_prev.c1_link'] || 'pages/learning.html'}"></div>
      <div class="field">
        <label>Card 1 Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-prev-c1-img" value="${sc['learn_prev.c1_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-prev-c1-file" style="display:none;" onchange="uploadCMSMedia('learn_prev.c1_media', 'learn-prev-c1-img', 'learn-prev-c1-file')">
          <button class="secondary" onclick="document.getElementById('learn-prev-c1-file').click()">Upload Picture</button>
        </div>
      </div>

      <!-- Card 2: Workshops -->
      <div class="field"><label>Card 2 (Workshops) Title</label><input id="learn-prev-c2-title" value="${sc['learn_prev.c2_title'] || 'WORKSHOPS'}"></div>
      <div class="field"><label>Card 2 Description</label><input id="learn-prev-c2-desc" value="${sc['learn_prev.c2_desc'] || 'Focused learning and implementation sessions.'}"></div>
      <div class="field"><label>Card 2 Destination Link</label><input id="learn-prev-c2-link" value="${sc['learn_prev.c2_link'] || 'pages/power-hours.html'}"></div>
      <div class="field">
        <label>Card 2 Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-prev-c2-img" value="${sc['learn_prev.c2_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-prev-c2-file" style="display:none;" onchange="uploadCMSMedia('learn_prev.c2_media', 'learn-prev-c2-img', 'learn-prev-c2-file')">
          <button class="secondary" onclick="document.getElementById('learn-prev-c2-file').click()">Upload Picture</button>
        </div>
      </div>

      <!-- Card 3: Resources -->
      <div class="field"><label>Card 3 (Resources) Title</label><input id="learn-prev-c3-title" value="${sc['learn_prev.c3_title'] || 'RESOURCES'}"></div>
      <div class="field"><label>Card 3 Description</label><input id="learn-prev-c3-desc" value="${sc['learn_prev.c3_desc'] || 'Guides, documents, assessments and practical tools.'}"></div>
      <div class="field"><label>Card 3 Destination Link</label><input id="learn-prev-c3-link" value="${sc['learn_prev.c3_link'] || 'pages/resources.html'}"></div>
      <div class="field">
        <label>Card 3 Picture</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-prev-c3-img" value="${sc['learn_prev.c3_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-prev-c3-file" style="display:none;" onchange="uploadCMSMedia('learn_prev.c3_media', 'learn-prev-c3-img', 'learn-prev-c3-file')">
          <button class="secondary" onclick="document.getElementById('learn-prev-c3-file').click()">Upload Picture</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 7: CMO SERVICES CMS -->
  <div class="card" id="sec-cmo-services" style="margin-bottom:20px;">
    <div class="card-title"><h3>7. Fractional CMO Services CMS</h3><span>STRATEGIC LEADERSHIP COPY & MEDIA</span></div>
    <div class="form-grid">
      <div class="field"><label>CMO Header Eyebrow</label><input id="cmo-eyebrow" value="${sc['cmo.eyebrow'] || 'FRACTIONAL CMO & STRATEGIC LEADERSHIP'}"></div>
      <div class="field"><label>CMO Headline (H1)</label><input id="cmo-h1" value="${sc['cmo.h1'] || 'Strategic Marketing Leadership For Growing Businesses'}"></div>
      <div class="field">
        <label>Fractional CMO Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="cmo-img" value="${sc['cmo.media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="cmo-file" style="display:none;" onchange="uploadCMSMedia('cmo.media', 'cmo-img', 'cmo-file')">
          <button class="secondary" onclick="document.getElementById('cmo-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field"><label>CMO Action CTA Text</label><input id="cmo-cta-text" value="${sc['cmo.cta_text'] || 'Book Executive CMO Consultation →'}"></div>
      <div class="field"><label>CMO Action CTA Link</label><input id="cmo-cta-url" value="${sc['cmo.cta_url'] || 'pages/booking.html'}"></div>
      <div class="field full"><label>CMO Subtitle Description</label><textarea id="cmo-desc">${sc['cmo.desc'] || 'Gain executive marketing strategy, brand positioning, and AI-driven growth systems without the cost of a full-time in-house CMO.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 8: POWER HOURS & WORKSHOPS CMS -->
  <div class="card" id="sec-power-hours" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>8. Power Hours &amp; Workshop Features CMS</h3>
      <a href="power-hours.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE WORKSHOPS PAGE &rarr;</a>
    </div>
    
    <div style="margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08);">
      <h4 style="color:var(--gold); font-size:0.9rem; margin-bottom:4px;"><i class="fa-solid fa-bolt" style="margin-right:6px;"></i>FLAGSHIP IMI INTENSIVE WORKSHOP (FEATURES BLOCK)</h4>
      <p style="font-size:0.8rem; color:var(--muted); margin:0;">Full control over the flagship sprint spotlight block on Power Hours and Learning Center pages.</p>
    </div>

    <div class="form-grid">
      <div class="field"><label>Intensive Eyebrow Tag</label><input id="workshop-intensive-eyebrow" value="${sc['workshop.intensive_eyebrow'] || '⚡ FLAGSHIP 3-DAY SPRINT'}"></div>
      <div class="field"><label>Intensive Headline Title</label><input id="workshop-intensive-title" value="${sc['workshop.intensive_title'] || 'IMI Intensive Workshop'}"></div>
      
      <div class="field">
        <label>Intensive Featured Picture / Cover</label>
        <div style="display:flex; gap:6px;">
          <input id="workshop-intensive-img" value="${sc['workshop.intensive_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="workshop-intensive-file" style="display:none;" onchange="uploadCMSMedia('workshop.intensive_media', 'workshop-intensive-img', 'workshop-intensive-file')">
          <button class="secondary" onclick="document.getElementById('workshop-intensive-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field"><label>Action Button Text</label><input id="workshop-intensive-btn-text" value="${sc['workshop.intensive_btn_text'] || 'Book the Intensive →'}"></div>
      <div class="field"><label>Action Destination Link</label><input id="workshop-intensive-btn-url" value="${sc['workshop.intensive_btn_url'] || 'pages/booking.html'}"></div>
      
      <div class="field"><label>Price / Rate Display</label><input id="workshop-intensive-price" value="${sc['workshop.intensive_price'] || '$25'}"></div>
      <div class="field"><label>Price Unit</label><input id="workshop-intensive-price-unit" value="${sc['workshop.intensive_price_unit'] || ' / HR'}"></div>
      <div class="field"><label>Duration Badge</label><input id="workshop-intensive-duration" value="${sc['workshop.intensive_duration'] || 'UP TO 72 HOURS'}"></div>
      <div class="field"><label>Subnote / Guarantee Note</label><input id="workshop-intensive-subnote" value="${sc['workshop.intensive_subnote'] || 'From Idea to Deployed Asset In Hours, Not Months.'}"></div>

      <div class="field full"><label>Intensive Description Paragraph</label><textarea id="workshop-intensive-desc">${sc['workshop.intensive_desc'] || 'Our most powerful offering. 8-hour shifts, direct execution, full deployment from concept to live asset. Used for full business system builds, website deployments, and complete marketing infrastructure.'}</textarea></div>
      
      <div class="field full">
        <label>Feature Bullet Points (One per line)</label>
        <textarea id="workshop-intensive-features" rows="5" placeholder="Enter one feature point per line...">${sc['workshop.intensive_features'] || 'Priority execution from Day 1\nDeep build support throughout\nFull asset deployment & handoff\nFinal scope confirmed before session\n8-hour shift structure for maximum output'}</textarea>
      </div>
    </div>

    <div style="margin:24px 0 15px; padding:15px 0 10px; border-top:1px solid rgba(255,255,255,0.08); border-bottom:1px solid rgba(255,255,255,0.08);">
      <h4 style="color:var(--gold); font-size:0.9rem; margin-bottom:4px;"><i class="fa-solid fa-clock" style="margin-right:6px;"></i>POWER HOURS &amp; WEBINARS OFFERINGS</h4>
    </div>

    <div class="form-grid">
      <div class="field"><label>Power Hour Headline</label><input id="power-h1" value="${sc['power.h1'] || 'Strategic Power Hour Intensive Session'}"></div>
      <div class="field"><label>Power Hour Rate / Pricing</label><input id="power-price" value="${sc['power.price'] || '$299 ONE-TIME'}"></div>
      <div class="field"><label>Power Hour Booking Link</label><input id="power-url" value="${sc['power.url'] || 'pages/booking.html'}"></div>
      <div class="field">
        <label>Power Hours Featured Picture / Cover</label>
        <div style="display:flex; gap:6px;">
          <input id="power-img" value="${sc['power.media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="power-file" style="display:none;" onchange="uploadCMSMedia('power.media', 'power-img', 'power-file')">
          <button class="secondary" onclick="document.getElementById('power-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Power Hours Description</label><textarea id="power-desc">${sc['power.desc'] || 'A 60-minute intensive 1-on-1 strategy work session with executive guidance to unpack, design, and solve marketing bottlenecks.'}</textarea></div>

      <div class="field"><label>Webinar Headline</label><input id="webinar-h1" value="${sc['webinar.h1'] || 'The 4-Part Brand System Framework'}"></div>
      <div class="field"><label>Webinar Registration Link</label><input id="webinar-link" value="${sc['webinar.link'] || 'pages/booking.html'}"></div>
      <div class="field">
        <label>Webinar Featured Picture / Cover</label>
        <div style="display:flex; gap:6px;">
          <input id="webinar-img" value="${sc['webinar.media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="webinar-file" style="display:none;" onchange="uploadCMSMedia('webinar.media', 'webinar-img', 'webinar-file')">
          <button class="secondary" onclick="document.getElementById('webinar-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Webinar Description</label><textarea id="webinar-desc">${sc['webinar.desc'] || 'Live masterclass on positioning, lead infrastructure, AI workflows, and strategic brand equity.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 9: DYNAMIC SECTION BUILDER -->
  <div class="card" id="sec-dynamic-builder" style="margin-bottom:20px;">
    <div class="card-title"><h3>9. Dynamic Custom Section Builder</h3><span>ADD NEW SECTIONS WITH PICTURES TO ANY PAGE</span></div>
    <p style="font-size:0.85rem; color:var(--muted); margin-bottom:15px;">Create and publish new custom content sections with full pictures/videos and rich Word-style text editors dynamically.</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('home', 'Homepage')">＋ Add Block to Homepage</button>
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('solutions', 'Solutions Page')">＋ Add Block to Solutions</button>
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('cmo', 'CMO Services')">＋ Add Section to CMO Services</button>
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('learn', 'Learning Center')">＋ Add Section to Learning</button>
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('power', 'Power Hours')">＋ Add Section to Power Hours</button>
      <button class="secondary" type="button" onclick="openAddCustomBlockModal('webinars', 'Webinars')">＋ Add Section to Webinars</button>
    </div>
  </div>

  <!-- SECTION 10: ABOUT PAGE & SOLUTIONS DIAGRAMS MEDIA CMS -->
  <div class="card" id="sec-about-diagrams" style="margin-bottom:20px;">
    <div class="card-title"><h3>10. About Page & Solutions Diagram Pictures</h3><span>FOUNDER & FRAMEWORK MEDIA</span></div>
    <div class="form-grid">
      <div class="field">
        <label>Team / Founder Picture (About Page)</label>
        <div style="display:flex; gap:6px;">
          <input id="about-founder-img" value="${sc['about.founder_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="about-founder-file" style="display:none;" onchange="uploadCMSMedia('about.founder_media', 'about-founder-img', 'about-founder-file')">
          <button class="secondary" onclick="document.getElementById('about-founder-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field">
        <label>CMO Strategy Diagram Image (Solutions Page)</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-cmo-img" value="${sc['solutions.cmo_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-cmo-file" style="display:none;" onchange="uploadCMSMedia('solutions.cmo_media', 'sol-cmo-img', 'sol-cmo-file')">
          <button class="secondary" onclick="document.getElementById('sol-cmo-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field">
        <label>Infrastructure Blueprint Image (Solutions Page)</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-infra-img" value="${sc['solutions.infra_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-infra-file" style="display:none;" onchange="uploadCMSMedia('solutions.infra_media', 'sol-infra-img', 'sol-infra-file')">
          <button class="secondary" onclick="document.getElementById('sol-infra-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field">
        <label>Targeted Consulting Diagram Image (Solutions Page)</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-consulting-img" value="${sc['solutions.consulting_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-consulting-file" style="display:none;" onchange="uploadCMSMedia('solutions.consulting_media', 'sol-consulting-img', 'sol-consulting-file')">
          <button class="secondary" onclick="document.getElementById('sol-consulting-file').click()">Upload Picture</button>
        </div>
      </div>

      <div class="field">
        <label>Campaign Execution Pipeline Image (Solutions Page)</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-campaign-img" value="${sc['solutions.campaign_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-campaign-file" style="display:none;" onchange="uploadCMSMedia('solutions.campaign_media', 'sol-campaign-img', 'sol-campaign-file')">
          <button class="secondary" onclick="document.getElementById('sol-campaign-file').click()">Upload Picture</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 11: TAB HERO BANNERS & MEDIA FOR ALL PUBLIC PAGES -->
  <div class="card" id="sec-page-banners" style="margin-bottom:20px;">
    <div class="card-title"><h3>11. Hero Banners For All Public Tabs</h3><span>PAGE-SPECIFIC HERO BACKGROUNDS</span></div>
    <p style="font-size:0.85rem; color:var(--muted); margin-bottom:15px;">Upload or paste background banner image URLs for every public tab hero section across the site.</p>
    <div class="form-grid">
      <div class="field">
        <label>Solutions Page Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-hero-banner" value="${sc['solutions.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('solutions.banner_url', 'sol-hero-banner', 'sol-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('sol-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>CMO Services Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="cmo-hero-banner" value="${sc['cmo.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="cmo-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('cmo.banner_url', 'cmo-hero-banner', 'cmo-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('cmo-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Learning Center Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-hero-banner" value="${sc['learn.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('learn.banner_url', 'learn-hero-banner', 'learn-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('learn-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Power Hour Workshops Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="workshop-hero-banner" value="${sc['workshop.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="workshop-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('workshop.banner_url', 'workshop-hero-banner', 'workshop-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('workshop-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Tools Engine Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="tools-hero-banner" value="${sc['tools.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tools-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('tools.banner_url', 'tools-hero-banner', 'tools-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('tools-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Solo Corp 101 Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="solocorp-hero-banner" value="${sc['solocorp.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="solocorp-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('solocorp.banner_url', 'solocorp-hero-banner', 'solocorp-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('solocorp-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Core Tribe Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="tribe-hero-banner" value="${sc['tribe.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tribe-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('tribe.banner_url', 'tribe-hero-banner', 'tribe-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('tribe-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>About IMI Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="about-hero-banner" value="${sc['about.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="about-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('about.banner_url', 'about-hero-banner', 'about-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('about-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>

      <div class="field">
        <label>Booking Engine Hero Banner</label>
        <div style="display:flex; gap:6px;">
          <input id="booking-hero-banner" value="${sc['booking.banner_url'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="booking-hero-banner-file" style="display:none;" onchange="uploadCMSMedia('booking.banner_url', 'booking-hero-banner', 'booking-hero-banner-file')">
          <button class="secondary" onclick="document.getElementById('booking-hero-banner-file').click()">Upload Banner</button>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 12: SOLUTIONS / SERVICES PAGE INTRO (FIRST SECTION UNDER BANNER) -->
  <div class="card" id="sec-solutions-intro" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>12. Business Solutions Page Intro (First Section Under Banner)</h3>
      <a href="solutions.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE PAGE →</a>
    </div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="sol-intro-eyebrow" value="${sc['solutions.intro_eyebrow'] || 'STRATEGIC LEADERSHIP & SYSTEMS'}"></div>
      <div class="field"><label>Headline Line 1</label><input id="sol-intro-h2-1" value="${sc['solutions.intro_h2_1'] || 'WHEN YOU NEED'}"></div>
      <div class="field"><label>Headline Highlight (Line 2)</label><input id="sol-intro-h2-2" value="${sc['solutions.intro_h2_2'] || 'MORE THAN A TOOL.'}"></div>
      <div class="field">
        <label>Solutions Page Intro Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="sol-intro-img" value="${sc['solutions.intro_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="sol-intro-file" style="display:none;" onchange="uploadCMSMedia('solutions.intro_media', 'sol-intro-img', 'sol-intro-file')">
          <button class="secondary" onclick="document.getElementById('sol-intro-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Description Paragraph</label><textarea id="sol-intro-desc">${sc['solutions.intro_desc'] || 'Technology can help you organize the work. Strategic guidance helps you determine what work matters.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 13: LEARNING CENTER PAGE INTRO (FIRST SECTION UNDER BANNER) -->
  <div class="card" id="sec-learning-intro" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>13. Learning Center Page Intro (First Section Under Banner)</h3>
      <a href="learning.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE PAGE →</a>
    </div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="learn-intro-eyebrow" value="${sc['learn.intro_eyebrow'] || 'STRUCTURED EDUCATION & ACTION'}"></div>
      <div class="field"><label>Headline Line 1</label><input id="learn-intro-h2-1" value="${sc['learn.intro_h2_1'] || 'MASTER THE SYSTEM.'}"></div>
      <div class="field"><label>Headline Highlight (Line 2)</label><input id="learn-intro-h2-2" value="${sc['learn.intro_h2_2'] || 'EXECUTE THE STRATEGY.'}"></div>
      <div class="field">
        <label>Learning Center Intro Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="learn-intro-img" value="${sc['learn.intro_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="learn-intro-file" style="display:none;" onchange="uploadCMSMedia('learn.intro_media', 'learn-intro-img', 'learn-intro-file')">
          <button class="secondary" onclick="document.getElementById('learn-intro-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Description Paragraph</label><textarea id="learn-intro-desc">${sc['learn.intro_desc'] || 'Explore our structured curriculum, high-impact workshops, and practical resources designed for direct implementation.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 14: CORE TRIBE FIRST SECTION (MEMBERSHIP & WHAT YOU UNLOCK) -->
  <div class="card" id="sec-tribe-intro" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>14. Core Tribe First Section (Membership & Path In)</h3>
      <a href="core-tribe.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE PAGE →</a>
    </div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="tribe-intro-eyebrow" value="${sc['tribe.intro_eyebrow'] || 'MEMBERSHIP OPTIONS'}"></div>
      <div class="field"><label>Headline Line 1</label><input id="tribe-intro-h2-1" value="${sc['tribe.intro_h2_1'] || 'Choose Your'}"></div>
      <div class="field"><label>Headline Highlight (Line 2)</label><input id="tribe-intro-h2-2" value="${sc['tribe.intro_h2_2'] || 'Path In'}"></div>
      <div class="field">
        <label>Core Tribe First Section Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="tribe-intro-img" value="${sc['tribe.intro_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tribe-intro-file" style="display:none;" onchange="uploadCMSMedia('tribe.intro_media', 'tribe-intro-img', 'tribe-intro-file')">
          <button class="secondary" onclick="document.getElementById('tribe-intro-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Description Paragraph</label><textarea id="tribe-intro-desc">${sc['tribe.intro_desc'] || 'Start where you are. Every tier is designed to give you exactly what you need at your current stage.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 15: FRACTIONAL CMO PAGE INTRO (FIRST SECTION UNDER BANNER) -->
  <div class="card" id="sec-cmo-intro" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>15. Fractional CMO Page Intro (First Section Under Banner)</h3>
      <a href="cmo-services.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE PAGE &rarr;</a>
    </div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="cmo-intro-eyebrow" value="${sc['cmo.intro_eyebrow'] || 'FRACTIONAL CMO LEADERSHIP'}"></div>
      <div class="field"><label>Headline Line 1</label><input id="cmo-intro-h2-1" value="${sc['cmo.intro_h2_1'] || 'Executive Strategy.'}"></div>
      <div class="field"><label>Headline Highlight (Line 2)</label><input id="cmo-intro-h2-2" value="${sc['cmo.intro_h2_2'] || 'Coordinated Growth.'}"></div>
      <div class="field">
        <label>CMO Intro Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="cmo-intro-img" value="${sc['cmo.intro_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="cmo-intro-file" style="display:none;" onchange="uploadCMSMedia('cmo.intro_media', 'cmo-intro-img', 'cmo-intro-file')">
          <button class="secondary" onclick="document.getElementById('cmo-intro-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Description Paragraph</label><textarea id="cmo-intro-desc">${sc['cmo.intro_desc'] || 'Gain high-level marketing direction and execution architecture to turn scattered activities into a predictable revenue system.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 16: NEWS CENTRE PAGE INTRO (FIRST SECTION UNDER BANNER) -->
  <div class="card" id="sec-news-intro" style="margin-bottom:20px;">
    <div class="card-title">
      <h3>16. News Centre Page Intro (First Section Under Banner)</h3>
      <a href="news.html" target="_blank" style="color:var(--gold); font-size:0.75rem; text-decoration:none; font-family:var(--font-mono);">VIEW LIVE PAGE &rarr;</a>
    </div>
    <div class="form-grid">
      <div class="field"><label>Section Eyebrow</label><input id="news-intro-eyebrow" value="${sc['news.intro_eyebrow'] || 'INTELLIGENCE &amp; DISPATCH'}"></div>
      <div class="field"><label>Headline Line 1</label><input id="news-intro-h2-1" value="${sc['news.intro_h2_1'] || 'Stay Informed.'}"></div>
      <div class="field"><label>Headline Highlight (Line 2)</label><input id="news-intro-h2-2" value="${sc['news.intro_h2_2'] || 'Stay Ahead.'}"></div>
      <div class="field">
        <label>News Centre Intro Featured Picture / Graphic</label>
        <div style="display:flex; gap:6px;">
          <input id="news-intro-img" value="${sc['news.intro_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="news-intro-file" style="display:none;" onchange="uploadCMSMedia('news.intro_media', 'news-intro-img', 'news-intro-file')">
          <button class="secondary" onclick="document.getElementById('news-intro-file').click()">Upload Picture</button>
        </div>
      </div>
      <div class="field full"><label>Intro Description Paragraph</label><textarea id="news-intro-desc">${sc['news.intro_desc'] || 'Our Market Intelligence dispatches deliver actionable strategy insights on brand, marketing systems, and ecosystem growth.'}</textarea></div>
    </div>
  </div>

  <!-- SECTION 17: DYNAMIC CONTENT BLOCK MANAGER (ALL SECTIONS) -->
  <div class="card" id="sec-block-manager" style="margin-bottom:20px;">
    <div class="card-title"><h3>17. Dynamic Feature Block Manager</h3><span>MAINTAIN CUSTOM SECTIONS PER TAB</span></div>
    <p style="font-size:0.85rem; color:var(--muted); margin-bottom:15px;">Create, edit, and maintain custom feature blocks for every page section. All blocks support Eyebrows, Titles, Descriptions, Action CTA Buttons, and direct Picture/Video/Sound Media Uploads.</p>

    ${renderSectionBlockManager('home', 'Homepage (Welcome Page)')}
    ${renderSectionBlockManager('solutions', 'Solutions Page')}
    ${renderSectionBlockManager('cmo', 'CMO Services Page')}
    ${renderSectionBlockManager('learn', 'Learning Center Page')}
    ${renderSectionBlockManager('workshop', 'Power Hour Workshops Page')}
    ${renderSectionBlockManager('tools', 'Tools Engine Page')}
    ${renderSectionBlockManager('solocorp', 'Solo Corp 101 Page')}
    ${renderSectionBlockManager('tribe', 'Core Tribe Page')}
    ${renderSectionBlockManager('about', 'About IMI Page')}
    ${renderSectionBlockManager('news', 'News Centre Page')}
    ${renderSectionBlockManager('booking', 'Booking Engine Page')}
  </div>
 
   <!-- SECTION 18: VIDEO HUB & CHANNEL INTEGRATIONS -->
   <div class="card" id="sec-video-hub" style="margin-bottom:20px;">
     <div class="card-title">
       <h3>18. Member Portal Video Hub &amp; Channel Integrations</h3>
       <span>PORTAL &amp; PUBLIC INTEGRATION</span>
     </div>
     <p style="font-size:0.85rem; color:var(--muted); margin-bottom:15px;">
       Manage official YouTube channel link, Patreon classroom community link, featured masterclass playlist or video embed, and video card descriptions displayed in the Member Portal Video Hub.
     </p>
     <div class="form-grid">
       <div class="field">
         <label>Official YouTube Channel URL</label>
         <input id="video-yt-channel-url" value="${sc['video.yt_channel_url'] || sc['comm.youtube_url'] || 'https://www.youtube.com/@imakeimage'}" placeholder="https://www.youtube.com/@imakeimage">
       </div>
       <div class="field">
         <label>Patreon Classroom Community URL</label>
         <input id="video-patreon-url" value="${sc['video.patreon_url'] || sc['comm.patreon_url'] || 'https://www.patreon.com/c/IMICREATIVELABCLASSROOM'}" placeholder="https://www.patreon.com/c/IMICREATIVELABCLASSROOM">
       </div>
       <div class="field full">
         <label>Featured Masterclass Embed URL (YouTube embed or playlist link)</label>
         <input id="video-playlist-embed-url" value="${sc['video.playlist_embed_url'] || sc['video_hub.featured_url'] || 'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOdP_8GztsuKi907NjQExTt0'}" placeholder="https://www.youtube-nocookie.com/embed/...">
         <span style="font-size:11px; color:var(--muted); margin-top:4px; display:block;">Use a YouTube embed link like <code>https://www.youtube-nocookie.com/embed/VIDEO_ID</code> or <code>https://www.youtube-nocookie.com/embed/videoseries?list=PLAYLIST_ID</code></span>
       </div>
       <div class="field">
         <label>Featured Video Title</label>
         <input id="video-featured-title" value="${sc['video.featured_title'] || 'IMI Executive Strategy & Operating Frameworks'}" placeholder="Featured Masterclass Title">
       </div>
       <div class="field">
         <label>Stream Quality / Badge Text</label>
         <input id="video-badge" value="${sc['video.badge'] || 'HD 1080p Stream'}" placeholder="e.g. HD 1080p Stream or EXCLUSIVE MASTERCLASS">
       </div>
       <div class="field full">
         <label>Featured Video Description Body</label>
         <textarea id="video-featured-desc" placeholder="Summary of the featured masterclass or playlist...">${sc['video.featured_desc'] || 'Core operating methodology for modern solo corporations, brand architecture, and systematic marketing rhythm.'}</textarea>
       </div>
       <div class="field full">
         <label>Video Hub Subtitle / Introductory Note</label>
         <textarea id="video-sub-heading" placeholder="Subtitle for the Video Hub panel...">${sc['video.sub_heading'] || 'Stream strategy masterclasses, framework primers, and connect with our official YouTube & Patreon channels.'}</textarea>
       </div>
     </div>
   </div>
 
   <button class="primary" data-action="Save Website" style="width:100%; padding:14px; font-size:13px;">Save & Publish All Website Copy, Media & Pricing</button>
   `);
 }

// ── Video Hub & Channel CMS View ──────────────────────────────────────────
function videohub() {
  const sc = state.data.siteContent || {};
  const ytChannel  = sc['video.yt_channel_url'] || sc['comm.youtube_url'] || 'https://www.youtube.com/@imakeimage';
  const patreon    = sc['video.patreon_url']     || sc['comm.patreon_url'] || 'https://www.patreon.com/c/IMICREATIVELABCLASSROOM';
  const embedUrl   = sc['video.playlist_embed_url'] || sc['video_hub.featured_url'] || 'https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOdP_8GztsuKi907NjQExTt0';
  const featTitle  = sc['video.featured_title']  || 'IMI Executive Strategy & Operating Frameworks';
  const featBadge  = sc['video.badge']           || 'HD 1080p Stream';
  const featDesc   = sc['video.featured_desc']   || 'Core operating methodology for modern solo corporations, brand architecture, and systematic marketing rhythm.';
  const subHeading = sc['video.sub_heading']     || 'Stream strategy masterclasses, framework primers, and connect with our official YouTube & Patreon channels.';

  const ytOk      = ytChannel.includes('youtube.com') || ytChannel.includes('youtu.be');
  const patreonOk = patreon.includes('patreon.com');
  const embedOk   = embedUrl.includes('youtube') || embedUrl.includes('youtu');

  return page('Video Hub & Media CMS', 'Manage official channels, streaming masterclasses, YouTube playlists, and member portal video features.', 'Save Video Hub', `

    <!-- Status Row -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:24px;">
      <div style="background:#0b0d10; border:1px solid var(--line); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:22px;">${ytOk ? '✅' : '⚠️'}</div>
        <div style="font-size:11px; font-weight:700; color:var(--gold); margin-top:4px; font-family:var(--font-heading); text-transform:uppercase;">YouTube Channel</div>
        <div style="font-size:10px; color:var(--muted); margin-top:3px;">${ytOk ? 'URL configured' : 'No URL set'}</div>
      </div>
      <div style="background:#0b0d10; border:1px solid var(--line); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:22px;">${patreonOk ? '✅' : '⚠️'}</div>
        <div style="font-size:11px; font-weight:700; color:var(--gold); margin-top:4px; font-family:var(--font-heading); text-transform:uppercase;">Patreon Channel</div>
        <div style="font-size:10px; color:var(--muted); margin-top:3px;">${patreonOk ? 'URL configured' : 'No URL set'}</div>
      </div>
      <div style="background:#0b0d10; border:1px solid var(--line); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:22px;">${embedOk ? '✅' : '⚠️'}</div>
        <div style="font-size:11px; font-weight:700; color:var(--gold); margin-top:4px; font-family:var(--font-heading); text-transform:uppercase;">Portal Stream</div>
        <div style="font-size:10px; color:var(--muted); margin-top:3px;">${embedOk ? 'Embed active' : 'No embed set'}</div>
      </div>
    </div>

    <!-- Channel Destinations -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div class="card-title">📡 Channel Destinations</div>
          <div class="card-sub">Official external channel URLs shown in the member portal</div>
        </div>
      </div>
      <div class="form-grid">
        <div class="field full">
          <label>YouTube Channel URL</label>
          <div style="display:flex; gap:8px;">
            <input id="video-yt-channel-url" value="${ytChannel}" placeholder="https://www.youtube.com/@yourhandle" style="flex:1;">
            <a href="${ytChannel}" target="_blank" style="background:var(--gold); color:#000; padding:0 14px; border-radius:6px; font-size:11px; font-weight:700; display:flex; align-items:center; text-decoration:none; white-space:nowrap;">↗ Test</a>
          </div>
        </div>
        <div class="field full">
          <label>Patreon Channel URL</label>
          <div style="display:flex; gap:8px;">
            <input id="video-patreon-url" value="${patreon}" placeholder="https://www.patreon.com/c/yourpage" style="flex:1;">
            <a href="${patreon}" target="_blank" style="background:#ff424d; color:#fff; padding:0 14px; border-radius:6px; font-size:11px; font-weight:700; display:flex; align-items:center; text-decoration:none; white-space:nowrap;">↗ Test</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Masterclass Player -->
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header">
        <div class="card-title">🎬 Featured Masterclass Player</div>
        <div class="card-sub">Controls the embedded video shown in the member portal Video Hub tab</div>
      </div>
      <div class="form-grid">
        <div class="field full">
          <label>Embed URL (YouTube playlist or single video)</label>
          <div style="display:flex; gap:8px;">
            <input id="video-playlist-embed-url" value="${embedUrl}" placeholder="https://www.youtube-nocookie.com/embed/..." style="flex:1;" oninput="window.updateVideoPreview(this.value)">
            <button type="button" onclick="window.updateVideoPreview(document.getElementById('video-playlist-embed-url').value)" style="background:var(--gold); color:#000; padding:0 14px; border-radius:6px; font-size:11px; font-weight:700; border:none; cursor:pointer; white-space:nowrap;">▶ Preview</button>
          </div>
        </div>
        <div class="field full">
          <label>Quick Presets</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="window.setVideoPreset('https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOdP_8GztsuKi907NjQExTt0','IMI Executive Strategy & Operating Frameworks')" style="background:#0b0d10; border:1px solid var(--gold); color:var(--gold); padding:6px 12px; border-radius:5px; font-size:10px; cursor:pointer;">Strategy Playlist</button>
            <button type="button" onclick="window.setVideoPreset('https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiL9ySfbIXDJR8cBhW1Lp','Brand Architecture Masterclass')" style="background:#0b0d10; border:1px solid var(--gold); color:var(--gold); padding:6px 12px; border-radius:5px; font-size:10px; cursor:pointer;">Brand Architecture</button>
            <button type="button" onclick="window.setVideoPreset('https://www.youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOfDvPbzm7-C-1Ssk83y9xkN','Solo Corp Frameworks')" style="background:#0b0d10; border:1px solid var(--gold); color:var(--gold); padding:6px 12px; border-radius:5px; font-size:10px; cursor:pointer;">Solo Corp Frameworks</button>
          </div>
        </div>
        <div class="field">
          <label>Featured Video Title</label>
          <input id="video-featured-title" value="${featTitle}" placeholder="Masterclass or playlist title">
        </div>
        <div class="field">
          <label>Quality / Status Badge</label>
          <input id="video-badge" value="${featBadge}" placeholder="e.g. HD 1080p Stream">
        </div>
        <div class="field full">
          <label>Featured Video Description</label>
          <textarea id="video-featured-desc" placeholder="Summary of the featured masterclass or playlist...">${featDesc}</textarea>
        </div>
        <div class="field full">
          <label>Video Hub Subtitle / Introductory Note</label>
          <textarea id="video-sub-heading" placeholder="Subtitle shown at the top of the Video Hub panel...">${subHeading}</textarea>
        </div>
      </div>

      <!-- Live Preview iframe -->
      <div style="margin-top:16px; border-radius:8px; overflow:hidden; background:#000; position:relative; padding-top:56.25%;">
        <iframe id="video-preview-iframe"
          src="${embedUrl}"
          style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          title="Video Hub Preview"></iframe>
      </div>
    </div>

    <!-- Save Button -->
    <button type="button" onclick="window.saveVideoHubCMS()" class="primary" style="width:100%; padding:14px; font-size:13px; margin-top:4px;">
      💾 Save & Publish Video Hub Settings
    </button>
  `);
}

// ── Video Hub Helper Functions ────────────────────────────────────────────
window.setVideoPreset = function(url, title) {
  const embedInput = document.getElementById('video-playlist-embed-url');
  const titleInput = document.getElementById('video-featured-title');
  if (embedInput) embedInput.value = url;
  if (titleInput) titleInput.value = title;
  window.updateVideoPreview(url);
};

window.updateVideoPreview = function(url) {
  const iframe = document.getElementById('video-preview-iframe');
  if (iframe && url) iframe.src = url;
};

window.saveVideoHubCMS = async function() {
  const fields = {
    'video.yt_channel_url':      document.getElementById('video-yt-channel-url')?.value?.trim(),
    'comm.youtube_url':          document.getElementById('video-yt-channel-url')?.value?.trim(),
    'video.patreon_url':         document.getElementById('video-patreon-url')?.value?.trim(),
    'comm.patreon_url':          document.getElementById('video-patreon-url')?.value?.trim(),
    'video.playlist_embed_url':  document.getElementById('video-playlist-embed-url')?.value?.trim(),
    'video_hub.featured_url':    document.getElementById('video-playlist-embed-url')?.value?.trim(),
    'video.featured_title':      document.getElementById('video-featured-title')?.value?.trim(),
    'video.featured_desc':       document.getElementById('video-featured-desc')?.value?.trim(),
    'video.badge':               document.getElementById('video-badge')?.value?.trim(),
    'video.sub_heading':         document.getElementById('video-sub-heading')?.value?.trim()
  };

  let saved = 0;
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) {
      await IMI_AUTH.saveSiteContent(k, v);
      localStorage.setItem('imi_' + k.replace('.', '_'), v);
      saved++;
    }
  }

  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Video Hub settings saved & published (' + saved + ' fields updated)!', 'success');
  await render();
};


function renderSectionBlockManager(pageKey, label) {
  const sc = state.data.siteContent || {};
  const blockKeys = Object.keys(sc).filter(k => k.startsWith(`custom_section.${pageKey}.`));

  const blocksHtml = blockKeys.map(k => {
    let block = {};
    try { block = typeof sc[k] === 'string' ? JSON.parse(sc[k]) : sc[k]; } catch(e) {}
    const safeId = k.replace(/[^a-zA-Z0-9]/g, '_');

    return `
    <div style="background:#0b0d10; border:1px solid var(--line); border-radius:8px; padding:16px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:11px; font-weight:700; color:var(--gold); font-family:var(--font-heading); text-transform:uppercase;">BLOCK ID: ${k.split('.').pop()}</span>
        <button onclick="deleteCustomBlock('${k}')" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:4px 10px; border-radius:4px; font-size:10px; cursor:pointer;">Delete Block</button>
      </div>
      <div class="form-grid">
        <div class="field"><label>Eyebrow Label</label><input id="blk_eyebrow_${safeId}" value="${block.eyebrow || 'FEATURED BLOCK'}"></div>
        <div class="field"><label>Block Headline Title</label><input id="blk_title_${safeId}" value="${block.title || ''}"></div>
        <div class="field full">
          <label>Description Body (Rich Word-Type Text Editor)</label>
          ${createRichEditorHtml(`blk_body_${safeId}`, block.body || '', 'Description body text, hyperlinks, bullet points, and details...', '130px')}
        </div>
        <div class="field"><label>Action CTA Button Text</label><input id="blk_btntext_${safeId}" value="${block.btnText || 'Learn More &rarr;'}"></div>
        <div class="field"><label>Action CTA Destination URL</label><input id="blk_btnurl_${safeId}" value="${block.btnUrl || 'pages/booking.html'}"></div>
        <div class="field full">
          <label>Media Asset (Image, GIF, Video, Sound URL)</label>
          <div style="display:flex; gap:6px;">
            <input id="blk_media_${safeId}" value="${block.mediaUrl || ''}" placeholder="Upload or image/video URL">
            <input type="file" id="blk_file_${safeId}" style="display:none;" onchange="uploadBlockMedia('${safeId}')">
            <button class="secondary" onclick="document.getElementById('blk_file_${safeId}').click()">Upload Media</button>
          </div>
        </div>
      </div>
      <button class="primary" onclick="saveCustomBlock('${k}', '${safeId}')" style="padding:8px 16px; font-size:11px; margin-top:12px;">Save Changes To Block</button>
    </div>`;
  }).join('');

  return `
  <div style="margin-top:20px; border-top:1px solid var(--line); padding-top:16px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h4 style="margin:0; font-size:0.95rem; color:#fff;">Feature Blocks for ${label}</h4>
      <button class="secondary" onclick="openAddCustomBlockModal('${pageKey}', '${label}')" style="padding:6px 14px; font-size:11px;">+ Add Block to ${label}</button>
    </div>
    ${blocksHtml || `<div style="font-size:12px; color:var(--muted); padding:10px 0;">No custom feature blocks created yet for ${label}. Click "+ Add Block" above to create one.</div>`}
  </div>`;
}

window.uploadBlockMedia = async function(safeId) {
  const fileInput = document.getElementById(`blk_file_${safeId}`);
  const input = document.getElementById(`blk_media_${safeId}`);
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', `block_${safeId}`);
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Block media uploaded!', 'success');
    }
  } catch(e) { console.warn('Block media upload notice:', e); }
};

window.saveCustomBlock = async function(key, safeId) {
  if (window.syncRichEditor) window.syncRichEditor(`blk_body_${safeId}`);
  const eyebrow = document.getElementById(`blk_eyebrow_${safeId}`)?.value;
  const title = document.getElementById(`blk_title_${safeId}`)?.value;
  const body = document.getElementById(`blk_body_${safeId}`)?.value;
  const btnText = document.getElementById(`blk_btntext_${safeId}`)?.value;
  const btnUrl = document.getElementById(`blk_btnurl_${safeId}`)?.value;
  const mediaUrl = document.getElementById(`blk_media_${safeId}`)?.value;

  const payload = JSON.stringify({ eyebrow, title, body, btnText, btnUrl, mediaUrl, updated_at: new Date().toISOString() });
  const res = await IMI_AUTH.saveSiteContent(key, payload);
  if (res.siteContent) {
    state.data.siteContent = res.siteContent;
  }
  imiToast('Feature Block updated!', 'success');
  await render();
};

window.deleteCustomBlock = async function(key) {
  if (confirm('Delete this feature block permanently?')) {
    const res = await IMI_AUTH.saveSiteContent(key, '');
    if (res.siteContent) {
      delete res.siteContent[key];
      state.data.siteContent = res.siteContent;
    }
    alert('Feature Block deleted.');
    await render();
  }
};

window.openAddCustomBlockModal = function(pageKey, label) {
  let modal = document.getElementById('admin-block-builder-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-block-builder-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
  <div style="background:#11141a; border:1px solid rgba(201,162,39,0.3); border-radius:12px; max-width:680px; width:100%; padding:28px; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 20px 50px rgba(0,0,0,0.9);">
    <button onclick="document.getElementById('admin-block-builder-modal').style.display='none'" style="position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#fff; width:32px; height:32px; border-radius:50%; font-size:1rem; cursor:pointer;">✕</button>
    <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff; margin:0 0 6px;">Add New Feature Block</h3>
    <p style="font-size:0.8rem; color:var(--gold); margin:0 0 20px; text-transform:uppercase; letter-spacing:0.1em;">Target Section: <strong>${label || pageKey.toUpperCase()}</strong></p>
    
    <div class="form-grid">
      <div class="field"><label>Eyebrow Label</label><input id="newblk_eyebrow" value="FEATURED INTELLIGENCE"></div>
      <div class="field"><label>Block Headline Title *</label><input id="newblk_title" placeholder="e.g. Strategic Growth Multiplier"></div>
      <div class="field full">
        <label>Description Body</label>
        ${createRichEditorHtml('newblk_body', '', 'Enter formatted block description, key takeaways, and highlights...', '140px')}
      </div>
      <div class="field"><label>Action Button Text</label><input id="newblk_btntext" value="Learn More &rarr;"></div>
      <div class="field"><label>Action Button Destination URL</label><input id="newblk_btnurl" value="pages/booking.html"></div>
      <div class="field full">
        <label>Media Asset (Upload Picture, Video, or Audio)</label>
        <div style="display:flex; gap:8px;">
          <input id="newblk_media" placeholder="Upload or image/video URL">
          <input type="file" id="newblk_file" style="display:none;" onchange="uploadNewBlockMedia()">
          <button class="secondary" type="button" onclick="document.getElementById('newblk_file').click()"><i class="fa-solid fa-cloud-arrow-up" style="margin-right:6px;"></i>Upload Picture / Media</button>
        </div>
      </div>
    </div>

    <div style="display:flex; gap:12px; margin-top:24px;">
      <button class="primary" onclick="submitNewCustomBlock('${pageKey}', '${label}')" style="padding:12px 24px; font-weight:700;"><i class="fa-solid fa-plus" style="margin-right:6px;"></i>Publish Feature Block</button>
      <button class="secondary" onclick="document.getElementById('admin-block-builder-modal').style.display='none'" style="padding:12px 18px;">Cancel</button>
    </div>
  </div>`;
  modal.style.display = 'flex';
};

window.uploadNewBlockMedia = async function() {
  const fileInput = document.getElementById('newblk_file');
  const input = document.getElementById('newblk_media');
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', 'custom_block_media');
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Feature block media uploaded!', 'success');
    }
  } catch(e) { console.warn('Block media upload notice:', e); }
};

window.submitNewCustomBlock = async function(pageKey, label) {
  if (window.syncRichEditor) window.syncRichEditor('newblk_body');
  const title = document.getElementById('newblk_title')?.value.trim();
  if (!title) { imiToast('Please enter a block headline title.', 'error'); return; }

  const eyebrow = document.getElementById('newblk_eyebrow')?.value || 'FEATURED INTELLIGENCE';
  const body = document.getElementById('newblk_body')?.value || '';
  const btnText = document.getElementById('newblk_btntext')?.value || 'Learn More →';
  const btnUrl = document.getElementById('newblk_btnurl')?.value || 'pages/booking.html';
  const mediaUrl = document.getElementById('newblk_media')?.value || '';

  const key = `custom_section.${pageKey}.${Date.now()}`;
  const payload = JSON.stringify({ eyebrow, title, body, btnText, btnUrl, mediaUrl, created_at: new Date().toISOString() });

  const res = await IMI_AUTH.saveSiteContent(key, payload);
  if (res.siteContent) {
    state.data.siteContent = res.siteContent;
  }
  const modal = document.getElementById('admin-block-builder-modal');
  if (modal) modal.style.display = 'none';

  imiToast(`Feature Block "${title}" published to ${label || pageKey}!`, 'success');
  await render();
};

window.addCustomSiteSection = function(pageKey) {
  window.openAddCustomBlockModal(pageKey, pageKey.toUpperCase());
};

function _isValidUrl(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim().toLowerCase();
  if (s.startsWith('uploading') || s.startsWith('error') || s.includes('not a function') || s.startsWith('c:') || s.startsWith('c/') || s.startsWith('file:')) return false;
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:') || s.startsWith('data:') || s.startsWith('./') || s.startsWith('../') || s.startsWith('/');
}

window.uploadCMSMedia = async function(key, inputId, fileInputId) {
  const fileInput = document.getElementById(fileInputId);
  const input = document.getElementById(inputId);
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];

  const btn = fileInput.parentElement?.querySelector('button') || fileInput.nextElementSibling;
  const origText = btn ? btn.innerHTML : 'Upload';
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', key.replace('.', '_'));
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      await IMI_AUTH.saveSiteContent(key, res.url);
      const storageKey = `imi_${key.replace('.', '_')}`;
      localStorage.setItem(storageKey, res.url);
      window.dispatchEvent(new CustomEvent('imi_content_updated'));
      imiToast(`Media asset uploaded and linked to ${key}!`, "success");
    } else {
      imiToast(`Upload completed with local preview.`, "success");
    }
  } catch(e) {
    console.warn('CMS upload notice:', e);
  } finally {
    if (btn) btn.innerHTML = origText;
  }
};

// ── Courses & Workshops Manager ───────────────────────────────────────
function courses() {
  const dbMods = state.data.courseModules || {};
  const sc = state.data.siteContent || {};
  const enrolledCount = state.data.memberList.length;

  let customCourseKeys = [];
  try {
    customCourseKeys = JSON.parse(sc['course.custom_keys'] || localStorage.getItem('imi_custom_course_keys') || '[]');
  } catch(e) {}

  const defaultList = [
    {
      key: 'brand-position',
      name: 'Module 01: Brand Position & Market Coordinates',
      desc: 'Establish brand authority, market coordinates, and customer avatar definitions.',
      students: enrolledCount,
      status: 'PUBLISHED'
    },
    {
      key: 'offer-design',
      name: 'Module 02: Offer Design & Value Proposition',
      desc: 'Package value propositions into high-margin scalable offerings.',
      students: enrolledCount,
      status: 'PUBLISHED'
    },
    {
      key: 'content-mapping',
      name: 'Module 03: Content Mapping & Audience Funnels',
      desc: 'Align content themes to customer awareness stages and decision funnels.',
      students: enrolledCount,
      status: 'PUBLISHED'
    },
    {
      key: 'system-integrations',
      name: 'Module 04: System Integrations & Cockpit Automations',
      desc: 'Automate leads, booking flows, email triggers, and time management cockpits.',
      students: enrolledCount,
      status: 'ACTIVE'
    }
  ];

  customCourseKeys.forEach(k => {
    if (!defaultList.find(x => x.key === k)) {
      defaultList.push({
        key: k,
        name: sc[`course.${k}.title`] || k.replace(/-/g, ' ').toUpperCase(),
        desc: sc[`course.${k}.desc`] || 'Custom course module and execution blueprints.',
        students: enrolledCount,
        status: 'PUBLISHED'
      });
    }
  });

  const courseRows = defaultList.map((m, index) => {
    const data = dbMods[m.key] || {};
    const titleVal = sc[`course.${m.key}.title`] || data.title || m.name;
    const descVal = sc[`course.${m.key}.desc`] || data.desc || m.desc;

    return `
    <tr style="border-bottom:1px solid var(--line);">
      <td style="padding:14px 10px;">
        <b style="color:var(--text);">${titleVal}</b>
        <div style="font-size:10px; color:var(--muted); margin-top:4px;">KEY: ${m.key} &nbsp;|&nbsp; ${descVal}</div>
      </td>
      <td style="padding:14px 10px;">
        <button class="secondary" onclick="toggleModuleEditor('${m.key}')" style="font-size:10px; padding:4px 10px;">Edit Content & Media</button>
      </td>
      <td style="padding:14px 10px;">${m.students}</td>
      <td style="padding:14px 10px;"><span class="badge">${m.status}</span></td>
    </tr>
    <tr id="editor-${m.key}" style="display:none; background:var(--panel2);">
      <td colspan="4" style="padding:18px;">
        <div class="form-grid">
          <div class="field full">
            <label>Module Title (Member Portal Display)</label>
            <input id="title-${m.key}" value="${titleVal}">
          </div>

          <div class="field full">
            <label>Module Description</label>
            <textarea id="desc-${m.key}">${descVal}</textarea>
          </div>

          <div class="field">
            <label>Video Lesson Title</label>
            <input id="v-title-${m.key}" value="${data.video_title || data.videoTitle || 'Watch Video Lesson'}">
            <label style="margin-top:6px;">Video URL or Upload (MP4 / Vimeo / YouTube)</label>
            <div style="display:flex; gap:6px;">
              <input id="v-url-${m.key}" value="${sc[`course.${m.key}.video_url`] || data.video_url || data.videoUrl || ''}" placeholder="https://...">
              <input type="file" id="v-file-${m.key}" style="display:none;" onchange="uploadModuleMedia('${m.key}', 'video')">
              <button class="secondary" onclick="document.getElementById('v-file-${m.key}').click()">Upload Video</button>
            </div>
          </div>

          <div class="field">
            <label>Audio Briefing Title</label>
            <input id="a-title-${m.key}" value="${data.audio_title || data.audioTitle || 'Audio Briefing'}">
            <label style="margin-top:6px;">Audio URL or Upload (MP3)</label>
            <div style="display:flex; gap:6px;">
              <input id="a-url-${m.key}" value="${sc[`course.${m.key}.audio_url`] || data.audio_url || data.audioUrl || ''}" placeholder="https://...">
              <input type="file" id="a-file-${m.key}" style="display:none;" onchange="uploadModuleMedia('${m.key}', 'audio')">
              <button class="secondary" onclick="document.getElementById('a-file-${m.key}').click()">Upload Audio</button>
            </div>
          </div>

          <div class="field">
            <label>PDF Worksheet Title</label>
            <input id="d-title-${m.key}" value="${data.doc_title || data.docTitle || 'Download PDF Worksheet'}">
            <label style="margin-top:6px;">PDF File URL or Upload</label>
            <div style="display:flex; gap:6px;">
              <input id="d-url-${m.key}" value="${sc[`course.${m.key}.doc_url`] || data.doc_url || data.docUrl || ''}" placeholder="../downloads/brand-worksheet.pdf">
              <input type="file" id="d-file-${m.key}" style="display:none;" onchange="uploadModuleMedia('${m.key}', 'doc')">
              <button class="secondary" onclick="document.getElementById('d-file-${m.key}').click()">Upload PDF</button>
            </div>
          </div>

          <div class="field">
            <label>Diagram / Hero Banner Title</label>
            <input id="c-title-${m.key}" value="${data.chart_title || data.chartTitle || 'View Diagram / Chart'}">
            <label style="margin-top:6px;">Banner Image / Diagram URL or Upload</label>
            <div style="display:flex; gap:6px;">
              <input id="c-url-${m.key}" value="${sc[`course.${m.key}.chart_url`] || data.chart_url || data.chartUrl || ''}" placeholder="https://...">
              <input type="file" id="c-file-${m.key}" style="display:none;" onchange="uploadModuleMedia('${m.key}', 'chart')">
              <button class="secondary" onclick="document.getElementById('c-file-${m.key}').click()">Upload Image</button>
            </div>
          </div>
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="secondary" onclick="deleteCourseModule('${m.key}')" style="color:var(--danger); border-color:var(--danger); font-size:11px; padding:6px 12px;">Delete Module</button>
          <button class="primary" onclick="saveSingleModule('${m.key}')">Save Module Content & Sync Member Account</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  return page('Courses & Learning Ecosystem', 'Build and manage your IMI learning modules, video lessons, audio briefings, workshops, and worksheets. Syncs directly to member accounts.', 'Create Course', `
  <div class="card table-wrap" style="margin-bottom:24px;">
    <div class="card-title" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3>1. Course Modules Curriculum</h3>
        <span>SYNCS INSTANTLY TO MEMBER PORTAL</span>
      </div>
      <button class="primary" onclick="addNewCoursePrompt()" style="font-size:11px; padding:6px 14px;">+ Add New Course Module</button>
    </div>
    <table class="table">
      <thead><tr><th>Course / Module</th><th>Media Setup</th><th>Students</th><th>Status</th></tr></thead>
      <tbody>${courseRows}</tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title"><h3>2. Live Workshops & Power Hours Setup</h3><span>SCHEDULE SESSIONS & VIDEO CALL LINKS</span></div>
    <p style="font-size:0.85rem; color:var(--muted); margin-bottom:14px;">Set up upcoming live workshops, Zoom / Google Meet room links, dates, and access tiers for members and event attendees.</p>
    <div class="form-grid">
      <div class="field"><label>Workshop Title</label><input id="ws-title" value="${sc['workshop.title'] || 'Live Funnel Architecture & Signal Routing Workshop'}"></div>
      <div class="field"><label>Date & Time</label><input id="ws-date" value="${sc['workshop.date'] || 'Every Thursday @ 2:00 PM EST'}"></div>
      <div class="field"><label>Duration</label><input id="ws-duration" value="${sc['workshop.duration'] || '60 Minutes Live'}"></div>
      <div class="field"><label>Host / Speaker</label><input id="ws-host" value="${sc['workshop.host'] || 'IMI Strategy & Implementation Node'}"></div>
      <div class="field"><label>Access Tier</label><input id="ws-tier" value="${sc['workshop.tier'] || 'All Members & Power Hour Pass Holders'}"></div>
      <div class="field"><label>Direct Meeting Room Link (Zoom / Meet / Jitsi)</label><input id="ws-room" value="${sc['workshop.room_url'] || 'https://meet.jit.si/IMILiveClassroomNode'}"></div>
      <div class="field full"><label>Workshop Description & Action Deliverables</label><textarea id="ws-desc" style="height:90px;">${sc['workshop.desc'] || 'Interactive implementation workshop mapping authority funnels, CRM trigger sequences, and automated lead capture workflows with live Q&A.'}</textarea></div>
    </div>
    <button class="primary" onclick="saveWorkshopSchedule()" style="padding:10px 18px; font-size:12px; margin-top:14px;">Save Workshop Setup & Sync to Member Portal</button>
  </div>`);
}

window.addNewCoursePrompt = async function() {
  const modNum = prompt('Enter Module Number or Short Key (e.g., module-05, retention-funnels):', `module-0${Date.now().toString().slice(-2)}`);
  if (!modNum) return;
  const modTitle = prompt('Enter Course Module Title:', 'Module: Advanced Funnel Optimization');
  if (!modTitle) return;
  const modDesc = prompt('Enter Module Description:', 'Master client acquisition metrics, retention triggers, and LTV scaling.');

  const sc = state.data.siteContent || {};
  let customCourseKeys = [];
  try {
    customCourseKeys = JSON.parse(sc['course.custom_keys'] || localStorage.getItem('imi_custom_course_keys') || '[]');
  } catch(e) {}

  if (!customCourseKeys.includes(modNum)) customCourseKeys.push(modNum);
  const keysJson = JSON.stringify(customCourseKeys);

  await IMI_AUTH.saveSiteContent('course.custom_keys', keysJson);
  localStorage.setItem('imi_custom_course_keys', keysJson);

  await IMI_AUTH.saveCourseModule(modNum, {
    title: modTitle,
    desc: modDesc,
    video_title: 'Watch Video Lesson',
    audio_title: 'Audio Briefing',
    doc_title: 'Download PDF Worksheet',
    chart_title: 'View Diagram / Chart'
  });

  imiToast(`Course module "${modTitle}" created!`, "success");
  await render();
};

window.deleteCourseModule = async function(key) {
  if (confirm(`Delete course module "${key}" permanently?`)) {
    const sc = state.data.siteContent || {};
    let customCourseKeys = [];
    try {
      customCourseKeys = JSON.parse(sc['course.custom_keys'] || localStorage.getItem('imi_custom_course_keys') || '[]');
    } catch(e) {}

    customCourseKeys = customCourseKeys.filter(k => k !== key);
    const keysJson = JSON.stringify(customCourseKeys);
    await IMI_AUTH.saveSiteContent('course.custom_keys', keysJson);
    localStorage.setItem('imi_custom_course_keys', keysJson);

    await IMI_AUTH.saveSiteContent(`course.${key}.title`, '');
    await IMI_AUTH.saveSiteContent(`course.${key}.desc`, '');
    window.dispatchEvent(new CustomEvent('imi_content_updated'));
    imiToast(`Module "${key}" removed.`, 'info');
    await render();
  }
};

window.saveWorkshopSchedule = async function() {
  const title = document.getElementById('ws-title')?.value || '';
  const date = document.getElementById('ws-date')?.value || '';
  const duration = document.getElementById('ws-duration')?.value || '';
  const host = document.getElementById('ws-host')?.value || '';
  const tier = document.getElementById('ws-tier')?.value || '';
  const room = document.getElementById('ws-room')?.value || '';
  const desc = document.getElementById('ws-desc')?.value || '';

  await IMI_AUTH.saveSiteContent('workshop.title', title);
  await IMI_AUTH.saveSiteContent('workshop.date', date);
  await IMI_AUTH.saveSiteContent('workshop.duration', duration);
  await IMI_AUTH.saveSiteContent('workshop.host', host);
  await IMI_AUTH.saveSiteContent('workshop.tier', tier);
  await IMI_AUTH.saveSiteContent('workshop.room_url', room);
  await IMI_AUTH.saveSiteContent('workshop.desc', desc);

  const payload = JSON.stringify({ title, date, duration, host, tier, room, desc, updated_at: new Date().toISOString() });
  await IMI_AUTH.saveSiteContent('workshop.schedule_payload', payload);
  localStorage.setItem('imi_workshop_schedule', payload);

  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Workshop & Power Hour schedule saved and published to Member Portal!', 'success');
  await render();
};

window.toggleModuleEditor = function(key) {
  const row = document.getElementById(`editor-${key}`);
  if (row) row.style.display = (row.style.display === 'none' ? 'table-row' : 'none');
};

window.uploadModuleMedia = async function(moduleKey, type) {
  const prefixMap = { video: 'v', audio: 'a', doc: 'd', chart: 'c' };
  const fileInput = document.getElementById(`${prefixMap[type]}-file-${moduleKey}`);
  const urlInput = document.getElementById(`${prefixMap[type]}-url-${moduleKey}`);

  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];

  const origVal = urlInput.value;
  urlInput.value = 'Uploading file...';
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, moduleKey, type);
    if (res.url && _isValidUrl(res.url)) {
      urlInput.value = res.url;
      imiToast(`Media uploaded successfully to storage!`, "success");
    } else {
      urlInput.value = origVal;
      imiToast(res.error || 'Upload error. For video courses, please paste a YouTube, Vimeo, Loom, or MP4 link.', 'warning', 6000);
    }
  } catch(e) {
    urlInput.value = origVal;
    imiToast('Upload error. Please paste a video hosting URL.', 'error', 5000);
  }
};

window.saveSingleModule = async function(moduleKey) {
  const title = document.getElementById(`title-${moduleKey}`)?.value;
  const desc  = document.getElementById(`desc-${moduleKey}`)?.value;

  const payload = {
    title: title,
    desc: desc,
    video_title: document.getElementById(`v-title-${moduleKey}`)?.value || 'Watch Video Lesson',
    video_url: document.getElementById(`v-url-${moduleKey}`)?.value || '',
    audio_title: document.getElementById(`a-title-${moduleKey}`)?.value || 'Audio Briefing',
    audio_url: document.getElementById(`a-url-${moduleKey}`)?.value || '',
    doc_title: document.getElementById(`d-title-${moduleKey}`)?.value || 'Download PDF Worksheet',
    doc_url: document.getElementById(`d-url-${moduleKey}`)?.value || '',
    chart_title: document.getElementById(`c-title-${moduleKey}`)?.value || 'View Diagram / Chart',
    chart_url: document.getElementById(`c-url-${moduleKey}`)?.value || ''
  };

  const res = await IMI_AUTH.saveCourseModule(moduleKey, payload);

  const sanitizeUrl = (url) => (url && url.startsWith('data:')) ? '[Base64 Media File - Upload to Supabase Storage or enter public URL]' : (url || '');

  let localModules = {};
  try { localModules = JSON.parse(localStorage.getItem('imi_course_modules') || '{}'); } catch(e) {}
  localModules[moduleKey] = {
    title: payload.title,
    desc: payload.desc,
    videoTitle: payload.video_title, videoUrl: sanitizeUrl(payload.video_url),
    audioTitle: payload.audio_title, audioUrl: sanitizeUrl(payload.audio_url),
    docTitle: payload.doc_title, docUrl: sanitizeUrl(payload.doc_url),
    chartTitle: payload.chart_title, chartUrl: sanitizeUrl(payload.chart_url)
  };
  try {
    localStorage.setItem('imi_course_modules', JSON.stringify(localModules));
  } catch(e) {
    console.warn('LocalStorage quota limit reached:', e);
  }
  window.dispatchEvent(new CustomEvent('imi_content_updated'));

  if (res.success) {
    imiToast(`Module "${title || moduleKey}" saved to Supabase and synced with Member Portal!`, "success");
  } else {
    imiToast(`Saved locally (Supabase notice: ${res.error})`, "success");
  }
};

// ── News Centre & Blog Manager ───────────────────────────────────────
function newsManager() {
  const sc = state.data.siteContent || {};
  return page('News Centre & Blog Manager', 'Manage news dispatches, blog articles, cover media, video/YouTube channel embeds, and live social feed embed code.', 'Publish Dispatch', `
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>Social & Broadcast Newsfeed Embed</h3><span>IFRAME / HTML EMBED</span></div>
    <div class="field full">
      <label>Social Feed Embed Code (HTML / iFrame / Facebook Timeline URL)</label>
      <textarea id="news-feed-embed" style="height:110px;" placeholder="<iframe src='...' width='100%' height='400'></iframe>">${sc['news.feed_embed'] || ''}</textarea>
    </div>
    <button class="primary" onclick="saveNewsEmbed()" style="padding:8px 16px; font-size:12px; margin-top:10px;">Save & Publish Embed Code</button>
  </div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>Publish Strategic News Dispatch</h3><span>NEW ARTICLE & NEWSLETTER</span></div>
    <div class="form-grid">
      <div class="field"><label>Article Title</label><input id="news-title-input" placeholder="e.g. AI Operations for 2026"></div>
      <div class="field"><label>Category / Date Tag</label><input id="news-date-input" placeholder="e.g. August 2026 • AI Strategy"></div>
      <div class="field full"><label>Summary / Excerpt (Short preview paragraph on card)</label><textarea id="news-summary-input" placeholder="Short article summary for the front card..."></textarea></div>
      <div class="field full">
        <label>Full Article Body / Content (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('news-content-input', '', 'Enter full multi-paragraph article content, headings, insights, hyperlinks, and takeaways...', '200px')}
      </div>
      <div class="field"><label>Action Button Destination URL</label><input id="news-link-input" value="pages/booking.html" placeholder="pages/booking.html"></div>
      <div class="field"><label>Action Button Text</label><input id="news-ctatext-input" value="Work With IMI →" placeholder="Work With IMI →"></div>
      <div class="field">
        <label>Video / YouTube / Channel Embed URL</label>
        <input id="news-video-input" placeholder="https://www.youtube.com/watch?v=... or MP4 URL">
      </div>
      <div class="field">
        <label>Featured Cover Image / Media URL</label>
        <div style="display:flex; gap:6px;">
          <input id="news-img-input" placeholder="Upload or image URL">
          <input type="file" id="news-img-file" style="display:none;" onchange="uploadNewDispatchImage()">
          <button class="secondary" onclick="document.getElementById('news-img-file').click()">Upload Image</button>
        </div>
      </div>
    </div>
    <button class="primary" onclick="addNewsDispatch()" style="padding:10px 18px; font-size:12px; margin-top:14px;">Publish Dispatch & Update Newsletter Feed</button>
  </div>

  <div class="card">
    <div class="card-title"><h3>Published News Centre Dispatches</h3><span>MANAGE ARTICLES & LISTS</span></div>
    ${renderAdminNewsDispatches()}
  </div>`);
}

window.uploadNewDispatchImage = async function() {
  const fileInput = document.getElementById('news-img-file');
  const input = document.getElementById('news-img-input');
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', 'news_new');
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Cover image uploaded!', 'success');
    }
  } catch(e) { console.warn('New dispatch image upload error:', e); }
};

window.saveNewsEmbed = async function() {
  const val = document.getElementById('news-feed-embed')?.value || '';
  await IMI_AUTH.saveSiteContent('news.feed_embed', val);
  localStorage.setItem('imi_news_feed_embed', val);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Social feed embed saved & published!');
};

window.addNewsDispatch = async function() {
  if (window.syncRichEditor) window.syncRichEditor('news-content-input');
  const title = document.getElementById('news-title-input')?.value;
  const date = document.getElementById('news-date-input')?.value || 'August 2026 • Strategy';
  const summary = document.getElementById('news-summary-input')?.value || '';
  const content = document.getElementById('news-content-input')?.value || summary;
  const link = document.getElementById('news-link-input')?.value || 'pages/booking.html';
  const ctaText = document.getElementById('news-ctatext-input')?.value || 'Work With IMI →';
  const videoUrl = document.getElementById('news-video-input')?.value || '';
  const imageUrl = document.getElementById('news-img-input')?.value || '';
  if (!title) return alert('Enter title!');

  const key = `news_dispatch.${Date.now()}`;
  const payload = JSON.stringify({ title, date, summary, content, link, ctaText, videoUrl, imageUrl, created_at: new Date().toISOString() });
  await IMI_AUTH.saveSiteContent(key, payload);
  localStorage.setItem(`imi_${key}`, payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast(`Dispatch "${title}" published to News Centre!`, "success");
  await render();
};

// Initial Standard Featured Articles Roster
const DEFAULT_INITIAL_NEWS_ARTICLES = [
  {
    key: 'news_dispatch.initial_ai_operations',
    title: 'Building Intentional Marketing Systems with AI Workflows',
    date: 'August 2026 · AI Operations',
    summary: 'How modern businesses move past disjointed tactics into coordinated lead generation and client acquisition engines.',
    content: `<p>Moving past disjointed tactics into an integrated growth engine requires three foundational pillars:</p>
<ul style="padding-left:20px; line-height:1.9;">
  <li><strong>Signal Capture & Data Routing:</strong> Automated tracking that identifies customer intent triggers across your touchpoints.</li>
  <li><strong>Adaptive Content Personalization:</strong> Dynamic nurturing flows calibrated to audience readiness stages.</li>
  <li><strong>Continuous Attribution Feedback:</strong> Real-time conversion insights feeding directly into budget reallocation models.</li>
</ul>
<h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">Moving from Tactical Noise to Systematic Authority</h3>
<p>When AI workflows are layered over clear brand positioning, the output changes from generic volume to authoritative precision. Your brand communicates with consistent tone, predictable cadence, and targeted messaging across all channels.</p>`,
    link: 'pages/learning.html',
    ctaText: 'Explore Learning Center →',
    videoUrl: '',
    imageUrl: '../assets/logo/imi-gold-logo.jpg'
  },
  {
    key: 'news_dispatch.initial_solocorp',
    title: 'The 30-Day Solo Corp Blueprint for Solopreneurs',
    date: 'August 2026 · Brand Strategy & Lean Ops',
    summary: 'Establishing authority coordinates, pricing high-margin services, and automating client intake.',
    content: `<p>Solo operators often fall into the trap of trading time for linear compensation. The Solo Corp framework shifts independent professionals from reactive freelancing to operating a streamlined enterprise of one.</p>
<h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">1. High-Margin Packaging & Value Density</h3>
<p>Stop quoting hourly rates. Price against business outcomes, strategic roadmaps, and proprietary implementation frameworks that deliver measurable leverage.</p>
<h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">2. Automated Cockpits & Booking Flows</h3>
<p>Automate client intake questionnaires, scheduling calendars, agreement signatures, and retainer invoicing. Free your energy to focus solely on high-leverage execution and strategic advisory.</p>`,
    link: 'pages/solo-corp.html',
    ctaText: 'Explore Solo Corp 101 →',
    videoUrl: '',
    imageUrl: '../assets/products/solo-corp-book-cover.png'
  },
  {
    key: 'news_dispatch.initial_fractional_cmo',
    title: 'When to Bring on a Fractional CMO vs Full-Time Agency',
    date: 'August 2026 · Executive Leadership & ROI',
    summary: 'Evaluating executive marketing oversight, strategic clarity, and ROI for scaling companies.',
    content: `<p>As businesses scale between $500k and $5M in annual revenue, traditional marketing approaches often fracture under operational friction.</p>
<h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">1. The Agency Trap</h3>
<p>Traditional agencies execute deliverables (ads, posts, emails) without deep alignment to business unit economics or gross margins.</p>
<h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">2. The Fractional Advantage</h3>
<p>A Fractional CMO provides executive-level strategy, marketing stack architecture, and performance oversight at a fraction of full-time executive cost.</p>`,
    link: 'pages/cmo-services.html',
    ctaText: 'Apply For CMO Services →',
    videoUrl: '',
    imageUrl: '../assets/logo/imi-gold-lockup.jpg'
  }
];

function renderAdminNewsDispatches() {
  const sc = state.data.siteContent || {};
  
  // Collect all dispatch keys from siteContent
  let allDispatches = [];
  
  // 1. Load initial articles (overridden by sc if saved)
  DEFAULT_INITIAL_NEWS_ARTICLES.forEach(item => {
    let saved = null;
    try {
      const raw = sc[item.key] || localStorage.getItem(`imi_${item.key}`);
      if (raw) saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch(e) {}
    allDispatches.push({
      key: item.key,
      isInitial: true,
      data: saved ? { ...item, ...saved } : item
    });
  });

  // 2. Load custom user-created dispatches
  Object.keys(sc).filter(k => k.startsWith('news_dispatch.') && !k.includes('initial_')).forEach(k => {
    let d = {};
    try { d = typeof sc[k] === 'string' ? JSON.parse(sc[k]) : sc[k]; } catch(e) {}
    allDispatches.push({
      key: k,
      isInitial: false,
      data: d
    });
  });

  const rowsHtml = allDispatches.map(entry => {
    const k = entry.key;
    const d = entry.data || {};
    const safeId = k.replace(/[^a-zA-Z0-9]/g, '_');
    const badgeLabel = entry.isInitial ? 'FEATURED CORE ARTICLE' : `DISPATCH ID: ${k.split('.').pop()}`;

    return `
    <div style="background:#0b0d10; border:1px solid var(--line); border-left:3px solid var(--gold); border-radius:8px; padding:16px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:11px; font-weight:700; color:var(--gold); font-family:var(--font-heading);">${badgeLabel}</span>
        ${!entry.isInitial ? `<button onclick="deleteNewsDispatch('${k}')" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:4px 10px; border-radius:4px; font-size:10px; cursor:pointer;">Delete Article</button>` : '<span style="font-size:10px; color:var(--muted); background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:4px;">CORE SYSTEM DISPATCH</span>'}
      </div>
      <div class="form-grid">
        <div class="field"><label>Article Title</label><input id="nd_title_${safeId}" value="${d.title || ''}"></div>
        <div class="field"><label>Category / Date Tag</label><input id="nd_date_${safeId}" value="${d.date || ''}"></div>
        <div class="field full"><label>Summary / Excerpt (Card Preview)</label><textarea id="nd_summary_${safeId}">${d.summary || ''}</textarea></div>
        <div class="field full">
          <label>Full Article Body / Content (Rich Word-Type Text Editor)</label>
          ${createRichEditorHtml(`nd_content_${safeId}`, d.content || d.body || d.summary || '', 'Enter article content...', '200px')}
        </div>
        <div class="field"><label>Action Destination Link</label><input id="nd_link_${safeId}" value="${d.link || d.ctaUrl || 'pages/booking.html'}"></div>
        <div class="field"><label>Action Button Text</label><input id="nd_ctatext_${safeId}" value="${d.ctaText || 'Work With IMI →'}"></div>
        <div class="field"><label>Video / YouTube / Channel Embed URL</label><input id="nd_video_${safeId}" value="${d.videoUrl || d.video || ''}" placeholder="https://www.youtube.com/watch?v=..."></div>
        <div class="field">
          <label>Featured Cover Image / Media URL</label>
          <div style="display:flex; gap:6px;">
            <input id="nd_img_${safeId}" value="${d.imageUrl || d.mediaUrl || ''}" placeholder="Upload or image URL">
            <input type="file" id="nd_file_${safeId}" style="display:none;" onchange="uploadNewsImage('${safeId}')">
            <button class="secondary" onclick="document.getElementById('nd_file_${safeId}').click()">Upload Picture</button>
          </div>
        </div>
      </div>
      <button class="primary" onclick="saveNewsDispatch('${k}', '${safeId}')" style="padding:8px 16px; font-size:11px; margin-top:12px;"><i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Changes To Article</button>
    </div>`;
  }).join('');

  return rowsHtml;
}

window.uploadNewsImage = async function(safeId) {
  const fileInput = document.getElementById(`nd_file_${safeId}`);
  const input = document.getElementById(`nd_img_${safeId}`);
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', `news_${safeId}`);
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Cover image uploaded!', 'success');
    }
  } catch(e) { console.warn('News image upload notice:', e); }
};

window.saveNewsDispatch = async function(key, safeId) {
  if (window.syncRichEditor) window.syncRichEditor(`nd_content_${safeId}`);
  const title = document.getElementById(`nd_title_${safeId}`)?.value;
  const date = document.getElementById(`nd_date_${safeId}`)?.value;
  const summary = document.getElementById(`nd_summary_${safeId}`)?.value;
  const content = document.getElementById(`nd_content_${safeId}`)?.value;
  const link = document.getElementById(`nd_link_${safeId}`)?.value;
  const ctaText = document.getElementById(`nd_ctatext_${safeId}`)?.value;
  const videoUrl = document.getElementById(`nd_video_${safeId}`)?.value;
  const imageUrl = document.getElementById(`nd_img_${safeId}`)?.value;

  const payload = JSON.stringify({ title, date, summary, content, link, ctaText, videoUrl, imageUrl, updated_at: new Date().toISOString() });
  await IMI_AUTH.saveSiteContent(key, payload);
  localStorage.setItem(`imi_${key}`, payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Article dispatch updated!', 'success');
  await render();
};

window.deleteNewsDispatch = async function(key) {
  if (confirm('Delete this article dispatch permanently?')) {
    await IMI_AUTH.saveSiteContent(key, '');
    localStorage.removeItem(`imi_${key}`);
    window.dispatchEvent(new CustomEvent('imi_content_updated'));
    imiToast('Article dispatch deleted.', 'info');
    await render();
  }
};

// ── Tools & Resource HUD Manager ──────────────────────────────────────
function toolsManager() {
  const sc = state.data.siteContent || {};
  let customTools = [];
  try { customTools = JSON.parse(localStorage.getItem('imi_cms_tools') || '[]'); } catch(e) {}

  const customToolsHtml = customTools.map((t, idx) => `
    <div style="background:#0b0d10; border:1px solid var(--line); border-left:3px solid var(--gold); border-radius:8px; padding:18px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:11px; font-weight:700; color:var(--gold); font-family:var(--font-heading); text-transform:uppercase;">${t.category ? t.category.toUpperCase() : 'CUSTOM TOOL / RESOURCE'}</span>
          <span style="font-size:10px; background:rgba(255,255,255,0.06); color:#aaa; padding:2px 8px; border-radius:4px;">ITEM #${idx + 1}</span>
          ${t.embedCode ? '<span style="font-size:10px; background:rgba(0,200,83,0.15); color:#00c853; padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-code"></i> EMBED READY</span>' : ''}
        </div>
        <button onclick="deleteCustomToolItem(${idx})" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:4px 10px; border-radius:4px; font-size:10px; cursor:pointer;"><i class="fa-solid fa-trash" style="margin-right:4px;"></i>Delete Item</button>
      </div>

      <div class="form-grid">
        <div class="field"><label>Tool / Resource Title</label><input id="ct_name_${idx}" value="${t.name || ''}"></div>
        <div class="field">
          <label>Category / Badge Tag</label>
          <select id="ct_cat_${idx}">
            <option value="tool" ${t.category === 'tool' ? 'selected' : ''}>Digital Software Tool</option>
            <option value="tracker" ${t.category === 'tracker' ? 'selected' : ''}>Interactive Tracker</option>
            <option value="worksheet" ${t.category === 'worksheet' ? 'selected' : ''}>PDF Worksheet</option>
            <option value="blueprint" ${t.category === 'blueprint' ? 'selected' : ''}>Strategic Blueprint</option>
            <option value="app" ${t.category === 'app' ? 'selected' : ''}>Web / SaaS App</option>
            <option value="video" ${t.category === 'video' ? 'selected' : ''}>Video Resource</option>
            <option value="audio" ${t.category === 'audio' ? 'selected' : ''}>Audio Briefing</option>
          </select>
        </div>

        <div class="field full">
          <label>Description & Features (Rich Word-Type Text Editor)</label>
          ${createRichEditorHtml(`ct_desc_${idx}`, t.desc || '', 'Enter tool description, instructions, features, and takeaways...', '130px')}
        </div>

        <div class="field"><label>Launch / Download Destination URL</label><input id="ct_url_${idx}" value="${t.url || ''}" placeholder="https://... or pages/tracker.html"></div>
        <div class="field"><label>Button Action Label</label><input id="ct_btn_${idx}" value="${t.btnLabel || 'Launch Tool →'}" placeholder="Launch Tool →"></div>

        <div class="field full">
          <label>Live Interactive Embed Code (HTML / iFrame / Widget / Dashboard)</label>
          <textarea id="ct_embed_${idx}" style="height:90px; font-family:monospace; font-size:0.8rem;" placeholder="<iframe src='https://...' width='100%' height='500' frameborder='0'></iframe>">${t.embedCode || ''}</textarea>
        </div>

        <div class="field full">
          <label>Cover Thumbnail / Icon Media URL</label>
          <div style="display:flex; gap:6px;">
            <input id="ct_thumb_${idx}" value="${t.thumbnail || ''}" placeholder="Upload or image URL">
            <input type="file" id="ct_file_${idx}" style="display:none;" onchange="uploadToolItemMedia(${idx})">
            <button class="secondary" onclick="document.getElementById('ct_file_${idx}').click()">Upload Image</button>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:14px; align-items:center;">
        <button class="primary" onclick="saveCustomToolEdit(${idx})" style="padding:8px 16px; font-size:11px;"><i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Changes To Tool</button>
        ${t.embedCode || t.url ? `<button class="secondary" onclick="previewToolInModal('${(t.name||'').replace(/'/g,"\\'")}', ${idx})" style="padding:8px 14px; font-size:11px;"><i class="fa-solid fa-play" style="margin-right:4px;"></i>Test &amp; Preview Runtime</button>` : ''}
      </div>
    </div>
  `).join('');

  return page('Tools & Resource HUD Manager', 'Maintain featured tools, member resource library, interactive iFrame/HTML embeds, custom resources, and member tool access.', 'Save Tool Settings', `
  
  <!-- 1. FEATURED DIGITAL SOFTWARE TOOLS -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>1. Featured Digital Software Tools</h3><span>PRICING, MEDIA &amp; LAUNCH LINKS</span></div>
    <div class="form-grid">
      <div class="field"><label>IMI Compass Title</label><input id="tools-compass-title" value="${sc['tools.compass_title'] || 'IMI Compass'}"></div>
      <div class="field"><label>IMI Compass Price</label><input id="tools-compass-price" value="${sc['tools.compass_price'] || '$9.99 ONE-TIME'}"></div>
      <div class="field full">
        <label>IMI Compass Description (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('tools-compass-desc', sc['tools.compass_desc'] || 'Strategic alignment app mapping audience segments, brand identity parameters, and positioning metrics.', 'Enter compass description...', '110px')}
      </div>
      <div class="field"><label>IMI Compass Launch URL</label><input id="tools-compass-url" value="${sc['tools.compass_url'] || 'https://mnemonic-compass.vercel.app/'}"></div>
      <div class="field">
        <label>IMI Compass Image / Media URL</label>
        <div style="display:flex; gap:6px;">
          <input id="tools-compass-img" value="${sc['tools.compass_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tools-compass-file" style="display:none;" onchange="uploadCMSMedia('tools.compass_media', 'tools-compass-img', 'tools-compass-file')">
          <button class="secondary" onclick="document.getElementById('tools-compass-file').click()">Upload Image</button>
        </div>
      </div>

      <div class="field" style="margin-top:15px;"><label>iM Time Command Title</label><input id="tools-time-title" value="${sc['tools.time_title'] || 'iM Time Command'}"></div>
      <div class="field" style="margin-top:15px;"><label>iM Time Command Price</label><input id="tools-time-price" value="${sc['tools.time_price'] || '$7.99 ONE-TIME'}"></div>
      <div class="field full">
        <label>iM Time Command Description (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('tools-time-desc', sc['tools.time_desc'] || 'High-performance productivity dashboard featuring task commands, timeline scheduling, and timezone mappings.', 'Enter time command description...', '110px')}
      </div>
      <div class="field"><label>iM Time Command Launch URL</label><input id="tools-time-url" value="${sc['tools.time_url'] || 'https://im-time-command.vercel.app/'}"></div>
      <div class="field">
        <label>iM Time Command Image / Media URL</label>
        <div style="display:flex; gap:6px;">
          <input id="tools-time-img" value="${sc['tools.time_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="tools-time-file" style="display:none;" onchange="uploadCMSMedia('tools.time_media', 'tools-time-img', 'tools-time-file')">
          <button class="secondary" onclick="document.getElementById('tools-time-file').click()">Upload Image</button>
        </div>
      </div>

      <div class="field" style="margin-top:15px;"><label>Commander Bundle Price</label><input id="pricing-bundle-price" value="${sc['pricing.bundle'] || '$14.99 ONE-TIME'}"></div>
      <div class="field" style="margin-top:15px;"><label>Commander Bundle Checkout Link</label><input id="pricing-bundle-url" value="${sc['pricing.bundle_url'] || 'pages/commander-bundle.html'}"></div>
      <div class="field full">
        <label>Commander Bundle Image / Media URL</label>
        <div style="display:flex; gap:6px;">
          <input id="pricing-bundle-img" value="${sc['pricing.bundle_media'] || ''}" placeholder="Upload or image URL">
          <input type="file" id="pricing-bundle-file" style="display:none;" onchange="uploadCMSMedia('pricing.bundle_media', 'pricing-bundle-img', 'pricing-bundle-file')">
          <button class="secondary" onclick="document.getElementById('pricing-bundle-file').click()">Upload Image</button>
        </div>
      </div>
    </div>
    <button class="primary" onclick="saveToolsConfig()" style="padding:10px 18px; font-size:12px; margin-top:14px;"><i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Digital Tools Configuration</button>
  </div>

  <!-- 2. MEMBER RESOURCE LIBRARY ITEMS -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>2. Member Resource Library Items</h3><span>BLUEPRINTS, WORKSHEETS &amp; TRACKERS</span></div>
    <div class="form-grid">
      <!-- Tracker -->
      <div class="field"><label>Featured Tracker Title</label><input id="res-tracker-title-input" value="${sc['res.tracker_title'] || 'My IMI Progress Tracker & High-Trust Doer Cockpit'}"></div>
      <div class="field"><label>Featured Tracker App URL</label><input id="res-tracker-url-input" value="${sc['res.tracker_url'] || 'tracker.html'}"></div>
      <div class="field full">
        <label>Featured Tracker Description (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('res-tracker-desc-input', sc['res.tracker_desc'] || 'Track your XP earnings, complete level milestones, log daily strategy activities, view growth charts, and export formatted Excel progress reports.', 'Enter tracker description...', '110px')}
      </div>

      <!-- Brand Worksheet -->
      <div class="field" style="margin-top:15px;"><label>Brand Positioning Worksheet Title</label><input id="res-brand-title-input" value="${sc['res.brand_title'] || 'Brand Positioning Worksheet'}"></div>
      <div class="field" style="margin-top:15px;">
        <label>Brand Positioning Worksheet Download PDF</label>
        <div style="display:flex; gap:6px;">
          <input id="res-brand-url-input" value="${sc['res.brand_url'] || '../downloads/brand-worksheet.pdf'}">
          <input type="file" id="res-brand-file" style="display:none;" onchange="uploadResourceDoc('res.brand_url', 'res-brand-url-input', 'res-brand-file')">
          <button class="secondary" onclick="document.getElementById('res-brand-file').click()">Upload PDF</button>
        </div>
      </div>
      <div class="field full">
        <label>Brand Positioning Worksheet Description (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('res-brand-desc-input', sc['res.brand_desc'] || 'Step-by-step PDF guide to clarify brand messaging and core offer positioning.', 'Enter worksheet description...', '110px')}
      </div>

      <!-- Solo Corp Primer -->
      <div class="field" style="margin-top:15px;"><label>Solo Corp 30-Day Primer Title</label><input id="res-primer-title-input" value="${sc['res.primer_title'] || 'Solo Corp 30-Day Success Primer'}"></div>
      <div class="field" style="margin-top:15px;">
        <label>Solo Corp 30-Day Primer Download Link</label>
        <div style="display:flex; gap:6px;">
          <input id="res-primer-url-input" value="${sc['res.primer_url'] || '../downloads/brand-worksheet.pdf'}">
          <input type="file" id="res-primer-file" style="display:none;" onchange="uploadResourceDoc('res.primer_url', 'res-primer-url-input', 'res-primer-file')">
          <button class="secondary" onclick="document.getElementById('res-primer-file').click()">Upload PDF</button>
        </div>
      </div>
      <div class="field full">
        <label>Solo Corp 30-Day Primer Description (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('res-primer-desc-input', sc['res.primer_desc'] || 'Personal operating blueprint for independent founders.', 'Enter primer description...', '110px')}
      </div>
    </div>
    <button class="primary" onclick="saveResourcesConfig()" style="padding:10px 18px; font-size:12px; margin-top:14px;"><i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Member Resources Configuration</button>
  </div>

  <!-- 3. ADD NEW CUSTOM TOOL OR RESOURCE (OPTIMIZED FORM WITH EMBED) -->
  <div class="card" style="margin-bottom:20px; border-left:3px solid var(--gold);">
    <div class="card-title">
      <h3><i class="fa-solid fa-plus-circle" style="color:var(--gold); margin-right:8px;"></i>Add New Tool, Resource or Embedded App</h3>
      <span>NEW ITEM BUILDER</span>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Tool / Resource Name</label>
        <input id="new-tool-name" placeholder="e.g. Market Signal Radar or Financial Model Template">
      </div>
      <div class="field">
        <label>Category / Type Tag</label>
        <select id="new-tool-category">
          <option value="tool">Digital Software Tool</option>
          <option value="tracker">Interactive Tracker</option>
          <option value="worksheet">PDF Worksheet</option>
          <option value="blueprint">Strategic Blueprint</option>
          <option value="app">Web / SaaS App</option>
          <option value="video">Video Training</option>
          <option value="audio">Audio Briefing</option>
        </select>
      </div>

      <div class="field full">
        <label>Description &amp; Feature Highlights (Rich Word-Type Text Editor)</label>
        ${createRichEditorHtml('new-tool-desc', '', 'Enter tool description, key features, bullet points, hyperlinks, and member takeaways...', '140px')}
      </div>

      <div class="field">
        <label>Launch URL or Destination Path</label>
        <input id="new-tool-url" placeholder="https://... or pages/tracker.html">
      </div>
      <div class="field">
        <label>Action Button Label</label>
        <input id="new-tool-btnlabel" value="Launch Tool &rarr;" placeholder="Launch Tool &rarr; or Download PDF">
      </div>

      <div class="field full">
        <label>Live Interactive Embed Code (HTML / iFrame / Widget / Dashboard)</label>
        <textarea id="new-tool-embed" style="height:95px; font-family:monospace; font-size:0.8rem;" placeholder="<iframe src='https://...' width='100%' height='500' frameborder='0'></iframe>"></textarea>
      </div>

      <div class="field full">
        <label>Featured Cover Image / Icon Media URL</label>
        <div style="display:flex; gap:6px;">
          <input id="new-tool-thumb" placeholder="Upload or paste image URL">
          <input type="file" id="new-tool-thumb-file" style="display:none;" onchange="uploadNewToolMedia()">
          <button class="secondary" onclick="document.getElementById('new-tool-thumb-file').click()">Upload Image</button>
        </div>
      </div>
    </div>
    <button class="primary" onclick="saveNewCustomTool()" style="padding:10px 20px; font-size:12px; margin-top:16px;"><i class="fa-solid fa-circle-check" style="margin-right:6px;"></i>Publish Tool / Resource to Member Accounts</button>
  </div>

  <!-- 4. GLOBAL RESOURCE HUD IFRAME -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>4. Global Member Resource HUD &amp; Embed Container</h3><span>GLOBAL IFRAME EMBED</span></div>
    <p style="font-size:0.85rem; color:var(--muted); margin-bottom:12px;">Paste global iFrame or HTML embed code here. It will display and run directly at the top of the Member Portal Resource &amp; Tools panel.</p>
    <div class="field full">
      <label>Global Embed Tool iFrame / Code for Member Resource Section</label>
      <textarea id="tools-hud-iframe" style="height:110px; font-family:monospace;" placeholder="<iframe src='https://...' width='100%' height='500' frameborder='0'></iframe>">${sc['tools.hud_iframe'] || ''}</textarea>
    </div>
    <button class="primary" onclick="saveToolHUD()" style="padding:10px 18px; font-size:12px; margin-top:12px;"><i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Tool HUD &amp; Sync to Members Account</button>
  </div>

  <!-- 5. PUBLISHED CUSTOM TOOLS ROSTER -->
  <div class="card">
    <div class="card-title"><h3>5. Published Custom Embedded Tools &amp; Resources</h3><span>ACTIVE MEMBER ROSTER</span></div>
    ${customToolsHtml || `<div style="font-size:12px; color:var(--muted); padding:12px 0;">No custom tools added yet. Fill out the "Add New Tool" form above to publish your first one.</div>`}
  </div>`);
}

window.uploadResourceDoc = async function(key, targetInputId, fileInputId) {
  const fileInput = document.getElementById(fileInputId);
  const input = document.getElementById(targetInputId);
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'resources', 'doc');
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      await IMI_AUTH.saveSiteContent(key, res.url);
      window.dispatchEvent(new CustomEvent('imi_content_updated'));
      imiToast('Worksheet PDF uploaded & saved!', 'success');
    }
  } catch(e) { console.warn('Resource upload error:', e); }
};

window.uploadNewToolMedia = async function() {
  const fileInput = document.getElementById('new-tool-thumb-file');
  const input = document.getElementById('new-tool-thumb');
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'tools', 'thumb');
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Tool cover image uploaded!', 'success');
    }
  } catch(e) { console.warn('Tool image upload error:', e); }
};

window.uploadToolItemMedia = async function(idx) {
  const fileInput = document.getElementById(`ct_file_${idx}`);
  const input = document.getElementById(`ct_thumb_${idx}`);
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'tools', `thumb_${idx}`);
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Tool image uploaded!', 'success');
    }
  } catch(e) { console.warn('Tool image upload error:', e); }
};

window.saveNewCustomTool = async function() {
  if (window.syncRichEditor) window.syncRichEditor('new-tool-desc');
  const name = document.getElementById('new-tool-name')?.value.trim();
  if (!name) { imiToast('Please enter a tool or resource name.', 'error'); return; }

  const category = document.getElementById('new-tool-category')?.value || 'tool';
  const desc = document.getElementById('new-tool-desc')?.value.trim() || '';
  const url = document.getElementById('new-tool-url')?.value.trim() || '';
  const btnLabel = document.getElementById('new-tool-btnlabel')?.value.trim() || 'Launch Tool →';
  const embedCode = document.getElementById('new-tool-embed')?.value.trim() || '';
  const thumbnail = document.getElementById('new-tool-thumb')?.value.trim() || '';

  let list = [];
  try { list = JSON.parse(localStorage.getItem('imi_cms_tools') || '[]'); } catch(e) {}
  list.unshift({ name, category, desc, url, btnLabel, embedCode, thumbnail, created_at: new Date().toISOString() });

  const payload = JSON.stringify(list);
  localStorage.setItem('imi_cms_tools', payload);
  await IMI_AUTH.saveSiteContent('cms_tools', payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast(`Tool "${name}" published to Member Accounts!`, "success");
  await render();
};

window.saveCustomToolEdit = async function(idx) {
  if (window.syncRichEditor) window.syncRichEditor(`ct_desc_${idx}`);
  let list = [];
  try { list = JSON.parse(localStorage.getItem('imi_cms_tools') || '[]'); } catch(e) {}
  if (!list[idx]) return;

  list[idx].name = document.getElementById(`ct_name_${idx}`)?.value.trim() || list[idx].name;
  list[idx].category = document.getElementById(`ct_cat_${idx}`)?.value || list[idx].category || 'tool';
  list[idx].desc = document.getElementById(`ct_desc_${idx}`)?.value.trim() || '';
  list[idx].url = document.getElementById(`ct_url_${idx}`)?.value.trim() || '';
  list[idx].btnLabel = document.getElementById(`ct_btn_${idx}`)?.value.trim() || 'Launch Tool →';
  list[idx].embedCode = document.getElementById(`ct_embed_${idx}`)?.value.trim() || '';
  list[idx].thumbnail = document.getElementById(`ct_thumb_${idx}`)?.value.trim() || '';
  list[idx].updated_at = new Date().toISOString();

  const payload = JSON.stringify(list);
  localStorage.setItem('imi_cms_tools', payload);
  await IMI_AUTH.saveSiteContent('cms_tools', payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast(`Tool "${list[idx].name}" updated!`, "success");
  await render();
};

window.deleteCustomToolItem = async function(idx) {
  if (!confirm('Remove this tool or resource from member accounts?')) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem('imi_cms_tools') || '[]'); } catch(e) {}
  list.splice(idx, 1);

  const payload = JSON.stringify(list);
  localStorage.setItem('imi_cms_tools', payload);
  await IMI_AUTH.saveSiteContent('cms_tools', payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Tool removed from member accounts.', 'info');
  await render();
};

window.previewToolInModal = function(title, idx) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem('imi_cms_tools') || '[]'); } catch(e) {}
  const tool = list[idx];
  if (!tool) return;

  const modalHtml = tool.embedCode || (tool.url ? `<iframe src="${tool.url}" style="width:100%; height:500px; border:none;" allowfullscreen></iframe>` : '<p>No preview URL or embed code available.</p>');
  
  let pModal = document.getElementById('adminToolPreviewModal');
  if (!pModal) {
    pModal = document.createElement('div');
    pModal.id = 'adminToolPreviewModal';
    pModal.style.cssText = 'position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; padding:20px;';
    document.body.appendChild(pModal);
  }
  pModal.innerHTML = `
    <div style="background:#12151b; border:1px solid var(--gold-border, rgba(201,162,39,0.4)); border-radius:12px; width:100%; max-width:900px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.9);">
      <div style="padding:14px 20px; background:#181d26; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:var(--gold); font-size:1rem;">Preview: ${title}</strong>
        <button onclick="document.getElementById('adminToolPreviewModal').style.display='none'" style="background:transparent; border:none; color:#aaa; font-size:22px; cursor:pointer;">&times;</button>
      </div>
      <div style="padding:20px; flex:1; overflow-y:auto; color:#fff;">${modalHtml}</div>
    </div>
  `;
  pModal.style.display = 'flex';
};

window.saveResourcesConfig = async function() {
  if (window.syncRichEditor) {
    window.syncRichEditor('res-tracker-desc-input');
    window.syncRichEditor('res-brand-desc-input');
    window.syncRichEditor('res-primer-desc-input');
  }

  const tTitle = document.getElementById('res-tracker-title-input')?.value || '';
  const tUrl   = document.getElementById('res-tracker-url-input')?.value || '';
  const tDesc  = document.getElementById('res-tracker-desc-input')?.value || '';

  const bTitle = document.getElementById('res-brand-title-input')?.value || '';
  const bUrl   = document.getElementById('res-brand-url-input')?.value || '';
  const bDesc  = document.getElementById('res-brand-desc-input')?.value || '';

  const pTitle = document.getElementById('res-primer-title-input')?.value || '';
  const pUrl   = document.getElementById('res-primer-url-input')?.value || '';
  const pDesc  = document.getElementById('res-primer-desc-input')?.value || '';

  await IMI_AUTH.saveSiteContent('res.tracker_title', tTitle);
  await IMI_AUTH.saveSiteContent('res.tracker_url', tUrl);
  await IMI_AUTH.saveSiteContent('res.tracker_desc', tDesc);

  await IMI_AUTH.saveSiteContent('res.brand_title', bTitle);
  await IMI_AUTH.saveSiteContent('res.brand_url', bUrl);
  await IMI_AUTH.saveSiteContent('res.brand_desc', bDesc);

  await IMI_AUTH.saveSiteContent('res.primer_title', pTitle);
  await IMI_AUTH.saveSiteContent('res.primer_url', pUrl);
  await IMI_AUTH.saveSiteContent('res.primer_desc', pDesc);

  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Member Resources saved & published!', 'success');
  await render();
};

window.saveToolsConfig = async function() {
  if (window.syncRichEditor) {
    window.syncRichEditor('tools-compass-desc');
    window.syncRichEditor('tools-time-desc');
  }

  const cTitle = document.getElementById('tools-compass-title')?.value || 'IMI Compass';
  const cPrice = document.getElementById('tools-compass-price')?.value || '$9.99 ONE-TIME';
  const cDesc  = document.getElementById('tools-compass-desc')?.value || '';
  const cUrl   = document.getElementById('tools-compass-url')?.value || '';
  const cImg   = document.getElementById('tools-compass-img')?.value || '';

  const tTitle = document.getElementById('tools-time-title')?.value || 'iM Time Command';
  const tPrice = document.getElementById('tools-time-price')?.value || '$7.99 ONE-TIME';
  const tDesc  = document.getElementById('tools-time-desc')?.value || '';
  const tUrl   = document.getElementById('tools-time-url')?.value || '';
  const tImg   = document.getElementById('tools-time-img')?.value || '';

  const bPrice = document.getElementById('pricing-bundle-price')?.value || '$14.99 ONE-TIME';
  const bUrl   = document.getElementById('pricing-bundle-url')?.value || '';
  const bImg   = document.getElementById('pricing-bundle-img')?.value || '';

  await IMI_AUTH.saveSiteContent('tools.compass_title', cTitle);
  await IMI_AUTH.saveSiteContent('tools.compass_price', cPrice);
  await IMI_AUTH.saveSiteContent('tools.compass_desc', cDesc);
  await IMI_AUTH.saveSiteContent('tools.compass_url', cUrl);
  await IMI_AUTH.saveSiteContent('tools.compass_media', cImg);

  await IMI_AUTH.saveSiteContent('tools.time_title', tTitle);
  await IMI_AUTH.saveSiteContent('tools.time_price', tPrice);
  await IMI_AUTH.saveSiteContent('tools.time_desc', tDesc);
  await IMI_AUTH.saveSiteContent('tools.time_url', tUrl);
  await IMI_AUTH.saveSiteContent('tools.time_media', tImg);

  await IMI_AUTH.saveSiteContent('pricing.bundle', bPrice);
  await IMI_AUTH.saveSiteContent('pricing.bundle_url', bUrl);
  await IMI_AUTH.saveSiteContent('pricing.bundle_media', bImg);

  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Digital Tools saved & published!', 'success');
  await render();
};

window.saveToolHUD = async function() {
  const code = document.getElementById('tools-hud-iframe')?.value || '';
  await IMI_AUTH.saveSiteContent('tools.hud_iframe', code);
  localStorage.setItem('imi_tools_hud_iframe', code);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Tool HUD iFrame saved & synced to member accounts!');
  await render();
};

// ── Members & Memberships View ────────────────────────────────────────
function members() {
  const membersList = state.data.memberList || [];

  const rows = membersList.map(m => {
    const isFree = m.role === 'free' || m.role === 'visitor';
    const roleLabel = m.role === 'admin' ? 'ADMIN' : (m.role === 'core_elite' ? 'CORE ELITE' : (isFree ? 'FREE TIER' : 'CORE TRIBE'));
    const joined = m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'Active Member';
    const lastActive = m.last_seen || m.last_sign_in ? new Date(m.last_seen || m.last_sign_in).toLocaleString() : 'Recent Session';
    const safeId = m.id || '';
    const safeEmail = m.email || '';
    const safeName = m.full_name || m.name || m.email?.split('@')[0] || 'Member';

    // Initials for avatar fallback
    const parts = safeName.split(' ').filter(Boolean);
    const initials = (parts[0]?.[0] || 'M') + (parts[1]?.[0] || '');

    // Contact info
    const phone = m.phone || '';
    const company = m.company || '';
    const location = m.location || '';
    const status = m.status || (isFree ? 'free_tier' : 'active');
    const notes = m.notes || '';

    // Status Badge config
    let statusBadgeHtml = '<span class="badge" style="color:#22c55e; border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.1);">ACTIVE</span>';
    if (m.role === 'admin') {
      statusBadgeHtml = '<span class="badge" style="color:var(--gold); border-color:var(--gold); background:rgba(201,162,39,0.1);">ADMIN</span>';
    } else if (status === 'follow_up_needed' || status === 'followup') {
      statusBadgeHtml = '<span class="badge" style="color:#ef4444; border-color:#ef4444; background:rgba(239,68,68,0.15); font-weight:700;">⚠️ FOLLOW-UP</span>';
    } else if (status === 'vip') {
      statusBadgeHtml = '<span class="badge" style="color:#f59e0b; border-color:#f59e0b; background:rgba(245,158,11,0.15);">VIP CLIENT</span>';
    } else if (status === 'onboarding') {
      statusBadgeHtml = '<span class="badge" style="color:#a855f7; border-color:#a855f7; background:rgba(168,85,247,0.15);">ONBOARDING</span>';
    } else if (isFree) {
      statusBadgeHtml = '<span class="badge" style="color:#60a5fa; border-color:rgba(96,165,250,0.3); background:rgba(96,165,250,0.1);">FREE TIER</span>';
    }

    return `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
      <!-- Member Info & Picture -->
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          ${m.avatar_url
            ? `<img src="${m.avatar_url}" alt="${safeName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--gold); flex-shrink:0;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--gold), #7a5f10); color:#000; font-family:var(--font-heading); font-size:13px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid var(--gold-light);">${initials.toUpperCase()}</div>`
          }
          <div>
            <div style="font-weight:700; color:#fff; font-size:13px;">${safeName}</div>
            <div style="color:var(--muted); font-size:11px; font-family:var(--font-mono);">${safeEmail}</div>
            ${location ? `<div style="font-size:10px; color:var(--silver); margin-top:2px;"><i class="fa-solid fa-location-dot" style="color:var(--gold); font-size:9px; margin-right:4px;"></i>${location}</div>` : ''}
          </div>
        </div>
      </td>

      <!-- Contact Details -->
      <td>
        <div style="display:flex; flex-direction:column; gap:3px;">
          ${phone
            ? `<div style="display:flex; align-items:center; gap:6px;">
                 <a href="tel:${phone}" style="color:var(--gold); text-decoration:none; font-size:11px; font-weight:600;"><i class="fa-solid fa-phone" style="font-size:10px; margin-right:4px;"></i>${phone}</a>
                 <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" style="background:#25D366; color:#000; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:800; text-decoration:none;">WA</a>
               </div>`
            : `<span style="color:var(--muted); font-size:11px;">No phone recorded</span>`
          }
          ${company
            ? `<div style="color:#fff; font-size:11px;"><i class="fa-solid fa-building" style="color:var(--muted); font-size:10px; margin-right:4px;"></i>${company}</div>`
            : ''
          }
          ${m.website
            ? `<div><a href="${m.website}" target="_blank" style="color:#60a5fa; font-size:10px; text-decoration:none;"><i class="fa-solid fa-link" style="font-size:9px; margin-right:3px;"></i>Website / LinkedIn</a></div>`
            : ''
          }
        </div>
      </td>

      <!-- Membership Tier -->
      <td>
        <select onchange="window.updateUserRole('${safeId}', '${safeEmail}', this.value)" style="background:#0b0d10; border:1px solid var(--line); color:var(--text); padding:5px 8px; border-radius:6px; font-size:11px; cursor:pointer;">
          <option value="free" ${isFree ? 'selected' : ''}>Free Tier (Limited)</option>
          <option value="core_tribe" ${m.role === 'core_tribe' ? 'selected' : ''}>Core Tribe ($5/mo)</option>
          <option value="core_elite" ${m.role === 'core_elite' ? 'selected' : ''}>Core Elite (VIP)</option>
          <option value="admin" ${m.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <div style="margin-top:4px;">${statusBadgeHtml}</div>
      </td>

      <!-- Follow-Up Notes & Status -->
      <td>
        <div style="max-width:220px;">
          ${notes
            ? `<div style="font-size:11px; color:#e2e8f0; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:4px 8px; line-height:1.4; margin-bottom:4px;">
                 📝 ${notes}
               </div>`
            : `<div style="font-size:10px; color:var(--muted); margin-bottom:4px;">No follow-up notes</div>`
          }
          <button onclick="window.quickEditMemberNotes('${safeId}', '${safeEmail}')" style="background:transparent; border:none; color:var(--gold); font-size:10px; cursor:pointer; padding:0; text-decoration:underline;">
            + Edit Follow-Up Note
          </button>
        </div>
      </td>

      <!-- Activity & Joined -->
      <td>
        <div style="font-size:11px; color:var(--muted);"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>${joined}</div>
        <div style="font-size:10px; color:var(--gold); margin-top:2px;"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${lastActive}</div>
      </td>

      <!-- Actions -->
      <td>
        <div style="display:flex; gap:6px;">
          <a href="portal.html?email=${encodeURIComponent(safeEmail)}" target="_blank" title="View Portal as this Member" style="background:rgba(96,165,250,0.12); border:1px solid rgba(96,165,250,0.35); color:#60a5fa; padding:5px 8px; border-radius:6px; font-size:11px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Portal
          </a>
          <button onclick="window.openEditMemberModal('${safeId}', '${safeEmail}')" style="background:rgba(201,162,39,0.12); border:1px solid rgba(201,162,39,0.35); color:var(--gold); padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button onclick="window.removeUser('${safeId}', '${safeEmail}')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:var(--danger); padding:5px 8px; border-radius:6px; font-size:11px; cursor:pointer;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  const freeCount = membersList.filter(x => x.role === 'free' || x.role === 'visitor').length;
  const paidCount = membersList.filter(x => x.role === 'core_tribe' || x.role === 'core_elite').length;
  const followUpCount = membersList.filter(x => x.status === 'follow_up_needed' || x.status === 'followup').length;

  return page('Members & Memberships Manager', 'Comprehensive roster, tier access control, account details editor, contact info & follow-up tracking.', 'Add Member', `
  <div class="grid stats" style="margin-bottom:20px;">
    <div class="card"><div class="stat-label">Total Active Members</div><div class="stat-value">${membersList.length}</div></div>
    <div class="card"><div class="stat-label">Free Tier Accounts</div><div class="stat-value" style="color:#60a5fa;">${freeCount}</div></div>
    <div class="card"><div class="stat-label">Core Tribe / Elite</div><div class="stat-value" style="color:var(--gold);">${paidCount}</div></div>
    <div class="card"><div class="stat-label">Follow-Up Action Items</div><div class="stat-value" style="color:${followUpCount > 0 ? '#ef4444' : 'var(--muted)'};">${followUpCount}</div></div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px; background:#0b0d10; border:1px solid var(--line); border-radius:8px; padding:12px 16px;">
    <div style="font-size:12px; color:var(--muted);">
      <i class="fa-solid fa-cloud-arrow-down" style="color:var(--gold); margin-right:6px;"></i> Cloud Synchronized Database &amp; Member Registry (${membersList.length} total members registered)
    </div>
    <div style="display:flex; gap:8px;">
      <button type="button" onclick="window.refreshMembersRoster()" style="background:#15181e; border:1px solid var(--gold); color:var(--gold); padding:8px 14px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
        <i class="fa-solid fa-arrows-rotate"></i> Sync &amp; Refresh Roster
      </button>
      <button type="button" onclick="window.quickAddFreeMember()" style="background:var(--gold); color:#000; border:none; padding:8px 14px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
        <i class="fa-solid fa-user-plus"></i> Quick Add Member
      </button>
    </div>
  </div>

  <div class="card table-wrap"><table class="table"><thead><tr>
    <th>Member / Profile</th>
    <th>Contact Details</th>
    <th>Membership Tier</th>
    <th>Follow-Up &amp; Notes</th>
    <th>Joined / Last Active</th>
    <th>Actions</th>
  </tr></thead><tbody>
  ${rows || '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No members found. Use "Add Member" or "Quick Add Member" above to create accounts.</td></tr>'}
  </tbody></table></div>`);
}

// ── Member Management Global Helpers ─────────────────────────────────────
window.refreshMembersRoster = async function() {
  if (window.imiToast) window.imiToast('Connecting to Supabase and refreshing roster...', 'info', 2000);
  try {
    await render();
    const count = (state.data.memberList || []).length;
    if (window.imiToast) window.imiToast('Roster updated from Supabase (' + count + ' members loaded)!', 'success');
  } catch (err) {
    console.error('Refresh roster error:', err);
    if (window.imiToast) window.imiToast('Error refreshing roster: ' + err.message, 'error');
  }
};

window.quickAddFreeMember = async function() {
  const name = prompt('Enter Member Full Name:');
  if (!name) return;
  const email = prompt('Enter Member Email Address:');
  if (!email) return;
  const phone = prompt('Enter Phone Number (optional):', '');
  const pass = prompt('Enter Temporary Password (optional):', 'imi123456');

  if (window.IMI_AUTH && window.IMI_AUTH.createMemberAccount) {
    const res = await window.IMI_AUTH.createMemberAccount(email, pass || 'imi123456', name, 'free');
    if (res.success) {
      if (phone && window.IMI_AUTH.updateMemberProfile) {
        await window.IMI_AUTH.updateMemberProfile(res.user?.id || email, { phone: phone, email: email, full_name: name });
      }
      if (window.imiToast) window.imiToast('Member "' + name + '" registered and saved to Supabase!', 'success');
      await render();
    } else {
      if (window.imiToast) window.imiToast('Failed to add member: ' + (res.error || 'Unknown error'), 'error');
    }
  }
};

window.quickEditMemberNotes = async function(userId, email) {
  const membersList = state.data.memberList || [];
  const m = membersList.find(x => (userId && x.id === userId) || (email && x.email && x.email.toLowerCase() === email.toLowerCase())) || {};
  const currentNote = m.notes || '';
  const newNote = prompt('Enter follow-up note for ' + (m.full_name || email) + ':', currentNote);
  if (newNote !== null) {
    await window.IMI_AUTH.updateMemberProfile(userId, { notes: newNote.trim() }, email);
    if (window.imiToast) window.imiToast('Follow-up note updated!', 'success');
    await render();
  }
};

window.updateUserRole = async function(userId, email, newRole) {
  if (arguments.length === 2) {
    newRole = email;
    email = '';
  }
  const res = await IMI_AUTH.updateMemberRole(userId, newRole, email);
  if (res && res.success === false) {
    imiToast(`Failed to update tier: ${res.error || 'Database error'}`, 'error');
  } else {
    imiToast('Member membership tier updated successfully!', 'success');
  }
  await render();
};

window.removeUser = async function(userId, email) {
  if (confirm('Are you sure you want to delete this member account? This action removes their access completely.')) {
    const res = await IMI_AUTH.deleteMember(userId, email);
    if (res && res.success === false) {
      imiToast(`Failed to delete member: ${res.error || 'Database error'}`, 'error');
    } else {
      imiToast('Member account deleted from database.', 'info');
    }
    await render();
  }
};

window.openEditMemberModal = function(userId, email) {
  const membersList = state.data.memberList || [];
  const m = membersList.find(x => (userId && x.id === userId) || (email && x.email && x.email.toLowerCase() === email.toLowerCase())) || { id: userId, email: email, role: 'free' };

  const existingModal = document.getElementById('edit-member-modal');
  if (existingModal) existingModal.remove();

  const isFree = m.role === 'free' || m.role === 'visitor';
  const status = m.status || (isFree ? 'free_tier' : 'active');

  const modalHtml = `
  <div id="edit-member-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto;">
    <div style="background:#0e1117; border:1px solid rgba(201,162,39,0.35); border-radius:12px; width:100%; max-width:540px; padding:26px; box-shadow:0 24px 60px rgba(0,0,0,0.9); max-height:90vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <h3 style="margin:0; font-size:1.2rem; color:#fff; font-family:var(--font-heading); display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-user-pen" style="color:var(--gold);"></i> Member Profile &amp; Follow-Up Details
        </h3>
        <button onclick="document.getElementById('edit-member-modal').remove()" style="background:transparent; border:none; color:var(--muted); font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Full Name *</label>
            <input id="edit-member-name" value="${m.full_name || m.name || ''}" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;" placeholder="Full Name">
          </div>
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Email Address</label>
            <input id="edit-member-email" value="${m.email || ''}" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:var(--muted); border-radius:6px; font-size:13px;" readonly>
          </div>
        </div>

        <div>
          <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Profile Picture / Avatar URL</label>
          <input id="edit-member-avatar" value="${m.avatar_url || ''}" placeholder="https://... photo or image link" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Membership Tier</label>
            <select id="edit-member-role" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
              <option value="free" ${isFree ? 'selected' : ''}>Free Tier (Limited Access)</option>
              <option value="core_tribe" ${m.role === 'core_tribe' ? 'selected' : ''}>Core Tribe ($5/mo - Full Curriculum)</option>
              <option value="core_elite" ${m.role === 'core_elite' ? 'selected' : ''}>Core Elite (VIP Advisory)</option>
              <option value="admin" ${m.role === 'admin' ? 'selected' : ''}>Administrator (Back Office)</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Account Status</label>
            <select id="edit-member-status" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
              <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
              <option value="free_tier" ${status === 'free_tier' ? 'selected' : ''}>Free Tier</option>
              <option value="follow_up_needed" ${status === 'follow_up_needed' || status === 'followup' ? 'selected' : ''}>Follow-Up Needed</option>
              <option value="onboarding" ${status === 'onboarding' ? 'selected' : ''}>Onboarding In Progress</option>
              <option value="vip" ${status === 'vip' ? 'selected' : ''}>VIP Client</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Phone / WhatsApp</label>
            <input id="edit-member-phone" value="${m.phone || ''}" placeholder="+1 (555) 000-0000" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
          </div>
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Brand / Company</label>
            <input id="edit-member-company" value="${m.company || ''}" placeholder="Brand or Enterprise Name" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Location (City, Country)</label>
            <input id="edit-member-location" value="${m.location || ''}" placeholder="e.g. New York, USA" style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
          </div>
          <div>
            <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Website / LinkedIn</label>
            <input id="edit-member-website" value="${m.website || ''}" placeholder="https://..." style="width:100%; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:13px;">
          </div>
        </div>

        <div>
          <label style="font-size:11px; color:var(--silver); font-weight:600; display:block; margin-bottom:4px;">Member Strategic Goals / Focus Area</label>
          <textarea id="edit-member-bio" placeholder="Primary objective, brand architecture goals, or curriculum notes..." style="width:100%; height:55px; padding:8px 12px; background:#0b0d10; border:1px solid var(--line); color:#fff; border-radius:6px; font-size:12px; box-sizing:border-box;">${m.bio || ''}</textarea>
        </div>

        <div>
          <label style="font-size:11px; color:var(--gold); font-weight:700; display:block; margin-bottom:4px;">Admin Follow-Up Notes &amp; Outreach Log</label>
          <textarea id="edit-member-notes" placeholder="Notes for team follow-up: calls scheduled, emails sent, upgrade discussions..." style="width:100%; height:65px; padding:8px 12px; background:#0b0d10; border:1px solid rgba(201,162,39,0.3); color:#fff; border-radius:6px; font-size:12px; box-sizing:border-box;">${m.notes || ''}</textarea>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:22px; border-top:1px solid rgba(255,255,255,0.06); padding-top:16px;">
        <button onclick="document.getElementById('edit-member-modal').remove()" style="padding:9px 16px; background:transparent; border:1px solid var(--line); color:var(--muted); border-radius:6px; font-size:12px; cursor:pointer;">Cancel</button>
        <button onclick="window.saveMemberEdits('${m.id || ''}', '${m.email || ''}')" style="padding:9px 20px; background:var(--gold); border:none; color:#000; font-weight:700; border-radius:6px; font-size:12px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
          <i class="fa-solid fa-floppy-disk"></i> Save Member Details
        </button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.saveMemberEdits = async function(userId, memberEmail) {
  const name = document.getElementById('edit-member-name')?.value.trim();
  const avatar = document.getElementById('edit-member-avatar')?.value.trim();
  const role = document.getElementById('edit-member-role')?.value;
  const status = document.getElementById('edit-member-status')?.value;
  const phone = document.getElementById('edit-member-phone')?.value.trim();
  const company = document.getElementById('edit-member-company')?.value.trim();
  const location = document.getElementById('edit-member-location')?.value.trim();
  const website = document.getElementById('edit-member-website')?.value.trim();
  const bio = document.getElementById('edit-member-bio')?.value.trim();
  const notes = document.getElementById('edit-member-notes')?.value.trim();

  const payload = {
    full_name: name,
    avatar_url: avatar,
    role: role,
    status: status,
    phone: phone,
    company: company,
    location: location,
    website: website,
    bio: bio,
    notes: notes,
    email: memberEmail
  };

  if (window.imiToast) window.imiToast('Saving member profile changes to Supabase...', 'info', 2000);
  const res = await IMI_AUTH.updateMemberProfile(userId, payload, memberEmail);

  if (res && res.success) {
    document.getElementById('edit-member-modal')?.remove();
    if (window.imiToast) window.imiToast('Member profile and follow-up notes updated!', 'success');
    await render();
  } else {
    if (window.imiToast) window.imiToast('Error updating member: ' + (res?.error || 'Database error'), 'error');
  }
};

// ── Action Event Binding ──────────────────────────────────────────────
function bindActions() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = async () => {
      const actionName = btn.dataset.action;

      if (actionName === 'Save Website') {
        const fields = [
          'site.logo', 'hero.banner_url', 'hero.eyebrow', 'hero.line1', 'hero.line2',
          'hero.line3', 'hero.description', 'hero.btn1', 'hero.btn1_url', 'hero.btn2', 'hero.btn2_url',
          'approach.label', 'approach.line1', 'approach.line2', 'approach.desc', 'approach.conc_title', 'approach.conc_desc', 'approach.media',
          'eco.solocorp_media', 'eco.tribe_media', 'eco.blueprint_media',
          'solutions.label', 'solutions.line1', 'solutions.line2', 'solutions.desc', 'solutions.media',
          'tools.compass_price', 'tools.compass_url', 'tools.compass_media', 'tools.time_price', 'tools.time_url', 'tools.time_media',
          'pricing.bundle', 'pricing.bundle_media', 'pricing.tribe', 'pricing.tribe_media', 'res.brand_pdf', 'res.solocorp_pdf',
          'learn_prev.label', 'learn_prev.h1', 'learn_prev.sub', 'learn_prev.media',
          'learn_prev.c1_title', 'learn_prev.c1_desc', 'learn_prev.c1_link', 'learn_prev.c1_media',
          'learn_prev.c2_title', 'learn_prev.c2_desc', 'learn_prev.c2_link', 'learn_prev.c2_media',
          'learn_prev.c3_title', 'learn_prev.c3_desc', 'learn_prev.c3_link', 'learn_prev.c3_media',
          'cmo.eyebrow', 'cmo.h1', 'cmo.desc', 'cmo.media', 'cmo.cta_text', 'cmo.cta_url',
          'power.h1', 'power.price', 'power.url', 'power.desc', 'power.media',
          'webinar.h1', 'webinar.link', 'webinar.desc', 'webinar.media',
          'about.founder_media', 'solutions.cmo_media', 'solutions.infra_media', 'solutions.consulting_media', 'solutions.campaign_media',
          'solutions.banner_url', 'cmo.banner_url', 'learn.banner_url', 'workshop.banner_url', 'tools.banner_url',
          'solocorp.banner_url', 'tribe.banner_url', 'about.banner_url', 'booking.banner_url',
          'solutions.intro_eyebrow', 'solutions.intro_h2_1', 'solutions.intro_h2_2', 'solutions.intro_desc', 'solutions.intro_media',
          'learn.intro_eyebrow', 'learn.intro_h2_1', 'learn.intro_h2_2', 'learn.intro_desc', 'learn.intro_media',
          'tribe.intro_eyebrow', 'tribe.intro_h2_1', 'tribe.intro_h2_2', 'tribe.intro_desc', 'tribe.intro_media',
          'cmo.intro_eyebrow', 'cmo.intro_h2_1', 'cmo.intro_h2_2', 'cmo.intro_desc', 'cmo.intro_media',
          'news.intro_eyebrow', 'news.intro_h2_1', 'news.intro_h2_2', 'news.intro_desc', 'news.intro_media',
          'workshop.intensive_eyebrow', 'workshop.intensive_title', 'workshop.intensive_desc', 'workshop.intensive_features',
          'workshop.intensive_btn_text', 'workshop.intensive_btn_url', 'workshop.intensive_price', 'workshop.intensive_price_unit',
          'workshop.intensive_duration', 'workshop.intensive_subnote', 'workshop.intensive_media',
          'video.yt_channel_url', 'video.patreon_url', 'video.playlist_embed_url',
          'video.featured_title', 'video.featured_desc', 'video.badge', 'video.sub_heading',
          'comm.youtube_url', 'comm.patreon_url', 'video_hub.featured_url'
        ];

        const fieldIdMap = {
          'site.logo': 'cms-logo',
          'hero.banner_url': 'hero-banner',
          'hero.eyebrow': 'hero-eyebrow',
          'hero.line1': 'hero-line1',
          'hero.line2': 'hero-line2',
          'hero.line3': 'hero-line3',
          'hero.description': 'hero-description',
          'hero.btn1': 'hero-btn1',
          'hero.btn1_url': 'hero-btn1-url',
          'hero.btn2': 'hero-btn2',
          'hero.btn2_url': 'hero-btn2-url',
          'approach.label': 'approach-label',
          'approach.line1': 'approach-line1',
          'approach.line2': 'approach-line2',
          'approach.desc': 'approach-desc',
          'approach.conc_title': 'approach-conc-title',
          'approach.conc_desc': 'approach-conc-desc',
          'approach.media': 'approach-img',
          'eco.solocorp_media': 'eco-solocorp-img',
          'eco.tribe_media': 'eco-tribe-img',
          'eco.blueprint_media': 'eco-blueprint-img',
          'solutions.label': 'solutions-label',
          'solutions.line1': 'solutions-line1',
          'solutions.line2': 'solutions-line2',
          'solutions.desc': 'solutions-desc',
          'solutions.media': 'solutions-img',
          'tools.compass_price': 'tools-compass-price',
          'tools.compass_url': 'tools-compass-url',
          'tools.compass_media': 'tools-compass-img',
          'tools.time_price': 'tools-time-price',
          'tools.time_url': 'tools-time-url',
          'tools.time_media': 'tools-time-img',
          'pricing.bundle': 'pricing-bundle',
          'pricing.bundle_media': 'pricing-bundle-img',
          'pricing.tribe': 'pricing-tribe',
          'pricing.tribe_media': 'pricing-tribe-img',
          'res.brand_pdf': 'res-brand-pdf',
          'res.solocorp_pdf': 'res-solocorp-pdf',
          'learn_prev.label': 'learn-prev-label',
          'learn_prev.h1': 'learn-prev-h1',
          'learn_prev.sub': 'learn-prev-sub',
          'learn_prev.media': 'learn-prev-img',
          'learn_prev.c1_title': 'learn-prev-c1-title',
          'learn_prev.c1_desc': 'learn-prev-c1-desc',
          'learn_prev.c1_link': 'learn-prev-c1-link',
          'learn_prev.c1_media': 'learn-prev-c1-img',
          'learn_prev.c2_title': 'learn-prev-c2-title',
          'learn_prev.c2_desc': 'learn-prev-c2-desc',
          'learn_prev.c2_link': 'learn-prev-c2-link',
          'learn_prev.c2_media': 'learn-prev-c2-img',
          'learn_prev.c3_title': 'learn-prev-c3-title',
          'learn_prev.c3_desc': 'learn-prev-c3-desc',
          'learn_prev.c3_link': 'learn-prev-c3-link',
          'learn_prev.c3_media': 'learn-prev-c3-img',
          'cmo.eyebrow': 'cmo-eyebrow',
          'cmo.h1': 'cmo-h1',
          'cmo.desc': 'cmo-desc',
          'cmo.media': 'cmo-img',
          'cmo.cta_text': 'cmo-cta-text',
          'cmo.cta_url': 'cmo-cta-url',
          'power.h1': 'power-h1',
          'power.price': 'power-price',
          'power.url': 'power-url',
          'power.desc': 'power-desc',
          'power.media': 'power-img',
          'webinar.h1': 'webinar-h1',
          'webinar.link': 'webinar-link',
          'webinar.desc': 'webinar-desc',
          'webinar.media': 'webinar-img',
          'about.founder_media': 'about-founder-img',
          'solutions.cmo_media': 'sol-cmo-img',
          'solutions.infra_media': 'sol-infra-img',
          'solutions.consulting_media': 'sol-consulting-img',
          'solutions.campaign_media': 'sol-campaign-img',
          'solutions.banner_url': 'sol-hero-banner',
          'cmo.banner_url': 'cmo-hero-banner',
          'learn.banner_url': 'learn-hero-banner',
          'workshop.banner_url': 'workshop-hero-banner',
          'tools.banner_url': 'tools-hero-banner',
          'solocorp.banner_url': 'solocorp-hero-banner',
          'tribe.banner_url': 'tribe-hero-banner',
          'about.banner_url': 'about-hero-banner',
          'booking.banner_url': 'booking-hero-banner',
          'solutions.intro_eyebrow': 'sol-intro-eyebrow',
          'solutions.intro_h2_1': 'sol-intro-h2-1',
          'solutions.intro_h2_2': 'sol-intro-h2-2',
          'solutions.intro_desc': 'sol-intro-desc',
          'solutions.intro_media': 'sol-intro-img',
          'learn.intro_eyebrow': 'learn-intro-eyebrow',
          'learn.intro_h2_1': 'learn-intro-h2-1',
          'learn.intro_h2_2': 'learn-intro-h2-2',
          'learn.intro_desc': 'learn-intro-desc',
          'learn.intro_media': 'learn-intro-img',
          'tribe.intro_eyebrow': 'tribe-intro-eyebrow',
          'tribe.intro_h2_1': 'tribe-intro-h2-1',
          'tribe.intro_h2_2': 'tribe-intro-h2-2',
          'tribe.intro_desc': 'tribe-intro-desc',
          'tribe.intro_media': 'tribe-intro-img',
          'cmo.intro_eyebrow': 'cmo-intro-eyebrow',
          'cmo.intro_h2_1': 'cmo-intro-h2-1',
          'cmo.intro_h2_2': 'cmo-intro-h2-2',
          'cmo.intro_desc': 'cmo-intro-desc',
          'cmo.intro_media': 'cmo-intro-img',
          'news.intro_eyebrow': 'news-intro-eyebrow',
          'news.intro_h2_1': 'news-intro-h2-1',
          'news.intro_h2_2': 'news-intro-h2-2',
          'news.intro_desc': 'news-intro-desc',
          'news.intro_media': 'news-intro-img',
          'workshop.intensive_eyebrow': 'workshop-intensive-eyebrow',
          'workshop.intensive_title': 'workshop-intensive-title',
          'workshop.intensive_desc': 'workshop-intensive-desc',
          'workshop.intensive_features': 'workshop-intensive-features',
          'workshop.intensive_btn_text': 'workshop-intensive-btn-text',
          'workshop.intensive_btn_url': 'workshop-intensive-btn-url',
          'workshop.intensive_price': 'workshop-intensive-price',
          'workshop.intensive_price_unit': 'workshop-intensive-price-unit',
          'workshop.intensive_duration': 'workshop-intensive-duration',
          'workshop.intensive_subnote': 'workshop-intensive-subnote',
          'workshop.intensive_media': 'workshop-intensive-img',
          'video.yt_channel_url': 'video-yt-channel-url',
          'video.patreon_url': 'video-patreon-url',
          'video.playlist_embed_url': 'video-playlist-embed-url',
          'video.featured_title': 'video-featured-title',
          'video.featured_desc': 'video-featured-desc',
          'video.badge': 'video-badge',
          'video.sub_heading': 'video-sub-heading',
          'comm.youtube_url': 'video-yt-channel-url',
          'comm.patreon_url': 'video-patreon-url',
          'video_hub.featured_url': 'video-playlist-embed-url'
        };

        for (const k of fields) {
          const id = fieldIdMap[k];
          const val = document.getElementById(id)?.value;
          if (val !== undefined) {
            await IMI_AUTH.saveSiteContent(k, val);
            const storageKey = `imi_${k.replace('.', '_')}`;
            localStorage.setItem(storageKey, val);
          }
        }

        imiToast('Website content and media links published live to Supabase!', 'success');
        await render();
      }
      else if (actionName === 'Save Video Hub') {
        if (window.saveVideoHubCMS) {
          await window.saveVideoHubCMS();
        }
      }
      else if (actionName === 'Add Member') {
        const name = prompt('Enter Member Full Name:');
        if (!name) return;
        const email = prompt('Enter Member Email:');
        if (!email) return;
        const role = prompt('Enter Role (free, core_tribe, core_elite, admin):', 'free');
        const pass = prompt('Enter Temporary Password:', 'imi123456');

        if (email && pass) {
          const res = await IMI_AUTH.createMemberAccount(email, pass, name, role || 'free');
          if (res.success) {
            imiToast(`Member "${name}" registered and added to database!`, "success");
            await render();
          } else {
            imiToast(`Error adding member: ${res.error}`, "error");
          }
        }
      }
      else if (actionName === 'New Booking') {
        const name = prompt('Enter Client Name:');
        if (!name) return;
        const email = prompt('Enter Client Email:');
        const topic = prompt('Enter Consultation Topic / Notes:', '15-Minute Strategy Node Consultation');

        if (name) {
          await IMI_AUTH.createBooking({ name, email, topic, status: 'pending' });
          imiToast(`Booking logged for ${name}!`, "success");
          await render();
        }
      }
      else if (actionName === 'Add Subscriber') {
        openAddSubscriberPrompt();
      }
      else if (actionName === 'Upload Media') {
        state.view = 'courses';
        await render();
      }
      else if (actionName === 'Save Settings') {
        const url = document.getElementById('sb-url')?.value.trim();
        const key = document.getElementById('sb-anon-key')?.value.trim();
        if (url) localStorage.setItem('imi_supabase_url', url);
        if (key) localStorage.setItem('imi_supabase_key', key);
        imiToast('Supabase credentials saved locally!', 'success');
      }
    };
  });
}

// ── Standard Default Portfolio Roster ───────────────────────────────────────
const DEFAULT_PORTFOLIO_ITEMS = [
  {
    title: 'IMI Ecosystem Website',
    category: 'Website & Links',
    description: 'Full strategic marketing platform with CMS, member portal, admin panel, and brand architecture.',
    url: 'https://imi-website-one.vercel.app',
    thumbnail: '../assets/logo/imi-gold-lockup.jpg',
    tags: 'Web Design, CMS, Branding',
    status: 'published',
    createdAt: '2026-08-01T12:00:00.000Z'
  },
  {
    title: 'IMI Compass Tool',
    category: 'App Projects',
    description: 'Brand positioning and market coordinates digital utility for modern entrepreneurs.',
    url: 'https://mnemonic-compass.vercel.app/',
    thumbnail: '../assets/products/mnemonic-compass-hud.jpg',
    tags: 'SaaS, Strategy, Tool',
    status: 'published',
    createdAt: '2026-08-05T12:00:00.000Z'
  },
  {
    title: 'Solo Corp 30-Day Blueprint',
    category: 'Media Design',
    description: 'Comprehensive brand and business launch guide with visual identity system and daily execution primer.',
    url: 'solo-corp.html',
    thumbnail: '../assets/products/solo-corp-book-cover.png',
    tags: 'Design, Content, Brand',
    status: 'published',
    createdAt: '2026-08-10T12:00:00.000Z'
  },
  {
    title: 'OVRG APPAREL E-STORE APP',
    category: 'App Projects',
    description: 'Mode streetwear premium à Abidjan. Boutique e-commerce officielle, catalogue produits et expérience client sur-mesure.',
    url: 'https://ovrgapparel.com',
    thumbnail: '../assets/products/time-command-hud.jpg',
    tags: 'App, E-Commerce, Streetwear',
    status: 'published',
    createdAt: '2026-08-11T12:00:00.000Z'
  },
  {
    title: 'iM Time Command Productivity Dashboard',
    category: 'App Projects',
    description: 'Executive task command, timeline scheduling, and timezone mappings utility.',
    url: 'https://im-time-command.vercel.app/',
    thumbnail: '../assets/products/time-command-hud.jpg',
    tags: 'Productivity, SaaS, Dashboard',
    status: 'published',
    createdAt: '2026-08-12T12:00:00.000Z'
  },
  {
    title: 'Core Tribe Strategic Network',
    category: 'Brand Strategy',
    description: 'Private mastermind community and live advisory workshops for high-trust operators.',
    url: 'core-tribe.html',
    thumbnail: '../assets/products/core-tribe-crown.jpg',
    tags: 'Community, Strategy, Mastermind',
    status: 'featured',
    createdAt: '2026-08-15T12:00:00.000Z'
  }
];

function getAdminPortfolioList() {
  const sc = state.data.siteContent || {};
  let savedItems = [];
  try {
    const raw = sc['portfolio_items'] || localStorage.getItem('imi_portfolio_items');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) savedItems = parsed;
    }
  } catch(e) {}

  const savedTitles = new Set(savedItems.map(i => (i.title || '').toLowerCase().trim()));
  const missingDefaults = DEFAULT_PORTFOLIO_ITEMS.filter(d =>
    !savedTitles.has((d.title || '').toLowerCase().trim())
  );

  return [...savedItems, ...missingDefaults];
}

// ── Portfolio & Work Showcase Manager ───────────────────────────────────────
function portfolioManager() {
  const items = getAdminPortfolioList();
  const categories = ['Website & Links', 'App Projects', 'Media Design', 'Video Content', 'Brand Strategy', 'Other'];

  const itemCards = items.map((item, idx) => `
    <div class="card" style="border-left:3px solid var(--gold); background:#141414; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <span style="font-size:0.7rem; color:var(--gold); text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.1em;">${item.category || 'Work'}</span>
            <h4 style="color:#fff; margin-top:4px; font-size:1rem; font-weight:700;">${item.title || 'Untitled'}</h4>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="secondary" style="font-size:11px; padding:4px 10px;" onclick="editPortfolioItem(${idx})"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button style="font-size:11px; padding:4px 10px; background:#200a0a; border:1px solid #ef444466; color:#ef4444; border-radius:4px; cursor:pointer;" onclick="deletePortfolioItem(${idx})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" style="width:100%; height:140px; object-fit:cover; border-radius:6px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.06);">` : ''}
        <p style="color:var(--text-secondary, #aaa); font-size:0.83rem; line-height:1.5; margin-bottom:10px;">${item.description || ''}</p>
        ${item.url ? `<a href="${item.url}" target="_blank" style="font-size:0.78rem; color:var(--gold); text-decoration:none; display:inline-flex; align-items:center; gap:4px; font-weight:600;">View Project &rarr;</a>` : ''}
      </div>
      <div style="margin-top:14px; pt:10px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; flex-wrap:wrap; gap:5px;">
          ${item.tags ? item.tags.split(',').map(t=>`<span style="background:rgba(201,162,39,0.1); border:1px solid rgba(201,162,39,0.25); border-radius:20px; padding:2px 8px; font-size:0.68rem; color:var(--gold);">${t.trim()}</span>`).join('') : ''}
        </div>
        <span class="badge" style="${item.status === 'featured' ? 'background:rgba(201,162,39,0.15); color:var(--gold); border:1px solid rgba(201,162,39,0.3);' : ''}">${(item.status || 'published').toUpperCase()}</span>
      </div>
    </div>`).join('');

  return page('Portfolio & Work Showcase Manager', 'Manage public showcase features on the About page across websites, apps, media design, video, and strategy.', 'Add Feature', `
  <div class="card" style="margin-bottom:24px;">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h3>Published Portfolio Showcase Items</h3>
        <span>${items.length} ACTIVE PROJECT${items.length !== 1 ? 'S' : ''} LISTED FOR MAINTENANCE &amp; UPDATES</span>
      </div>
      <button class="primary" onclick="clearPortfolioForm(); document.getElementById('portfolio-edit-section')?.scrollIntoView({behavior:'smooth', block:'start'});" style="padding:7px 14px; font-size:11px;">
        <i class="fa-solid fa-plus"></i> + Add New Project Feature
      </button>
    </div>
    <div class="grid two-col" style="margin-top:16px; gap:16px;">${itemCards}</div>
  </div>

  <div class="card" id="portfolio-edit-section" style="border-top:3px solid var(--gold);">
    <div class="card-title">
      <h3><i class="fa-solid fa-pen-nib" style="color:var(--gold); margin-right:8px;"></i>Add / Edit Portfolio Project</h3>
      <span id="portfolio-form-mode-badge" style="color:var(--gold); font-size:0.75rem; font-family:var(--font-mono);">NEW ITEM</span>
    </div>
    <input type="hidden" id="portfolio-edit-idx" value="-1">
    <div class="form-grid" style="margin-top:16px;">
      <div class="field"><label>Project Title *</label><input id="pf-title" placeholder="e.g. IMI Ecosystem Web Redesign"></div>
      <div class="field"><label>Category *</label>
        <select id="pf-category" style="width:100%; background:#111; color:#fff; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:10px;">
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="field full"><label>Description</label><textarea id="pf-desc" rows="3" placeholder="Brief description of the project deliverables, brand assets, and results."></textarea></div>
      <div class="field"><label>Project / Live URL</label><input id="pf-url" placeholder="https://example.com or solo-corp.html"></div>
      <div class="field">
        <label>Thumbnail Image URL or Upload</label>
        <div style="display:flex; gap:6px;">
          <input id="pf-thumb" placeholder="https://... or ../assets/products/... or upload">
          <input type="file" id="pf-thumb-file" style="display:none;" onchange="uploadPortfolioThumbnail()">
          <button class="secondary" type="button" onclick="document.getElementById('pf-thumb-file').click()">Upload Image</button>
        </div>
      </div>
      <div class="field full"><label>Tags (comma-separated)</label><input id="pf-tags" placeholder="Website, Branding, SaaS, Video"></div>
      <div class="field"><label>Status</label>
        <select id="pf-status" style="width:100%; background:#111; color:#fff; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:10px;">
          <option value="published">Published</option><option value="featured">Featured</option><option value="draft">Draft</option>
        </select>
      </div>
    </div>
    <div style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap;">
      <button class="primary" onclick="savePortfolioItem()" style="padding:10px 24px;"><i class="fa-solid fa-floppy-disk" style="margin-right:8px;"></i>Save &amp; Publish Project</button>
      <button class="secondary" onclick="clearPortfolioForm()" style="padding:10px 18px;"><i class="fa-solid fa-rotate-left" style="margin-right:6px;"></i>Clear Form</button>
    </div>
  </div>`);
}

window.uploadPortfolioThumbnail = async function() {
  const fileInput = document.getElementById('pf-thumb-file');
  const input = document.getElementById('pf-thumb');
  if (!fileInput || !fileInput.files[0]) return;
  const file = fileInput.files[0];
  try {
    const res = await IMI_AUTH.uploadCourseFile(file, 'website-cms', 'portfolio_thumb');
    if (res.url && _isValidUrl(res.url)) {
      input.value = res.url;
      imiToast('Portfolio image uploaded!', 'success');
    }
  } catch(e) { console.warn('Portfolio image upload error:', e); }
};

window.clearPortfolioForm = function() {
  const editIdx = document.getElementById('portfolio-edit-idx');
  if (editIdx) editIdx.value = '-1';
  const title = document.getElementById('pf-title');
  if (title) title.value = '';
  const desc = document.getElementById('pf-desc');
  if (desc) desc.value = '';
  const url = document.getElementById('pf-url');
  if (url) url.value = '';
  const thumb = document.getElementById('pf-thumb');
  if (thumb) thumb.value = '';
  const tags = document.getElementById('pf-tags');
  if (tags) tags.value = '';
  const cat = document.getElementById('pf-category');
  if (cat) cat.value = 'Website & Links';
  const status = document.getElementById('pf-status');
  if (status) status.value = 'published';
  const badge = document.getElementById('portfolio-form-mode-badge');
  if (badge) badge.textContent = 'NEW ITEM';
};

window.savePortfolioItem = async function() {
  let items = getAdminPortfolioList();
  const editIdx = parseInt(document.getElementById('portfolio-edit-idx')?.value || '-1');
  const title = document.getElementById('pf-title')?.value.trim();
  if (!title) { imiToast('Please enter a project title.', 'error'); return; }

  const item = {
    title: title,
    category: document.getElementById('pf-category')?.value || 'Website & Links',
    description: document.getElementById('pf-desc')?.value.trim() || '',
    url: document.getElementById('pf-url')?.value.trim() || '#',
    thumbnail: document.getElementById('pf-thumb')?.value.trim() || '',
    tags: document.getElementById('pf-tags')?.value.trim() || '',
    status: document.getElementById('pf-status')?.value || 'published',
    updatedAt: new Date().toISOString()
  };

  if (editIdx >= 0 && editIdx < items.length) {
    items[editIdx] = { ...items[editIdx], ...item };
  } else {
    item.createdAt = new Date().toISOString();
    items.unshift(item);
  }

  const json = JSON.stringify(items);

  // Write to imi_portfolio_items (primary read key for about.html)
  localStorage.setItem('imi_portfolio_items', json);

  // Also write into imi_site_content cache so cross-device Supabase fallback is fresh
  try {
    const sc = JSON.parse(localStorage.getItem('imi_site_content') || '{}');
    sc['portfolio_items'] = json;
    localStorage.setItem('imi_site_content', JSON.stringify(sc));
  } catch(e) {}

  // Update in-memory state
  if (state.data.siteContent) state.data.siteContent['portfolio_items'] = json;

  // Persist to Supabase (authoritative DB)
  if (window.IMI_AUTH?.saveSiteContent) await IMI_AUTH.saveSiteContent('portfolio_items', json);

  window.dispatchEvent(new CustomEvent('imi_content_updated', { detail: { key: 'portfolio_items' } }));
  imiToast(editIdx >= 0 ? 'Portfolio project updated & published!' : 'Portfolio project created & published!', 'success');
  clearPortfolioForm();
  await render();
};

window.deletePortfolioItem = async function(idx) {
  if (!confirm('Remove this project from the portfolio showcase?')) return;
  let items = getAdminPortfolioList();
  if (idx < 0 || idx >= items.length) return;
  items.splice(idx, 1);
  const json = JSON.stringify(items);
  localStorage.setItem('imi_portfolio_items', json);
  try {
    const sc = JSON.parse(localStorage.getItem('imi_site_content') || '{}');
    sc['portfolio_items'] = json;
    localStorage.setItem('imi_site_content', JSON.stringify(sc));
  } catch(e) {}
  if (state.data.siteContent) state.data.siteContent['portfolio_items'] = json;
  if (window.IMI_AUTH?.saveSiteContent) await IMI_AUTH.saveSiteContent('portfolio_items', json);
  window.dispatchEvent(new CustomEvent('imi_content_updated', { detail: { key: 'portfolio_items' } }));
  imiToast('Project removed from portfolio.', 'info');
  await render();
};

window.editPortfolioItem = function(idx) {
  const items = getAdminPortfolioList();
  const item = items[idx];
  if (!item) return;
  document.getElementById('portfolio-edit-idx').value = idx;
  document.getElementById('pf-title').value = item.title || '';
  const catEl = document.getElementById('pf-category');
  if (catEl) catEl.value = item.category || 'Website & Links';
  document.getElementById('pf-desc').value = item.description || '';
  document.getElementById('pf-url').value = item.url || '';
  document.getElementById('pf-thumb').value = item.thumbnail || '';
  document.getElementById('pf-tags').value = item.tags || '';
  const statusEl = document.getElementById('pf-status');
  if (statusEl) statusEl.value = item.status || 'published';
  const badge = document.getElementById('portfolio-form-mode-badge');
  if (badge) badge.textContent = `EDITING: ${item.title}`;
  document.getElementById('portfolio-edit-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── Newsletter Subscribers & Email Campaigns Hub ──────────────────────
function subscribersManager() {
  const subs = state.data.subscribersList || [];
  const members = state.data.memberList || [];
  const totalAudience = subs.length + members.length;

  let dispatches = [];
  try { dispatches = JSON.parse(localStorage.getItem('imi_admin_dispatches') || '[]'); } catch(e) {}

  const rows = subs.map((s, idx) => {
    const email = typeof s === 'string' ? s : (s.email || '');
    const name = typeof s === 'object' && s.name ? s.name : email.split('@')[0];
    const source = typeof s === 'object' && s.source ? s.source : 'Website / Public Form';
    const dateStr = typeof s === 'object' && s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
    const id = typeof s === 'object' && s.id ? s.id : email;

    return `
    <tr class="sub-row" data-search="${(email + ' ' + name + ' ' + source).toLowerCase()}">
      <td style="padding:14px 10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:rgba(201,162,39,0.15); border:1px solid rgba(201,162,39,0.3); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem; color:var(--gold);">
            ${name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <b style="color:#fff; font-size:0.88rem;">${name}</b>
            <div style="font-size:0.75rem; color:var(--muted); font-family:monospace;">${email}</div>
          </div>
        </div>
      </td>
      <td style="padding:14px 10px; font-size:0.8rem; color:var(--text);">${dateStr}</td>
      <td style="padding:14px 10px;"><span style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:3px 8px; border-radius:4px; font-size:0.72rem; color:var(--gold-light);">${source}</span></td>
      <td style="padding:14px 10px;"><span class="badge" style="background:rgba(0,200,83,0.12); color:#00c853; border:1px solid rgba(0,200,83,0.3); font-size:0.68rem; font-weight:700;">ACTIVE</span></td>
      <td style="padding:14px 10px; text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <a href="mailto:${email}" style="background:#1a1a1a; border:1px solid var(--line); color:var(--gold); padding:5px 10px; border-radius:4px; font-size:11px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;" title="Direct Email"><i class="fa-solid fa-paper-plane"></i> Email</a>
          <button onclick="copySingleEmail('${email}')" class="secondary" style="font-size:11px; padding:5px 10px;" title="Copy Email"><i class="fa-solid fa-copy"></i></button>
          <button onclick="deleteSubscriberAdmin('${id}')" style="background:transparent; border:1px solid var(--danger, #ef4444); color:var(--danger, #ef4444); padding:5px 10px; border-radius:4px; font-size:11px; cursor:pointer;" title="Remove Subscriber"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  const dispatchesRows = dispatches.map(d => `
    <tr style="border-bottom:1px solid var(--line);">
      <td style="padding:12px 10px; font-size:0.8rem; color:var(--muted);">${d.date || 'Recent'}</td>
      <td style="padding:12px 10px;"><strong style="color:#fff; font-size:0.88rem;">${d.subject || 'Dispatch Broadcast'}</strong></td>
      <td style="padding:12px 10px;"><span class="badge" style="text-transform:uppercase;">${d.target || 'All'}</span></td>
      <td style="padding:12px 10px; font-size:0.8rem; color:var(--muted); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.body || ''}</td>
    </tr>
  `).join('');

  return page('Newsletter Subscribers & Email Campaigns Hub', 'Maintain your verified newsletter subscriber registration list, export contact rosters, and launch aligned email campaigns.', 'New Broadcast', `
  <!-- 1. KEY TELEMETRY HUD -->
  <div class="grid stats" style="margin-bottom:24px;">
    <div class="card"><div class="stat-label">Newsletter Subscribers</div><div class="stat-value" style="color:var(--gold);">${subs.length}</div></div>
    <div class="card"><div class="stat-label">Platform Members</div><div class="stat-value" style="color:#448aff;">${members.length}</div></div>
    <div class="card"><div class="stat-label">Total Email Reach</div><div class="stat-value" style="color:#00c853;">${totalAudience}</div></div>
    <div class="card"><div class="stat-label">Broadcasts Dispatched</div><div class="stat-value" style="color:#e1bee7;">${dispatches.length}</div></div>
  </div>

  <!-- 2. SUBSCRIBERS REGISTRATION LIST -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <h3>1. Newsletter Subscribers Registration List</h3>
        <span>VERIFIED EMAIL LEADS &amp; REGISTERED SUBSCRIBERS</span>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="primary" onclick="openAddSubscriberPrompt()" style="padding:7px 14px; font-size:11px;"><i class="fa-solid fa-user-plus"></i> + Add Subscriber</button>
        <button class="secondary" onclick="exportSubscribersCSV()" style="padding:7px 14px; font-size:11px;"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
        <button class="secondary" onclick="copyAllSubscriberEmails()" style="padding:7px 14px; font-size:11px;"><i class="fa-solid fa-copy"></i> Copy All Emails (BCC)</button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div style="display:flex; gap:10px; margin:16px 0; flex-wrap:wrap;">
      <div style="flex:1; min-width:240px;">
        <input id="sub-search-input" onkeyup="filterSubscribersTable()" placeholder="🔍 Search subscribers by email, name, or source..." style="width:100%; background:#0b0d10; border:1px solid var(--line); color:#fff; padding:9px 14px; border-radius:6px; font-size:0.83rem;">
      </div>
      <button class="secondary" onclick="document.getElementById('email-campaign-card')?.scrollIntoView({behavior:'smooth', block:'start'})" style="padding:8px 16px; font-size:11px; color:var(--gold); border-color:rgba(201,162,39,0.4);">
        <i class="fa-solid fa-paper-plane"></i> Launch Email Campaign &darr;
      </button>
    </div>

    <div class="table-wrap">
      <table class="table" id="subscribers-table">
        <thead>
          <tr>
            <th>Subscriber / Lead</th>
            <th>Registered Date</th>
            <th>Acquisition Source</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody id="subscribers-tbody">
          ${rows || '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--muted);">No subscribers registered yet. Submissions from Homepage &amp; News Centre will appear here in real time.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 3. EMAIL CAMPAIGN DISPATCHER & ALIGNMENT -->
  <div class="card" id="email-campaign-card" style="margin-bottom:24px;">
    <div class="card-title">
      <h3>2. Email Campaign Dispatcher &amp; Broadcast Setup</h3>
      <span>ALIGN BROADCASTS TO SUBSCRIBERS &amp; MEMBERS</span>
    </div>

    <!-- Pre-built Campaign Templates -->
    <div style="background:rgba(201,162,39,0.06); border:1px solid rgba(201,162,39,0.2); border-radius:8px; padding:14px; margin-bottom:18px;">
      <div style="font-size:0.75rem; color:var(--gold); font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">Load Pre-Built Campaign Template:</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="secondary" onclick="loadCampaignTemplate('weekly_intel')" style="padding:5px 11px; font-size:11px;">📰 Weekly Strategic Dispatch</button>
        <button class="secondary" onclick="loadCampaignTemplate('solocorp')" style="padding:5px 11px; font-size:11px;">📘 Solo Corp 101 Announcement</button>
        <button class="secondary" onclick="loadCampaignTemplate('workshop')" style="padding:5px 11px; font-size:11px;">🎙️ Power Hour Workshop Invite</button>
        <button class="secondary" onclick="loadCampaignTemplate('tool_release')" style="padding:5px 11px; font-size:11px;">⚡ New Tool / Compass Launch</button>
        <button class="secondary" onclick="loadCampaignTemplate('clear')" style="padding:5px 11px; font-size:11px; color:var(--muted);">Clear Form</button>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label>Campaign Subject / Headline</label>
        <input id="camp-subject" placeholder="e.g. [IMI Insider] Strategic Clarity, AI Systems & Market Architecture">
      </div>
      <div class="field">
        <label>Target Audience Segment</label>
        <select id="camp-target">
          <option value="subscribers">Newsletter Subscribers (${subs.length} contacts)</option>
          <option value="members">Active Platform Members (${members.length} contacts)</option>
          <option value="all">Full Ecosystem: Subscribers + Members (${totalAudience} contacts)</option>
        </select>
      </div>
      <div class="field full">
        <label>Pre-header / Summary Preview Text</label>
        <input id="camp-preview" placeholder="Short email inbox preview line...">
      </div>
      <div class="field full">
        <label>Email Message Content (Markdown or HTML supported)</label>
        <textarea id="camp-body" style="height:170px;" placeholder="Write your newsletter broadcast message here...&#10;&#10;Use tokens: {{NAME}}, {{SITE_URL}}, {{UNSUBSCRIBE}}"></textarea>
      </div>
    </div>

    <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
      <button class="primary" onclick="launchEmailCampaign()" style="padding:11px 24px; font-size:12px; font-weight:800;">
        🚀 Launch Campaign via Gmail / Email Client
      </button>
      <button class="secondary" onclick="copyCampaignBroadcastPayload()" style="padding:11px 20px; font-size:12px;">
        📋 Copy HTML Email Payload
      </button>
      <button class="secondary" onclick="publishBroadcastToPortal()" style="padding:11px 20px; font-size:12px;">
        💾 Post Broadcast to Member Portal Feed
      </button>
    </div>
  </div>

  <!-- 4. PAST SENT BROADCASTS LOG -->
  <div class="card">
    <div class="card-title">
      <h3>3. Sent Broadcasts &amp; Campaign Dispatch History</h3>
      <span>HISTORICAL COMMUNICATIONS LOG</span>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Dispatch Date</th>
            <th>Campaign Subject</th>
            <th>Target Segment</th>
            <th>Message Snippet</th>
          </tr>
        </thead>
        <tbody>
          ${dispatchesRows || '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--muted);">No campaigns dispatched yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>`);
}

// ── Newsletter & Campaign Helper Functions ─────────────────────────────
window.filterSubscribersTable = function() {
  const query = (document.getElementById('sub-search-input')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.sub-row').forEach(row => {
    const searchData = row.getAttribute('data-search') || '';
    row.style.display = searchData.includes(query) ? '' : 'none';
  });
};

window.copySingleEmail = function(email) {
  navigator.clipboard.writeText(email);
  imiToast(`Copied "${email}" to clipboard!`, 'success');
};

window.copyAllSubscriberEmails = function() {
  const target = document.getElementById('camp-target')?.value || 'subscribers';
  const subs = state.data.subscribersList || [];
  const members = state.data.memberList || [];

  let emails = [];
  if (target === 'subscribers') {
    emails = subs.map(s => typeof s === 'string' ? s : s.email).filter(Boolean);
  } else if (target === 'members') {
    emails = members.map(m => m.email).filter(Boolean);
  } else {
    const combined = [...subs.map(s => typeof s === 'string' ? s : s.email), ...members.map(m => m.email)];
    emails = Array.from(new Set(combined.filter(Boolean)));
  }

  if (emails.length === 0) {
    imiToast('No subscriber emails found to copy.', 'warning');
    return;
  }

  const text = emails.join(', ');
  navigator.clipboard.writeText(text);
  imiToast(`Copied ${emails.length} subscriber emails (BCC format) to clipboard!`, 'success');
};

window.exportSubscribersCSV = function() {
  const subs = state.data.subscribersList || [];
  if (subs.length === 0) {
    imiToast('No subscribers to export.', 'warning');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,Email,Name,Source,Status,Created At\r\n';
  subs.forEach(s => {
    const email = typeof s === 'string' ? s : (s.email || '');
    const name = typeof s === 'object' && s.name ? `"${s.name.replace(/"/g, '""')}"` : `"${email.split('@')[0]}"`;
    const source = typeof s === 'object' && s.source ? `"${s.source.replace(/"/g, '""')}"` : '"Website"';
    const status = 'Active';
    const created = typeof s === 'object' && s.created_at ? s.created_at : new Date().toISOString();
    csvContent += `${email},${name},${source},${status},${created}\r\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `imi_newsletter_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  imiToast('Subscribers CSV exported successfully!', 'success');
};

window.openAddSubscriberPrompt = async function() {
  const email = prompt('Enter Subscriber Email Address:');
  if (!email || !email.includes('@')) return;
  const name = prompt('Enter Subscriber Full Name (optional):', email.split('@')[0]) || '';
  const source = 'Admin Manual Entry';

  if (window.IMI_AUTH?.subscribeNewsletter) {
    await IMI_AUTH.subscribeNewsletter(email, name, source);
  } else {
    let subs = [];
    try { subs = JSON.parse(localStorage.getItem('imi_subscribersList') || '[]'); } catch(e) {}
    subs.unshift({ id: 'sub_' + Date.now(), email, name, source, created_at: new Date().toISOString() });
    localStorage.setItem('imi_subscribersList', JSON.stringify(subs));
    window.dispatchEvent(new CustomEvent('imi_content_updated'));
  }
  imiToast(`Subscriber "${email}" added successfully!`, 'success');
  await render();
};

window.deleteSubscriberAdmin = async function(idOrEmail) {
  if (confirm(`Remove subscriber "${idOrEmail}" from the registration list?`)) {
    if (window.IMI_AUTH?.deleteSubscriber) {
      await IMI_AUTH.deleteSubscriber(idOrEmail);
    } else {
      let subs = [];
      try { subs = JSON.parse(localStorage.getItem('imi_subscribersList') || '[]'); } catch(e) {}
      subs = subs.filter(s => (typeof s === 'string' ? s : s.email) !== idOrEmail && s.id !== idOrEmail);
      localStorage.setItem('imi_subscribersList', JSON.stringify(subs));
      window.dispatchEvent(new CustomEvent('imi_content_updated'));
    }
    imiToast(`Subscriber removed.`, 'info');
    await render();
  }
};

window.loadCampaignTemplate = function(tplKey) {
  const subjInput = document.getElementById('camp-subject');
  const prevInput = document.getElementById('camp-preview');
  const bodyInput = document.getElementById('camp-body');
  if (!subjInput || !bodyInput) return;

  const templates = {
    weekly_intel: {
      subject: '[IMI Insider] Weekly Strategic Intelligence & Market Coordinates',
      preview: 'Executive frameworks, AI workflows, and strategic ecosystem announcements.',
      body: `Hello {{NAME}},\n\nHere is your weekly strategic briefing from I MAKE IMAGE:\n\n1. MARKET ARCHITECTURE\nBuilding high-margin positioning without trading time for linear revenue.\n\n2. AI OPERATIONS\nAutomating your client acquisition pipeline and content distribution node.\n\n3. ECOSYSTEM UPDATES\nNew tools and live workshops are now open in the Member Portal.\n\nRead the full dispatches at https://imi-website-one.vercel.app/pages/news.html\n\n— The IMI Strategy Node Team\n\nTo manage your preferences, visit https://imi-website-one.vercel.app`
    },
    solocorp: {
      subject: '[New Release] Solo Corp 101 — From Obedience to Self-Ownership',
      preview: 'The 30-Day Success Primer for independent founders is now available.',
      body: `Hello {{NAME}},\n\nWe are excited to announce the release of Solo Corp 101: The 30-Day Success Primer.\n\nBefore you build the business, build the operator responsible for running it. Solo Corp 101 delivers a structured 30-day personal foundation protocol for discipline, clarity, and intentional execution.\n\nGet your copy for just $5 (One-Time):\nhttps://imi-website-one.vercel.app/pages/solo-corp.html\n\n— I MAKE IMAGE Publishing`
    },
    workshop: {
      subject: '[Live Invitation] Join the Upcoming IMI Power Hour Workshop',
      preview: 'Live virtual classroom session on Funnel Architecture & Brand Positioning.',
      body: `Hello {{NAME}},\n\nYou are invited to join our upcoming live Power Hour Workshop:\n\n🎙️ Topic: Live Funnel Architecture & Client Acquisition Node\n🗓️ When: This Thursday at 2:00 PM EST\n📍 Location: Virtual Meeting Classroom\n\nAccess the room and register your seat here:\nhttps://imi-website-one.vercel.app/pages/power-hours.html\n\nSee you inside!\n— IMI Executive Advisory`
    },
    tool_release: {
      subject: '[Tool Deployment] IMI Compass & Time Command Now Live',
      preview: 'Deploy specialized brand positioning and time execution utilities.',
      body: `Hello {{NAME}},\n\nNew digital tools have been deployed to the IMI Ecosystem:\n\n⚡ IMI Compass: Brand positioning and audience coordinates utility.\n⏱️ iM Time Command: High-performance daily productivity dashboard.\n\nExplore and launch the tools here:\nhttps://imi-website-one.vercel.app/pages/tools.html\n\n— IMI Product Engineering`
    },
    clear: { subject: '', preview: '', body: '' }
  };

  const tpl = templates[tplKey] || templates.clear;
  subjInput.value = tpl.subject;
  if (prevInput) prevInput.value = tpl.preview;
  bodyInput.value = tpl.body;
  imiToast(`Loaded template: ${tplKey}`, 'info');
};

window.launchEmailCampaign = async function() {
  const subj = document.getElementById('camp-subject')?.value.trim();
  const target = document.getElementById('camp-target')?.value || 'subscribers';
  const preview = document.getElementById('camp-preview')?.value.trim() || '';
  const body = document.getElementById('camp-body')?.value.trim();

  if (!subj) {
    imiToast('Please enter a campaign subject line.', 'error');
    return;
  }
  if (!body) {
    imiToast('Please enter email body content.', 'error');
    return;
  }

  const subs = state.data.subscribersList || [];
  const members = state.data.memberList || [];

  let emails = [];
  if (target === 'subscribers') {
    emails = subs.map(s => typeof s === 'string' ? s : s.email).filter(Boolean);
  } else if (target === 'members') {
    emails = members.map(m => m.email).filter(Boolean);
  } else {
    const combined = [...subs.map(s => typeof s === 'string' ? s : s.email), ...members.map(m => m.email)];
    emails = Array.from(new Set(combined.filter(Boolean)));
  }

  // Log dispatch in history
  let dispatches = [];
  try { dispatches = JSON.parse(localStorage.getItem('imi_admin_dispatches') || '[]'); } catch(e) {}
  dispatches.unshift({
    subject: subj,
    target: target,
    preview: preview,
    body: body,
    recipientCount: emails.length,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });
  const payload = JSON.stringify(dispatches);
  localStorage.setItem('imi_admin_dispatches', payload);
  if (window.IMI_AUTH?.saveSiteContent) {
    await IMI_AUTH.saveSiteContent('admin_dispatches', payload);
  }

  // Open default mail client with BCC list
  const bccList = emails.join(',');
  const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  
  window.open(mailtoUrl, '_blank');
  imiToast(`Campaign queued for ${emails.length} recipients & mail composer opened!`, 'success');
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  await render();
};

window.copyCampaignBroadcastPayload = function() {
  const subj = document.getElementById('camp-subject')?.value || '';
  const body = document.getElementById('camp-body')?.value || '';
  const payload = `Subject: ${subj}\n\n${body}`;
  navigator.clipboard.writeText(payload);
  imiToast('Campaign payload copied to clipboard!', 'success');
};

window.publishBroadcastToPortal = async function() {
  const subj = document.getElementById('camp-subject')?.value.trim();
  const body = document.getElementById('camp-body')?.value.trim();
  const target = document.getElementById('camp-target')?.value || 'all';
  if (!subj || !body) {
    imiToast('Please enter subject and message body first.', 'error');
    return;
  }

  let dispatches = [];
  try { dispatches = JSON.parse(localStorage.getItem('imi_admin_dispatches') || '[]'); } catch(e) {}
  dispatches.unshift({
    subject: subj,
    target: target,
    body: body,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });
  const payload = JSON.stringify(dispatches);
  localStorage.setItem('imi_admin_dispatches', payload);
  if (window.IMI_AUTH?.saveSiteContent) {
    await IMI_AUTH.saveSiteContent('admin_dispatches', payload);
  }
  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('Broadcast published live to Member Portal Feed!', 'success');
  await render();
};

// ── Bookings & Communication Centre (injected) ────────────────────────────
// ── Bookings & Communication Centre ──────────────────────────────────

// ── Dedicated Member Messages Centre ─────────────────────────────────────
function messagesCentre() {
  const memberMessages = state.data.memberMessages || [];
  const unreadCount = state.data.unreadMessages || 0;

  const messageCards = memberMessages.length === 0 ? `
    <div style="text-align:center; padding:48px 24px; background:#0b0d10; border:1px dashed var(--line); border-radius:8px; color:var(--muted);">
      <i class="fa-solid fa-inbox" style="font-size:2.4rem; margin-bottom:12px; color:var(--gold); display:block;"></i>
      <h4 style="margin:0 0 6px 0; color:#fff; font-size:15px;">No Member Inquiries Yet</h4>
      <p style="margin:0; font-size:13px; color:var(--silver);">When a registered member sends a message from their Member Portal, it will appear here immediately for you to review and answer.</p>
    </div>
  ` : memberMessages.map(m => {
    const isUnread = (m.status || 'unread') === 'unread';
    const replies = Array.isArray(m.replies) ? m.replies : [];
    const roleBadge = m.member_role === 'core_tribe' ? '<span style="color:#B8BCC2; border:1px solid #B8BCC255; background:#B8BCC215; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">CORE TRIBE</span>'
      : (m.member_role === 'core_elite' ? '<span style="color:#C9A227; border:1px solid #C9A22755; background:#C9A22715; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">CORE ELITE</span>'
      : '<span style="color:#60a5fa; border:1px solid #60a5fa55; background:#60a5fa15; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">FREE TIER</span>');

    const repliesHtml = replies.map(r => `
      <div style="background:rgba(201,162,39,0.06); border-left:3px solid var(--gold); border-radius:4px; padding:12px 14px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:11px; color:var(--gold); display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-shield-halved"></i> ${r.sender_name || 'IMI Administrator'}
          </strong>
          <span style="font-size:10px; color:var(--muted);">${r.created_at ? new Date(r.created_at).toLocaleString() : 'Recent'}</span>
        </div>
        <p style="margin:0; font-size:12px; color:#ddd; line-height:1.5;">${r.text}</p>
      </div>
    `).join('');

    return `
    <div class="card" style="margin-bottom:18px; border-left:4px solid ${isUnread ? '#22c55e' : 'var(--gold)'}; background:#0e1117;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, var(--gold), #7a5f10); color:#000; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:15px; overflow:hidden; flex-shrink:0;">
            ${m.member_avatar ? `<img src="${m.member_avatar}" style="width:100%;height:100%;object-fit:cover;">` : (m.member_name ? m.member_name[0].toUpperCase() : 'M')}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="color:#fff; font-size:14px;">${m.member_name || 'Member'}</strong>
              ${roleBadge}
            </div>
            <div style="font-size:11px; color:var(--muted); font-family:var(--font-mono, monospace);">${m.member_email || ''}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          ${isUnread ? `<span style="background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.4); font-size:10px; padding:3px 8px; border-radius:4px; font-weight:800; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-circle" style="font-size:6px;"></i> NEW INQUIRY</span>`
            : `<span style="background:rgba(201,162,39,0.15); color:var(--gold); border:1px solid rgba(201,162,39,0.4); font-size:10px; padding:3px 8px; border-radius:4px; font-weight:700;"><i class="fa-solid fa-reply"></i> REPLIED</span>`}
          <span style="font-size:11px; color:var(--muted);">${m.created_at ? new Date(m.created_at).toLocaleString() : 'Recent'}</span>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h4 style="margin:0 0 6px 0; color:var(--gold-light, #f1df9a); font-size:13px; font-weight:700;">${m.subject || 'Direct Message'}</h4>
        <p style="margin:0; font-size:13px; color:#eee; line-height:1.6; background:rgba(0,0,0,0.25); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">${m.body}</p>
      </div>

      ${repliesHtml}

      <!-- Admin Reply Box -->
      <div style="margin-top:14px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.08);">
        <div style="display:flex; gap:10px;">
          <input id="reply-text-${m.id}" placeholder="Write official administrator reply to ${m.member_name || 'member'}..." style="flex:1; background:#080a0d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
          <button onclick="replyToMemberMessage('${m.id}')" class="primary" style="padding:8px 16px; font-size:11px; white-space:nowrap; gap:6px;">
            <i class="fa-solid fa-paper-plane"></i> Send Reply
          </button>
          <button onclick="deleteMemberMessage('${m.id}')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; padding:8px 12px; font-size:11px; cursor:pointer;" title="Delete message">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    `;
  }).join('');

  return page('Direct Messages & Strategy Inquiries', 'Manage inbound communications, answer strategic member questions, and review message history.', null, `
  <div class="grid stats" style="margin-bottom:20px;">
    <div class="card"><div class="stat-label">Total Inbound Messages</div><div class="stat-value">${memberMessages.length}</div></div>
    <div class="card"><div class="stat-label">Unread / Awaiting Reply</div><div class="stat-value" style="color:#22c55e;">${unreadCount}</div></div>
    <div class="card"><div class="stat-label">Answered Inquiries</div><div class="stat-value">${memberMessages.length - unreadCount}</div></div>
  </div>

  <div class="card">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3><i class="fa-solid fa-envelope-open-text" style="color:var(--gold); margin-right:8px;"></i> Member Inquiries Inbox</h3>
      <button onclick="render()" class="secondary" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-rotate"></i> Refresh Messages</button>
    </div>
    ${messageCards}
  </div>
  `);
}

// ── Dedicated Community Board Moderation ─────────────────────────────────
function communityAdmin() {
  const communityPosts = state.data.communityPosts || [];

  const communityRows = communityPosts.map(p => `
    <tr>
      <td><b>${p.title}</b><div style="color:var(--muted); font-size:10px;">${p.content.substring(0, 80)}...</div></td>
      <td>${p.author_name || 'Member'}<div style="color:var(--muted); font-size:10px;">${p.author_email || ''}</div></td>
      <td><span style="font-size:10px; color:var(--gold); border:1px solid var(--gold-border); padding:2px 6px; border-radius:4px;">${p.category || 'General'}</span></td>
      <td>${p.likes || 0} ❤️ / ${(p.comments || []).length} 💬</td>
      <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}</td>
      <td>
        <button onclick="deleteCommunityPost('${p.id}')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:4px 8px; border-radius:4px; font-size:10px; cursor:pointer;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');

  return page('Community Board & Discussions', 'Moderate community member discussions, delete inappropriate posts, and publish official announcements.', 'Post Announcement', `
  <div class="card" id="admin-new-community-box" style="display:none; margin-bottom:20px; border:1px solid rgba(201,162,39,0.35);">
    <div class="card-title"><h3>Post Official Admin Topic to Community Board</h3></div>
    <div style="display:grid; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">
      <input id="admin-comm-title" placeholder="Discussion / Announcement Title" style="background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
      <select id="admin-comm-category" style="background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
        <option value="Announcements">Announcements</option>
        <option value="Brand Strategy">Brand Strategy</option>
        <option value="General">General</option>
        <option value="Wins & Milestones">Wins & Milestones</option>
      </select>
    </div>
    <textarea id="admin-comm-content" rows="3" placeholder="Write announcement details or prompt for the community..." style="width:100%; background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px; margin-bottom:10px; box-sizing:border-box;"></textarea>
    <button onclick="postAdminCommunityTopic()" class="primary" style="font-size:11px; padding:8px 16px;">Publish Announcement</button>
  </div>

  <div class="card">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3><i class="fa-solid fa-comments" style="color:var(--gold); margin-right:8px;"></i> Published Community Discussions</h3>
      <button onclick="document.getElementById('admin-new-community-box').style.display = document.getElementById('admin-new-community-box').style.display === 'none' ? 'block' : 'none'" class="primary" style="font-size:11px; padding:6px 12px;">
        <i class="fa-solid fa-plus"></i> Post Announcement
      </button>
    </div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Topic / Post</th><th>Author</th><th>Category</th><th>Engagement</th><th>Date</th><th>Action</th></tr></thead><tbody>
    ${communityRows || '<tr><td colspan="6">No community posts found.</td></tr>'}
    </tbody></table></div>
  </div>
  `);
}

function bookings() {
  const bookingList = state.data.bookingList || [];
  const subsList = state.data.subscribersList || [];
  const memberMessages = state.data.memberMessages || [];
  const communityPosts = state.data.communityPosts || [];
  const unreadCount = state.data.unreadMessages || 0;
  const sc = state.data.siteContent || {};

  // Build Member Direct Messages HTML
  const messageCards = memberMessages.length === 0 ? `
    <div style="text-align:center; padding:36px; background:#0b0d10; border:1px dashed var(--line); border-radius:8px; color:var(--muted);">
      <i class="fa-solid fa-inbox" style="font-size:2rem; margin-bottom:10px; color:var(--gold);"></i>
      <p style="margin:0; font-size:13px;">No direct messages from members yet. Inquiries sent from the Member Portal will appear here live.</p>
    </div>
  ` : memberMessages.map(m => {
    const isUnread = (m.status || 'unread') === 'unread';
    const replies = Array.isArray(m.replies) ? m.replies : [];
    const roleBadge = m.member_role === 'core_tribe' ? '<span style="color:#B8BCC2; border:1px solid #B8BCC255; background:#B8BCC215; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">CORE TRIBE</span>'
      : (m.member_role === 'core_elite' ? '<span style="color:#C9A227; border:1px solid #C9A22755; background:#C9A22715; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">CORE ELITE</span>'
      : '<span style="color:#60a5fa; border:1px solid #60a5fa55; background:#60a5fa15; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">FREE TIER</span>');

    const repliesHtml = replies.map(r => `
      <div style="background:rgba(201,162,39,0.06); border-left:3px solid var(--gold); border-radius:4px; padding:10px 14px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:11px; color:var(--gold); display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-shield-halved"></i> ${r.sender_name || 'IMI Administrator'}
          </strong>
          <span style="font-size:10px; color:var(--muted);">${r.created_at ? new Date(r.created_at).toLocaleString() : 'Recent'}</span>
        </div>
        <p style="margin:0; font-size:12px; color:#ddd; line-height:1.5;">${r.text}</p>
      </div>
    `).join('');

    return `
    <div class="card" style="margin-bottom:16px; border-left:4px solid ${isUnread ? '#22c55e' : 'var(--gold)'}; background:#0e1117;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, var(--gold), #7a5f10); color:#000; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:14px; overflow:hidden; flex-shrink:0;">
            ${m.member_avatar ? `<img src="${m.member_avatar}" style="width:100%;height:100%;object-fit:cover;">` : (m.member_name ? m.member_name[0].toUpperCase() : 'M')}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="color:#fff; font-size:14px;">${m.member_name || 'Member'}</strong>
              ${roleBadge}
            </div>
            <div style="font-size:11px; color:var(--muted); font-family:var(--font-mono, monospace);">${m.member_email || ''}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          ${isUnread ? `<span style="background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.4); font-size:10px; padding:3px 8px; border-radius:4px; font-weight:800; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-circle" style="font-size:6px;"></i> NEW INQUIRY</span>`
            : `<span style="background:rgba(201,162,39,0.15); color:var(--gold); border:1px solid rgba(201,162,39,0.4); font-size:10px; padding:3px 8px; border-radius:4px; font-weight:700;"><i class="fa-solid fa-reply"></i> REPLIED</span>`}
          <span style="font-size:11px; color:var(--muted);">${m.created_at ? new Date(m.created_at).toLocaleString() : 'Recent'}</span>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h4 style="margin:0 0 6px 0; color:var(--gold-light, #f1df9a); font-size:13px; font-weight:700;">${m.subject || 'Direct Message'}</h4>
        <p style="margin:0; font-size:13px; color:#eee; line-height:1.6; background:rgba(0,0,0,0.25); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">${m.body}</p>
      </div>

      ${repliesHtml}

      <!-- Admin Reply Box -->
      <div style="margin-top:14px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.08);">
        <div style="display:flex; gap:10px;">
          <input id="reply-text-${m.id}" placeholder="Write official administrator reply to ${m.member_name || 'member'}..." style="flex:1; background:#080a0d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
          <button onclick="replyToMemberMessage('${m.id}')" class="primary" style="padding:8px 16px; font-size:11px; white-space:nowrap; gap:6px;">
            <i class="fa-solid fa-paper-plane"></i> Send Reply
          </button>
          <button onclick="deleteMemberMessage('${m.id}')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; padding:8px 12px; font-size:11px; cursor:pointer;" title="Delete message">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    `;
  }).join('');

  // Build Community Posts Table HTML
  const communityRows = communityPosts.map(p => `
    <tr>
      <td><b>${p.title}</b><div style="color:var(--muted); font-size:10px;">${p.content.substring(0, 70)}...</div></td>
      <td>${p.author_name || 'Member'}<div style="color:var(--muted); font-size:10px;">${p.author_email || ''}</div></td>
      <td><span style="font-size:10px; color:var(--gold); border:1px solid var(--gold-border); padding:2px 6px; border-radius:4px;">${p.category || 'General'}</span></td>
      <td>${p.likes || 0} ❤️ / ${(p.comments || []).length} 💬</td>
      <td>${p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}</td>
      <td>
        <button onclick="deleteCommunityPost('${p.id}')" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:4px 8px; border-radius:4px; font-size:10px; cursor:pointer;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');

  const rows = bookingList.map(b => `
    <tr>
      <td>${b.created_at ? new Date(b.created_at).toLocaleString() : 'Recent'}</td>
      <td><b>${b.name || 'Client'}</b><div style="color:var(--muted); font-size:10px;">${b.email || ''}</div></td>
      <td>${b.notes || b.topic || 'Strategy Session'}</td>
      <td>
        <select onchange="changeBookingStatus('${b.id}', this.value)" style="background:#0b0d10; border:1px solid var(--line); color:var(--text); padding:4px 8px; border-radius:6px; font-size:10px;">
          <option value="pending" ${(b.status || '').toLowerCase() === 'pending' ? 'selected' : ''}>PENDING</option>
          <option value="confirmed" ${(b.status || '').toLowerCase() === 'confirmed' ? 'selected' : ''}>CONFIRMED</option>
          <option value="completed" ${(b.status || '').toLowerCase() === 'completed' ? 'selected' : ''}>COMPLETED</option>
          <option value="declined" ${(b.status || '').toLowerCase() === 'declined' ? 'selected' : ''}>DECLINED</option>
        </select>
      </td>
      <td>
        <a href="${b.meeting_url || sc['workshop.room_url'] || 'https://meet.jit.si/IMI_Classroom_Live_Node'}" target="_blank" style="color:var(--gold); font-size:10px; text-decoration:none;">Launch Meeting Room &rarr;</a>
      </td>
    </tr>`).join('');

  return page('Bookings & Communication Centre', 'Manage member direct inquiries, community board discussions, appointments, and mass broadcasts.', 'New Broadcast', `
  
  <!-- 1. MEMBER DIRECT MESSAGES INBOX -->
  <div class="card" style="margin-bottom:24px; border:1px solid rgba(201,162,39,0.35);">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-envelope-open-text" style="color:var(--gold);"></i> Member Direct Inquiries &amp; Strategy Messages
      </h3>
      <div>
        <span class="badge" style="background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.4); font-weight:700;">
          ${unreadCount} UNREAD / ${memberMessages.length} TOTAL
        </span>
      </div>
    </div>
    <p style="color:var(--muted); font-size:12px; margin-top:-6px; margin-bottom:18px;">
      Messages submitted from the Member Command Center. Replying here updates the member's portal timeline immediately.
    </p>

    <div id="admin-member-messages-list">
      ${messageCards}
    </div>
  </div>

  <!-- 2. COMMUNITY EXCHANGE BOARD MODERATION -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
      <h3 style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid fa-comments" style="color:var(--gold);"></i> Community Discussion Board Moderation
      </h3>
      <button onclick="document.getElementById('admin-new-community-box').style.display = document.getElementById('admin-new-community-box').style.display === 'none' ? 'block' : 'none'" class="secondary" style="font-size:11px; padding:6px 12px;">
        <i class="fa-solid fa-plus"></i> Post Announcement
      </button>
    </div>

    <div id="admin-new-community-box" style="display:none; background:#0b0d10; border:1px solid var(--line); border-radius:8px; padding:16px; margin-bottom:16px;">
      <h4 style="margin:0 0 10px; font-size:12px; color:var(--gold);">Post Official Admin Topic to Community Board</h4>
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">
        <input id="admin-comm-title" placeholder="Discussion / Announcement Title" style="background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
        <select id="admin-comm-category" style="background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px;">
          <option value="Announcements">Announcements</option>
          <option value="Brand Strategy">Brand Strategy</option>
          <option value="General">General</option>
          <option value="Wins & Milestones">Wins & Milestones</option>
        </select>
      </div>
      <textarea id="admin-comm-content" rows="3" placeholder="Write announcement details or prompt for the community..." style="width:100%; background:#14171d; border:1px solid var(--line); border-radius:6px; padding:8px 12px; color:#fff; font-size:12px; margin-bottom:10px; box-sizing:border-box;"></textarea>
      <button onclick="postAdminCommunityTopic()" class="primary" style="font-size:11px; padding:8px 16px;">Publish Announcement</button>
    </div>

    <div class="table-wrap"><table class="table"><thead><tr><th>Topic / Post</th><th>Author</th><th>Category</th><th>Engagement</th><th>Date</th><th>Action</th></tr></thead><tbody>
    ${communityRows || '<tr><td colspan="6">No community posts found.</td></tr>'}
    </tbody></table></div>
  </div>

  <!-- 3. STRATEGY APPOINTMENTS CALENDAR -->
  ${renderAdminBookingCalendar(bookingList, sc)}

  <!-- 4. STRATEGY APPOINTMENTS QUEUE -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>Strategy Session &amp; Consultation Bookings Queue</h3><span>LIVE APPOINTMENTS</span></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Time</th><th>Client</th><th>Service / Topic</th><th>Status</th><th>Meeting Link</th></tr></thead><tbody>
    ${rows || '<tr><td colspan="5">No consultation bookings found.</td></tr>'}
    </tbody></table></div>
  </div>

  <!-- 5. GMAIL / MASS EMAIL DISPATCHER -->
  <div class="card">
    <div class="card-title"><h3>Gmail / Mass Email Dispatcher</h3><span>GMAIL APP AUTHORIZATION &amp; CAMPAIGNS</span></div>
    <div class="form-grid">
      <div class="field"><label>Campaign Subject / Headline</label><input id="email-subject" placeholder="e.g. Weekly Strategy Dispatch &amp; Member Update"></div>
      <div class="field"><label>Recipient Segment</label>
        <select id="email-target">
          <option value="all">All Members &amp; Subscribers (${(state.data.memberList || []).length + subsList.length})</option>
          <option value="members">Active Members Only (${(state.data.memberList || []).length})</option>
          <option value="subscribers">Newsletter Subscribers (${subsList.length})</option>
        </select>
      </div>
      <div class="field full"><label>Email Message Content (HTML supported)</label><textarea id="email-body" style="height:120px;" placeholder="Write newsletter broadcast or direct message..."></textarea></div>
    </div>
    <div style="display:flex; gap:10px; margin-top:14px;">
      <button class="primary" onclick="sendMassEmail()" style="padding:10px 20px; font-size:12px;">🚀 Launch Email Campaign</button>
      <button class="secondary" onclick="authGmail()" style="padding:10px 20px; font-size:12px;"><i class="fa-brands fa-google"></i> Connect Gmail Authorization</button>
    </div>
  </div>`);
}

function renderAdminBookingCalendar(bookingList, sc) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let daysHtml = '';
  for (let i = 0; i < firstDay; i++) {
    daysHtml += `<div style="background:rgba(255,255,255,0.015); min-height:85px; border-radius:6px; border:1px solid rgba(255,255,255,0.03); opacity:0.3;"></div>`;
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === now.getDate();
    const dayBookings = bookingList.filter(b => {
      if (!b.created_at && !b.date) return false;
      const bDate = new Date(b.date || b.created_at);
      return bDate.getDate() === d && bDate.getMonth() === month && bDate.getFullYear() === year;
    });

    const isThursday = new Date(year, month, d).getDay() === 4;
    let eventBadges = '';

    if (isThursday) {
      eventBadges += `<div style="background:rgba(156,39,176,0.25); border:1px solid #ba68c8; color:#e1bee7; font-size:9px; border-radius:4px; padding:2px 4px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" onclick="alert('Planned Workshop: Live Funnel Architecture\\nHost: IMI Strategy Node\\nRoom: ${sc['workshop.room_url'] || 'https://meet.jit.si/IMILiveClassroomNode'}')">🟣 2PM Workshop</div>`;
    }

    dayBookings.forEach(b => {
      const color = b.status === 'confirmed' ? '#00c853' : (b.status === 'completed' ? '#448aff' : '#ffb300');
      eventBadges += `<div style="background:rgba(0,0,0,0.6); border-left:2px solid ${color}; color:#fff; font-size:9px; border-radius:3px; padding:2px 4px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" onclick="alert('Strategy Session: ${b.topic || b.notes || 'Consultation'}\\nClient: ${b.name || 'Client'} (${b.email || ''})\\nStatus: ${b.status || 'Pending'}\\nLink: ${b.meeting_url || sc['workshop.room_url'] || 'https://meet.jit.si/IMI_Classroom_Live_Node'}')">🟡 ${b.name ? b.name.split(' ')[0] : 'Client'}</div>`;
    });

    daysHtml += `
      <div style="background:${isToday ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.02)'}; min-height:85px; border-radius:6px; border:1px solid ${isToday ? 'var(--gold)' : 'rgba(255,255,255,0.05)'}; padding:6px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; font-weight:700; color:${isToday ? 'var(--gold)' : '#fff'};">${d}</span>
          ${isToday ? '<span style="font-size:8px; background:var(--gold); color:#000; font-weight:800; padding:1px 4px; border-radius:3px;">TODAY</span>' : ''}
        </div>
        <div style="flex:1; overflow-y:auto; margin-top:2px;">${eventBadges}</div>
      </div>`;
  }

  return `
    <div style="background:var(--panel2, #0b0d10); border:1px solid var(--line, rgba(255,255,255,0.08)); border-radius:10px; padding:20px; margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
        <h4 style="color:#fff; margin:0; font-size:1.1rem;"><i class="fa-solid fa-calendar-days" style="color:var(--gold); margin-right:8px;"></i>${monthNames[month]} ${year} &bull; Strategy &amp; Workshop Schedule</h4>
        <div style="display:flex; gap:12px; font-size:11px;">
          <span style="color:#e1bee7;">🟣 Planned Workshops</span>
          <span style="color:#ffb300;">🟡 Strategy Sessions</span>
          <span style="color:#00c853;">🟢 Confirmed</span>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; text-align:center; font-size:11px; color:var(--muted); font-weight:700; margin-bottom:8px;">
        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px;">
        ${daysHtml}
      </div>
    </div>`;
}

window.changeBookingStatus = async function(bookingId, status) {
  await IMI_AUTH.updateBookingStatus(bookingId, status);
  imiToast('Booking status updated!', 'success');
  await render();
};


window.replyToMemberMessage = async function(msgId) {
  const input = document.getElementById('reply-text-' + msgId);
  const text = input ? input.value.trim() : '';
  if (!text) return alert('Please enter your reply message.');

  if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.replyToDirectMessage) {
    const res = await IMI_AUTH.replyToDirectMessage(msgId, text, 'admin');
    if (res.success) {
      imiToast('Reply sent to member successfully!', 'success');
      await render();
    } else {
      alert(res.error || 'Failed to send reply');
    }
  }
};

window.deleteMemberMessage = async function(msgId) {
  if (!confirm('Are you sure you want to delete this member inquiry?')) return;
  if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.deleteDirectMessage) {
    await IMI_AUTH.deleteDirectMessage(msgId);
    imiToast('Message deleted.', 'info');
    await render();
  }
};

window.postAdminCommunityTopic = async function() {
  const title = document.getElementById('admin-comm-title')?.value.trim();
  const category = document.getElementById('admin-comm-category')?.value;
  const content = document.getElementById('admin-comm-content')?.value.trim();
  if (!title || !content) return alert('Please provide both title and content.');

  if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.createCommunityPost) {
    const res = await IMI_AUTH.createCommunityPost({ title, category, content });
    if (res.success) {
      imiToast('Announcement published to Community Board!', 'success');
      await render();
    }
  }
};

window.deleteCommunityPost = async function(postId) {
  if (!confirm('Are you sure you want to remove this community post?')) return;
  if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.deleteCommunityPost) {
    await IMI_AUTH.deleteCommunityPost(postId);
    imiToast('Community post removed.', 'info');
    await render();
  }
};

window.sendMassEmail = async function() {
  const subj = document.getElementById('email-subject')?.value;
  const target = document.getElementById('email-target')?.value;
  const body = document.getElementById('email-body')?.value;
  if (!subj) return alert('Please enter email subject!');

  let dispatches = [];
  try { dispatches = JSON.parse(localStorage.getItem('imi_admin_dispatches') || '[]'); } catch(e) {}
  dispatches.unshift({
    subject: subj,
    target: target,
    body: body || 'Weekly strategic broadcast update.',
    date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
  });

  const payload = JSON.stringify(dispatches);
  localStorage.setItem('imi_admin_dispatches', payload);
  await IMI_AUTH.saveSiteContent('admin_dispatches', payload);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));

  imiToast(`Email campaign "${subj}" queued and logged in Member Messaging Hub!`, "success");
};

window.authGmail = function() {
  alert('Gmail OAuth App Authorization protocol initialized for admin broadcasts.');
};

// ── Offers, Billing & Real-Time Analytics (injected) ─────────────────────
// ── Offers, Billing & Analytics ──────────────────────────────────────
function analytics() {
  const sc = state.data.siteContent || {};
  return page('Offers, Billing & Analytics', 'Manage paid products, billing follow-ups, traffic metrics, ROI signals and social links.', 'Export Analytics', `
  <div class="grid stats" style="margin-bottom:20px;">
    <div class="card"><div class="stat-label">Total Product Offers</div><div class="stat-value">4 Active</div></div>
    <div class="card"><div class="stat-label">Monthly Recurring Revenue</div><div class="stat-value">$500+ / mo</div></div>
    <div class="card"><div class="stat-label">Conversion Funnel Signal</div><div class="stat-value">94.2%</div></div>
  </div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>Paid Product Offers & Billing Follow-Up Sync</h3><span>SYNC WITH TOOLS & PUBLIC TABS</span></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Product / Offer</th><th>Type</th><th>Price</th><th>Billing Sync Status</th></tr></thead><tbody>
    <tr><td><b>IMI Compass</b></td><td>Digital Tool</td><td>${sc['tools.compass_price'] || '$9.99'}</td><td><span class="badge">SYNCED</span></td></tr>
    <tr><td><b>iM Time Command</b></td><td>Digital Tool</td><td>${sc['tools.time_price'] || '$7.99'}</td><td><span class="badge">SYNCED</span></td></tr>
    <tr><td><b>Commander Bundle</b></td><td>Offer Bundle</td><td>${sc['pricing.bundle'] || '$14.99'}</td><td><span class="badge">SYNCED</span></td></tr>
    <tr><td><b>Core Tribe Membership</b></td><td>Monthly Recurring</td><td>${sc['pricing.tribe'] || '$5.00/mo'}</td><td><span class="badge">SYNCED</span></td></tr>
    </tbody></table></div>
  </div>

  <div class="card">
    <div class="card-title"><h3>Global Social Media Links</h3><span>SOCIAL CHANNEL FOOTER & HEADER LINKS</span></div>
    <div class="form-grid">
      <div class="field"><label>YouTube Channel URL</label><input id="social-youtube" value="${sc['social.youtube'] || ''}" placeholder="https://youtube.com/@..."></div>
      <div class="field"><label>Instagram Profile URL</label><input id="social-instagram" value="${sc['social.instagram'] || ''}" placeholder="https://instagram.com/..."></div>
      <div class="field"><label>LinkedIn Page URL</label><input id="social-linkedin" value="${sc['social.linkedin'] || ''}" placeholder="https://linkedin.com/in/..."></div>
      <div class="field"><label>X / Twitter Handle URL</label><input id="social-x" value="${sc['social.x'] || ''}" placeholder="https://x.com/..."></div>
    </div>
    <button class="primary" onclick="saveSocialLinks()" style="padding:10px 18px; font-size:12px; margin-top:14px;">Save Social Links</button>
  </div>`);
}

window.saveSocialLinks = async function() {
  const yt = document.getElementById('social-youtube')?.value || '';
  const ig = document.getElementById('social-instagram')?.value || '';
  const li = document.getElementById('social-linkedin')?.value || '';
  const x = document.getElementById('social-x')?.value || '';

  await IMI_AUTH.saveSiteContent('social.youtube', yt);
  await IMI_AUTH.saveSiteContent('social.instagram', ig);
  await IMI_AUTH.saveSiteContent('social.linkedin', li);
  await IMI_AUTH.saveSiteContent('social.x', x);

  localStorage.setItem('imi_social_youtube', yt);
  localStorage.setItem('imi_social_instagram', ig);
  localStorage.setItem('imi_social_linkedin', li);
  localStorage.setItem('imi_social_x', x);
  window.dispatchEvent(new CustomEvent('imi_content_updated'));

  alert('Social links updated across site footer!');
};

// ── Links & Payments Hub Manager (injected) ───────────────────────────────
// ── Links & Payments Hub Manager ──────────────────────────────────────
function linksManager() {
  const sc = state.data.siteContent || {};
  return page('Links & Payments Hub', 'Centralized control center for all CTA buttons, destination URLs, product checkout links, and social links across all platform pages.', 'Save All Links', `
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>1. Navigation & Header CTA Links</h3><span>PRIMARY ACTION LINKS</span></div>
    <div class="form-grid">
      <div class="field"><label>Hero Primary Button Text</label><input id="link_hero_btn1" value="${sc['hero.btn1'] || 'Explore Business Solutions →'}"></div>
      <div class="field"><label>Hero Primary Button Destination URL</label><input id="link_hero_btn1_url" value="${sc['hero.btn1_url'] || 'pages/solutions.html'}"></div>
      <div class="field"><label>Hero Secondary Button Text</label><input id="link_hero_btn2" value="${sc['hero.btn2'] || 'Book Strategy Session'}"></div>
      <div class="field"><label>Hero Secondary Button Destination URL</label><input id="link_hero_btn2_url" value="${sc['hero.btn2_url'] || 'pages/booking.html'}"></div>
      <div class="field"><label>Header Nav "Book a Session" CTA Link</label><input id="link_header_book" value="${sc['global.book_url'] || 'pages/booking.html'}"></div>
      <div class="field"><label>Header Nav "Login" Link</label><input id="link_header_login" value="${sc['global.login_url'] || 'pages/login.html'}"></div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>2. Product Checkout & Offer Links</h3><span>PAID DIGITAL PRODUCTS</span></div>
    <div class="form-grid">
      <div class="field"><label>IMI Compass Launch / Checkout URL</label><input id="link_compass_url" value="${sc['tools.compass_url'] || 'pages/compass.html'}"></div>
      <div class="field"><label>iM Time Command Launch / Checkout URL</label><input id="link_time_url" value="${sc['tools.time_url'] || 'https://im-time-command.vercel.app/'}"></div>
      <div class="field"><label>Commander Bundle Checkout URL</label><input id="link_bundle_url" value="${sc['pricing.bundle_url'] || 'pages/commander-bundle.html'}"></div>
      <div class="field"><label>Core Tribe Membership Checkout / Join URL</label><input id="link_tribe_url" value="${sc['pricing.tribe_url'] || 'pages/core-tribe.html'}"></div>
      <div class="field"><label>Solo Corp 101 Checkout URL</label><input id="link_solocorp_url" value="${sc['pricing.solocorp_url'] || 'pages/solo-corp.html'}"></div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><h3>3. Page-by-Page CTA Destination & Button Controls</h3><span>ALL PLATFORM PAGES</span></div>
    <div class="form-grid">
      <div class="field"><label>Solutions Page CTA Button Text</label><input id="link_solutions_text" value="${sc['solutions.btn_text'] || 'BOOK A STRATEGY SESSION →'}"></div>
      <div class="field"><label>Solutions Page CTA Destination</label><input id="link_sec_solutions" value="${sc['solutions.btn_url'] || 'pages/booking.html'}"></div>

      <div class="field"><label>CMO Services CTA Button Text</label><input id="link_cmo_text" value="${sc['cmo.btn_text'] || 'Book Your Session Now →'}"></div>
      <div class="field"><label>CMO Services CTA Destination</label><input id="link_sec_cmo" value="${sc['cmo.btn_url'] || 'pages/booking.html'}"></div>

      <div class="field"><label>Power Hours Workshops CTA Button Text</label><input id="link_workshop_text" value="${sc['workshop.btn_text'] || 'Reserve Power Hour Session →'}"></div>
      <div class="field"><label>Power Hours Workshops CTA Destination</label><input id="link_sec_workshop" value="${sc['workshop.btn_url'] || 'pages/booking.html'}"></div>

      <div class="field"><label>Learning Center CTA Button Text</label><input id="link_learn_text" value="${sc['learning.btn_text'] || 'Access Member Curriculum →'}"></div>
      <div class="field"><label>Learning Center CTA Destination</label><input id="link_sec_learning" value="${sc['learning.btn_url'] || 'pages/login.html?return=portal.html'}"></div>

      <div class="field"><label>Webinars Page CTA Button Text</label><input id="link_webinars_text" value="${sc['webinars.btn_text'] || 'Register Free for Next Session →'}"></div>
      <div class="field"><label>Webinars Page CTA Destination</label><input id="link_sec_webinars" value="${sc['webinars.btn_url'] || 'pages/login.html?return=portal.html'}"></div>

      <div class="field"><label>Solo Corp 101 CTA Button Text</label><input id="link_solocorp_text" value="${sc['solocorp.btn_text'] || 'Get Solo Corp 101 → $5'}"></div>
      <div class="field"><label>Solo Corp 101 CTA Destination</label><input id="link_sec_solocorp" value="${sc['solocorp.btn_url'] || 'pages/login.html'}"></div>

      <div class="field"><label>Core Tribe CTA Button Text</label><input id="link_tribe_text" value="${sc['tribe.btn_text'] || 'Join Core Tribe → $5/mo'}"></div>
      <div class="field"><label>Core Tribe CTA Destination</label><input id="link_sec_tribe" value="${sc['tribe.btn_url'] || 'pages/core-tribe.html'}"></div>

      <div class="field"><label>Tools Engine CTA Button Text</label><input id="link_tools_text" value="${sc['tools.btn_text'] || 'Launch Tools & Engine →'}"></div>
      <div class="field"><label>Tools Engine CTA Destination</label><input id="link_sec_tools" value="${sc['tools.btn_url'] || 'pages/tools.html'}"></div>

      <div class="field"><label>News Centre CTA Button Text</label><input id="link_news_text" value="${sc['news.btn_text'] || 'Read Ecosystem Dispatches →'}"></div>
      <div class="field"><label>News Centre CTA Destination</label><input id="link_sec_news" value="${sc['news.btn_url'] || 'pages/news.html'}"></div>

      <div class="field"><label>About IMI CTA Button Text</label><input id="link_about_text" value="${sc['about.btn_text'] || 'WORK WITH US →'}"></div>
      <div class="field"><label>About IMI CTA Destination</label><input id="link_sec_about" value="${sc['about.btn_url'] || 'pages/booking.html'}"></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><h3>4. Classroom & Community Destination Links</h3><span>EXTERNAL NODES</span></div>
    <div class="form-grid">
      <div class="field"><label>Patreon Classroom URL</label><input id="link_patreon_url" value="${sc['comm.patreon_url'] || 'https://www.patreon.com/c/IMICREATIVELABCLASSROOM'}"></div>
      <div class="field"><label>Nowsite Classroom URL</label><input id="link_nowsite_url" value="${sc['comm.nowsite_url'] || 'https://nowsite.team/47krhRZLzk'}"></div>
      <div class="field"><label>Facebook Group URL</label><input id="link_facebook_url" value="${sc['comm.facebook_url'] || 'https://www.facebook.com/imakeimage/'}"></div>
    </div>
    <button class="primary" onclick="saveAllLinksHub()" style="padding:12px 24px; font-size:13px; margin-top:16px; width:100%;">Save & Publish All Action Links Across Ecosystem</button>
  </div>`);
}

window.saveAllLinksHub = async function() {
  const map = {
    'hero.btn1': document.getElementById('link_hero_btn1')?.value,
    'hero.btn1_url': document.getElementById('link_hero_btn1_url')?.value,
    'hero.btn2': document.getElementById('link_hero_btn2')?.value,
    'hero.btn2_url': document.getElementById('link_hero_btn2_url')?.value,
    'global.book_url': document.getElementById('link_header_book')?.value,
    'global.login_url': document.getElementById('link_header_login')?.value,
    'tools.compass_url': document.getElementById('link_compass_url')?.value,
    'tools.time_url': document.getElementById('link_time_url')?.value,
    'pricing.bundle_url': document.getElementById('link_bundle_url')?.value,
    'pricing.tribe_url': document.getElementById('link_tribe_url')?.value,
    'pricing.solocorp_url': document.getElementById('link_solocorp_url')?.value,
    'solutions.btn_text': document.getElementById('link_solutions_text')?.value,
    'solutions.btn_url': document.getElementById('link_sec_solutions')?.value,
    'cmo.btn_text': document.getElementById('link_cmo_text')?.value,
    'cmo.btn_url': document.getElementById('link_sec_cmo')?.value,
    'workshop.btn_text': document.getElementById('link_workshop_text')?.value,
    'workshop.btn_url': document.getElementById('link_sec_workshop')?.value,
    'learning.btn_text': document.getElementById('link_learn_text')?.value,
    'learning.btn_url': document.getElementById('link_sec_learning')?.value,
    'webinars.btn_text': document.getElementById('link_webinars_text')?.value,
    'webinars.btn_url': document.getElementById('link_sec_webinars')?.value,
    'solocorp.btn_text': document.getElementById('link_solocorp_text')?.value,
    'solocorp.btn_url': document.getElementById('link_sec_solocorp')?.value,
    'tribe.btn_text': document.getElementById('link_tribe_text')?.value,
    'tribe.btn_url': document.getElementById('link_sec_tribe')?.value,
    'tools.btn_text': document.getElementById('link_tools_text')?.value,
    'tools.btn_url': document.getElementById('link_sec_tools')?.value,
    'news.btn_text': document.getElementById('link_news_text')?.value,
    'news.btn_url': document.getElementById('link_sec_news')?.value,
    'about.btn_text': document.getElementById('link_about_text')?.value,
    'about.btn_url': document.getElementById('link_sec_about')?.value,
    'comm.patreon_url': document.getElementById('link_patreon_url')?.value,
    'comm.nowsite_url': document.getElementById('link_nowsite_url')?.value,
    'comm.facebook_url': document.getElementById('link_facebook_url')?.value
  };

  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) {
      await IMI_AUTH.saveSiteContent(k, v);
      localStorage.setItem(`imi_${k.replace('.', '_')}`, v);
    }
  }

  window.dispatchEvent(new CustomEvent('imi_content_updated'));
  imiToast('All global links & CTA action destinations updated and published!', 'success');
  await render();
};

// ── Settings (injected) ────────────────────────────────────────────────────
function settings() {
  return page('Settings', 'Configure the IMI ecosystem and Supabase endpoints.', 'Save Settings', `<div class="card"><div class="form-grid">
 <div class="field"><label>Supabase URL</label><input id="sb-url" value="${localStorage.getItem('imi_supabase_url') || 'https://vpdilgdelkrotatvwfhh.supabase.co'}"></div>
 <div class="field"><label>Supabase Anon Key</label><input id="sb-anon-key" type="password" value="${localStorage.getItem('imi_supabase_key') || ''}" placeholder="eyJ..."></div>
 </div><br><button class="primary" data-action="Save Settings">Save Settings</button></div>`);
}


// Initial execution
render();
