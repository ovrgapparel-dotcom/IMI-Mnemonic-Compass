/* =========================================
   IMI MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
        });
    }

    /* =====================================
       NAVIGATION MENU PERSISTENCE
    ===================================== */
    const currentPath = window.location.pathname.toLowerCase();
    document.querySelectorAll('.desktop-nav a, .mobile-menu a, .main-nav a').forEach(a => {
        a.classList.remove('active');
        const href = a.getAttribute('href');
        if (!href) return;
        const pageName = href.split('/').pop().split('#')[0].split('?')[0].toLowerCase();
        const currentName = currentPath.split('/').pop() || 'index.html';

        if (pageName === currentName || (pageName === 'index.html' && (currentName === '' || currentName === '/'))) {
            a.classList.add('active');
        }
    });


    /* =====================================
       HEADER SCROLL EFFECT
    ===================================== */

    const header =
        document.getElementById("siteHeader");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.style.background =
                "rgba(8,8,8,.94)";

        } else {

            header.style.background =
                "rgba(8,8,8,.72)";

        }

    });


    /* =====================================
       NEWSLETTER & EMAIL CAPTURE FORMS
    ===================================== */
    const bindNewsletterForms = () => {
        const forms = document.querySelectorAll("#newsletterForm, .newsletter-form, [data-newsletter-form]");
        forms.forEach(form => {
            if (form.dataset.bound) return;
            form.dataset.bound = "true";

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const emailInput = form.querySelector("input[type='email'], input[name='email']");
                const nameInput = form.querySelector("input[name='name'], input[type='text']");
                const button = form.querySelector("button, input[type='submit']");
                const originalText = button ? button.innerHTML : "Subscribe";

                const email = emailInput ? emailInput.value.trim() : "";
                const name = nameInput ? nameInput.value.trim() : "";
                const source = document.title ? document.title.split('—')[0].split('|')[0].trim() : window.location.pathname;

                if (!email || !email.includes('@')) {
                    alert('Please enter a valid email address.');
                    return;
                }

                if (button) {
                    button.disabled = true;
                    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...`;
                }

                try {
                    if (typeof IMI_AUTH !== 'undefined' && IMI_AUTH.subscribeNewsletter) {
                        await IMI_AUTH.subscribeNewsletter(email, name, source);
                    } else {
                        let subs = [];
                        try { subs = JSON.parse(localStorage.getItem('imi_subscribersList') || '[]'); } catch(e) {}
                        subs.unshift({ id: 'sub_' + Date.now(), email, name, source, created_at: new Date().toISOString() });
                        localStorage.setItem('imi_subscribersList', JSON.stringify(subs));
                        window.dispatchEvent(new CustomEvent('imi_content_updated'));
                    }

                    if (button) {
                        button.innerHTML = `✓ YOU'RE SUBSCRIBED`;
                        button.style.background = '#00c853';
                        button.style.borderColor = '#00c853';
                        button.style.color = '#000';
                    }
                    if (emailInput) emailInput.value = '';
                    if (nameInput) nameInput.value = '';

                    const feedback = form.querySelector('.newsletter-feedback');
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.textContent = 'Welcome to IMI Insider! Your registration is confirmed.';
                    }
                } catch (err) {
                    console.error('Newsletter error:', err);
                    if (button) {
                        button.disabled = false;
                        button.innerHTML = originalText;
                    }
                }
            });
        });
    };
    bindNewsletterForms();


    /* =====================================
       SIMPLE REVEAL ANIMATION
    ===================================== */

    const revealElements =
        document.querySelectorAll(
            ".ecosystem-card, .pathway-card, .learning-card, .resource-card, .tool-card"
        );

    const revealObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.style.opacity = "1";

                        entry.target.style.transform =
                            "translateY(0)";

                    }

                });

            },
            {
                threshold: 0.1
            }
        );


    revealElements.forEach((element) => {

        element.style.opacity = "0";

        element.style.transform =
            "translateY(20px)";

        element.style.transition =
            "opacity 700ms ease, transform 700ms ease";

        revealObserver.observe(element);

    });

    /* =====================================
       DYNAMIC WEBSITE CMS HYDRATION
    ===================================== */
    const hydrateWebsiteCMS = async () => {
        if (typeof IMI_AUTH === 'undefined') return;
        try {
            const sc = await IMI_AUTH.fetchSiteContent();
            if (!sc) return;

            function isValidMediaUrl(u) {
                if (!u || typeof u !== 'string') return false;
                const s = u.trim().toLowerCase();
                if (s.startsWith('uploading') || s.startsWith('error') || s.includes('not a function') || s.startsWith('c:') || s.startsWith('c/') || s.startsWith('file:')) return false;
                return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:') || s.startsWith('data:') || s.startsWith('./') || s.startsWith('../') || s.startsWith('/');
            }

            // 1. Universal Site Brand Logo Persistence Across All Pages & Sidebars
            if (isValidMediaUrl(sc['site.logo'])) {
                const logoUrl = sc['site.logo'];
                document.querySelectorAll('.brand-mark').forEach(bm => {
                    bm.innerHTML = `<img src="${logoUrl}" alt="IMI Logo" style="height:100%; width:100%; object-fit:contain; border-radius:4px;">`;
                });
                document.querySelectorAll('.logo img, .sidebar-logo img, .sidebar-logo a img, #adminLogoImg').forEach(img => {
                    img.src = logoUrl;
                });
            }

            // 2. Hero Background Banner (Image / Blob / Video)
            if (document.getElementById('hero-bg-media')) {
                const bgEl = document.getElementById('hero-bg-media');
                const rawUrl = sc['hero.banner_url'] || sc['hero.banner'] || sc['hero_banner'];
                const url = isValidMediaUrl(rawUrl) ? rawUrl : 'assets/products/mnemonic-compass-hud.jpg';

                if (url.includes('.mp4') || url.includes('.webm')) {
                    bgEl.innerHTML = `
                        <video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; opacity:0.35;">
                            <source src="${url}">
                        </video>
                        <div style="position:absolute; inset:0; background:radial-gradient(circle, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.92) 100%);"></div>
                    `;
                } else {
                    bgEl.style.backgroundImage = `url("${url}")`;
                    bgEl.style.backgroundSize = 'cover';
                    bgEl.style.backgroundPosition = 'center';
                    bgEl.style.opacity = '0.35';
                }
            }

            // 3. Hero Headlines & Paragraph Copy
            if (sc['hero.eyebrow'] && document.getElementById('hero-eyebrow-text')) {
                document.getElementById('hero-eyebrow-text').textContent = sc['hero.eyebrow'];
            }
            const h1El = document.getElementById('hero-h1-text');
            if (h1El) {
                const line1 = sc['hero.line1'] || 'Build Your Brand.';
                const line2 = sc['hero.line2'] || 'Command Your Marketing.';
                const line3 = sc['hero.line3'] || 'Grow Your Business.';
                h1El.innerHTML = `${line1}<br><span>${line2}</span><br>${line3}`;
            }
            if (sc['hero.description'] && document.getElementById('hero-desc-text')) {
                document.getElementById('hero-desc-text').textContent = sc['hero.description'];
            }
            if (sc['hero.btn1'] && document.getElementById('hero-btn1-link')) {
                document.getElementById('hero-btn1-link').textContent = sc['hero.btn1'];
            }
            if (sc['hero.btn1_url'] && document.getElementById('hero-btn1-link')) {
                document.getElementById('hero-btn1-link').href = sc['hero.btn1_url'];
            }
            if (sc['hero.btn2_url'] && document.getElementById('hero-btn2-link')) {
                document.getElementById('hero-btn2-link').href = sc['hero.btn2_url'];
            }

            // Universal Tab Hero Banners & Copy Hydration (All Tabs)
            const tabs = [
                { prefix: 'solutions', heroId: 'sol-hero', eyebrowId: 'sol-eyebrow', titleId: 'sol-title', descId: 'sol-desc' },
                { prefix: 'cmo', heroId: 'cmo-hero', eyebrowId: 'cmo-eyebrow', titleId: 'cmo-h1', descId: 'cmo-desc' },
                { prefix: 'learn', heroId: 'learn-hero', eyebrowId: 'learn-eyebrow', titleId: 'learn-title', descId: 'learn-desc' },
                { prefix: 'workshop', heroId: 'workshop-hero', eyebrowId: 'workshop-eyebrow', titleId: 'workshop-title', descId: 'workshop-desc' },
                { prefix: 'tools', heroId: 'tools-hero', eyebrowId: 'tools-eyebrow', titleId: 'tools-title', descId: 'tools-desc' },
                { prefix: 'solocorp', heroId: 'solocorp-hero', eyebrowId: 'solocorp-eyebrow', titleId: 'solocorp-title', descId: 'solocorp-desc' },
                { prefix: 'tribe', heroId: 'tribe-hero', eyebrowId: 'tribe-eyebrow', titleId: 'tribe-title', descId: 'tribe-desc' },
                { prefix: 'about', heroId: 'about-hero', eyebrowId: 'about-eyebrow', titleId: 'about-title', descId: 'about-desc' },
                { prefix: 'booking', heroId: 'booking-hero', eyebrowId: 'booking-eyebrow', titleId: 'booking-title', descId: 'booking-desc' }
            ];

            tabs.forEach(t => {
                const bannerUrl = sc[`${t.prefix}.banner_url`];
                if (isValidMediaUrl(bannerUrl)) {
                    const heroEl = document.getElementById(t.heroId) || document.querySelector('.page-hero, .hero');
                    if (heroEl) {
                        heroEl.style.backgroundImage = `linear-gradient(rgba(8,8,8,0.7), rgba(8,8,8,0.95)), url("${bannerUrl}")`;
                        heroEl.style.backgroundSize = 'cover';
                        heroEl.style.backgroundPosition = 'center';
                    }
                }
                if (sc[`${t.prefix}.eyebrow`] && document.getElementById(t.eyebrowId)) {
                    document.getElementById(t.eyebrowId).textContent = sc[`${t.prefix}.eyebrow`];
                }
                if (sc[`${t.prefix}.title`] && document.getElementById(t.titleId)) {
                    document.getElementById(t.titleId).textContent = sc[`${t.prefix}.title`];
                }
                if (sc[`${t.prefix}.desc`] && document.getElementById(t.descId)) {
                    document.getElementById(t.descId).textContent = sc[`${t.prefix}.desc`];
                }
            });

            // 4. Approach / System Section
            if (sc['approach.label'] && document.getElementById('approach-label-text')) {
                document.getElementById('approach-label-text').textContent = sc['approach.label'];
            }
            if (document.getElementById('approach-h2-text')) {
                const line1 = sc['approach.line1'] || 'Your business has pieces.';
                const line2 = sc['approach.line2'] || 'Do you have a system?';
                document.getElementById('approach-h2-text').innerHTML = `${line1}<br><span>${line2}</span>`;
            }
            if (sc['approach.desc'] && document.getElementById('approach-desc-text')) {
                document.getElementById('approach-desc-text').textContent = sc['approach.desc'];
            }
            if (sc['approach.conc_title'] && document.getElementById('approach-conc-h3-text')) {
                document.getElementById('approach-conc-h3-text').textContent = sc['approach.conc_title'];
            }
            if (sc['approach.conc_desc'] && document.getElementById('approach-conc-p-text')) {
                document.getElementById('approach-conc-p-text').textContent = sc['approach.conc_desc'];
            }

            // 5. Business Solutions Section
            if (sc['solutions.label'] && document.getElementById('solutions-label-text')) {
                document.getElementById('solutions-label-text').textContent = sc['solutions.label'];
            }
            if (document.getElementById('solutions-h2-text')) {
                const line1 = sc['solutions.line1'] || 'Your business deserves';
                const line2 = sc['solutions.line2'] || 'a marketing system.';
                document.getElementById('solutions-h2-text').innerHTML = `${line1}<br><span>${line2}</span>`;
            }
            if (sc['solutions.desc'] && document.getElementById('solutions-desc-text')) {
                document.getElementById('solutions-desc-text').textContent = sc['solutions.desc'];
            }

            // 6. Tool Pricing & Offers
            if (sc['tools.compass_price']) {
                document.querySelectorAll('.compass-card .tool-price').forEach(el => {
                    el.innerHTML = `${sc['tools.compass_price']} <span>ONE-TIME</span>`;
                });
            }
            if (sc['tools.time_price']) {
                document.querySelectorAll('.time-card .tool-price').forEach(el => {
                    el.innerHTML = `${sc['tools.time_price']} <span>ONE-TIME</span>`;
                });
            }
            if (sc['pricing.bundle']) {
                document.querySelectorAll('.bundle-price strong').forEach(el => {
                    el.textContent = sc['pricing.bundle'];
                });
            }

            // 7. Ecosystem Card Pictures (Solo Corp, Core Tribe, Blueprint)
            const isSubpage = window.location.pathname.includes('/pages/');
            const defaultSoloCover = isSubpage
                ? '../assets/products/solo-corp-book-cover.png'
                : 'assets/products/solo-corp-book-cover.png';

            const customSolo = sc['eco.solocorp_media'] || sc['solocorp.book_cover'];
            const isCustomValid = isValidMediaUrl(customSolo) &&
                !customSolo.includes('placeholder') &&
                !customSolo.includes('coin') &&
                !customSolo.includes('medallion') &&
                (customSolo.startsWith('http') || customSolo.startsWith('data:') || customSolo.startsWith('blob:') || customSolo.includes('solo-corp-book-cover'));

            const resolvedSoloCover = isCustomValid ? customSolo : defaultSoloCover;
            const soloImg = document.getElementById('solocorp-hero-book-img');
            if (soloImg && !soloImg.dataset.locked) {
                soloImg.src = resolvedSoloCover;
            }
            document.querySelectorAll('.solocorp-card, [data-eco="solocorp"]').forEach(el => {
                const img = el.querySelector('img');
                if (img) img.src = resolvedSoloCover;
            });
            if (isValidMediaUrl(sc['eco.tribe_media'])) {
                document.querySelectorAll('.tribe-card, [data-eco="tribe"]').forEach(el => {
                    const img = el.querySelector('img');
                    if (img) img.src = sc['eco.tribe_media'];
                });
            }
            if (isValidMediaUrl(sc['eco.blueprint_media'])) {
                document.querySelectorAll('.blueprint-card, [data-eco="blueprint"]').forEach(el => {
                    const img = el.querySelector('img');
                    if (img) img.src = sc['eco.blueprint_media'];
                });
            }

            // 8. Tool Card Pictures (Compass & Time Command)
            if (isValidMediaUrl(sc['tools.compass_media'])) {
                document.querySelectorAll('.compass-visual').forEach(el => {
                    el.innerHTML = `<img src="${sc['tools.compass_media']}" alt="IMI Compass" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
                });
            }
            if (isValidMediaUrl(sc['tools.time_media'])) {
                document.querySelectorAll('.clock-visual').forEach(el => {
                    el.innerHTML = `<img src="${sc['tools.time_media']}" alt="iM Time Command" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
                });
            }

            // 9. Solutions Feature Picture — render as actual image (not masked CSS background)
            const solutionsCmsVisual = document.getElementById('solutions-cms-visual');
            if (isValidMediaUrl(sc['solutions.media'])) {
                if (solutionsCmsVisual) {
                    const solMediaUrl = sc['solutions.media'];
                    const solLower = solMediaUrl.toLowerCase();
                    if (solLower.includes('.mp4') || solLower.includes('.webm')) {
                        solutionsCmsVisual.innerHTML = `<video autoplay loop muted playsinline style="width:100%; border-radius:12px; max-height:380px; object-fit:cover;"><source src="${solMediaUrl}"></video>`;
                    } else {
                        solutionsCmsVisual.innerHTML = `<img src="${solMediaUrl}" alt="IMI Business Solutions" style="width:100%; border-radius:12px; max-height:380px; object-fit:cover; display:block;">`;
                    }
                    solutionsCmsVisual.style.display = 'block';
                }
            }

            // 9b. Approach Section Featured Media
            if (isValidMediaUrl(sc['approach.media'])) {
                const approachMediaEl = document.getElementById('approach-media-container');
                if (approachMediaEl) {
                    const apUrl = sc['approach.media'];
                    const apLower = apUrl.toLowerCase();
                    if (apLower.includes('.mp4') || apLower.includes('.webm')) {
                        approachMediaEl.innerHTML = `<video autoplay loop muted playsinline style="width:100%; border-radius:16px; max-height:440px; object-fit:cover;"><source src="${apUrl}"></video>`;
                    } else {
                        approachMediaEl.innerHTML = `<img src="${apUrl}" alt="IMI Approach" style="width:100%; border-radius:16px; max-height:440px; object-fit:cover; display:block;">`;
                    }
                    approachMediaEl.style.display = 'block';
                }
            }

            // 9c. IMI Learning Preview Section Hydration (Homepage)
            if (sc['learn_prev.label'] && document.getElementById('learn-prev-label-text')) {
                document.getElementById('learn-prev-label-text').textContent = sc['learn_prev.label'];
            }
            if (sc['learn_prev.h1'] && document.getElementById('learn-prev-h1-text')) {
                const parts = sc['learn_prev.h1'].split(' ');
                const mid = Math.ceil(parts.length / 2);
                document.getElementById('learn-prev-h1-text').innerHTML = `${parts.slice(0, mid).join(' ')}<br><span>${parts.slice(mid).join(' ')}</span>`;
            }
            if (sc['learn_prev.sub'] && document.getElementById('learn-prev-sub-text')) {
                document.getElementById('learn-prev-sub-text').textContent = sc['learn_prev.sub'];
            }
            // Learning preview featured graphic
            if (isValidMediaUrl(sc['learn_prev.media'])) {
                const lpMedia = document.getElementById('learn-prev-media-container');
                if (lpMedia) {
                    lpMedia.innerHTML = `<img src="${sc['learn_prev.media']}" alt="IMI Learning" style="width:100%; border-radius:16px; max-height:400px; object-fit:cover; display:block;">`;
                    lpMedia.style.display = 'block';
                }
            }
            // Learning Card 1 (Courses)
            const c1Card = document.getElementById('learn-prev-card1');
            if (c1Card) {
                if (sc['learn_prev.c1_title']) { const el = document.getElementById('learn-prev-c1-title-text'); if (el) el.textContent = sc['learn_prev.c1_title']; }
                if (sc['learn_prev.c1_desc']) { const el = document.getElementById('learn-prev-c1-desc-text'); if (el) el.textContent = sc['learn_prev.c1_desc']; }
                if (sc['learn_prev.c1_link']) { const el = document.getElementById('learn-prev-c1-link-el'); if (el) el.href = sc['learn_prev.c1_link']; }
                if (isValidMediaUrl(sc['learn_prev.c1_media'])) {
                    const iconEl = document.getElementById('learn-prev-c1-icon-container');
                    if (iconEl) { iconEl.innerHTML = `<img src="${sc['learn_prev.c1_media']}" alt="${sc['learn_prev.c1_title'] || 'Courses'}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`; }
                }
            }
            // Learning Card 2 (Workshops)
            const c2Card = document.getElementById('learn-prev-card2');
            if (c2Card) {
                if (sc['learn_prev.c2_title']) { const el = document.getElementById('learn-prev-c2-title-text'); if (el) el.textContent = sc['learn_prev.c2_title']; }
                if (sc['learn_prev.c2_desc']) { const el = document.getElementById('learn-prev-c2-desc-text'); if (el) el.textContent = sc['learn_prev.c2_desc']; }
                if (sc['learn_prev.c2_link']) { const el = document.getElementById('learn-prev-c2-link-el'); if (el) el.href = sc['learn_prev.c2_link']; }
                if (isValidMediaUrl(sc['learn_prev.c2_media'])) {
                    const iconEl = document.getElementById('learn-prev-c2-icon-container');
                    if (iconEl) { iconEl.innerHTML = `<img src="${sc['learn_prev.c2_media']}" alt="${sc['learn_prev.c2_title'] || 'Workshops'}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`; }
                }
            }
            // Learning Card 3 (Resources)
            const c3Card = document.getElementById('learn-prev-card3');
            if (c3Card) {
                if (sc['learn_prev.c3_title']) { const el = document.getElementById('learn-prev-c3-title-text'); if (el) el.textContent = sc['learn_prev.c3_title']; }
                if (sc['learn_prev.c3_desc']) { const el = document.getElementById('learn-prev-c3-desc-text'); if (el) el.textContent = sc['learn_prev.c3_desc']; }
                if (sc['learn_prev.c3_link']) { const el = document.getElementById('learn-prev-c3-link-el'); if (el) el.href = sc['learn_prev.c3_link']; }
                if (isValidMediaUrl(sc['learn_prev.c3_media'])) {
                    const iconEl = document.getElementById('learn-prev-c3-icon-container');
                    if (iconEl) { iconEl.innerHTML = `<img src="${sc['learn_prev.c3_media']}" alt="${sc['learn_prev.c3_title'] || 'Resources'}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`; }
                }
            }

            // 10. Founder & Solutions Diagram Media Hydration
            if (isValidMediaUrl(sc['about.founder_media'])) {
                document.querySelectorAll('.about-visual').forEach(el => {
                    el.innerHTML = `<img src="${sc['about.founder_media']}" alt="IMI Founder" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
                });
            }
            const visuals = document.querySelectorAll('.service-visual');
            if (isValidMediaUrl(sc['solutions.cmo_media']) && visuals[0]) {
                visuals[0].innerHTML = `<img src="${sc['solutions.cmo_media']}" alt="CMO Strategy Diagram" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            }
            if (isValidMediaUrl(sc['solutions.infra_media']) && visuals[1]) {
                visuals[1].innerHTML = `<img src="${sc['solutions.infra_media']}" alt="Infrastructure Blueprint" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            }
            if (isValidMediaUrl(sc['solutions.consulting_media']) && visuals[2]) {
                visuals[2].innerHTML = `<img src="${sc['solutions.consulting_media']}" alt="Targeted Consulting Diagram" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            }
            if (isValidMediaUrl(sc['solutions.campaign_media']) && visuals[3]) {
                visuals[3].innerHTML = `<img src="${sc['solutions.campaign_media']}" alt="Campaign Execution Pipeline" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
            }

            // 10b. First Post-Hero Section Hydration (Solutions, Learn, Core Tribe)
            // Solutions Page Intro
            if (sc['solutions.intro_eyebrow'] && document.getElementById('sol-intro-eyebrow-text')) {
                document.getElementById('sol-intro-eyebrow-text').textContent = sc['solutions.intro_eyebrow'];
            }
            if (document.getElementById('sol-intro-h2-text')) {
                const line1 = sc['solutions.intro_h2_1'] || 'WHEN YOU NEED';
                const line2 = sc['solutions.intro_h2_2'] || 'MORE THAN A TOOL.';
                document.getElementById('sol-intro-h2-text').innerHTML = `${line1}<br><span>${line2}</span>`;
            }
            if (sc['solutions.intro_desc'] && document.getElementById('sol-intro-desc-text')) {
                document.getElementById('sol-intro-desc-text').textContent = sc['solutions.intro_desc'];
            }
            if (isValidMediaUrl(sc['solutions.intro_media'])) {
                const solIntroMedia = document.getElementById('solutions-intro-media-container');
                if (solIntroMedia) {
                    const url = sc['solutions.intro_media'];
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        solIntroMedia.innerHTML = `<video autoplay loop muted playsinline style="width:100%; max-height:460px; object-fit:cover; display:block;"><source src="${url}"></video>`;
                    } else {
                        solIntroMedia.innerHTML = `<img src="${url}" alt="Solutions Intro" style="width:100%; max-height:460px; object-fit:cover; display:block;">`;
                    }
                    solIntroMedia.style.display = 'block';
                }
            }

            // Learning Center Page Intro
            if (sc['learn.intro_eyebrow'] && document.getElementById('learn-intro-eyebrow-text')) {
                document.getElementById('learn-intro-eyebrow-text').textContent = sc['learn.intro_eyebrow'];
            }
            if (document.getElementById('learn-intro-h2-text')) {
                const line1 = sc['learn.intro_h2_1'] || 'MASTER THE SYSTEM.';
                const line2 = sc['learn.intro_h2_2'] || 'EXECUTE THE STRATEGY.';
                document.getElementById('learn-intro-h2-text').innerHTML = `${line1}<br><span>${line2}</span>`;
            }
            if (sc['learn.intro_desc'] && document.getElementById('learn-intro-desc-text')) {
                document.getElementById('learn-intro-desc-text').textContent = sc['learn.intro_desc'];
            }
            if (isValidMediaUrl(sc['learn.intro_media'])) {
                const learnIntroMedia = document.getElementById('learn-intro-media-container');
                if (learnIntroMedia) {
                    const url = sc['learn.intro_media'];
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        learnIntroMedia.innerHTML = `<video autoplay loop muted playsinline style="width:100%; max-height:460px; object-fit:cover; display:block;"><source src="${url}"></video>`;
                    } else {
                        learnIntroMedia.innerHTML = `<img src="${url}" alt="Learning Intro" style="width:100%; max-height:460px; object-fit:cover; display:block;">`;
                    }
                    learnIntroMedia.style.display = 'block';
                }
            }

            // Core Tribe First Section
            if (sc['tribe.intro_eyebrow'] && document.getElementById('tribe-intro-eyebrow-text')) {
                document.getElementById('tribe-intro-eyebrow-text').textContent = sc['tribe.intro_eyebrow'];
            }
            if (document.getElementById('tribe-intro-h2-text')) {
                const line1 = sc['tribe.intro_h2_1'] || 'Choose Your';
                const line2 = sc['tribe.intro_h2_2'] || 'Path In';
                document.getElementById('tribe-intro-h2-text').innerHTML = `${line1} <span>${line2}</span>`;
            }
            if (sc['tribe.intro_desc'] && document.getElementById('tribe-intro-desc-text')) {
                document.getElementById('tribe-intro-desc-text').textContent = sc['tribe.intro_desc'];
            }
            if (isValidMediaUrl(sc['tribe.intro_media'])) {
                const tribeIntroMedia = document.getElementById('tribe-intro-media-container');
                if (tribeIntroMedia) {
                    const url = sc['tribe.intro_media'];
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        tribeIntroMedia.innerHTML = `<video autoplay loop muted playsinline style="width:100%; max-height:460px; object-fit:cover; display:block;"><source src="${url}"></video>`;
                    } else {
                        tribeIntroMedia.innerHTML = `<img src="${url}" alt="Core Tribe Intro" style="width:100%; max-height:460px; object-fit:cover; display:block;">`;
                    }
                    tribeIntroMedia.style.display = 'block';
                }
            }

            // CMO Services Page Intro
            if (sc['cmo.intro_eyebrow'] && document.getElementById('cmo-intro-eyebrow-text')) {
                document.getElementById('cmo-intro-eyebrow-text').textContent = sc['cmo.intro_eyebrow'];
            }
            if (document.getElementById('cmo-intro-h2-text')) {
                const line1 = sc['cmo.intro_h2_1'] || 'Executive Strategy.';
                const line2 = sc['cmo.intro_h2_2'] || 'Coordinated Growth.';
                document.getElementById('cmo-intro-h2-text').innerHTML = `${line1} <span>${line2}</span>`;
            }
            if (sc['cmo.intro_desc'] && document.getElementById('cmo-intro-desc-text')) {
                document.getElementById('cmo-intro-desc-text').textContent = sc['cmo.intro_desc'];
            }
            if (isValidMediaUrl(sc['cmo.intro_media'])) {
                const cmoIntroMedia = document.getElementById('cmo-intro-media-container');
                if (cmoIntroMedia) {
                    const url = sc['cmo.intro_media'];
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        cmoIntroMedia.innerHTML = `<video autoplay loop muted playsinline style="width:100%; max-height:460px; object-fit:cover; display:block;"><source src="${url}"></video>`;
                    } else {
                        cmoIntroMedia.innerHTML = `<img src="${url}" alt="CMO Intro" style="width:100%; max-height:460px; object-fit:cover; display:block;">`;
                    }
                }
            }

            // News Centre Page Intro
            if (sc['news.intro_eyebrow'] && document.getElementById('news-intro-eyebrow-text')) {
                document.getElementById('news-intro-eyebrow-text').textContent = sc['news.intro_eyebrow'];
            }
            if (document.getElementById('news-intro-h2-text')) {
                const line1 = sc['news.intro_h2_1'] || 'Stay Informed.';
                const line2 = sc['news.intro_h2_2'] || 'Stay Ahead.';
                document.getElementById('news-intro-h2-text').innerHTML = `${line1} <span>${line2}</span>`;
            }
            if (sc['news.intro_desc'] && document.getElementById('news-intro-desc-text')) {
                document.getElementById('news-intro-desc-text').textContent = sc['news.intro_desc'];
            }
            if (isValidMediaUrl(sc['news.intro_media'])) {
                const newsIntroMedia = document.getElementById('news-intro-media-container');
                if (newsIntroMedia) {
                    const url = sc['news.intro_media'];
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        newsIntroMedia.innerHTML = `<video autoplay loop muted playsinline style="width:100%; max-height:460px; object-fit:cover; display:block;"><source src="${url}"></video>`;
                    } else {
                        newsIntroMedia.innerHTML = `<img src="${url}" alt="News Intro" style="width:100%; max-height:460px; object-fit:cover; display:block;">`;
                    }
                }
            }

            // Flagship IMI Intensive Workshop Feature Block
            const intensiveEyebrow = sc['workshop.intensive_eyebrow'];
            const intensiveTitle = sc['workshop.intensive_title'];
            const intensiveDesc = sc['workshop.intensive_desc'];
            const intensiveFeatures = sc['workshop.intensive_features'];
            const intensivePrice = sc['workshop.intensive_price'];
            const intensiveUnit = sc['workshop.intensive_price_unit'] || ' / HR';
            const intensiveDuration = sc['workshop.intensive_duration'];
            const intensiveSubnote = sc['workshop.intensive_subnote'];
            const intensiveBtnText = sc['workshop.intensive_btn_text'];
            const intensiveBtnUrl = sc['workshop.intensive_btn_url'];
            const intensiveMedia = sc['workshop.intensive_media'];

            // Power Hours Page Spotlight
            if (intensiveEyebrow && document.getElementById('intensive-eyebrow')) {
                document.getElementById('intensive-eyebrow').textContent = intensiveEyebrow;
            }
            if (intensiveTitle && document.getElementById('intensive-title')) {
                document.getElementById('intensive-title').textContent = intensiveTitle;
            }
            if (intensiveDesc && document.getElementById('intensive-desc')) {
                document.getElementById('intensive-desc').textContent = intensiveDesc;
            }
            if (intensiveFeatures && document.getElementById('intensive-features-list')) {
                const listEl = document.getElementById('intensive-features-list');
                const items = intensiveFeatures.split('\n').map(s => s.trim()).filter(Boolean);
                if (items.length) {
                    listEl.innerHTML = items.map(it => `<li>${it.replace(/^([✓\u2713•\-\*]\s*)+/, '')}</li>`).join('');
                }
            }
            if (intensiveBtnText && document.getElementById('intensive-btn')) {
                document.getElementById('intensive-btn').textContent = intensiveBtnText;
            }
            if (intensiveBtnUrl && document.getElementById('intensive-btn')) {
                document.getElementById('intensive-btn').setAttribute('href', intensiveBtnUrl);
            }
            if (intensivePrice && document.getElementById('intensive-price')) {
                document.getElementById('intensive-price').innerHTML = `${intensivePrice}<span class="flagship-price-unit" id="intensive-price-unit">${intensiveUnit}</span>`;
            }
            if (intensiveDuration && document.getElementById('intensive-duration-note')) {
                document.getElementById('intensive-duration-note').textContent = intensiveDuration;
            }
            if (intensiveSubnote && document.getElementById('intensive-subnote')) {
                document.getElementById('intensive-subnote').innerHTML = intensiveSubnote.replace(/\n/g, '<br>');
            }
            if (isValidMediaUrl(intensiveMedia)) {
                const mediaContainer = document.getElementById('intensive-media-container');
                if (mediaContainer) {
                    const url = intensiveMedia;
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        mediaContainer.innerHTML = `<video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; display:block;" class="imi-zoomable"><source src="${url}"></video>`;
                    } else {
                        mediaContainer.innerHTML = `<img src="${url}" alt="IMI Intensive Workshop" style="width:100%; height:100%; object-fit:cover; display:block;" class="imi-zoomable">`;
                    }
                }
            }

            // Learning Center Page Workshops Tab Spotlight
            if (intensiveEyebrow && document.getElementById('learn-intensive-eyebrow')) {
                document.getElementById('learn-intensive-eyebrow').textContent = intensiveEyebrow;
            }
            if (intensiveTitle && document.getElementById('learn-intensive-title')) {
                document.getElementById('learn-intensive-title').textContent = intensiveTitle;
            }
            if (intensiveDesc && document.getElementById('learn-intensive-desc')) {
                document.getElementById('learn-intensive-desc').textContent = intensiveDesc;
            }
            if (intensiveFeatures && document.getElementById('learn-intensive-features-list')) {
                const listEl = document.getElementById('learn-intensive-features-list');
                const items = intensiveFeatures.split('\n').map(s => s.trim()).filter(Boolean);
                if (items.length) {
                    listEl.innerHTML = items.map(it => `<li style="font-size:.84rem; color:rgba(255,255,255,0.7); padding:4px 0; display:flex; align-items:center; gap:8px;"><span style="color:var(--gold); font-weight:700;">&check;</span> ${it.replace(/^([✓\u2713•\-\*]\s*)+/, '')}</li>`).join('');
                }
            }
            if (intensiveBtnText && document.getElementById('learn-intensive-btn')) {
                document.getElementById('learn-intensive-btn').textContent = intensiveBtnText;
            }
            if (intensiveBtnUrl && document.getElementById('learn-intensive-btn')) {
                document.getElementById('learn-intensive-btn').setAttribute('href', intensiveBtnUrl);
            }
            if (intensivePrice && document.getElementById('learn-intensive-price')) {
                document.getElementById('learn-intensive-price').innerHTML = `${intensivePrice}<span style="font-size:.9rem; color:rgba(255,255,255,0.5);">${intensiveUnit}</span>`;
            }
            if (intensiveDuration && document.getElementById('learn-intensive-duration-note')) {
                document.getElementById('learn-intensive-duration-note').textContent = intensiveDuration;
            }
            if (isValidMediaUrl(intensiveMedia)) {
                const mediaContainer = document.getElementById('learn-intensive-media-container');
                if (mediaContainer) {
                    const url = intensiveMedia;
                    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
                        mediaContainer.innerHTML = `<video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; display:block;" class="imi-zoomable"><source src="${url}"></video>`;
                    } else {
                        mediaContainer.innerHTML = `<img src="${url}" alt="IMI Intensive Workshop" style="width:100%; height:100%; object-fit:cover; display:block;" class="imi-zoomable">`;
                    }
                }
            }

            // Video Hub & Channel Links Sync
            const ytUrl = sc['video.yt_channel_url'] || sc['comm.youtube_url'];
            if (ytUrl) {
                document.querySelectorAll('a[href*="youtube.com/@imakeimage"], #video-hub-top-yt-link, #video-hub-yt-btn, #featured-video-yt-link').forEach(el => {
                    el.href = ytUrl;
                });
            }
            const patreonUrl = sc['video.patreon_url'] || sc['comm.patreon_url'];
            if (patreonUrl) {
                document.querySelectorAll('a[href*="patreon.com/c/IMICREATIVELABCLASSROOM"], #video-hub-top-patreon-link, #video-hub-patreon-btn').forEach(el => {
                    el.href = patreonUrl;
                });
            }
            const playlistUrl = sc['video.playlist_embed_url'] || sc['video_hub.featured_url'];
            if (playlistUrl && document.getElementById('featured-youtube-iframe')) {
                document.getElementById('featured-youtube-iframe').src = playlistUrl;
            }
            if (sc['video.featured_title'] && document.getElementById('featured-video-title')) {
                document.getElementById('featured-video-title').textContent = sc['video.featured_title'];
            }
            if (sc['video.featured_desc'] && document.getElementById('featured-video-desc')) {
                document.getElementById('featured-video-desc').textContent = sc['video.featured_desc'];
            }

            // 11. Dynamic Custom Feature Block Sections
            function renderFeatureBlock(data) {
                const eyebrow = data.eyebrow || 'FEATURED INTELLIGENCE';
                const title = data.title || '';
                const body = data.body || '';
                const btnText = data.btnText || data.button_text || '';
                const btnUrl = data.btnUrl || data.button_url || '#';
                const mediaUrl = data.mediaUrl || data.media_url || '';

                let mediaHtml = '';
                if (isValidMediaUrl(mediaUrl)) {
                    const lower = mediaUrl.toLowerCase();
                    if (lower.includes('.mp4') || lower.includes('.webm')) {
                        mediaHtml = `<video controls autoplay loop muted playsinline style="width:100%; border-radius:12px; max-height:420px; object-fit:cover; border:1px solid rgba(201,162,39,0.3); box-shadow:0 12px 30px rgba(0,0,0,0.6);"><source src="${mediaUrl}"></video>`;
                    } else if (lower.includes('.mp3') || lower.includes('.wav') || lower.includes('.ogg')) {
                        mediaHtml = `<div style="background:#161920; border:1px solid rgba(201,162,39,0.3); border-radius:12px; padding:24px; text-align:center; width:100%;"><i class="fa-solid fa-headphones" style="font-size:2.5rem; color:var(--gold); margin-bottom:12px; display:block;"></i><audio controls style="width:100%; margin-top:8px;"><source src="${mediaUrl}"></audio></div>`;
                    } else {
                        mediaHtml = `<img src="${mediaUrl}" alt="${title}" style="width:100%; border-radius:12px; max-height:420px; object-fit:cover; border:1px solid rgba(201,162,39,0.3); box-shadow:0 15px 35px rgba(0,0,0,0.6);">`;
                    }
                }

                return `
                <section class="feature-block-section" style="padding:70px 6vw; background:linear-gradient(180deg, #0a0c0f 0%, #0e1117 100%); border-top:1px solid rgba(201,162,39,0.15); border-bottom:1px solid rgba(201,162,39,0.15); margin:40px 0;">
                    <div style="display:grid; grid-template-columns:${mediaHtml ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr'}; gap:48px; align-items:center; max-width:1160px; margin:0 auto;">
                        <div style="${!mediaHtml ? 'max-width:850px; margin:0 auto; text-align:center;' : ''}">
                            <div class="section-label" style="color:var(--gold); font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:12px; display:inline-flex; align-items:center; gap:8px;">
                                <span style="display:inline-block; width:6px; height:6px; background:var(--gold); border-radius:50%;"></span>
                                ${eyebrow}
                            </div>
                            <h3 style="font-family:var(--font-heading); font-size:clamp(1.8rem, 3.5vw, 2.5rem); font-weight:800; color:#fff; margin-bottom:18px; line-height:1.2; letter-spacing:-0.01em;">${title}</h3>
                            <div style="color:rgba(255,255,255,0.72); font-size:1rem; line-height:1.8; margin-bottom:28px;">${body}</div>
                            ${btnText ? `<a href="${btnUrl}" class="button button-gold" style="display:inline-flex; align-items:center; gap:8px; padding:13px 28px; border-radius:8px; text-decoration:none; font-weight:800; font-size:0.9rem; letter-spacing:0.04em;">${btnText} &rarr;</a>` : ''}
                        </div>
                        ${mediaHtml ? `<div style="display:flex; justify-content:center; width:100%;">${mediaHtml}</div>` : ''}
                    </div>
                </section>`;
            }

            const customContainers = {
                home: document.getElementById('home-custom-sections-container'),
                index: document.getElementById('home-custom-sections-container'),
                cmo: document.getElementById('cmo-custom-sections-container'),
                'cmo-services': document.getElementById('cmo-custom-sections-container'),
                solutions: document.getElementById('solutions-custom-sections-container') || document.getElementById('sol-custom-sections-container'),
                sol: document.getElementById('solutions-custom-sections-container') || document.getElementById('sol-custom-sections-container'),
                learning: document.getElementById('learn-custom-sections-container') || document.getElementById('learning-custom-sections-container'),
                learn: document.getElementById('learn-custom-sections-container') || document.getElementById('learning-custom-sections-container'),
                workshops: document.getElementById('workshop-custom-sections-container') || document.getElementById('power-hours-custom-sections-container'),
                workshop: document.getElementById('workshop-custom-sections-container') || document.getElementById('power-hours-custom-sections-container'),
                'power-hours': document.getElementById('workshop-custom-sections-container') || document.getElementById('power-hours-custom-sections-container'),
                tools: document.getElementById('tools-custom-sections-container'),
                solocorp: document.getElementById('solocorp-custom-sections-container') || document.getElementById('solo-corp-custom-sections-container'),
                'solo-corp': document.getElementById('solocorp-custom-sections-container') || document.getElementById('solo-corp-custom-sections-container'),
                tribe: document.getElementById('tribe-custom-sections-container') || document.getElementById('core-tribe-custom-sections-container'),
                'core-tribe': document.getElementById('tribe-custom-sections-container') || document.getElementById('core-tribe-custom-sections-container'),
                about: document.getElementById('about-custom-sections-container'),
                news: document.getElementById('news-custom-sections-container'),
                booking: document.getElementById('booking-custom-sections-container'),
                webinars: document.getElementById('webinars-custom-sections-container') || document.getElementById('webinar-custom-sections-container'),
                webinar: document.getElementById('webinars-custom-sections-container') || document.getElementById('webinar-custom-sections-container')
            };

            const uniqueContainers = new Set(Object.values(customContainers).filter(Boolean));
            uniqueContainers.forEach(el => { el.innerHTML = ''; });

            Object.keys(sc).forEach(k => {
                if (k.startsWith('custom_section.')) {
                    const parts = k.split('.');
                    const pageKey = parts[1];
                    const container = customContainers[pageKey];
                    if (container) {
                        try {
                            const data = typeof sc[k] === 'string' ? JSON.parse(sc[k]) : sc[k];
                            if (data && (data.title || data.body || data.mediaUrl)) {
                                container.innerHTML += renderFeatureBlock(data);
                            }
                        } catch(e) { console.warn('Failed to parse custom section:', e); }
                    }
                }
            });

            // 12. Dynamic News Dispatches & Pop-Up Article Reader
            const defaultArticles = [
                {
                    id: 'art-ai-systems',
                    title: 'Building Intentional Marketing Systems with AI Workflows',
                    date: 'August 2026 · AI Operations & Automation',
                    summary: 'How modern businesses move past disjointed tactics into coordinated lead generation and client acquisition engines.',
                    imageUrl: '../assets/products/solo-corp-blueprint.jpg',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    content: `
                        <p>Most companies do not suffer from a lack of marketing effort; they suffer from fragmented architecture. Isolated social posts, disconnected email campaigns, and uncoordinated ad spend lead to high operational friction with diminishing returns.</p>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">1. The 3 Core Tenets of an AI Marketing Engine</h3>
                        <p>To scale efficiently, modern marketing requires three connected layers:</p>
                        <ul style="padding-left:20px; line-height:1.9;">
                            <li><strong>Signal Capture & Data Routing:</strong> Automated tracking that identifies customer intent triggers across your touchpoints.</li>
                            <li><strong>Adaptive Content Personalization:</strong> Dynamic nurturing flows calibrated to audience readiness stages.</li>
                            <li><strong>Continuous Attribution Feedback:</strong> Real-time conversion insights feeding directly into budget reallocation models.</li>
                        </ul>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">2. Moving from Tactical Noise to Systematic Authority</h3>
                        <p>When AI workflows are layered over clear brand positioning, the output changes from generic volume to authoritative precision. Your brand communicates with consistent tone, predictable cadence, and targeted messaging across all channels.</p>
                        <blockquote style="border-left:3px solid var(--gold); padding-left:16px; margin:20px 0; color:var(--gold); font-style:italic; background:rgba(201,162,39,0.04); padding:14px 18px; border-radius:0 8px 8px 0;">
                            "Marketing is not an expense when built as an integrated business asset. It becomes your primary growth multiplier."
                        </blockquote>
                    `,
                    ctaUrl: 'booking.html',
                    ctaText: 'Schedule Strategy Review →'
                },
                {
                    id: 'art-solocorp-blueprint',
                    title: 'The 30-Day Solo Corp Blueprint for Solopreneurs',
                    date: 'August 2026 · Brand Strategy & Lean Ops',
                    summary: 'Establishing authority coordinates, pricing high-margin services, and automating client intake.',
                    imageUrl: '../assets/products/solo-corp-book-cover.png',
                    videoUrl: '',
                    content: `
                        <p>Solo operators often fall into the trap of trading time for linear compensation. The Solo Corp framework shifts independent professionals from reactive freelancing to operating a streamlined enterprise of one.</p>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">1. High-Margin Packaging & Value Density</h3>
                        <p>Stop quoting hourly rates. Price against business outcomes, strategic roadmaps, and proprietary implementation frameworks that deliver measurable leverage.</p>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">2. Automated Cockpits & Booking Flows</h3>
                        <p>Automate client intake questionnaires, scheduling calendars, agreement signatures, and retainer invoicing. Free your energy to focus solely on high-leverage execution and strategic advisory.</p>
                        <ul style="padding-left:20px; line-height:1.9;">
                            <li>Standardized Discovery Audits</li>
                            <li>Predictable 15-Minute Intake Filters</li>
                            <li>Self-Serve Digital Asset Libraries</li>
                        </ul>
                    `,
                    ctaUrl: 'solo-corp.html',
                    ctaText: 'Explore Solo Corp 101 →'
                },
                {
                    id: 'art-fractional-cmo',
                    title: 'When to Bring on a Fractional CMO vs Full-Time Agency',
                    date: 'August 2026 · Executive Leadership & ROI',
                    summary: 'Evaluating executive marketing oversight, strategic clarity, and ROI for scaling companies.',
                    imageUrl: '../assets/logo/imi-gold-lockup.jpg',
                    videoUrl: '',
                    content: `
                        <p>Hiring a full-time Chief Marketing Officer is often premature for growth-stage businesses, while traditional agencies often prioritize ad spend volume over strategic alignment.</p>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">1. Strategic Direction vs Channel Execution</h3>
                        <p>A Fractional CMO acts as your executive co-pilot. We architect the marketing strategy, align leadership, vet vendor contracts, and manage internal teams to execute with accountability.</p>
                        <h3 style="color:#fff; font-size:1.3rem; margin:24px 0 12px;">2. The Decision Matrix</h3>
                        <p>If your customer acquisition costs are rising, messaging feels disjointed across channels, or your team is executing without a unified quarterly roadmap, executive fractional oversight delivers the highest ROI.</p>
                    `,
                    ctaUrl: 'cmo-services.html',
                    ctaText: 'View Fractional CMO Services →'
                }
            ];

            window.imiArticlesRegistry = {};
            defaultArticles.forEach(a => { window.imiArticlesRegistry[a.id] = a; });

            const newsGrid = document.getElementById('news-articles-grid');
            if (newsGrid) {
                const dispatchKeys = Object.keys(sc).filter(k => k.startsWith('news_dispatch.'));
                const allArticles = [...defaultArticles];

                dispatchKeys.forEach(k => {
                    try {
                        const d = typeof sc[k] === 'string' ? JSON.parse(sc[k]) : sc[k];
                        if (d && d.title) {
                            const articleObj = {
                                id: k,
                                title: d.title,
                                date: d.date || 'Ecosystem Dispatch',
                                summary: d.summary || '',
                                content: d.content || d.body || `<p>${d.summary || ''}</p>`,
                                imageUrl: d.imageUrl || d.mediaUrl || '',
                                videoUrl: d.videoUrl || d.video || '',
                                ctaUrl: d.link || d.ctaUrl || 'booking.html',
                                ctaText: d.ctaText || 'Work With IMI →'
                            };
                            window.imiArticlesRegistry[k] = articleObj;
                            allArticles.unshift(articleObj);
                        }
                    } catch(e) {}
                });

                const seenIds = new Set();
                const uniqueArticles = allArticles.filter(a => {
                    if (seenIds.has(a.id || a.title)) return false;
                    seenIds.add(a.id || a.title);
                    return true;
                });

                newsGrid.innerHTML = uniqueArticles.map(a => {
                    const coverImg = isValidMediaUrl(a.imageUrl) ? `<div style="height:180px; overflow:hidden; background:#000;"><img src="${a.imageUrl}" alt="${a.title}" style="width:100%; height:100%; object-fit:cover; opacity:0.85;"></div>` : '';
                    const safeId = a.id || '';
                    return `
                    <div class="news-card" style="cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;" onclick="openArticleModal('${safeId}')">
                        <div>
                            ${coverImg}
                            <div class="news-card-body">
                                <div class="news-date">${a.date || 'Ecosystem Dispatch'}</div>
                                <h3 style="font-size:1.15rem; margin:8px 0;">${a.title}</h3>
                                <p style="font-size:0.88rem; line-height:1.6; color:rgba(255,255,255,0.7);">${a.summary || ''}</p>
                            </div>
                        </div>
                        <div>
                            <div style="padding:0 20px 10px;">
                                <button class="btn btn-secondary" onclick="event.stopPropagation(); openArticleModal('${safeId}')" style="width:100%; font-size:0.8rem; padding:8px 14px; border-color:rgba(201,162,39,0.3); color:var(--gold);">Read Insight &rarr;</button>
                            </div>
                            <div class="card-share-footer" onclick="event.stopPropagation();">
                                <span class="card-share-label"><i class="fa-solid fa-share-nodes" style="color:var(--gold); margin-right:3px;"></i> Share:</span>
                                <div class="card-share-buttons">
                                    <button onclick="shareArticle('linkedin', '${safeId}', event)" class="card-share-btn share-linkedin" title="Share to LinkedIn"><i class="fa-brands fa-linkedin-in"></i></button>
                                    <button onclick="shareArticle('facebook', '${safeId}', event)" class="card-share-btn share-facebook" title="Share to Facebook"><i class="fa-brands fa-facebook-f"></i></button>
                                    <button onclick="shareArticle('x', '${safeId}', event)" class="card-share-btn share-x" title="Share to X"><i class="fa-brands fa-x-twitter"></i></button>
                                    <button onclick="shareArticle('instagram', '${safeId}', event)" class="card-share-btn share-instagram" title="Share on Instagram"><i class="fa-brands fa-instagram"></i></button>
                                    <button onclick="shareArticle('tiktok', '${safeId}', event)" class="card-share-btn share-tiktok" title="Share on TikTok"><i class="fa-brands fa-tiktok"></i></button>
                                    <button onclick="shareArticle('whatsapp', '${safeId}', event)" class="card-share-btn share-whatsapp" title="Share via WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                                    <button onclick="shareArticle('copy', '${safeId}', event)" class="card-share-btn share-copy" title="Copy Article Link"><i class="fa-solid fa-link"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }

            window.activeArticleId = null;

            window.openArticleModal = (articleId) => {
                const modal = document.getElementById('modal-article-reader');
                if (!modal) return;
                const article = (window.imiArticlesRegistry && window.imiArticlesRegistry[articleId]) || defaultArticles.find(x => x.id === articleId) || defaultArticles[0];
                if (!article) return;

                window.activeArticleId = article.id || articleId;

                document.getElementById('modal-article-title').textContent = article.title || 'Article Dispatch';
                document.getElementById('modal-article-tag').textContent = article.date || 'Ecosystem Dispatch';
                document.getElementById('modal-article-body').innerHTML = article.content || `<p>${article.summary || ''}</p>`;
                
                const imgBox = document.getElementById('modal-article-img-box');
                const imgEl = document.getElementById('modal-article-img');
                if (isValidMediaUrl(article.imageUrl) && imgBox && imgEl) {
                    imgEl.src = article.imageUrl;
                    imgBox.style.display = 'block';
                } else if (imgBox) {
                    imgBox.style.display = 'none';
                }

                // Video / YouTube channel embed handling
                const videoBox = document.getElementById('modal-article-video-box');
                if (videoBox) {
                    if (article.videoUrl && article.videoUrl.trim()) {
                        const vUrl = article.videoUrl.trim();
                        let embedHtml = '';
                        if (vUrl.includes('youtube.com/watch?v=') || vUrl.includes('youtu.be/')) {
                            const vidId = vUrl.includes('youtu.be/') ? vUrl.split('youtu.be/')[1].split('?')[0] : vUrl.split('v=')[1].split('&')[0];
                            embedHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                        } else if (vUrl.includes('vimeo.com/')) {
                            const vimeoId = vUrl.split('vimeo.com/')[1].split('?')[0];
                            embedHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;"><iframe src="https://player.vimeo.com/video/${vimeoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>`;
                        } else if (vUrl.startsWith('<iframe') || vUrl.startsWith('<video')) {
                            embedHtml = `<div style="padding:10px; text-align:center;">${vUrl}</div>`;
                        } else {
                            embedHtml = `<video controls style="width:100%; max-height:400px;"><source src="${vUrl}">Your browser does not support video playback.</video>`;
                        }
                        videoBox.innerHTML = embedHtml;
                        videoBox.style.display = 'block';
                    } else {
                        videoBox.innerHTML = '';
                        videoBox.style.display = 'none';
                    }
                }

                const ctaBtn = document.getElementById('modal-article-cta');
                if (ctaBtn) {
                    ctaBtn.href = article.ctaUrl || 'booking.html';
                    ctaBtn.textContent = article.ctaText || 'Work With IMI →';
                }

                // Update URL query state for sharable permalink without page reload
                if (window.history && window.history.replaceState) {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('article', article.id || articleId);
                    window.history.replaceState({}, '', newUrl.toString());
                }

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            };

            window.closeArticleModal = () => {
                const modal = document.getElementById('modal-article-reader');
                if (modal) {
                    modal.style.display = 'none';
                    const videoBox = document.getElementById('modal-article-video-box');
                    if (videoBox) videoBox.innerHTML = '';
                }
                window.activeArticleId = null;
                if (window.history && window.history.replaceState) {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('article');
                    window.history.replaceState({}, '', newUrl.pathname);
                }
                document.body.style.overflow = '';
            };

            // Global Social Sharing Handler
            window.shareActiveArticle = function(platform) {
                window.shareArticle(platform, window.activeArticleId);
            };

            window.shareArticle = function(platform, articleId, event) {
                if (event) {
                    event.stopPropagation();
                    event.preventDefault();
                }
                const article = (window.imiArticlesRegistry && window.imiArticlesRegistry[articleId]) || 
                                (typeof defaultArticles !== 'undefined' && defaultArticles.find(x => x.id === articleId)) ||
                                { title: 'IMI Market Intelligence & Strategy Dispatch', summary: 'Strategic business ecosystem insights from I MAKE IMAGE.' };
                
                const pageOrigin = window.location.origin || 'https://imi-website-one.vercel.app';
                const articleParam = articleId ? `?article=${encodeURIComponent(articleId)}` : '';
                const shareUrl = `${pageOrigin}/pages/news.html${articleParam}`;
                const shareTitle = article.title || 'IMI Strategy Dispatch';
                const fullShareText = `${shareTitle} — Strategic Business Intelligence from I MAKE IMAGE`;

                const encodedUrl = encodeURIComponent(shareUrl);
                const encodedTitle = encodeURIComponent(shareTitle);
                const encodedText = encodeURIComponent(fullShareText);

                switch(platform) {
                    case 'linkedin':
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, 'linkedin_share', 'width=640,height=580,menubar=no,toolbar=no');
                        break;
                    case 'facebook':
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, 'facebook_share', 'width=640,height=580,menubar=no,toolbar=no');
                        break;
                    case 'twitter':
                    case 'x':
                        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, 'twitter_share', 'width=640,height=480,menubar=no,toolbar=no');
                        break;
                    case 'whatsapp':
                        window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`, '_blank');
                        break;
                    case 'instagram':
                        navigator.clipboard.writeText(`${fullShareText}\n\nRead more: ${shareUrl}`).then(() => {
                            window.showShareToast('📋 Link & article caption copied! Paste into Instagram Post or Story.');
                            setTimeout(() => {
                                window.open('https://www.instagram.com/', '_blank');
                            }, 700);
                        }).catch(() => {
                            window.open('https://www.instagram.com/', '_blank');
                        });
                        break;
                    case 'tiktok':
                        navigator.clipboard.writeText(`${fullShareText}\n\n${shareUrl}`).then(() => {
                            window.showShareToast('📋 Link & title copied! Ready to paste into TikTok.');
                            setTimeout(() => {
                                window.open('https://www.tiktok.com/', '_blank');
                            }, 700);
                        }).catch(() => {
                            window.open('https://www.tiktok.com/', '_blank');
                        });
                        break;
                    case 'copy':
                        navigator.clipboard.writeText(shareUrl).then(() => {
                            window.showShareToast('✅ Article link copied to clipboard!');
                        }).catch(() => {
                            window.showShareToast('✅ Link: ' + shareUrl);
                        });
                        break;
                    case 'native':
                    default:
                        if (navigator.share) {
                            navigator.share({
                                title: shareTitle,
                                text: fullShareText,
                                url: shareUrl
                            }).catch(() => {});
                        } else {
                            navigator.clipboard.writeText(shareUrl).then(() => {
                                window.showShareToast('✅ Article link copied to clipboard!');
                            });
                        }
                        break;
                }
            };

            window.showShareToast = function(msg) {
                let toast = document.getElementById('imi-share-toast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'imi-share-toast';
                    toast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#161920; border:1px solid #c9a227; color:#fff; padding:12px 24px; border-radius:30px; font-family:Outfit,sans-serif; font-size:0.88rem; font-weight:600; z-index:999999; box-shadow:0 12px 36px rgba(0,0,0,0.85); display:flex; align-items:center; gap:10px; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); opacity:0; pointer-events:none;';
                    document.body.appendChild(toast);
                }
                toast.innerHTML = `<span style="color:#c9a227;">✦</span> ${msg}`;
                toast.style.opacity = '1';
                toast.style.pointerEvents = 'auto';
                toast.style.transform = 'translateX(-50%) translateY(0)';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.pointerEvents = 'none';
                    toast.style.transform = 'translateX(-50%) translateY(12px)';
                }, 3400);
            };

            // Check if deep link article parameter exists on load
            const urlParams = new URLSearchParams(window.location.search);
            const articleParam = urlParams.get('article');
            if (articleParam) {
                setTimeout(() => {
                    if (typeof window.openArticleModal === 'function') {
                        window.openArticleModal(articleParam);
                    }
                }, 350);
            }

            // 12b. Social Feed / iFrame Embed Renderer
            const feedContainer = document.getElementById('news-feed-embed-container');
            const feedLoading = document.getElementById('feed-loading-state');
            const feedFallback = document.getElementById('feed-fallback-cta');

            const showFeedFallback = () => {
                if (feedLoading) feedLoading.style.display = 'none';
                if (feedFallback) feedFallback.style.display = 'block';
            };

            if (feedContainer && sc['news.feed_embed'] && sc['news.feed_embed'].trim()) {
                try {
                    let embedCode = sc['news.feed_embed'].trim();

                    // If user supplied just a Facebook page URL, format it into a responsive embed iframe
                    if (embedCode.startsWith('http') && (embedCode.includes('facebook.com') || embedCode.includes('fb.com'))) {
                        const encodedUrl = encodeURIComponent(embedCode);
                        embedCode = `<iframe src="https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=500&height=650&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" width="100%" height="650" style="border:none;overflow:hidden;max-width:500px;margin:0 auto;display:block;border-radius:8px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe>`;
                    } else if (embedCode.includes('<iframe') && !embedCode.includes('loading=')) {
                        embedCode = embedCode.replace('<iframe ', '<iframe loading="lazy" ');
                    }

                    // Hide loading spinner, inject embed
                    if (feedLoading) feedLoading.style.display = 'none';
                    feedContainer.insertAdjacentHTML('afterbegin', embedCode);

                    // Re-execute any <script> tags inside the embed safely
                    feedContainer.querySelectorAll('script').forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.textContent = oldScript.textContent;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                    // Trigger Facebook SDK XFBML parser ONLY if XFBML markup (e.g. .fb-page) is present, avoiding duplicate iframe requests
                    if (feedContainer.querySelector('.fb-page, .fb-post, .fb-video') && window.FB && window.FB.XFBML && typeof window.FB.XFBML.parse === 'function') {
                        window.FB.XFBML.parse(feedContainer);
                    }

                    // Fallback: if the iframe/embed doesn't render content within 6 seconds, show the CTA
                    const embedIframe = feedContainer.querySelector('iframe');
                    if (embedIframe) {
                        let fallbackTimer = setTimeout(() => {
                            // Only show fallback if iframe body appears empty (can't read cross-origin, so show if still loading)
                            showFeedFallback();
                        }, 6000);
                        embedIframe.addEventListener('load', () => {
                            clearTimeout(fallbackTimer);
                            // iframe loaded — keep it visible, hide fallback just in case
                            if (feedFallback) feedFallback.style.display = 'none';
                        });
                        embedIframe.addEventListener('error', () => {
                            clearTimeout(fallbackTimer);
                            if (embedIframe) embedIframe.style.display = 'none';
                            showFeedFallback();
                        });
                    }
                } catch(e) {
                    console.warn('Social feed embed notice:', e);
                    showFeedFallback();
                }
            } else if (feedContainer) {
                // No embed stored in CMS — show the fallback CTA directly
                if (feedLoading) feedLoading.style.display = 'none';
                if (feedFallback) feedFallback.style.display = 'block';
            }

            // 13. Tracking Script Injection & Pageviews Telemetry
            const pageviews = Number(localStorage.getItem('imi_site_pageviews_count') || '1482') + 1;
            localStorage.setItem('imi_site_pageviews_count', pageviews.toString());

            if (sc['analytics.tracking_script']) {
                try {
                    const range = document.createRange();
                    const fragment = range.createContextualFragment(sc['analytics.tracking_script']);
                    document.head.appendChild(fragment);
                } catch(e) { console.warn('Tracking script injection notice:', e); }
            }
        } catch(e) {
            console.warn('Website CMS hydration notice:', e);
        }
    };

    // ── 14. GLOBAL FLOATING SUPPORT CHANNELS (WHATSAPP, MESSENGER, EMAIL) ──
    const initFloatingSupportWidget = () => {
        if (document.getElementById('imi-support-launcher')) return;

        let sc = {};
        try { sc = JSON.parse(localStorage.getItem('imi_site_content') || '{}'); } catch(e) {}

        const waUrl = sc['support.whatsapp_url'] || localStorage.getItem('imi_support_whatsapp') || 'https://wa.me/18005550199?text=Hello%20IMI%20Strategy%20Team%2C%20I%20have%20an%20inquiry%20regarding...';
        const msgUrl = sc['support.messenger_url'] || localStorage.getItem('imi_support_messenger') || 'https://m.me/imakeimage';
        const emailAddr = sc['support.email'] || localStorage.getItem('imi_support_email') || 'admin@imakeimage.com';

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            #imi-support-launcher {
                position: fixed;
                bottom: 26px;
                right: 26px;
                width: 54px;
                height: 54px;
                border-radius: 50%;
                background: linear-gradient(135deg, #c9a227, #f3d069);
                color: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(201,162,39,0.45);
                z-index: 99998;
                transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
                user-select: none;
            }
            #imi-support-launcher:hover {
                transform: scale(1.08) translateY(-2px);
                box-shadow: 0 12px 40px rgba(201,162,39,0.65);
            }
            #imi-support-launcher .support-ping {
                position: absolute;
                top: 2px;
                right: 2px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #00c853;
                border: 2px solid #000;
                animation: support-pulse 2s infinite;
            }
            @keyframes support-pulse {
                0% { box-shadow: 0 0 0 0 rgba(0,200,83,0.7); }
                70% { box-shadow: 0 0 0 8px rgba(0,200,83,0); }
                100% { box-shadow: 0 0 0 0 rgba(0,200,83,0); }
            }
            #imi-support-modal {
                display: none;
                position: fixed;
                bottom: 92px;
                right: 26px;
                width: 330px;
                max-width: calc(100vw - 36px);
                background: #0d1015;
                border: 1px solid rgba(201,162,39,0.35);
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.85);
                z-index: 99999;
                font-family: 'Outfit', sans-serif;
                overflow: hidden;
                backdrop-filter: blur(12px);
            }
            .support-channel-btn {
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: #141821;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            .support-channel-btn:hover {
                transform: translateX(4px);
                border-color: var(--gold, #c9a227);
                background: #1a202c;
            }
        `;
        document.head.appendChild(style);

        // Inject HTML
        const container = document.createElement('div');
        container.innerHTML = `
            <div id="imi-support-launcher" onclick="window.toggleFloatingSupport()" title="Live Concierge & Support Channels">
                <i class="fa-solid fa-headset" id="imi-support-icon"></i>
                <span class="support-ping"></span>
            </div>

            <div id="imi-support-modal">
                <div style="background:linear-gradient(135deg, #181d26, #0c0e12); padding:16px 18px; border-bottom:1px solid rgba(201,162,39,0.2); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:0.95rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px;">
                            <span>IMI Support Concierge</span>
                            <span style="font-size:0.65rem; font-weight:700; background:rgba(0,200,83,0.15); color:#00c853; border:1px solid rgba(0,200,83,0.3); padding:2px 6px; border-radius:10px;">ONLINE</span>
                        </div>
                        <div style="font-size:0.75rem; color:#aaa; margin-top:2px;">Select your preferred live channel:</div>
                    </div>
                    <button onclick="window.toggleFloatingSupport()" style="background:transparent; border:none; color:#aaa; font-size:20px; cursor:pointer; padding:0 4px; line-height:1;">&times;</button>
                </div>

                <div style="padding:14px; display:flex; flex-direction:column; gap:10px;">
                    <!-- WhatsApp -->
                    <a href="${waUrl}" target="_blank" class="support-channel-btn">
                        <div style="width:36px; height:36px; border-radius:8px; background:rgba(37,211,102,0.15); color:#25d366; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
                            <i class="fa-brands fa-whatsapp"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:0.85rem; font-weight:700; color:#fff;">WhatsApp Concierge</div>
                            <div style="font-size:0.72rem; color:#25d366;">Instant direct messaging</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size:11px; color:#555;"></i>
                    </a>

                    <!-- Messenger -->
                    <a href="${msgUrl}" target="_blank" class="support-channel-btn">
                        <div style="width:36px; height:36px; border-radius:8px; background:rgba(0,132,255,0.15); color:#0084ff; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
                            <i class="fa-brands fa-facebook-messenger"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:0.85rem; font-weight:700; color:#fff;">Facebook Messenger</div>
                            <div style="font-size:0.72rem; color:#0084ff;">Chat with IMI page</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size:11px; color:#555;"></i>
                    </a>

                    <!-- Priority Email -->
                    <a href="mailto:${emailAddr}?subject=Priority%20Strategic%20Inquiry%20-%20IMI" class="support-channel-btn">
                        <div style="width:36px; height:36px; border-radius:8px; background:rgba(201,162,39,0.15); color:var(--gold, #c9a227); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;">
                            <i class="fa-solid fa-envelope"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:0.85rem; font-weight:700; color:#fff;">Direct Email Dispatch</div>
                            <div style="font-size:0.72rem; color:var(--gold, #c9a227);">${emailAddr}</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size:11px; color:#555;"></i>
                    </a>
                </div>

                <div style="padding:10px 14px; text-align:center; font-size:0.72rem; color:#888; border-top:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3);">
                    ⚡ Direct advisory response within 15 minutes
                </div>
            </div>
        `;
        document.body.appendChild(container);

        window.toggleFloatingSupport = function() {
            const modal = document.getElementById('imi-support-modal');
            const icon = document.getElementById('imi-support-icon');
            if (!modal) return;
            const isOpen = modal.style.display === 'block';
            modal.style.display = isOpen ? 'none' : 'block';
            if (icon) icon.className = isOpen ? 'fa-solid fa-headset' : 'fa-solid fa-xmark';
        };

        // Close on outside click
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('imi-support-modal');
            const launcher = document.getElementById('imi-support-launcher');
            if (!modal || modal.style.display !== 'block') return;
            if (!modal.contains(e.target) && !launcher.contains(e.target)) {
                modal.style.display = 'none';
                const icon = document.getElementById('imi-support-icon');
                if (icon) icon.className = 'fa-solid fa-headset';
            }
        });
    };

    hydrateWebsiteCMS();
    initFloatingSupportWidget();
    window.addEventListener('imi_content_updated', () => {
        hydrateWebsiteCMS();
        initFloatingSupportWidget();
        imiBindLightbox();
    });
    window.addEventListener('storage', hydrateWebsiteCMS);

    imiBindLightbox();

});


/* =========================================
   IMI GLOBAL LIGHTBOX
   Click any featured image to expand fullscreen.
   Works across all pages automatically.
========================================= */

function imiInitLightboxDOM() {
    if (document.getElementById('imi-lightbox')) return;

    const lb = document.createElement('div');
    lb.id = 'imi-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image Preview');
    lb.innerHTML = `
        <button id="imi-lightbox-close" title="Close" aria-label="Close preview">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div id="imi-lightbox-content"></div>
    `;

    document.body.appendChild(lb);

    // Close on backdrop click
    lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target === document.getElementById('imi-lightbox-content')) {
            imiCloseLightbox();
        }
    });

    // Close button
    document.getElementById('imi-lightbox-close').addEventListener('click', imiCloseLightbox);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') imiCloseLightbox();
    });
}

function imiOpenLightbox(src, isVideo) {
    imiInitLightboxDOM();
    const content = document.getElementById('imi-lightbox-content');
    if (isVideo) {
        content.innerHTML = `<video controls autoplay loop muted playsinline>
            <source src="${src}">
        </video>`;
    } else {
        content.innerHTML = `<img src="${src}" alt="Featured Image Preview">`;
    }
    const lb = document.getElementById('imi-lightbox');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function imiCloseLightbox() {
    const lb = document.getElementById('imi-lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
        const content = document.getElementById('imi-lightbox-content');
        if (content) content.innerHTML = '';
    }, 300);
}

function imiBindLightbox() {
    imiInitLightboxDOM();

    // Selectors for all featured image containers across the site
    const containerSelectors = [
        '#approach-media-container',
        '#solutions-intro-media-container',
        '#learn-intro-media-container',
        '#tribe-intro-media-container',
        '#cmo-intro-media-container',
        '#news-intro-media-container',
        '.service-visual',
        '.solutions-visual',
        '.feature-media',
        '.feature-block-media',
        '.system-visual',
        '.tribe-visual',
        '.solutions-media',
        '.cmo-media',
        '[id$="-media-container"]'
    ];

    const found = new Set();

    containerSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(container => {
            // Bind images inside containers
            container.querySelectorAll('img').forEach(img => {
                if (found.has(img)) return;
                found.add(img);
                img.classList.add('imi-zoomable');
                img.addEventListener('click', () => {
                    imiOpenLightbox(img.src, false);
                });
            });

            // Bind videos inside containers
            container.querySelectorAll('video').forEach(vid => {
                if (found.has(vid)) return;
                found.add(vid);
                vid.classList.add('imi-zoomable');
                vid.style.cursor = 'zoom-in';
                vid.addEventListener('click', (e) => {
                    e.preventDefault();
                    const src = vid.querySelector('source')?.src || vid.src;
                    imiOpenLightbox(src, true);
                });
            });

            // If the container itself is an img
            if (container.tagName === 'IMG') {
                if (found.has(container)) return;
                found.add(container);
                container.classList.add('imi-zoomable');
                container.addEventListener('click', () => {
                    imiOpenLightbox(container.src, false);
                });
            }
        });
    });
}
