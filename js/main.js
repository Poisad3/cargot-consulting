/**
 * Cargot Consulting — main.js
 * Handles: language switcher (EN/ES), nav scroll state, mobile menu,
 *          scroll animations, metric counters, contact form validation & submission.
 */

'use strict';

/* ─── Helpers ──────────────────────────────────────────────── */

function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function animateCounter(el, end, duration) {
  const startTime = performance.now();
  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * end);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = end;
    }
  }
  requestAnimationFrame(tick);
}

/* ─── 1. Translations ───────────────────────────────────────── */

const translations = {
  en: {
    // Nav
    'nav.services':  'Services',
    'nav.about':     'About',
    'nav.process':   'Process',
    'nav.results':   'Results',
    'nav.contact':   'Contact',
    'nav.cta':       'Get in Touch',
    'nav.darkmode':  'Dark Mode',

    // Hero
    'hero.badge':              'Trusted by satisfied clients',
    'hero.heading.line1':      'Engineering the future',
    'hero.heading.line2':      'of your ',
    'hero.heading.highlight':  'technology infrastructure',
    'hero.subtext':            'Cargot Consulting delivers expert advisory in technology strategy, cybersecurity, and digital transformation — built for organizations that demand precision, reliability, and long-term results.',
    'hero.cta.primary':        'Start a Conversation',
    'hero.cta.secondary':      'Explore Services',
    'hero.trust.label':        'Serving clients in',
    'hero.trust.us':           'United States',
    'hero.trust.mx':           'Mexico',
    'hero.trust.latam':        'Latin America',

    // Services
    'services.label':   'What We Do',
    'services.heading': 'Core service areas',
    'services.subtext': 'Three focused practices designed to solve the most critical challenges facing technology-driven organizations today.',
    'services.badge':   'Most Requested',
    'services.learnmore': 'Learn more',

    'services.tech.title': 'Technology Consulting',
    'services.tech.desc':  'We design and align your technology stack with your business objectives. From architecture reviews to vendor selection, we bring engineering rigor to every technology decision.',
    'services.tech.f1':    'IT Strategy & Roadmapping',
    'services.tech.f2':    'Cloud Architecture & Migration',
    'services.tech.f3':    'Systems Integration',
    'services.tech.f4':    'Technology Assessments',

    'services.sec.title': 'Cybersecurity',
    'services.sec.desc':  "Protect your organization's critical assets with a proactive security posture. We assess vulnerabilities, implement controls, and build resilience against evolving threats.",
    'services.sec.f1':    'Security Audits & Risk Assessments',
    'services.sec.f2':    'Compliance (ISO 27001, NIST)',
    'services.sec.f3':    'Incident Response Planning',
    'services.sec.f4':    'Security Awareness Training',

    'services.dt.title': 'Digital Transformation',
    'services.dt.desc':  'Modernize operations, automate workflows, and build the digital capabilities your organization needs to compete and grow in a rapidly changing market.',
    'services.dt.f1':    'Process Automation & Optimization',
    'services.dt.f2':    'Digital Maturity Assessment',
    'services.dt.f3':    'Change Management',
    'services.dt.f4':    'Data & Analytics Strategy',

    // About
    'about.label':   'About Cargot Consulting',
    'about.heading': 'Built by engineers,\ntrusted by enterprises',
    'about.p1':      "Cargot Consulting was founded on the belief that great technology consulting requires deep technical expertise combined with business acumen. We don't sell generic frameworks — we deliver tailored solutions that fit your organization's context, constraints, and ambitions.",
    'about.p2':      'Our team brings experience from enterprise environments , with a track record of delivering measurable outcomes for clients in diverse industries.',
    'about.v1.title': 'Precision',
    'about.v1.desc':  'Every engagement is scoped, documented, and delivered on time.',
    'about.v2.title': 'Partnership',
    'about.v2.desc':  'We work alongside your team, not above it.',
    'about.v3.title': 'Results',
    'about.v3.desc':  'Success is measured in outcomes, not deliverables.',
    'about.card1.title': 'Americas Coverage',
    'about.card1.desc':  'Active engagements across the United States, Mexico, Colombia, and beyond.',
    'about.card2.title': 'Industry Depth',
    'about.card2.desc':  'Finance, Healthcare, Government, Retail, and Manufacturing verticals.',
    'about.card3.title': 'Certified Expertise',
    'about.card3.desc':  'CISSP, CISM, AWS, Azure, and ISO 27001 certified consultants on staff.',

    // Process
    'process.label':   'How We Work',
    'process.heading': 'A structured engagement model',
    'process.subtext': 'Every engagement follows a rigorous process designed to minimize risk, maximize clarity, and deliver results your team can build on.',
    'process.s1.title': 'Discovery & Assessment',
    'process.s1.desc':  'We begin with a structured discovery session to understand your current state, goals, constraints, and stakeholder landscape. No assumptions, no templated audits.',
    'process.s2.title': 'Strategy & Planning',
    'process.s2.desc':  'We synthesize findings into a clear, actionable roadmap with prioritized initiatives, resource requirements, risk mitigation, and measurable milestones.',
    'process.s3.title': 'Implementation & Guidance',
    'process.s3.desc':  'Our consultants work directly with your technical teams to implement solutions, transfer knowledge, and ensure adoption across the organization.',
    'process.s4.title': 'Review & Optimization',
    'process.s4.desc':  'We measure outcomes against defined KPIs, document lessons learned, and provide ongoing advisory to ensure sustained performance and continuous improvement.',

    // Metrics
    'metrics.heading': 'Our results by the numbers',
    'metrics.l1': 'Engagements Delivered',
    'metrics.l2': 'Client Retention Rate',
    'metrics.l3': 'Countries Served',
    'metrics.l4': 'Avg. Cost Reduction',

    // CTA
    'cta.heading':     'Ready to move your technology forward?',
    'cta.subtext':     "Schedule a no-commitment discovery call with our team. We'll listen, assess, and tell you honestly whether and how we can help.",
    'cta.btn.primary': 'Schedule a Call',

    // Contact
    'contact.label':   'Contact',
    'contact.heading': 'Start the conversation',
    'contact.subtext': "Tell us about your organization and the challenge you're trying to solve. We respond within one business day.",
    'contact.details.title':         'Contact Details',
    'contact.details.email':         'Email',
    'contact.details.phone':         'Phone',
    'contact.details.location':      'Location',
    'contact.details.location.value':'United States · Latin America',
    'contact.hours.title': 'Office Hours',
    'contact.hours.days':  'Monday – Friday',
    'contact.hours.note':  'For urgent security incidents, we provide 24/7 emergency response for active clients.',
    'contact.connect.title': 'Social Media',

    // Form
    'form.firstname':             'First Name',
    'form.firstname.placeholder': 'Jane',
    'form.lastname':              'Last Name',
    'form.lastname.placeholder':  'Smith',
    'form.email':                 'Work Email',
    'form.email.placeholder':     'jane@company.com',
    'form.company':               'Company',
    'form.company.placeholder':   'Acme Corp',
    'form.service':               'Area of Interest',
    'form.service.default':       'Select a service area',
    'form.service.tech':          'Technology Consulting',
    'form.service.sec':           'Cybersecurity',
    'form.service.dt':            'Digital Transformation',
    'form.service.other':         'Other / Not sure yet',
    'form.message':               'Message',
    'form.message.placeholder':   "Describe the challenge or initiative you'd like to discuss...",
    'form.submit':                'Send Message',
    'form.submitting':            'Sending...',
    'form.success':               "Message sent. We'll be in touch within one business day.",
    'form.error.required':        'This field is required.',
    'form.error.email':           'Please enter a valid email address.',

    // Footer
    'footer.tagline':      'Enterprise technology consulting built for organizations that demand precision, reliability, and long-term results.',
    'footer.nav.services': 'Services',
    'footer.nav.company':  'Company',
    'footer.nav.about':    'About Us',
    'footer.nav.process':  'Our Process',
    'footer.nav.legal':    'Legal',
    'footer.nav.privacy':  'Privacy Policy',
    'footer.nav.terms':    'Terms of Service',
    'footer.copy':         'Cargot Consulting. All rights reserved.',
    'footer.built':        'Engineered with precision.',
  },

  es: {
    // Nav
    'nav.services':  'Servicios',
    'nav.about':     'Nosotros',
    'nav.process':   'Proceso',
    'nav.results':   'Resultados',
    'nav.contact':   'Contacto',
    'nav.cta':       'Contáctanos',
    'nav.darkmode':  'Modo Oscuro',

    // Hero
    'hero.badge':              'Con la confianza de clientes satisfechos',
    'hero.heading.line1':      'Diseñamos el futuro',
    'hero.heading.line2':      'de su ',
    'hero.heading.highlight':  'infraestructura tecnológica',
    'hero.subtext':            'Cargot Consulting ofrece asesoría especializada en estrategia tecnológica, ciberseguridad y transformación digital — diseñada para organizaciones que exigen precisión, confiabilidad y resultados a largo plazo.',
    'hero.cta.primary':        'Iniciar una Conversación',
    'hero.cta.secondary':      'Explorar Servicios',
    'hero.trust.label':        'Atendemos clientes en',
    'hero.trust.us':           'Estados Unidos',
    'hero.trust.mx':           'México',
    'hero.trust.latam':        'Latinoamérica',

    // Services
    'services.label':   'Lo que Hacemos',
    'services.heading': 'Áreas de servicio principales',
    'services.subtext': 'Tres prácticas enfocadas para resolver los desafíos más críticos que enfrentan las organizaciones impulsadas por la tecnología hoy en día.',
    'services.badge':   'Más Solicitado',
    'services.learnmore': 'Saber más',

    'services.tech.title': 'Consultoría Tecnológica',
    'services.tech.desc':  'Diseñamos y alineamos su infraestructura tecnológica con sus objetivos de negocio. Desde revisiones de arquitectura hasta selección de proveedores, aplicamos rigor de ingeniería en cada decisión tecnológica.',
    'services.tech.f1':    'Estrategia TI y Hoja de Ruta',
    'services.tech.f2':    'Arquitectura Cloud y Migración',
    'services.tech.f3':    'Integración de Sistemas',
    'services.tech.f4':    'Evaluaciones Tecnológicas',

    'services.sec.title': 'Ciberseguridad',
    'services.sec.desc':  'Proteja los activos críticos de su organización con una postura de seguridad proactiva. Evaluamos vulnerabilidades, implementamos controles y construimos resiliencia frente a amenazas en evolución.',
    'services.sec.f1':    'Auditorías de Seguridad y Evaluación de Riesgos',
    'services.sec.f2':    'Cumplimiento (ISO 27001, NIST)',
    'services.sec.f3':    'Planificación de Respuesta a Incidentes',
    'services.sec.f4':    'Capacitación en Conciencia de Seguridad',

    'services.dt.title': 'Transformación Digital',
    'services.dt.desc':  'Modernice sus operaciones, automatice flujos de trabajo y construya las capacidades digitales que su organización necesita para competir y crecer en un mercado en rápida evolución.',
    'services.dt.f1':    'Automatización y Optimización de Procesos',
    'services.dt.f2':    'Evaluación de Madurez Digital',
    'services.dt.f3':    'Gestión del Cambio',
    'services.dt.f4':    'Estrategia de Datos y Analítica',

    // About
    'about.label':   'Sobre Cargot Consulting',
    'about.heading': 'Construido por ingenieros,\ncon la confianza de empresas',
    'about.p1':      'Cargot Consulting fue fundada con la convicción de que una gran consultoría tecnológica requiere profunda experiencia técnica combinada con visión empresarial. No vendemos marcos genéricos — entregamos soluciones a medida que se adaptan al contexto, las restricciones y las ambiciones de su organización.',
    'about.p2':      'Nuestro equipo aporta experiencia en entornos empresariales, con un historial de resultados medibles para clientes en diversos sectores.',
    'about.v1.title': 'Precisión',
    'about.v1.desc':  'Cada compromiso es definido, documentado y entregado a tiempo.',
    'about.v2.title': 'Colaboración',
    'about.v2.desc':  'Trabajamos junto a su equipo, no por encima de él.',
    'about.v3.title': 'Resultados',
    'about.v3.desc':  'El éxito se mide en resultados, no en entregables.',
    'about.card1.title': 'Cobertura en las Américas',
    'about.card1.desc':  'Compromisos activos en Estados Unidos, México, Colombia y más.',
    'about.card2.title': 'Profundidad Sectorial',
    'about.card2.desc':  'Sectores de finanzas, salud, gobierno, retail y manufactura.',
    'about.card3.title': 'Experiencia Certificada',
    'about.card3.desc':  'Consultores certificados en CISSP, CISM, AWS, Azure e ISO 27001.',

    // Process
    'process.label':   'Cómo Trabajamos',
    'process.heading': 'Un modelo de trabajo estructurado',
    'process.subtext': 'Cada compromiso sigue un proceso riguroso diseñado para minimizar riesgos, maximizar la claridad y entregar resultados sobre los que su equipo pueda construir.',
    'process.s1.title': 'Descubrimiento y Evaluación',
    'process.s1.desc':  'Comenzamos con una sesión de descubrimiento estructurada para comprender su estado actual, objetivos, restricciones y el panorama de partes interesadas. Sin supuestos, sin auditorías genéricas.',
    'process.s2.title': 'Estrategia y Planificación',
    'process.s2.desc':  'Sintetizamos los hallazgos en una hoja de ruta clara y accionable con iniciativas priorizadas, requisitos de recursos, mitigación de riesgos e hitos medibles.',
    'process.s3.title': 'Implementación y Guía',
    'process.s3.desc':  'Nuestros consultores trabajan directamente con sus equipos técnicos para implementar soluciones, transferir conocimiento y garantizar la adopción en toda la organización.',
    'process.s4.title': 'Revisión y Optimización',
    'process.s4.desc':  'Medimos resultados contra KPIs definidos, documentamos lecciones aprendidas y brindamos asesoría continua para garantizar un rendimiento sostenido y mejora continua.',

    // Metrics
    'metrics.heading': 'Nuestros resultados en números',
    'metrics.l1': 'Proyectos Entregados',
    'metrics.l2': 'Tasa de Retención de Clientes',
    'metrics.l3': 'Países Atendidos',
    'metrics.l4': 'Reducción Promedio de Costos',

    // CTA
    'cta.heading':     '¿Listo para hacer avanzar su tecnología?',
    'cta.subtext':     'Programe una llamada de descubrimiento sin compromiso con nuestro equipo. Escucharemos, evaluaremos y le diremos con honestidad si podemos ayudarle y cómo.',
    'cta.btn.primary': 'Agendar una Llamada',

    // Contact
    'contact.label':   'Contacto',
    'contact.heading': 'Inicie la conversación',
    'contact.subtext': 'Cuéntenos sobre su organización y el desafío que desea resolver. Respondemos dentro de un día hábil.',
    'contact.details.title':         'Datos de Contacto',
    'contact.details.email':         'Correo',
    'contact.details.phone':         'Teléfono',
    'contact.details.location':      'Ubicación',
    'contact.details.location.value':'Guatemala · Latinoamérica',
    'contact.hours.title': 'Horario de Atención',
    'contact.hours.days':  'Lunes – Viernes',
    'contact.hours.note':  'Para incidentes de seguridad urgentes, ofrecemos respuesta de emergencia 24/7 para clientes activos.',
    'contact.connect.title': 'Redes Sociales',

    // Form
    'form.firstname':             'Nombre',
    'form.firstname.placeholder': 'Juan',
    'form.lastname':              'Apellido',
    'form.lastname.placeholder':  'García',
    'form.email':                 'Correo Corporativo',
    'form.email.placeholder':     'juan@empresa.com',
    'form.company':               'Empresa',
    'form.company.placeholder':   'Mi Empresa S.A.',
    'form.service':               'Área de Interés',
    'form.service.default':       'Seleccione un área de servicio',
    'form.service.tech':          'Consultoría Tecnológica',
    'form.service.sec':           'Ciberseguridad',
    'form.service.dt':            'Transformación Digital',
    'form.service.other':         'Otro / No estoy seguro aún',
    'form.message':               'Mensaje',
    'form.message.placeholder':   'Describa el desafío o iniciativa que desea discutir...',
    'form.submit':                'Enviar Mensaje',
    'form.submitting':            'Enviando...',
    'form.success':               'Mensaje enviado. Nos pondremos en contacto dentro de un día hábil.',
    'form.error.required':        'Este campo es obligatorio.',
    'form.error.email':           'Por favor ingrese una dirección de correo válida.',

    // Footer
    'footer.tagline':      'Consultoría tecnológica empresarial para organizaciones que exigen precisión, confiabilidad y resultados a largo plazo.',
    'footer.nav.services': 'Servicios',
    'footer.nav.company':  'Empresa',
    'footer.nav.about':    'Nosotros',
    'footer.nav.process':  'Nuestro Proceso',
    'footer.nav.legal':    'Legal',
    'footer.nav.privacy':  'Política de Privacidad',
    'footer.nav.terms':    'Términos de Servicio',
    'footer.copy':         'Cargot Consulting. Todos los derechos reservados.',
    'footer.built':        'Diseñado con precisión.',
  },
};

/* ─── 2. Language Switcher ──────────────────────────────────── */

const STORAGE_KEY = 'cargot-lang';

/**
 * Apply a language to the page by walking all data-i18n elements.
 * @param {'en'|'es'} lang
 */
function applyLanguage(lang) {
  const dict = translations[lang];
  if (!dict) return;

  // Update <html lang>
  document.documentElement.lang = lang;

  // Translate text nodes
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      // Preserve child elements (icons) — only update text nodes
      const hasChildElements = el.querySelector('i, svg, [data-lucide]');
      if (hasChildElements) {
        // Find and update only text node children
        el.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = dict[key];
          }
        });
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Update lang toggle label (show opposite language)
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? 'ES' : 'EN';
  }

  // Update page title
  document.title = lang === 'es' ? 'Cargot Consulting' : 'Cargot Consulting';

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = lang === 'es'
      ? 'Cargot Consulting — Consultoría empresarial en tecnología, ciberseguridad y transformación digital para empresas en EE.UU. y Latinoamérica.'
      : 'Cargot Consulting — Enterprise technology, cybersecurity, and digital transformation consulting for businesses in the US and Latin America.';
  }

  // Persist
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (_) { /* storage unavailable */ }
}

function initLanguageSwitcher() {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  // Restore persisted preference, fall back to browser language
  let currentLang = 'es';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') {
      currentLang = stored;
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language || navigator.userLanguage || 'es';
      currentLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
    }
  } catch (_) { /* storage unavailable */ }

  // Apply on load (only if not Spanish — default HTML is already Spanish)
  if (currentLang === 'en') {
    applyLanguage('en');
  }

  toggle.addEventListener('click', () => {
    let lang;
    try {
      lang = localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (_) {
      lang = document.documentElement.lang || 'en';
    }
    const next = lang === 'en' ? 'es' : 'en';
    applyLanguage(next);

    // Brief visual feedback on the button
    toggle.classList.add('lang-toggle--active');
    setTimeout(() => toggle.classList.remove('lang-toggle--active'), 200);
  });
}

/* ─── 3. Navigation scroll state ───────────────────────────── */

function initNav() {
  const header = document.getElementById('nav-header');
  if (!header) return;

  function updateScrollState() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
}

/* ─── 4. Mobile menu ────────────────────────────────────────── */

function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  let isOpen = false;

  function setIcon(name) {
    const icon = toggle.querySelector('[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', name);
      lucide.createIcons({ nodes: [icon] });
    }
  }

  function openMenu() {
    isOpen = true;
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    setIcon('x');
    document.addEventListener('click', handleOutsideClick);
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    setIcon('menu');
    document.removeEventListener('click', handleOutsideClick);
  }

  function handleOutsideClick(e) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  window.matchMedia('(min-width: 641px)').addEventListener('change', (e) => {
    if (e.matches && isOpen) closeMenu();
  });
}

/* ─── 5. Smooth scroll ──────────────────────────────────────── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ─── 6. Scroll-based fade-in animations ───────────────────── */

function initScrollAnimations() {
  const targets = document.querySelectorAll([
    '.service-card', '.process-step', '.about-card', '.value-item',
    '.metric-item', '.section-header', '.hero-badge', '.cta-inner',
    '.contact-info-card',
  ].join(','));

  if (!targets.length) return;

  targets.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
  }
}

/* ─── 7. Metric counter animation ──────────────────────────── */

function initCounters() {
  const metricValues = document.querySelectorAll('.metric-value[data-target]');
  if (!metricValues.length) return;

  // Restructure metric-item to wrap value + symbol in a row div
  metricValues.forEach((valueEl) => {
    const parent   = valueEl.parentElement;
    const symbolEl = parent.querySelector('.metric-symbol');
    const labelEl  = parent.querySelector('.metric-label');
    if (symbolEl && labelEl) {
      const row = document.createElement('div');
      row.classList.add('metric-number-row');
      row.appendChild(valueEl.cloneNode(true));
      row.appendChild(symbolEl.cloneNode(true));
      parent.innerHTML = '';
      parent.appendChild(row);
      parent.appendChild(labelEl);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target.querySelector('.metric-value[data-target]');
        if (!el) return;
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (!isNaN(target)) animateCounter(el, target, 1600);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.metric-item').forEach((item) => observer.observe(item));
}

/* ─── 8. Contact form validation & submission ───────────────── */

function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  function getCurrentLang() {
    try { return localStorage.getItem(STORAGE_KEY) || 'en'; } catch (_) { return 'en'; }
  }

  function getError(type) {
    const lang = getCurrentLang();
    const dict = translations[lang] || translations.en;
    return dict[`form.error.${type}`] || translations.en[`form.error.${type}`];
  }

  function validateField(input) {
    const errorEl = input.parentElement.querySelector('.form-error');
    let message   = '';

    if (input.required && !input.value.trim()) {
      message = getError('required');
    } else if (input.type === 'email' && input.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        message = getError('email');
      }
    }

    if (errorEl) errorEl.textContent = message;
    input.classList.toggle('is-error', Boolean(message));
    return !message;
  }

  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) validateField(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allValid = Array.from(form.querySelectorAll('.form-input[required]'))
      .every((input) => validateField(input));

    if (!allValid) {
      const firstError = form.querySelector('.form-input.is-error');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        form.querySelectorAll('.form-input').forEach((el) => el.classList.remove('is-error'));
        successMsg.removeAttribute('hidden');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        lucide.createIcons();
      } else {
        throw new Error('Server error');
      }
    } catch {
      const errP = document.createElement('p');
      errP.style.cssText = 'font-size:0.875rem;color:#DC2626;margin-top:0.5rem;';
      const lang = getCurrentLang();
      errP.textContent = lang === 'es'
        ? 'Algo salió mal. Inténtelo de nuevo o escríbanos directamente.'
        : 'Something went wrong. Please try again or email us directly.';
      submitBtn.after(errP);
      setTimeout(() => errP.remove(), 6000);
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* ─── 9. Footer dynamic year ────────────────────────────────── */

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── 10. Active nav link highlighting ─────────────────────── */

function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('nav-link--active', active);
          link.setAttribute('aria-current', active ? 'true' : 'false');
        });
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ─── 11. Dark Mode ─────────────────────────────────────────── */

const DARK_KEY = 'cargot-theme';

/**
 * Set the icon on a dark-toggle button to sun or moon.
 * @param {Element} btn
 * @param {'sun'|'moon'} name
 */
function setDarkIcon(btn, name) {
  if (!btn) return;
  const icon = btn.querySelector('[data-lucide]');
  if (icon) {
    icon.setAttribute('data-lucide', name);
    lucide.createIcons({ nodes: [icon] });
  }
}

/**
 * Apply or remove the dark theme and update both toggle buttons.
 * @param {boolean} dark
 */
function applyDarkMode(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');

  const desktopBtn = document.getElementById('dark-toggle');
  const mobileBtn  = document.getElementById('mobile-dark-toggle');

  setDarkIcon(desktopBtn, dark ? 'sun' : 'moon');
  setDarkIcon(mobileBtn,  dark ? 'sun' : 'moon');

  // Update aria labels for accessibility
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  if (desktopBtn) desktopBtn.setAttribute('aria-label', label);
  if (mobileBtn)  mobileBtn.setAttribute('aria-label', label);

  // Persist preference
  try {
    localStorage.setItem(DARK_KEY, dark ? 'dark' : 'light');
  } catch (_) { /* storage unavailable */ }
}

function initDarkMode() {
  // Resolve initial preference: localStorage only — default is always light
  let isDark = false;
  try {
    const stored = localStorage.getItem(DARK_KEY);
    if (stored === 'dark') isDark = true;
  } catch (_) { /* storage unavailable, stay light */ }

  applyDarkMode(isDark);

  // Wire up desktop toggle
  const desktopBtn = document.getElementById('dark-toggle');
  if (desktopBtn) {
    desktopBtn.addEventListener('click', () => {
      const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyDarkMode(!currentlyDark);
    });
  }

  // Wire up mobile toggle
  const mobileBtn = document.getElementById('mobile-dark-toggle');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyDarkMode(!currentlyDark);
    });
  }
}

/* ─── Init ──────────────────────────────────────────────────── */

onReady(() => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initLanguageSwitcher();
  initDarkMode();
  initNav();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initFooterYear();
  initActiveNavLinks();
});
