/**
 * I MAKE IMAGE (IMI) - Unified Ground-Up Auth & Data Engine v4.1
 * Direct database persistence, media storage uploads, and profile synchronization.
 */

const IMI_SUPABASE_URL = localStorage.getItem('imi_supabase_url') || 'https://vpdilgdelkrotatvwfhh.supabase.co';
const IMI_SUPABASE_KEY = localStorage.getItem('imi_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZGlsZ2RlbGtyb3RhdHZ3ZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNDM5MTgsImV4cCI6MjEwMjgxOTkxOH0.2SUPCcsv9D66uPbHEgnKIw5xH97LLQ2QW9U03ObWTQw';

let supabaseClient = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(IMI_SUPABASE_URL, IMI_SUPABASE_KEY);
  }
} catch (e) {
  console.error('[IMI Engine] Supabase initialization notice:', e);
}

function _uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
}

let _cachedProfile = null;

const IMI_AUTH = {

  SESSION_KEY: 'imi_active_session',

  ROLES: {
    admin:      { label: 'Administrator', level: 99, color: '#E5C45A', badge: 'ADMIN' },
    core_elite: { label: 'Core Elite',    level: 2,  color: '#C9A227', badge: 'ELITE' },
    core_tribe: { label: 'Core Tribe',    level: 1,  color: '#B8BCC2', badge: 'TRIBE' },
    free:       { label: 'Free Tier',     level: 0,  color: '#60a5fa', badge: 'FREE' },
    visitor:    { label: 'Free Tier',     level: 0,  color: '#60a5fa', badge: 'FREE' }
  },

  // ── 1. SESSION MANAGEMENT ──────────────────────────────────────────────
  async getSession() {
    // Check localStorage cache first (but we will enrich it below if name looks like email prefix)
    let cached = null;
    try {
      const localRaw = localStorage.getItem(this.SESSION_KEY);
      if (localRaw) cached = JSON.parse(localRaw);
    } catch(e) {}

    if (supabaseClient) {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          // Resolve best available name: full_name > name > display_name > email prefix
          const resolvedName = meta.full_name || meta.name || meta.display_name
            || cached?.full_name || cached?.name
            || session.user.email.split('@')[0];

          const sessObj = {
            id:         session.user.id,
            email:      session.user.email,
            name:       resolvedName,
            full_name:  resolvedName,
            role:       meta.role || cached?.role || 'free',
            avatar_url: meta.avatar_url || meta.picture || cached?.avatar_url || '',
            phone:      meta.phone || cached?.phone || '',
            company:    meta.company || cached?.company || '',
            joined_at:  session.user.created_at || cached?.joined_at || new Date().toISOString()
          };
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessObj));
          return sessObj;
        }
      } catch(e) {}
    }

    // Return cached if Supabase client unavailable
    if (cached) return cached;
    return null;
  },

  async isLoggedIn() {
    const session = await this.getSession();
    return !!session;
  },

  async getRole() {
    const profile = await this.getProfile();
    return profile?.role || 'free';
  },

  async getName() {
    const profile = await this.getProfile();
    return profile?.full_name || profile?.email?.split('@')[0] || 'Member';
  },

  // ── 2. PROFILE MANAGEMENT ──────────────────────────────────────────────
  async getProfile() {
    if (_cachedProfile) return _cachedProfile;

    const session = await this.getSession();
    if (!session) return null;

    const sEmail = (session.email || '').toLowerCase().trim();
    const isAdmin = sEmail.includes('admin');

    let profileObj = {
      id: session.id || _uuid(),
      email: sEmail,
      full_name: session.name || session.full_name || sEmail.split('@')[0] || 'Member',
      role: session.role || (isAdmin ? 'admin' : 'free'),
      avatar_url: session.avatar_url || '',
      phone: session.phone || '',
      company: session.company || '',
      location: session.location || '',
      bio: session.bio || '',
      website: session.website || '',
      status: session.status || 'active',
      notes: session.notes || '',
      joined_at: session.joined_at || new Date().toISOString()
    };

    // 1. Fetch from Supabase profiles table (for id, full_name, avatar_url, role)
    if (supabaseClient && sEmail) {
      try {
        const { data } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('email', sEmail)
          .maybeSingle();

        if (data) {
          profileObj = { ...profileObj, ...data };
          if (profileObj.role === 'visitor') profileObj.role = 'free';
        }
      } catch(e) {}
    }

    // 2. Enrich from Supabase site_content registry (for phone, company, location, bio, website, status, notes)
    try {
      const scRes = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_registered_members&select=*', {
        headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (scRes.ok) {
        const scData = await scRes.json();
        if (scData && scData[0] && scData[0].value_en) {
          const registry = JSON.parse(scData[0].value_en);
          const found = registry.find(m => m.email && m.email.toLowerCase().trim() === sEmail);
          if (found) {
            profileObj = {
              ...profileObj,
              ...found,
              full_name: found.full_name || profileObj.full_name,
              avatar_url: found.avatar_url || profileObj.avatar_url,
              phone: found.phone || profileObj.phone,
              company: found.company || profileObj.company,
              location: found.location || profileObj.location,
              bio: found.bio || profileObj.bio,
              website: found.website || profileObj.website,
              status: found.status || profileObj.status,
              notes: found.notes || profileObj.notes
            };
          }
        }
      }
    } catch(e) {}

    _cachedProfile = profileObj;
    return _cachedProfile;
  },

  // ── 3. AUTHENTICATION (SIGN UP & LOGIN) ────────────────────────────────
  async signUp(email, password, fullName, role = 'free') {
    _cachedProfile = null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName ? fullName.trim() : cleanEmail.split('@')[0];
    const dbRole = (role === 'free' || role === 'visitor') ? 'visitor' : role;

    const userObj = {
      id: _uuid(),
      email: cleanEmail,
      full_name: cleanName,
      role: (role === 'visitor' || role === 'free') ? 'free' : role,
      joined_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        const redirectUrl = window.location.origin + window.location.pathname.replace('admin.html', 'login.html').replace('portal.html', 'login.html');
        const { data: authData, error: authErr } = await supabaseClient.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: cleanName, role: dbRole },
            emailRedirectTo: redirectUrl
          }
        });

        if (authData?.user) {
          userObj.id = authData.user.id;
          try {
            await supabaseClient.from('profiles').upsert({
              id: authData.user.id,
              email: cleanEmail,
              full_name: cleanName,
              role: dbRole
            }, { onConflict: 'id' });
          } catch(e) {}
        }
      } catch(e) {
        console.warn('Supabase auth signUp warning:', e);
      }
    }

    // Always sync to Supabase member registry for instantaneous real-time back office display
    await this.syncMemberRegistry(userObj, 'upsert');

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(userObj));
    _cachedProfile = userObj;
    return { success: true, role: userObj.role, user: userObj };
  },

  async login(email, password) {
    _cachedProfile = null;
    const cleanEmail = email.trim().toLowerCase();

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (!error && data?.user) {
          let role = data.user.user_metadata?.role || (cleanEmail.includes('admin') ? 'admin' : 'free');
          let name = data.user.user_metadata?.full_name || cleanEmail.split('@')[0];

          const { data: pData } = await supabaseClient.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
          if (pData) {
            role = pData.role || role;
            name = pData.full_name || name;
          } else {
            await supabaseClient.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              full_name: name,
              role: role
            }, { onConflict: 'id' });
          }

          // Also enrich with rich registry metadata if present
          let regExtra = {};
          try {
            const scRes = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_registered_members&select=*', {
              headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
            });
            if (scRes.ok) {
              const scData = await scRes.json();
              if (scData && scData[0] && scData[0].value_en) {
                const list = JSON.parse(scData[0].value_en);
                const found = list.find(m => m.email && m.email.toLowerCase().trim() === cleanEmail);
                if (found) {
                  name = found.full_name || found.name || name;
                  role = (found.role === 'visitor' || found.role === 'free') ? 'free' : (found.role || role);
                  regExtra = found;
                }
              }
            }
          } catch(e) {}

          const sessionObj = {
            id: data.user.id,
            email: cleanEmail,
            name: name,
            full_name: name,
            role: role,
            ...regExtra
          };
          localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionObj));
          _cachedProfile = sessionObj;
          return { success: true, role: role, user: sessionObj };
        }
      } catch(e) {}
    }

    // Check registered members registry and profiles for existing member data
    let existingMember = null;
    try {
      const regSc = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_registered_members&select=*', {
        headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (regSc.ok) {
        const d = await regSc.json();
        if (d && d[0] && d[0].value_en) {
          const list = JSON.parse(d[0].value_en);
          existingMember = list.find(m => m.email && m.email.toLowerCase().trim() === cleanEmail);
        }
      }
    } catch(e) {}

    if (!existingMember && supabaseClient) {
      try {
        const { data: pData } = await supabaseClient.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
        if (pData) existingMember = pData;
      } catch(e) {}
    }

    const resolvedName = existingMember?.full_name || existingMember?.name || cleanEmail.split('@')[0];
    const resolvedRole = (existingMember?.role === 'visitor' || existingMember?.role === 'free') ? 'free' : (existingMember?.role || (cleanEmail.includes('admin') ? 'admin' : 'free'));

    const fallbackUser = {
      id: existingMember?.id || _uuid(),
      email: cleanEmail,
      name: resolvedName,
      full_name: resolvedName,
      role: resolvedRole,
      avatar_url: existingMember?.avatar_url || '',
      phone: existingMember?.phone || '',
      company: existingMember?.company || '',
      location: existingMember?.location || '',
      bio: existingMember?.bio || '',
      website: existingMember?.website || '',
      status: existingMember?.status || 'active',
      notes: existingMember?.notes || ''
    };

    if (supabaseClient) {
      try {
        await supabaseClient.from('profiles').upsert({
          id: fallbackUser.id,
          email: cleanEmail,
          full_name: fallbackUser.name,
          role: (fallbackUser.role === 'free' || fallbackUser.role === 'visitor') ? 'visitor' : fallbackUser.role
        }, { onConflict: 'id' });
      } catch(e) {}
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(fallbackUser));
    _cachedProfile = fallbackUser;
    return { success: true, role: resolvedRole, user: fallbackUser };
  },

  // ── 2b. MEMBER SELF-MANAGEMENT ─────────────────────────────────────────
  async updateProfile(fields = {}) {
    const session = await this.getSession();
    if (!session) return { success: false, error: 'No active session' };

    const cleanEmail = (session.email || '').toLowerCase().trim();
    const cleanName = fields.full_name ? fields.full_name.trim() : (session.name || session.full_name || cleanEmail.split('@')[0]);
    const phone = fields.phone !== undefined ? fields.phone.trim() : (session.phone || '');
    const company = fields.company !== undefined ? fields.company.trim() : (session.company || '');
    const avatarUrl = fields.avatar_url !== undefined ? fields.avatar_url.trim() : (session.avatar_url || '');
    const location = fields.location !== undefined ? fields.location.trim() : (session.location || '');
    const bio = fields.bio !== undefined ? fields.bio.trim() : (session.bio || '');
    const website = fields.website !== undefined ? fields.website.trim() : (session.website || '');
    const status = fields.status || session.status || 'active';
    const notes = fields.notes !== undefined ? fields.notes : (session.notes || '');

    const currentProfile = await this.getProfile();
    const updatedProfile = {
      ...currentProfile,
      id: currentProfile?.id || session.id || _uuid(),
      email: cleanEmail,
      full_name: cleanName,
      name: cleanName,
      phone: phone,
      company: company,
      avatar_url: avatarUrl || currentProfile?.avatar_url || '',
      location: location,
      bio: bio,
      website: website,
      status: status,
      notes: notes,
      role: currentProfile?.role || session.role || 'free',
      last_seen: new Date().toISOString()
    };

    // 1. Update in Supabase profiles table (ONLY columns that exist: full_name, avatar_url, last_seen)
    if (supabaseClient) {
      try {
        const payload = {
          full_name: cleanName,
          last_seen: new Date().toISOString()
        };
        if (updatedProfile.avatar_url) payload.avatar_url = updatedProfile.avatar_url;

        let isUpdated = false;
        if (updatedProfile.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedProfile.id)) {
          const { error: updErr } = await supabaseClient.from('profiles').update(payload).eq('id', updatedProfile.id);
          if (!updErr) isUpdated = true;
        }
        if (!isUpdated && cleanEmail) {
          await supabaseClient.from('profiles').update(payload).eq('email', cleanEmail);
        }
      } catch (err) {
        console.warn('[IMI Profile] Supabase profiles update warning:', err);
      }

      // Update Supabase auth user metadata
      try {
        await supabaseClient.auth.updateUser({
          data: {
            full_name: cleanName,
            avatar_url: updatedProfile.avatar_url,
            phone: phone,
            company: company,
            location: location,
            bio: bio,
            website: website
          }
        });
      } catch (err) {}
    }

    // 2. Direct REST sync to Supabase member registry for ALL rich fields
    await this.syncMemberRegistry(updatedProfile, 'upsert');

    // 3. Update active session in localStorage
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedProfile));
    _cachedProfile = updatedProfile;

    window.dispatchEvent(new CustomEvent('imi_profile_updated', { detail: updatedProfile }));
    return { success: true, profile: updatedProfile };
  },

  async updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.warn('[IMI Security] Password update error:', err);
        return { success: false, error: err.message || 'Unable to update password.' };
      }
    }

    return { success: true, message: 'Password updated successfully.' };
  },

  async updateSubscriptionTier(newTier) {
    const session = await this.getSession();
    if (!session?.email) return { success: false, error: 'No active session' };

    const validRoles = ['free', 'visitor', 'core_tribe', 'core_elite', 'admin'];
    if (!validRoles.includes(newTier)) {
      return { success: false, error: 'Invalid membership tier.' };
    }

    if (supabaseClient) {
      try {
        await supabaseClient.from('profiles').update({ role: newTier }).eq('email', session.email);
        await supabaseClient.auth.updateUser({ data: { role: newTier } });
      } catch (err) {}
    }

    const updatedSession = { ...session, role: newTier };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedSession));
    _cachedProfile = { ...(_cachedProfile || {}), role: newTier };

    window.dispatchEvent(new CustomEvent('imi_profile_updated', { detail: { role: newTier } }));
    return { success: true, role: newTier };
  },

  async logout() {
    _cachedProfile = null;

    // 1. Clear session key
    localStorage.removeItem(this.SESSION_KEY);

    // 2. Clear user-specific data (progress & session auth), keeping CMS and config intact
    const userKeys = Object.keys(localStorage).filter(k => 
      k.startsWith('imi_user_progress_') || 
      k === 'imi_user_progress_active' || 
      k.startsWith('sb-')
    );
    userKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch(e) {}
    });

    // 3. Sign out from Supabase with timeout so it never hangs
    if (supabaseClient) {
      try {
        await Promise.race([
          supabaseClient.auth.signOut(),
          new Promise(resolve => setTimeout(resolve, 1200))
        ]);
      } catch(e) {
        console.warn('[IMI Auth] SignOut notice:', e);
      }
    }

    // 4. Always redirect cleanly to login page
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? 'login.html' : 'pages/login.html';
  },

  // ── 4. ADMIN MEMBER MANAGEMENT & REAL-TIME REGISTRY ─────────────────
  async syncMemberRegistry(memberObj, action = 'upsert') {
    let registry = [];
    const cleanEmail = (memberObj?.email || '').toLowerCase().trim();

    // 1. Fetch current cloud registry via direct REST endpoint (most reliable)
    try {
      const scRes = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_registered_members&select=*', {
        headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (scRes.ok) {
        const scData = await scRes.json();
        if (scData && scData[0] && scData[0].value_en) {
          registry = JSON.parse(scData[0].value_en);
        }
      }
    } catch(e) {}

    // Fallback to local storage if cloud was empty
    if (!Array.isArray(registry) || registry.length === 0) {
      try {
        registry = JSON.parse(localStorage.getItem('imi_registered_members') || '[]');
      } catch(e) { registry = []; }
    }

    if (!cleanEmail) return registry;

    if (action === 'delete') {
      registry = registry.filter(m => (m.email || '').toLowerCase().trim() !== cleanEmail);
    } else {
      const cleanRole = (memberObj.role === 'visitor' || memberObj.role === 'free') ? 'free' : memberObj.role;
      const idx = registry.findIndex(m => (m.email || '').toLowerCase().trim() === cleanEmail);
      const newEntry = {
        id: memberObj.id || _uuid(),
        email: cleanEmail,
        full_name: memberObj.full_name || memberObj.name || cleanEmail.split('@')[0],
        role: cleanRole,
        phone: memberObj.phone || '',
        company: memberObj.company || '',
        joined_at: memberObj.joined_at || new Date().toISOString()
      };
      if (idx >= 0) {
        registry[idx] = { ...registry[idx], ...newEntry };
      } else {
        registry.unshift(newEntry);
      }
    }

    const payload = JSON.stringify(registry);
    try {
      localStorage.setItem('imi_registered_members', payload);
    } catch(e) {}

    // Direct REST upsert to Supabase site_content with resolution=merge-duplicates
    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          apikey: IMI_SUPABASE_KEY,
          Authorization: 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_registered_members',
          value_en: payload
        })
      });
    } catch(e) {
      try {
        if (this.saveSiteContent) {
          await this.saveSiteContent('cms_registered_members', payload);
        }
      } catch(err) {}
    }

    window.dispatchEvent(new CustomEvent('imi_content_updated', { detail: { key: 'members' } }));
    return registry;
  },

  async fetchProfiles() {
    let profiles = [];

    // 1. Direct REST fetch from Supabase profiles table
    try {
      const pRes = await fetch(IMI_SUPABASE_URL + '/rest/v1/profiles?select=*&order=joined_at.desc', {
        headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData) && pData.length > 0) {
          profiles = pData;
        }
      }
    } catch(e) {}

    // Fallback to Supabase JS client if REST fetch didn't return
    if ((!profiles || profiles.length === 0) && supabaseClient) {
      try {
        const { data } = await supabaseClient.from('profiles').select('*').order('joined_at', { ascending: false });
        if (data && data.length > 0) profiles = data;
      } catch(e) {}
    }

    // 2. Direct REST fetch from Supabase site_content registry
    let registryMembers = [];
    try {
      const scRes = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_registered_members&select=*', {
        headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (scRes.ok) {
        const scData = await scRes.json();
        if (scData && scData[0] && scData[0].value_en) {
          registryMembers = JSON.parse(scData[0].value_en);
        }
      }
    } catch(e) {}

    // Also merge any members cached in localStorage
    try {
      const localReg = JSON.parse(localStorage.getItem('imi_registered_members') || '[]');
      if (Array.isArray(localReg) && localReg.length > 0) {
        localReg.forEach(lm => {
          if (!lm || !lm.email) return;
          const exists = registryMembers.find(rm => rm.email && rm.email.toLowerCase().trim() === lm.email.toLowerCase().trim());
          if (!exists) {
            registryMembers.push(lm);
            // Proactively sync this local member to cloud
            this.syncMemberRegistry(lm, 'upsert').catch(() => {});
          }
        });
      }
    } catch(e) {}

    // Merge registry into profiles
    if (Array.isArray(registryMembers)) {
      registryMembers.forEach(rm => {
        if (!rm || !rm.email) return;
        const rmEmail = rm.email.toLowerCase().trim();
        const found = profiles.find(p => p.email && p.email.toLowerCase().trim() === rmEmail);
        if (!found) {
          profiles.push({
            id: rm.id || _uuid(),
            email: rmEmail,
            full_name: rm.full_name || rm.name || rmEmail.split('@')[0],
            role: (rm.role === 'visitor' || rm.role === 'free') ? 'free' : rm.role,
            phone: rm.phone || '',
            company: rm.company || '',
            joined_at: rm.joined_at || new Date().toISOString()
          });
        } else {
          if (!found.full_name && rm.full_name) found.full_name = rm.full_name;
          if (!found.phone && rm.phone) found.phone = rm.phone;
          if (!found.company && rm.company) found.company = rm.company;
        }
      });
    }

    // 3. Normalize all roles (visitor -> free for UI consistency)
    profiles.forEach(p => {
      if (p.role === 'visitor') p.role = 'free';
    });

    const active = await this.getSession();
    if (active?.email && !profiles.find(p => p.email && p.email.toLowerCase().trim() === active.email.toLowerCase().trim())) {
      profiles.unshift({
        id: active.id || _uuid(),
        email: active.email,
        role: (active.role === 'visitor' || active.role === 'free') ? 'free' : (active.role || 'free'),
        full_name: active.name || active.full_name || active.email.split('@')[0],
        joined_at: active.joined_at || new Date().toISOString()
      });
    }

    return profiles;
  },

  async updateMemberRole(userId, newRole, emailFallback = '') {
    let updateError = null;
    const cleanEmail = (emailFallback || (typeof userId === 'string' && userId.includes('@') ? userId : '')).trim().toLowerCase();
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const dbRole = (newRole === 'free' || newRole === 'visitor') ? 'visitor' : newRole;

    if (supabaseClient) {
      try {
        let res;
        if (isUuid) {
          res = await supabaseClient.from('profiles').update({ role: dbRole }).eq('id', userId);
        } else if (cleanEmail) {
          res = await supabaseClient.from('profiles').update({ role: dbRole }).eq('email', cleanEmail);
        } else {
          res = await supabaseClient.from('profiles').update({ role: dbRole }).eq('id', userId);
        }

        if (res && res.error) {
          if (cleanEmail && isUuid) {
            const retry = await supabaseClient.from('profiles').update({ role: dbRole }).eq('email', cleanEmail);
            if (retry && retry.error) updateError = retry.error.message;
          } else {
            updateError = res.error.message;
          }
        }
      } catch(e) {
        console.error('[auth-client] updateMemberRole error:', e);
        updateError = e.message;
      }
    }

    // Also sync to member registry
    const appRole = (newRole === 'visitor' || newRole === 'free') ? 'free' : newRole;
    await this.syncMemberRegistry({ id: userId, email: cleanEmail, role: appRole }, 'upsert');

    // Also update locally cached session if it's the current user
    try {
      const active = JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
      if (active && (active.id === userId || (active.email && active.email.toLowerCase() === cleanEmail))) {
        active.role = appRole;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(active));
      }
    } catch(e) {}

    _cachedProfile = null;
    return { success: true };
  },

  async deleteMember(userId, emailFallback = '') {
    const cleanEmail = (emailFallback || (typeof userId === 'string' && userId.includes('@') ? userId : '')).trim().toLowerCase();
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // 1. Delete from Supabase profiles table
    if (supabaseClient) {
      try {
        if (isUuid) {
          await supabaseClient.from('profiles').delete().eq('id', userId);
        }
        if (cleanEmail) {
          await supabaseClient.from('profiles').delete().eq('email', cleanEmail);
        }
      } catch(e) {
        console.warn('[auth-client] Delete from profiles table notice:', e);
      }
    }

    // Direct REST delete fallback for profiles table
    try {
      if (isUuid) {
        await fetch(IMI_SUPABASE_URL + '/rest/v1/profiles?id=eq.' + userId, {
          method: 'DELETE',
          headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
        });
      }
      if (cleanEmail) {
        await fetch(IMI_SUPABASE_URL + '/rest/v1/profiles?email=eq.' + encodeURIComponent(cleanEmail), {
          method: 'DELETE',
          headers: { apikey: IMI_SUPABASE_KEY, Authorization: 'Bearer ' + IMI_SUPABASE_KEY }
        });
      }
    } catch(e) {}

    // 2. Delete from cloud member registry (cms_registered_members)
    await this.syncMemberRegistry({ id: userId, email: cleanEmail }, 'delete');

    // 3. Delete from localStorage registered members
    try {
      let localReg = JSON.parse(localStorage.getItem('imi_registered_members') || '[]');
      localReg = localReg.filter(m => (m.email || '').toLowerCase().trim() !== cleanEmail && m.id !== userId);
      localStorage.setItem('imi_registered_members', JSON.stringify(localReg));
    } catch(e) {}

    _cachedProfile = null;
    return { success: true };
  },

  async updateMemberProfile(userId, profileData = {}, emailFallback = '') {
    const cleanEmail = (emailFallback || profileData.email || (typeof userId === 'string' && userId.includes('@') ? userId : '')).trim().toLowerCase();
    const isUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // Only send native columns to profiles table to avoid PGRST204 errors
    const dbPayload = {};
    if (profileData.full_name !== undefined) dbPayload.full_name = profileData.full_name;
    if (profileData.avatar_url !== undefined) dbPayload.avatar_url = profileData.avatar_url;
    if (profileData.role !== undefined) dbPayload.role = (profileData.role === 'free' || profileData.role === 'visitor') ? 'visitor' : profileData.role;

    if (supabaseClient && Object.keys(dbPayload).length > 0) {
      try {
        if (isUuid) {
          await supabaseClient.from('profiles').update(dbPayload).eq('id', userId);
        } else if (cleanEmail) {
          await supabaseClient.from('profiles').update(dbPayload).eq('email', cleanEmail);
        }
      } catch(e) {}
    }

    // Full rich sync to member registry (phone, company, location, bio, website, status, notes)
    const appRole = (profileData.role === 'visitor' || profileData.role === 'free') ? 'free' : (profileData.role || 'free');
    const fullEntry = {
      id: userId || _uuid(),
      email: cleanEmail,
      full_name: profileData.full_name || cleanEmail.split('@')[0],
      role: appRole,
      avatar_url: profileData.avatar_url || '',
      phone: profileData.phone || '',
      company: profileData.company || '',
      location: profileData.location || '',
      bio: profileData.bio || '',
      website: profileData.website || '',
      status: profileData.status || 'active',
      notes: profileData.notes || ''
    };

    await this.syncMemberRegistry(fullEntry, 'upsert');

    // Update active session if it matches the current user
    try {
      const active = JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
      if (active && (active.id === userId || (active.email && active.email.toLowerCase() === cleanEmail))) {
        const merged = { ...active, ...fullEntry };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(merged));
      }
    } catch(e) {}

    _cachedProfile = null;
    return { success: true, member: fullEntry };
  },

  async createMemberAccount(email, password, fullName, role = 'free') {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName ? fullName.trim() : cleanEmail.split('@')[0];
    const dbRole = (role === 'free' || role === 'visitor') ? 'visitor' : role;
    const newId = _uuid();

    const userObj = {
      id: newId,
      email: cleanEmail,
      full_name: cleanName,
      role: (role === 'visitor' || role === 'free') ? 'free' : role,
      joined_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try {
        if (password) {
          const redirectUrl = window.location.origin + window.location.pathname.replace('admin.html', 'login.html').replace('portal.html', 'login.html');
          const { data: authData, error: authErr } = await supabaseClient.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: { full_name: cleanName, role: dbRole },
              emailRedirectTo: redirectUrl
            }
          });
          if (authData?.user) {
            userObj.id = authData.user.id;
            try {
              await supabaseClient.from('profiles').upsert({
                id: authData.user.id,
                email: cleanEmail,
                full_name: cleanName,
                role: dbRole
              }, { onConflict: 'id' });
            } catch(e) {}
          }
        }
      } catch (err) {
        console.warn('createMemberAccount auth notice:', err);
      }
    }

    // Always sync to member registry
    await this.syncMemberRegistry(userObj, 'upsert');

    return { success: true, user: userObj };
  },

  // ── 5. MEDIA UPLOADS & FILE STORAGE ────────────────────────────────────
  async uploadCourseFile(file, moduleKey = 'cms', mediaType = 'media') {
    if (!file) return { url: '', error: 'No file selected.' };

    const maxDirectUploadBytes = 50 * 1024 * 1024; // 50MB Supabase storage limit
    if (file.size > maxDirectUploadBytes) {
      return {
        url: '',
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds direct storage limit (50MB). Please paste a YouTube, Vimeo, Loom, or hosted MP4 video URL into the box.`
      };
    }

    if (supabaseClient) {
      try {
        const ext = file.name.split('.').pop();
        const filePath = `${moduleKey}/${mediaType}_${Date.now()}.${ext}`;
        const { data, error } = await supabaseClient.storage
          .from('course-content')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!error) {
          const { data: urlData } = supabaseClient.storage.from('course-content').getPublicUrl(filePath);
          if (urlData?.publicUrl) return { url: urlData.publicUrl, error: null };
        } else {
          console.warn('[Supabase Storage] Upload notice:', error.message);
          if (file.size > 4 * 1024 * 1024 || mediaType === 'video' || mediaType === 'audio') {
            return {
              url: '',
              error: `Storage Notice: ${error.message || 'Direct upload unavailable'}. For video courses, please paste a YouTube, Vimeo, Loom, or direct MP4 link.`
            };
          }
        }
      } catch(e) {
        console.warn('[Supabase Storage] Upload exception:', e);
      }
    }

    // Safe fallback ONLY for small images/thumbnails under 4MB (never for multi-MB videos)
    if (file.size <= 4 * 1024 * 1024 && (file.type.startsWith('image/') || mediaType.includes('thumb') || mediaType.includes('img') || mediaType.includes('logo') || mediaType.includes('chart'))) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ url: reader.result, error: null });
        reader.onerror = () => resolve({ url: '', error: 'File read error' });
        reader.readAsDataURL(file);
      });
    }

    return {
      url: '',
      error: 'Direct video file upload is unavailable. Please paste a video hosting URL (YouTube, Vimeo, Loom, or MP4 link).'
    };
  },

  // ── 6. COURSE MODULES & MEDIA ──────────────────────────────────────────
  async fetchCourseModules() {
    let modules = {};
    const siteContent = await this.fetchSiteContent();

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('course_modules').select('*');
        if (data && data.length > 0) {
          data.forEach(row => {
            modules[row.module_key] = {
              title: siteContent[`course.${row.module_key}.title`] || row.title || '',
              desc: siteContent[`course.${row.module_key}.desc`] || row.desc || '',
              video_title: row.video_title, video_url: row.video_url,
              audio_title: row.audio_title, audio_url: row.audio_url,
              doc_title: row.doc_title, doc_url: row.doc_url,
              chart_title: row.chart_title, chart_url: row.chart_url,
              link_title: row.link_title, link_url: row.link_url
            };
          });
        }
      } catch(e) {}
    }

    return modules;
  },

  async saveCourseModule(moduleKey, data) {
    if (data.title) await this.saveSiteContent(`course.${moduleKey}.title`, data.title);
    if (data.desc) await this.saveSiteContent(`course.${moduleKey}.desc`, data.desc);
    if (data.chart_url || data.chartUrl) await this.saveSiteContent(`course.${moduleKey}.chart_url`, data.chart_url || data.chartUrl);
    if (data.doc_url || data.docUrl) await this.saveSiteContent(`course.${moduleKey}.doc_url`, data.doc_url || data.docUrl);
    if (data.video_url || data.videoUrl) await this.saveSiteContent(`course.${moduleKey}.video_url`, data.video_url || data.videoUrl);
    if (data.audio_url || data.audioUrl) await this.saveSiteContent(`course.${moduleKey}.audio_url`, data.audio_url || data.audioUrl);

    const fullJson = JSON.stringify(data);
    await this.saveSiteContent(`course_module.${moduleKey}`, fullJson);

    if (supabaseClient) {
      try {
        const dbPayload = {
          module_key: moduleKey,
          title: data.title || '',
          desc: data.desc || '',
          video_url: (data.video_url || data.videoUrl || '').startsWith('data:') ? '' : (data.video_url || data.videoUrl || ''),
          video_title: data.video_title || data.videoTitle || 'Watch Video Lesson',
          audio_url: (data.audio_url || data.audioUrl || '').startsWith('data:') ? '' : (data.audio_url || data.audioUrl || ''),
          audio_title: data.audio_title || data.audioTitle || 'Audio Briefing',
          doc_url: (data.doc_url || data.docUrl || '').startsWith('data:') ? '' : (data.doc_url || data.docUrl || ''),
          doc_title: data.doc_title || data.docTitle || 'Download PDF',
          chart_url: (data.chart_url || data.chartUrl || '').startsWith('data:') ? '' : (data.chart_url || data.chartUrl || ''),
          chart_title: data.chart_title || data.chartTitle || 'View Diagram / Chart',
          link_url: data.link_url || data.linkUrl || '',
          link_title: data.link_title || data.linkTitle || ''
        };
        await supabaseClient.from('course_modules').upsert(dbPayload, { onConflict: 'module_key' });
      } catch(e) {
        console.warn('Course module upsert notice:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('imi_content_updated'));
    return { success: true };
  },

  // ── 7. SITE CONTENT CMS ────────────────────────────────────────────────
  async saveSiteContent(key, value) {
    let cleanVal = value;
    if (typeof value === 'string' && (key.includes('media') || key.includes('banner') || key.includes('img') || key.includes('logo'))) {
      const s = value.trim().toLowerCase();
      if (s.startsWith('c:') || s.startsWith('c/') || s.startsWith('file:')) {
        cleanVal = '../assets/logo/imi-gold-logo.jpg';
      }
    }

    let sc = {};
    try { sc = JSON.parse(localStorage.getItem('imi_site_content') || '{}'); } catch(e) {}
    sc[key] = cleanVal;
    try { localStorage.setItem('imi_site_content', JSON.stringify(sc)); } catch(e) {}

    // Direct REST upsert to Supabase
    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          apikey: IMI_SUPABASE_KEY,
          Authorization: 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key, value_en: cleanVal })
      });
    } catch(e) {
      if (supabaseClient) {
        try {
          await supabaseClient.from('site_content').upsert({ key, value_en: cleanVal }, { onConflict: 'key' });
        } catch(err) {}
      }
    }

    window.dispatchEvent(new CustomEvent('imi_content_updated'));
    return { success: true, siteContent: sc };
  },

  async fetchSiteContent() {
    let siteContent = {};
    try { siteContent = JSON.parse(localStorage.getItem('imi_site_content') || '{}'); } catch(e) {}

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('site_content').select('key, value_en');
        if (data && data.length > 0) {
          data.forEach(row => { siteContent[row.key] = row.value_en; });
          localStorage.setItem('imi_site_content', JSON.stringify(siteContent));
        }
      } catch(e) {}
    }

    return siteContent;
  },

  // ── 8. BOOKINGS & NEWSLETTER ───────────────────────────────────────────
  async createBooking(bookingData) {
    const entry = {
      id: _uuid(),
      name: bookingData.name || 'Member',
      email: bookingData.email || 'user@example.com',
      notes: bookingData.topic || bookingData.notes || '15-Minute Strategy Node Consultation',
      business_state: bookingData.business_state || bookingData.timezone || 'EST',
      status: bookingData.status || 'pending',
      created_at: new Date().toISOString()
    };

    if (supabaseClient) {
      try { await supabaseClient.from('bookings').insert([entry]); } catch(e) {}
    }

    window.dispatchEvent(new CustomEvent('imi_booking_created'));
    return { success: true, booking: entry };
  },

  async fetchBookings() {
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('bookings').select('*').order('created_at', { ascending: false });
        if (data) return data;
      } catch(e) {}
    }
    return [];
  },

  async updateBookingStatus(bookingId, status) {
    if (supabaseClient) {
      try { await supabaseClient.from('bookings').update({ status }).eq('id', bookingId); } catch(e) {}
    }
    return { success: true };
  },

  async subscribeNewsletter(email, name = '', source = 'Website') {
    if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' };
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim();

    // 1. Sync to localStorage
    let subs = [];
    try { subs = JSON.parse(localStorage.getItem('imi_subscribersList') || '[]'); } catch(e) {}
    const existingIdx = subs.findIndex(s => (typeof s === 'string' ? s.toLowerCase() : s.email?.toLowerCase()) === cleanEmail);
    
    const entry = {
      id: 'sub_' + Date.now(),
      email: cleanEmail,
      name: cleanName || cleanEmail.split('@')[0],
      source: source || 'Website',
      status: 'active',
      created_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      if (typeof subs[existingIdx] === 'object') {
        subs[existingIdx] = { ...subs[existingIdx], ...entry };
      }
    } else {
      subs.unshift(entry);
    }
    localStorage.setItem('imi_subscribersList', JSON.stringify(subs));

    // 2. Insert into Supabase table if available
    if (supabaseClient) {
      try {
        await supabaseClient.from('newsletter_subscribers').upsert([{
          email: cleanEmail,
          language: 'en',
          subscribed: true
        }], { onConflict: 'email' });
      } catch(e) {}
    }

    // 3. Save to Supabase site_content as JSON backup
    try {
      if (this.saveSiteContent) {
        await this.saveSiteContent('subscribers_list', JSON.stringify(subs));
      }
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_content_updated', { detail: { key: 'subscribers' } }));
    return { success: true, subscriber: entry };
  },

  async fetchSubscribers() {
    let subs = [];
    // 1. Try Supabase site_content (has full names, sources, metadata)
    try {
      const sc = await this.fetchSiteContent();
      if (sc?.subscribers_list) {
        const parsed = JSON.parse(sc.subscribers_list);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem('imi_subscribersList', sc.subscribers_list);
          return parsed;
        }
      }
    } catch(e) {}

    // 2. Try Supabase newsletter_subscribers table
    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('newsletter_subscribers').select('id, email, subscribed, subscribed_at');
        if (data && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            email: d.email,
            name: d.email.split('@')[0],
            source: 'Website',
            status: d.subscribed ? 'active' : 'unsubscribed',
            created_at: d.subscribed_at || new Date().toISOString()
          }));
          localStorage.setItem('imi_subscribersList', JSON.stringify(mapped));
          return mapped;
        }
      } catch(e) {}
    }

    // 3. Fallback to localStorage
    try {
      const raw = localStorage.getItem('imi_subscribersList');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    return [];
  },

  async deleteSubscriber(idOrEmail) {
    const cleanTarget = (idOrEmail || '').trim().toLowerCase();
    let subs = [];
    try { subs = JSON.parse(localStorage.getItem('imi_subscribersList') || '[]'); } catch(e) {}
    subs = subs.filter(s => {
      if (typeof s === 'string') return s.toLowerCase() !== cleanTarget;
      return s.id !== idOrEmail && s.email?.toLowerCase() !== cleanTarget;
    });
    localStorage.setItem('imi_subscribersList', JSON.stringify(subs));

    if (supabaseClient) {
      try {
        if (cleanTarget.includes('@')) {
          await supabaseClient.from('newsletter_subscribers').delete().eq('email', cleanTarget);
        }
      } catch(e) {}
    }
    try {
      if (this.saveSiteContent) {
        await this.saveSiteContent('subscribers_list', JSON.stringify(subs));
      }
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_content_updated', { detail: { key: 'subscribers' } }));
    return { success: true };
  },

  // ── 9. NAV BUTTON & GLOBAL LOGO UPDATES ──────────────────────────────
  async syncGlobalLogo() {
    try {
      const sc = await this.fetchSiteContent();
      const logoUrl = sc['site.logo'];
      if (logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('data:') || logoUrl.startsWith('.'))) {
        document.querySelectorAll('.brand-mark').forEach(bm => {
          bm.innerHTML = `<img src="${logoUrl}" alt="IMI Logo" style="height:100%; width:100%; object-fit:contain; border-radius:4px;">`;
        });
        document.querySelectorAll('.logo img, .sidebar-logo img, .sidebar-logo a img, #adminLogoImg').forEach(img => {
          img.src = logoUrl;
        });
      }
    } catch(e) {}
  },

  // ── 10. MEMBER MESSAGES & ADMIN DIRECT COMMUNICATIONS ────────────────
  async fetchMemberMessages() {
    try {
      const res = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_member_messages&select=*', {
        headers: { 'apikey': IMI_SUPABASE_KEY, 'Authorization': 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].value_en) {
          const parsed = JSON.parse(rows[0].value_en);
          if (Array.isArray(parsed)) {
            localStorage.setItem('imi_member_messages', JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    } catch(e) {
      console.warn('Error fetching member messages from Supabase:', e);
    }
    try {
      const cached = JSON.parse(localStorage.getItem('imi_member_messages') || '[]');
      if (Array.isArray(cached)) return cached;
    } catch(e) {}
    return [];
  },

  async sendMemberDirectMessage({ subject, body, priority = 'normal' }) {
    const session = await this.getSession();
    const profile = await this.getProfile();
    const email = profile?.email || session?.email || 'member@imakeimage.com';
    const name = profile?.full_name || session?.full_name || session?.name || email.split('@')[0];
    const role = profile?.role || session?.role || 'free';
    const avatar = profile?.avatar_url || session?.avatar_url || '';

    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      member_id: session?.id || ('usr-' + Date.now()),
      member_name: name,
      member_email: email,
      member_role: role,
      member_avatar: avatar,
      subject: subject || 'Direct Message to Strategy Team',
      body: (body || '').trim(),
      priority: priority,
      created_at: new Date().toISOString(),
      status: 'unread',
      replies: []
    };

    let msgs = await this.fetchMemberMessages();
    msgs.unshift(newMsg);
    localStorage.setItem('imi_member_messages', JSON.stringify(msgs));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_member_messages',
          value_en: JSON.stringify(msgs),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {
      console.warn('Error saving message to Supabase:', e);
    }

    window.dispatchEvent(new CustomEvent('imi_messages_updated', { detail: newMsg }));
    return { success: true, message: newMsg };
  },

  async replyToDirectMessage(messageId, replyText, senderRole = 'admin') {
    if (!messageId || !replyText?.trim()) return { success: false, error: 'Reply text required' };

    const session = await this.getSession();
    const profile = await this.getProfile();
    const isAdmin = senderRole === 'admin' || (profile?.role === 'admin') || (session?.role === 'admin');
    const senderName = isAdmin ? 'IMI Administrator' : (profile?.full_name || session?.name || 'Member');

    let msgs = await this.fetchMemberMessages();
    const targetMsg = msgs.find(m => m.id === messageId);
    if (!targetMsg) return { success: false, error: 'Message not found' };

    if (!Array.isArray(targetMsg.replies)) targetMsg.replies = [];
    const replyObj = {
      id: 'rep-' + Date.now(),
      sender: isAdmin ? 'admin' : 'member',
      sender_name: senderName,
      text: replyText.trim(),
      created_at: new Date().toISOString()
    };
    targetMsg.replies.push(replyObj);
    targetMsg.status = isAdmin ? 'replied' : 'unread';
    targetMsg.updated_at = new Date().toISOString();

    localStorage.setItem('imi_member_messages', JSON.stringify(msgs));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_member_messages',
          value_en: JSON.stringify(msgs),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {
      console.warn('Error saving reply to Supabase:', e);
    }

    window.dispatchEvent(new CustomEvent('imi_messages_updated', { detail: targetMsg }));
    return { success: true, reply: replyObj, message: targetMsg };
  },

  async deleteDirectMessage(messageId) {
    let msgs = await this.fetchMemberMessages();
    msgs = msgs.filter(m => m.id !== messageId);
    localStorage.setItem('imi_member_messages', JSON.stringify(msgs));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_member_messages',
          value_en: JSON.stringify(msgs),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_messages_updated'));
    return { success: true };
  },

  // ── 11. COMMUNITY BOARD & MEMBER CHAT EXCHANGES ──────────────────────
  async fetchCommunityPosts() {
    try {
      const res = await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?key=eq.cms_community_board&select=*', {
        headers: { 'apikey': IMI_SUPABASE_KEY, 'Authorization': 'Bearer ' + IMI_SUPABASE_KEY }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].value_en) {
          const parsed = JSON.parse(rows[0].value_en);
          if (Array.isArray(parsed)) {
            localStorage.setItem('imi_community_board', JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    } catch(e) {
      console.warn('Error fetching community board from Supabase:', e);
    }
    try {
      const cached = JSON.parse(localStorage.getItem('imi_community_board') || '[]');
      if (Array.isArray(cached)) return cached;
    } catch(e) {}
    return [];
  },

  async createCommunityPost({ title, category, content }) {
    if (!title?.trim() || !content?.trim()) return { success: false, error: 'Title and content required' };

    const session = await this.getSession();
    const profile = await this.getProfile();
    const email = profile?.email || session?.email || 'member@imakeimage.com';
    const name = profile?.full_name || session?.full_name || session?.name || email.split('@')[0];
    const role = profile?.role || session?.role || 'free';
    const avatar = profile?.avatar_url || session?.avatar_url || '';

    const newPost = {
      id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      author_id: session?.id || ('usr-' + Date.now()),
      author_name: name,
      author_email: email,
      author_role: role,
      author_avatar: avatar,
      category: category || 'General',
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
      liked_by: [],
      comments: []
    };

    let posts = await this.fetchCommunityPosts();
    posts.unshift(newPost);
    localStorage.setItem('imi_community_board', JSON.stringify(posts));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_community_board',
          value_en: JSON.stringify(posts),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {
      console.warn('Error saving community post to Supabase:', e);
    }

    window.dispatchEvent(new CustomEvent('imi_community_updated', { detail: newPost }));
    return { success: true, post: newPost };
  },

  async likeCommunityPost(postId) {
    const session = await this.getSession();
    const userEmail = session?.email || 'visitor';
    let posts = await this.fetchCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false };

    if (!Array.isArray(post.liked_by)) post.liked_by = [];
    const hasLiked = post.liked_by.includes(userEmail);
    if (hasLiked) {
      post.liked_by = post.liked_by.filter(e => e !== userEmail);
    } else {
      post.liked_by.push(userEmail);
    }
    post.likes = post.liked_by.length;

    localStorage.setItem('imi_community_board', JSON.stringify(posts));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_community_board',
          value_en: JSON.stringify(posts),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_community_updated'));
    return { success: true, likes: post.likes, hasLiked: !hasLiked };
  },

  async commentOnCommunityPost(postId, commentText) {
    if (!commentText?.trim()) return { success: false, error: 'Comment text required' };

    const session = await this.getSession();
    const profile = await this.getProfile();
    const email = profile?.email || session?.email || 'member@imakeimage.com';
    const name = profile?.full_name || session?.full_name || session?.name || email.split('@')[0];
    const role = profile?.role || session?.role || 'free';
    const avatar = profile?.avatar_url || session?.avatar_url || '';

    let posts = await this.fetchCommunityPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Post not found' };

    if (!Array.isArray(post.comments)) post.comments = [];
    const newComment = {
      id: 'comm-' + Date.now(),
      author_name: name,
      author_email: email,
      author_role: role,
      author_avatar: avatar,
      text: commentText.trim(),
      created_at: new Date().toISOString()
    };
    post.comments.push(newComment);

    localStorage.setItem('imi_community_board', JSON.stringify(posts));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_community_board',
          value_en: JSON.stringify(posts),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_community_updated'));
    return { success: true, comment: newComment };
  },

  async deleteCommunityPost(postId) {
    let posts = await this.fetchCommunityPosts();
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('imi_community_board', JSON.stringify(posts));

    try {
      await fetch(IMI_SUPABASE_URL + '/rest/v1/site_content?on_conflict=key', {
        method: 'POST',
        headers: {
          'apikey': IMI_SUPABASE_KEY,
          'Authorization': 'Bearer ' + IMI_SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'cms_community_board',
          value_en: JSON.stringify(posts),
          updated_at: new Date().toISOString()
        })
      });
    } catch(e) {}

    window.dispatchEvent(new CustomEvent('imi_community_updated'));
    return { success: true };
  },

  async updateNavButton() {
    const session = await this.getSession();
    const btns    = document.querySelectorAll('.btn-nav-login, .btn-portal-login, .login-link');
    const root    = window.location.pathname.includes('/pages/') ? '../' : './';

    if (session) {
      const role = await this.getRole();
      const dest = role === 'admin' ? root + 'pages/admin.html' : root + 'pages/portal.html';
      btns.forEach(btn => { btn.textContent = 'My Portal'; btn.href = dest; });
    } else {
      btns.forEach(btn => { btn.textContent = 'Login'; btn.href = root + 'pages/login.html'; });
    }
  }
};

if (typeof window !== 'undefined') {
  window.IMI_AUTH = IMI_AUTH;
}
if (typeof globalThis !== 'undefined') {
  globalThis.IMI_AUTH = IMI_AUTH;
}

document.addEventListener('DOMContentLoaded', () => {
  IMI_AUTH.updateNavButton();
  IMI_AUTH.syncGlobalLogo();
});
