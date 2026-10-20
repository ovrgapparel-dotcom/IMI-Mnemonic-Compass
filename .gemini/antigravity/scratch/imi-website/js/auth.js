/**
 * I MAKE IMAGE (IMI) - Authentication & Session Manager
 * 
 * Manages login state, role-based access, and portal routing.
 * Architecture is ready to connect to Supabase/Firebase for real auth.
 * 
 * ROLES:
 *  - 'visitor'    → public, not logged in
 *  - 'core_tribe' → $5/mo member (Core Tribe classroom access)
 *  - 'core_elite' → paid elite member (all content + consulting)
 *  - 'admin'      → full back-office control panel
 */

const IMI_AUTH = {

    // ─── Session Storage Key ───────────────────────────────────────────────
    SESSION_KEY: 'imi_session',

    // ─── Demo Users (Replace with real Supabase/Firebase call) ─────────────
    // In production this would be an API call to your auth provider
    DEMO_USERS: [
        { email: 'admin@imakeimage.com',      password: 'admin123',  role: 'admin',      name: 'IMI Admin' },
        { email: 'elite@imakeimage.com',       password: 'elite123',  role: 'core_elite', name: 'Elite Member' },
        { email: 'member@imakeimage.com',      password: 'tribe123',  role: 'core_tribe', name: 'Tribe Member' },
    ],

    // ─── Role Definitions ──────────────────────────────────────────────────
    ROLES: {
        admin:      { label: 'Administrator',   level: 99, color: '#E5C45A', badge: 'ADMIN' },
        core_elite: { label: 'Core Elite',      level: 2,  color: '#C9A227', badge: 'ELITE' },
        core_tribe: { label: 'Core Tribe',      level: 1,  color: '#B8BCC2', badge: 'TRIBE' },
        visitor:    { label: 'Visitor',         level: 0,  color: '#9B9C9E', badge: 'GUEST' }
    },

    // ─── Get Current Session ───────────────────────────────────────────────
    getSession() {
        try {
            const raw = localStorage.getItem(this.SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    // ─── Check If User Is Logged In ────────────────────────────────────────
    isLoggedIn() {
        const session = this.getSession();
        return session && session.email && session.role;
    },

    // ─── Get Current User Role ────────────────────────────────────────────
    getRole() {
        const session = this.getSession();
        return session ? session.role : 'visitor';
    },

    // ─── Login ─────────────────────────────────────────────────────────────
    login(email, password) {
        // Demo auth — swap this for: fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email, password}) })
        const user = this.DEMO_USERS.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            const session = {
                email: user.email,
                name: user.name,
                role: user.role,
                loginAt: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, user: session };
        } else {
            return { success: false, error: 'Invalid credentials. Check email and password.' };
        }
    },

    // ─── Logout ────────────────────────────────────────────────────────────
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = this._resolveRoot() + 'index.html';
    },

    // ─── Require Auth (redirect to login if not signed in) ─────────────────
    requireAuth(minRole = 'core_tribe') {
        if (!this.isLoggedIn()) {
            this._redirectToLogin();
            return false;
        }
        const userLevel = this.ROLES[this.getRole()]?.level ?? 0;
        const requiredLevel = this.ROLES[minRole]?.level ?? 1;
        if (userLevel < requiredLevel) {
            this._redirectToUpgrade();
            return false;
        }
        return true;
    },

    // ─── Update Nav Login Button ───────────────────────────────────────────
    updateNavButton() {
        const btns = document.querySelectorAll('.btn-nav-login, .btn-portal-login');
        const session = this.getSession();
        const root = this._resolveRoot();

        btns.forEach(btn => {
            if (session) {
                const roleInfo = this.ROLES[session.role] || this.ROLES.visitor;
                btn.textContent = `My Portal`;
                btn.style.background = `linear-gradient(135deg, ${roleInfo.color}, #a6811e)`;
                btn.style.color = '#000';
                btn.href = root + 'pages/portal.html';
                btn.removeAttribute('data-open-modal');
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
            } else {
                btn.textContent = 'Login';
                btn.href = root + 'pages/login.html';
            }
        });
    },

    // ─── Internal Helpers ─────────────────────────────────────────────────
    _redirectToLogin() {
        const root = this._resolveRoot();
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = root + 'pages/login.html?return=' + returnUrl;
    },

    _redirectToUpgrade() {
        const root = this._resolveRoot();
        window.location.href = root + 'pages/login.html?upgrade=1';
    },

    // Figure out path depth for relative root resolution
    _resolveRoot() {
        const path = window.location.pathname;
        return path.includes('/pages/') ? '../' : './';
    }
};

// ─── Auto-run on every page load ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    IMI_AUTH.updateNavButton();
});
