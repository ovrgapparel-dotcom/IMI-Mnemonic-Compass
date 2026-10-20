/**
 * IMI i18n — Internationalization Engine
 * Supported Languages: EN (English) | FR (French)
 * 
 * Usage:
 *   IMI_i18n.t('hero.headline')         → returns translated string
 *   IMI_i18n.setLanguage('fr')          → switches site to French
 *   data-i18n="hero.headline"           → auto-translated on DOM load
 *   data-i18n-placeholder="form.email"  → translates input placeholders
 */

const IMI_i18n = (() => {

  // ── Translation Dictionary ──────────────────────────────────────────
  const translations = {

    en: {
      nav: {
        home:       'Home',
        solutions:  'Solutions',
        learn:      'Learn',
        tools:      'Tools',
        tribe:      'Core Tribe',
        about:      'About',
        book:       'Book a Session',
        login:      'Login',
        portal:     'My Portal',
        language:   'FR'
      },
      hero: {
        status:     'IMI CORE ECOSYSTEM // ONLINE',
        line1:      'Build Your Brand.',
        line2:      'Command Your Marketing.',
        line3:      'Grow Your Business.',
        sub:        'Strategic marketing services, practical education, and digital tools designed to help entrepreneurs and businesses turn ideas into intentional systems for growth.',
        cta1:       'Work with IMI',
        cta2:       'Explore the Ecosystem'
      },
      system: {
        tag:        'Operations Blueprint',
        title:      'Your Business Has Pieces. Do You Have A System?',
        desc:       'Many business owners operate in fragmented silos. We connect these pieces into a singular, high-performing growth machine.',
        result:     'IMI Connects the Pieces'
      },
      journey: {
        tag:        'Strategic Roadmap',
        title:      'Your Path Starts Here',
        desc:       'Six logical phases built to guide you from foundational clarity to business expansion.',
        card1_title:'Solo Corp 101',
        card1_desc: 'Start with yourself. Establish personal clarity, mental alignment, and daily operating systems before scaling outward.',
        card1_cta:  'Explore Solo Corp',
        card2_title:'Core Tribe',
        card2_desc: 'Learn the system in a highly collaborative ecosystem. Build frameworks alongside peers with ongoing interactive support.',
        card2_cta:  'Join Tribe',
        card3_title:'IMI Compass',
        card3_desc: 'Find your strategic direction. Map market positioning, audience avatars, and target goals with precision metrics.',
        card3_cta:  'Launch Compass',
        card4_title:'Time Command',
        card4_desc: 'Execute your strategy. Control your timeline, resource management, and output metrics with specialized software tools.',
        card4_cta:  'Command Time',
        card5_title:'Core Elite',
        card5_desc: 'Implement with guide-directed acceleration. Elite consulting and direct strategy mapping with dedicated mentors.',
        card5_cta:  'Upgrade Elite',
        card6_title:'Business Solutions',
        card6_desc: 'Build and scale. Complete externalized CMO systems, growth infrastructure, and direct operational leadership.',
        card6_cta:  'Scale Up'
      },
      products: {
        tag:        'Software Nodes',
        title:      'Ecosystem Applications',
        desc:       'Interactive software nodes built to translate strategic concepts into measurable operational growth.',
        compass_title:  'IMI Compass',
        compass_desc:   'Strategic orientation software mapping audience segments, brand identity parameters, and growth coordinates.',
        compass_type:   'Web App',
        compass_cta:    'Launch App',
        time_title:     'iM Time Command',
        time_desc:      'High-performance productivity dashboard featuring task commands, timeline scheduling, and timezone mappings.',
        time_type:      'Web App',
        time_cta:       'Launch App',
        bundle_badge:   'FEATURED SYSTEM BUNDLE',
        bundle_title:   'Commander Bundle',
        bundle_desc:    'Unify strategy and execution. Connect your IMI Compass strategic target coordinates directly into your iM Time Command productivity cockpit.',
        bundle_cta:     'Get Bundle',
        bundle_label:   'ONE-TIME'
      },
      solutions: {
        tag:        'Human Expertise',
        title:      'When You Need More Than A Tool',
        desc:       'Technology can help you organize the work. Strategic guidance helps you determine what work matters.',
        cmo_title:  'Fractional CMO',
        cmo_desc:   'Gain executive marketing leadership, growth funnel architecture, and brand strategy without the full-time cost.',
        mkt_title:  'Marketing Systems',
        mkt_desc:   'Engineered campaigns, automated pipeline funnels, and conversion optimization frameworks mapped to your audience.',
        con_title:  'Consulting',
        con_desc:   'Tailored strategy audits, market expansion roadmaps, and bottleneck diagnoses to unlock stagnant growth.',
        imp_title:  'Implementation',
        imp_desc:   'Direct execution services building landing pages, email workflows, tracking metrics, and campaign integrations.',
        cta:        'Consult with Strategy Node'
      },
      tribe: {
        tag:        'Interactive Community',
        headline1:  "Don't Just Learn.",
        headline2:  'Build.',
        desc:       'The Core Tribe connects blueprint courses, active workshops, custom tools, and resources with a collaborative community designed to ensure you implement what you learn.',
        price:      '$5 / MONTH MEMBERSHIP',
        cta:        'Join Core Tribe Classroom'
      },
      solocorp: {
        tag:        'Foundational Prime',
        title:      'Start With Yourself',
        desc:       'Before you build a complex external marketing machine, command your internal systems. Solo Corp 101 is a 30-Day Success Primer offering step-by-step systems to build personal discipline, clear focus, and foundational business design rules.',
        cta:        'Explore Solo Corp 101'
      },
      free: {
        tag:        'Acquisition Engine',
        title:      'Begin Mapping Your Path',
        desc:       'Free blueprints, consultation diagnostics, and guides to map your business bottlenecks today.',
        web_type:   'Webinar',
        web_title:  'Systemization Masterclass',
        web_desc:   'Learn how to connect Brand, Offers, and Time into one automated operational engine.',
        web_cta:    'Register Free',
        guide_type: 'Guide',
        guide_title:'Success Primer Blueprint',
        guide_desc: 'Download our step-by-step operational setup blueprint for independent founders.',
        guide_cta:  'Download PDF',
        diag_type:  'Diagnostic',
        diag_title: 'Ecosystem Self-Assessment',
        diag_desc:  'A 10-minute visual roadmap diagnostic scorecard to pinpoint process gaps.',
        diag_cta:   'Launch Scorecard',
        sess_type:  'Session',
        sess_title: 'Free 15m Consultation',
        sess_desc:  'Review your score with our senior marketing architects. Actionable advice.',
        sess_cta:   'Book Call'
      },
      newsletter: {
        tag:        'Get The Signal',
        title:      'Join IMI Insider',
        desc:       'Receive weekly strategic intelligence briefs covering brand design, marketing channels, software hacks, and ecosystem builder workflows.',
        placeholder:'Enter your coordinate email...',
        cta:        'Join Signal'
      },
      cta: {
        tag:        'Final Decision Matrix',
        title:      "What Are You Ready To Build?",
        desc:       'No need to guess. Select your core current objective below to access targeted paths directly.',
        path1:      'I Need Strategic Direction',
        path1_sub:  'Explore IMI Compass app',
        path2:      'I Want To Learn & Connect',
        path2_sub:  'Explore the Core Tribe Classroom',
        path3:      'I Need Professional Execution Support',
        path3_sub:  'Explore custom CMO & Systems Solutions'
      },
      footer: {
        tagline:    'A practical approach to measurable operational results and strategic marketing clarity.',
        ecosystem:  'Ecosystem',
        links:      'Links & Assets',
        channels:   'Channels',
        privacy:    'Privacy Policy',
        terms:      'Terms of Service',
        copyright:  '© 2026 I MAKE IMAGE. All rights reserved.'
      },
      modal: {
        book_title: 'Book Strategic Consultation',
        book_name:  'Your Name',
        book_email: 'Coordinate Email',
        book_state: 'Current Business State',
        book_s1:    'Launching First Venture',
        book_s2:    'Scaling Brand & Offer',
        book_s3:    'Systemizing Core Team Operations',
        book_cta:   'Transmit Booking Request',
        web_title:  'Systemization Masterclass Register',
        guide_title:'Download Success Blueprint',
        guide_cta:  'Get PDF Link',
        diag_title: 'Launch Assessment',
        diag_gap:   'Current Main Bottleneck',
        diag_g1:    'No clear offer structure',
        diag_g2:    'Inefficient time command',
        diag_g3:    'No recurring pipeline funnel',
        diag_send:  'Transmit Scorecard Link To:',
        diag_cta:   'Begin 10-Min Assessment',
        consult_title:'15-Min Briefing Call',
        consult_contact:'Contact Number / Telegram',
        consult_tz: 'Ideal Timezone & Hours',
        consult_cta:'Schedule Free Briefing',
        form_success:'SIGNAL RECEIVED',
        form_success_msg:'We have mapped your coordinates. Our support node will reach out shortly.',
        transmitting: 'TRANSMITTING...'
      }
    },

    // ─────────────────────────── FRENCH ───────────────────────────────
    fr: {
      nav: {
        home:       'Accueil',
        solutions:  'Solutions',
        learn:      'Apprendre',
        tools:      'Outils',
        tribe:      'Core Tribe',
        about:      'À Propos',
        book:       'Réserver une Session',
        login:      'Connexion',
        portal:     'Mon Portail',
        language:   'EN'
      },
      hero: {
        status:     'IMI CORE ECOSYSTEM // EN LIGNE',
        line1:      'Construisez Votre Marque.',
        line2:      'Commandez Votre Marketing.',
        line3:      'Développez Votre Entreprise.',
        sub:        'Services marketing stratégiques, éducation pratique et outils numériques conçus pour aider les entrepreneurs à transformer leurs idées en systèmes de croissance intentionnels.',
        cta1:       'Travailler avec IMI',
        cta2:       "Explorer l'Écosystème"
      },
      system: {
        tag:        'Schéma Opérationnel',
        title:      'Votre Entreprise a des Pièces. Avez-vous un Système ?',
        desc:       "Beaucoup de propriétaires d'entreprise opèrent en silos fragmentés. Nous connectons ces pièces en une machine de croissance unifiée et performante.",
        result:     'IMI Connecte les Pièces'
      },
      journey: {
        tag:        'Feuille de Route Stratégique',
        title:      'Votre Parcours Commence Ici',
        desc:       'Six phases logiques conçues pour vous guider de la clarté fondamentale à l\'expansion commerciale.',
        card1_title:'Solo Corp 101',
        card1_desc: 'Commencez par vous-même. Établissez la clarté personnelle, l\'alignement mental et les systèmes opérationnels quotidiens.',
        card1_cta:  'Explorer Solo Corp',
        card2_title:'Core Tribe',
        card2_desc: 'Apprenez le système dans un écosystème collaboratif. Construisez des cadres avec des pairs et un soutien interactif continu.',
        card2_cta:  'Rejoindre la Tribu',
        card3_title:'IMI Compass',
        card3_desc: 'Trouvez votre direction stratégique. Cartographiez le positionnement marché et les objectifs cibles avec des métriques de précision.',
        card3_cta:  'Lancer Compass',
        card4_title:'Time Command',
        card4_desc: 'Exécutez votre stratégie. Contrôlez votre calendrier, la gestion des ressources et les métriques de production.',
        card4_cta:  'Commander le Temps',
        card5_title:'Core Elite',
        card5_desc: 'Implémentez avec une accélération guidée. Conseil élite et cartographie stratégique directe avec des mentors dédiés.',
        card5_cta:  'Passer Élite',
        card6_title:'Solutions Business',
        card6_desc: 'Construisez et développez. Systèmes CMO complets, infrastructure de croissance et leadership opérationnel direct.',
        card6_cta:  'Passer à l\'Échelle'
      },
      products: {
        tag:        'Nœuds Logiciels',
        title:      'Applications de l\'Écosystème',
        desc:       'Nœuds logiciels interactifs conçus pour traduire les concepts stratégiques en croissance opérationnelle mesurable.',
        compass_title:  'IMI Compass',
        compass_desc:   'Logiciel d\'orientation stratégique cartographiant les segments d\'audience, les paramètres d\'identité de marque et les coordonnées de croissance.',
        compass_type:   'Application Web',
        compass_cta:    'Lancer l\'App',
        time_title:     'iM Time Command',
        time_desc:      'Tableau de bord de productivité haute performance avec commandes de tâches, planification du calendrier et mappages de fuseaux horaires.',
        time_type:      'Application Web',
        time_cta:       'Lancer l\'App',
        bundle_badge:   'OFFRE GROUPÉE VEDETTE',
        bundle_title:   'Commander Bundle',
        bundle_desc:    'Unifiez stratégie et exécution. Connectez les coordonnées cibles IMI Compass directement dans votre cockpit iM Time Command.',
        bundle_cta:     'Obtenir le Bundle',
        bundle_label:   'PAIEMENT UNIQUE'
      },
      solutions: {
        tag:        'Expertise Humaine',
        title:      'Quand Vous Avez Besoin de Plus qu\'un Outil',
        desc:       'La technologie peut vous aider à organiser le travail. Le conseil stratégique vous aide à déterminer quel travail est important.',
        cmo_title:  'CMO Fractionnel',
        cmo_desc:   'Obtenez un leadership marketing exécutif, une architecture d\'entonnoir de croissance et une stratégie de marque sans le coût à temps plein.',
        mkt_title:  'Systèmes Marketing',
        mkt_desc:   'Campagnes conçues, entonnoirs automatisés et cadres d\'optimisation de conversion cartographiés vers votre audience.',
        con_title:  'Conseil',
        con_desc:   'Audits stratégiques sur mesure, feuilles de route d\'expansion de marché et diagnostics pour débloquer la croissance.',
        imp_title:  'Implémentation',
        imp_desc:   'Services d\'exécution directe construisant des pages de destination, workflows email, métriques de suivi et intégrations de campagnes.',
        cta:        'Consulter le Nœud Stratégique'
      },
      tribe: {
        tag:        'Communauté Interactive',
        headline1:  "N'Apprenez Pas Seulement.",
        headline2:  'Construisez.',
        desc:       'Le Core Tribe connecte les cours, les ateliers actifs, les outils personnalisés et les ressources avec une communauté collaborative pour assurer que vous mettez en œuvre ce que vous apprenez.',
        price:      '5$ / MOIS D\'ADHÉSION',
        cta:        'Rejoindre la Salle de Classe'
      },
      solocorp: {
        tag:        'Fondation Initiale',
        title:      'Commencez par Vous-même',
        desc:       'Avant de construire une machine marketing externe complexe, commandez vos systèmes internes. Solo Corp 101 est un primer de succès de 30 jours avec des systèmes étape par étape.',
        cta:        'Explorer Solo Corp 101'
      },
      free: {
        tag:        'Moteur d\'Acquisition',
        title:      'Commencez à Cartographier Votre Parcours',
        desc:       'Schémas directeurs gratuits, diagnostics de consultation et guides pour cartographier les goulots d\'étranglement de votre entreprise.',
        web_type:   'Webinaire',
        web_title:  'Masterclass de Systématisation',
        web_desc:   'Apprenez à connecter Marque, Offres et Temps en un moteur opérationnel automatisé.',
        web_cta:    'S\'inscrire Gratuitement',
        guide_type: 'Guide',
        guide_title:'Schéma du Primer de Succès',
        guide_desc: 'Téléchargez notre schéma de configuration opérationnelle étape par étape pour les fondateurs indépendants.',
        guide_cta:  'Télécharger PDF',
        diag_type:  'Diagnostic',
        diag_title: 'Auto-évaluation de l\'Écosystème',
        diag_desc:  'Un tableau de bord de diagnostic visuel de 10 minutes pour identifier les lacunes de processus.',
        diag_cta:   'Lancer le Diagnostic',
        sess_type:  'Session',
        sess_title: 'Consultation Gratuite 15min',
        sess_desc:  'Examinez votre score avec nos architectes marketing seniors. Conseils pratiques.',
        sess_cta:   'Réserver un Appel'
      },
      newsletter: {
        tag:        'Recevoir le Signal',
        title:      'Rejoindre IMI Insider',
        desc:       'Recevez des briefings hebdomadaires d\'intelligence stratégique couvrant la conception de marque, les canaux marketing, les astuces logicielles et les flux de travail.',
        placeholder:'Entrez votre email coordonné...',
        cta:        'Rejoindre le Signal'
      },
      cta: {
        tag:        'Matrice de Décision Finale',
        title:      "Qu'Êtes-vous Prêt à Construire ?",
        desc:       'Pas besoin de deviner. Sélectionnez votre objectif principal actuel ci-dessous pour accéder directement aux parcours ciblés.',
        path1:      'J\'ai Besoin de Direction Stratégique',
        path1_sub:  'Explorer l\'application IMI Compass',
        path2:      'Je Veux Apprendre et Me Connecter',
        path2_sub:  'Explorer la Salle de Classe Core Tribe',
        path3:      'J\'ai Besoin d\'un Soutien d\'Exécution Professionnel',
        path3_sub:  'Explorer les Solutions CMO et Systèmes'
      },
      footer: {
        tagline:    'Une approche pratique pour des résultats opérationnels mesurables et une clarté marketing stratégique.',
        ecosystem:  'Écosystème',
        links:      'Liens et Ressources',
        channels:   'Canaux',
        privacy:    'Politique de Confidentialité',
        terms:      'Conditions d\'Utilisation',
        copyright:  '© 2026 I MAKE IMAGE. Tous droits réservés.'
      },
      modal: {
        book_title: 'Réserver une Consultation Stratégique',
        book_name:  'Votre Nom',
        book_email: 'Email Coordonné',
        book_state: 'État Actuel de l\'Entreprise',
        book_s1:    'Lancement de ma première entreprise',
        book_s2:    'Développement de la marque et de l\'offre',
        book_s3:    'Systématisation des opérations',
        book_cta:   'Transmettre la Demande de Réservation',
        web_title:  'Inscription Masterclass de Systématisation',
        guide_title:'Télécharger le Schéma de Succès',
        guide_cta:  'Obtenir le Lien PDF',
        diag_title: 'Lancer l\'Évaluation',
        diag_gap:   'Principal Goulot d\'Étranglement Actuel',
        diag_g1:    'Pas de structure d\'offre claire',
        diag_g2:    'Gestion du temps inefficace',
        diag_g3:    'Pas d\'entonnoir de pipeline récurrent',
        diag_send:  'Envoyer le Lien du Tableau de Bord à :',
        diag_cta:   'Commencer l\'Évaluation de 10 Min',
        consult_title:'Appel de Briefing 15 Min',
        consult_contact:'Numéro / Telegram',
        consult_tz: 'Fuseau horaire et Horaires Idéaux',
        consult_cta:'Planifier le Briefing Gratuit',
        form_success:'SIGNAL REÇU',
        form_success_msg:'Nous avons cartographié vos coordonnées. Notre nœud de support vous contactera sous peu.',
        transmitting: 'TRANSMISSION...'
      }
    }
  };

  // ── State ────────────────────────────────────────────────────────────
  const LANG_KEY = 'imi_language';
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  // ── Core functions ───────────────────────────────────────────────────
  function t(key) {
    const keys = key.split('.');
    let val = translations[currentLang];
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) break;
    }
    // Fallback to English
    if (val === undefined) {
      let fallback = translations['en'];
      for (const k of keys) fallback = fallback?.[k];
      return fallback || key;
    }
    return val;
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations();
    updateLangToggle();
  }

  function getLanguage() { return currentLang; }

  function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'fr' : 'en');
  }

  function applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    // Set lang attribute on html element
    document.documentElement.lang = currentLang;
  }

  function updateLangToggle() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = t('nav.language');
  }

  // Auto-apply on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    updateLangToggle();
  });

  return { t, setLanguage, getLanguage, toggleLanguage, applyTranslations };

})();
