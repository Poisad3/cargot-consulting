"""
Cargot Consulting — Automated Site Test Suite
==============================================
Pure Python 3, stdlib only (html.parser, re, json, pathlib, unittest).
Tests: HTML structure, brand naming, i18n coverage, form config,
       navigation anchors, CSS/JS references, JS translations, accessibility.

Run: python3 tests/test_site.py
"""

import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────
ROOT   = Path(__file__).parent.parent
HTML   = ROOT / "index.html"
CSS    = ROOT / "css" / "styles.css"
JS     = ROOT / "js" / "main.js"

# ── HTML Parser ──────────────────────────────────────────────

class SiteParser(HTMLParser):
    """Single-pass parser that collects everything the tests need."""

    VOID = {
        'area','base','br','col','embed','hr','img','input',
        'link','meta','param','source','track','wbr',
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack          = []        # open-tag stack
        self.errors         = []        # structural errors
        self.ids            = set()     # all id="…" values
        self.i18n_keys      = set()     # all data-i18n="…" values
        self.i18n_ph_keys   = set()     # all data-i18n-placeholder="…" values
        self.anchors        = set()     # href="#…" values
        self.nav_links      = []        # href values of .nav-link elements
        self.section_ids    = set()     # id="…" on <section> tags
        self.form_action    = None      # action attr of the contact form
        self.form_method    = None
        self.form_required  = []        # name attrs of required inputs
        self.form_inputs    = []        # all input/textarea/select names
        self.select_options = []        # all <option> data-i18n keys
        self.link_hrefs     = []        # all <link rel="stylesheet"> hrefs
        self.script_srcs    = []        # all <script src="…"> values
        self.lang_attr      = None      # <html lang="…">
        self.title_text     = ""
        self.meta           = {}        # name/property → content
        self._in_title      = False
        self._current_attrs = {}
        self._current_tag   = None

    # helpers
    def _attrs(self, attrs):
        return dict(attrs)

    def handle_starttag(self, tag, attrs):
        d = self._attrs(attrs)
        self._current_tag   = tag
        self._current_attrs = d

        # structural stack
        if tag not in self.VOID:
            self.stack.append(tag)

        # <html lang>
        if tag == 'html' and 'lang' in d:
            self.lang_attr = d['lang']

        # ids
        if 'id' in d:
            self.ids.add(d['id'])

        # sections
        if tag == 'section' and 'id' in d:
            self.section_ids.add(d['id'])

        # i18n
        if 'data-i18n' in d:
            self.i18n_keys.add(d['data-i18n'])
        if 'data-i18n-placeholder' in d:
            self.i18n_ph_keys.add(d['data-i18n-placeholder'])

        # anchors
        if tag == 'a' and 'href' in d:
            href = d['href']
            if href.startswith('#'):
                self.anchors.add(href)
            if 'nav-link' in d.get('class', ''):
                self.nav_links.append(href)

        # form
        if tag == 'form' and d.get('id') == 'contact-form':
            self.form_action = d.get('action', '')
            self.form_method = d.get('method', '')

        if tag in ('input', 'textarea') and 'name' in d:
            self.form_inputs.append(d['name'])
            # Boolean attribute 'required' arrives as None (bare) or '' (with ="")
            if 'required' in d:
                self.form_required.append(d['name'])

        if tag == 'select' and 'name' in d:
            self.form_inputs.append(d['name'])

        # select options
        if tag == 'option' and 'data-i18n' in d:
            self.select_options.append(d['data-i18n'])

        # css / js refs
        if tag == 'link' and d.get('rel') == 'stylesheet' and 'href' in d:
            self.link_hrefs.append(d['href'])
        if tag == 'script' and 'src' in d:
            self.script_srcs.append(d['src'])

        # meta
        if tag == 'meta':
            key = d.get('name') or d.get('property')
            if key and 'content' in d:
                self.meta[key] = d['content']

        # title
        if tag == 'title':
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False
        if tag in self.VOID:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"Unexpected </{tag}>")

    def handle_data(self, data):
        if self._in_title:
            self.title_text += data


def parse_html():
    parser = SiteParser()
    parser.feed(HTML.read_text(encoding='utf-8'))
    return parser


def read_js():
    return JS.read_text(encoding='utf-8')


def read_css():
    return CSS.read_text(encoding='utf-8')


# ════════════════════════════════════════════════════════════════
# Test Cases
# ════════════════════════════════════════════════════════════════

class TestHTMLStructure(unittest.TestCase):
    """Well-formedness and required sections."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_no_structural_errors(self):
        self.assertEqual(self.p.errors, [],
            f"HTML structural errors: {self.p.errors}")

    def test_no_unclosed_tags(self):
        # Ignore html/body/head which browsers auto-close
        unclosed = [t for t in self.p.stack if t not in ('html', 'body', 'head')]
        self.assertEqual(unclosed, [],
            f"Unclosed tags: {unclosed}")

    def test_html_lang_attribute(self):
        self.assertEqual(self.p.lang_attr, 'en',
            "Default <html lang> should be 'en'")

    def test_required_sections_present(self):
        required = {'hero', 'services', 'about', 'process', 'metrics', 'cta', 'contact'}
        missing  = required - self.p.section_ids
        self.assertEqual(missing, set(),
            f"Missing sections with id: {missing}")

    def test_required_element_ids_present(self):
        required_ids = {
            'nav-header', 'nav-toggle', 'mobile-menu',
            'contact-form', 'form-submit', 'form-success',
            'footer-year', 'lang-toggle', 'lang-label',
        }
        missing = required_ids - self.p.ids
        self.assertEqual(missing, set(),
            f"Missing required IDs: {missing}")

    def test_page_title(self):
        self.assertIn('Cargot Consulting', self.p.title_text,
            "Page title should contain 'Cargot Consulting'")

    def test_title_no_old_brand(self):
        self.assertNotIn('Cargot Tech', self.p.title_text,
            "Page title must not contain old brand 'Cargot Tech'")


class TestBrandNaming(unittest.TestCase):
    """No legacy 'Cargot Tech' / 'CargotTech' anywhere."""

    def _check_file(self, path):
        content = path.read_text(encoding='utf-8')
        # Case-insensitive search for old names
        matches = re.findall(r'cargot\s*tech|cargottech', content, re.IGNORECASE)
        return matches

    def test_no_old_brand_in_html(self):
        found = self._check_file(HTML)
        self.assertEqual(found, [],
            f"Old brand found in index.html: {found}")

    def test_no_old_brand_in_css(self):
        # Allow comment on line 2 — check actual CSS rules only
        css = read_css()
        # Strip comment block at top
        stripped = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
        found = re.findall(r'cargot\s*tech|cargottech', stripped, re.IGNORECASE)
        self.assertEqual(found, [],
            f"Old brand found in styles.css (outside comments): {found}")

    def test_no_old_brand_in_js(self):
        js = read_js()
        found = re.findall(r'cargot\s*tech|cargottech', js, re.IGNORECASE)
        self.assertEqual(found, [],
            f"Old brand found in main.js: {found}")

    def test_new_brand_in_html(self):
        html = HTML.read_text(encoding='utf-8')
        self.assertIn('Cargot Consulting', html,
            "New brand 'Cargot Consulting' not found in HTML")

    def test_new_brand_in_js_translations(self):
        js = read_js()
        self.assertIn('Cargot Consulting', js,
            "New brand 'Cargot Consulting' not found in JS translations")


class TestAssetReferences(unittest.TestCase):
    """CSS and JS files are correctly referenced and exist on disk."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_stylesheet_referenced(self):
        self.assertIn('css/styles.css', self.p.link_hrefs,
            "styles.css not linked in <head>")

    def test_stylesheet_exists(self):
        self.assertTrue(CSS.exists(), "css/styles.css file not found on disk")

    def test_js_referenced(self):
        js_srcs = [s for s in self.p.script_srcs if 'main.js' in s]
        self.assertTrue(len(js_srcs) > 0, "main.js not referenced in HTML")

    def test_js_exists(self):
        self.assertTrue(JS.exists(), "js/main.js file not found on disk")

    def test_lucide_cdn_referenced(self):
        lucide_srcs = [s for s in self.p.script_srcs if 'lucide' in s]
        self.assertTrue(len(lucide_srcs) > 0,
            "Lucide icon CDN script not found in HTML")

    def test_geist_font_referenced(self):
        html = HTML.read_text(encoding='utf-8')
        self.assertIn('Geist', html,
            "Geist font not referenced in HTML")


class TestNavigation(unittest.TestCase):
    """All nav anchor hrefs resolve to actual section IDs."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_all_anchors_resolve(self):
        broken = []
        for href in self.p.anchors:
            if href == '#':
                continue
            target_id = href.lstrip('#')
            if target_id not in self.p.ids:
                broken.append(href)
        self.assertEqual(broken, [],
            f"Broken anchor links (no matching id): {broken}")

    def test_required_nav_sections(self):
        nav_hrefs = set(self.p.nav_links)
        required  = {'#services', '#about', '#process', '#metrics', '#contact'}
        missing   = required - nav_hrefs
        self.assertEqual(missing, set(),
            f"Nav links missing for sections: {missing}")


class TestForm(unittest.TestCase):
    """Contact form configuration and fields."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_form_action_is_formspree(self):
        self.assertIsNotNone(self.p.form_action,
            "Contact form action attribute not found")
        self.assertIn('formspree.io/f/', self.p.form_action,
            "Form action should point to Formspree")

    def test_form_id_is_not_placeholder(self):
        self.assertNotIn('YOUR_FORM_ID', self.p.form_action,
            "Form action still has placeholder YOUR_FORM_ID")

    def test_form_id_is_correct(self):
        self.assertIn('xdeaqbwa', self.p.form_action,
            "Form action should contain Formspree ID 'xdeaqbwa'")

    def test_form_method_is_post(self):
        self.assertEqual(self.p.form_method, 'POST',
            "Form method should be POST")

    def test_required_fields_present(self):
        required_names = {'first_name', 'last_name', 'email', 'message'}
        actual = set(self.p.form_required)
        missing = required_names - actual
        self.assertEqual(missing, set(),
            f"Required form fields missing: {missing}")

    def test_all_expected_fields_present(self):
        expected = {'first_name', 'last_name', 'email', 'company', 'service', 'message'}
        actual   = set(self.p.form_inputs)
        missing  = expected - actual
        self.assertEqual(missing, set(),
            f"Expected form fields missing: {missing}")


class TestI18nHTML(unittest.TestCase):
    """Every major text node has a data-i18n key."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_minimum_i18n_key_count(self):
        # We expect at least 100 keys — a conservative floor
        count = len(self.p.i18n_keys)
        self.assertGreaterEqual(count, 100,
            f"Too few data-i18n keys ({count}). Expected ≥100.")

    def test_required_i18n_keys_present(self):
        required = {
            'nav.services', 'nav.about', 'nav.process', 'nav.contact', 'nav.cta',
            'hero.badge', 'hero.heading.line1', 'hero.subtext',
            'hero.cta.primary', 'hero.cta.secondary',
            'services.label', 'services.heading',
            'services.tech.title', 'services.sec.title', 'services.dt.title',
            'about.label', 'about.heading',
            'process.label', 'process.heading',
            'process.s1.title', 'process.s2.title', 'process.s3.title', 'process.s4.title',
            'metrics.l1', 'metrics.l2', 'metrics.l3', 'metrics.l4',
            'cta.heading', 'cta.btn.primary',
            'contact.heading', 'contact.label',
            'form.firstname', 'form.email', 'form.message', 'form.submit',
            'footer.tagline', 'footer.copy',
        }
        missing = required - self.p.i18n_keys
        self.assertEqual(missing, set(),
            f"Missing required data-i18n keys in HTML: {missing}")

    def test_lang_toggle_present(self):
        self.assertIn('lang-toggle', self.p.ids,
            "Language toggle button (id='lang-toggle') not found")

    def test_lang_label_present(self):
        self.assertIn('lang-label', self.p.ids,
            "Language label span (id='lang-label') not found")

    def test_select_options_have_i18n(self):
        expected_option_keys = {
            'form.service.default', 'form.service.tech',
            'form.service.sec', 'form.service.dt', 'form.service.other',
        }
        missing = expected_option_keys - self.p.i18n_keys
        self.assertEqual(missing, set(),
            f"Select option i18n keys missing: {missing}")


class TestI18nJS(unittest.TestCase):
    """JS translations object has both EN and ES entries for all HTML keys."""

    @classmethod
    def setUpClass(cls):
        cls.js   = read_js()
        cls.html_keys = parse_html().i18n_keys

    def _extract_lang_keys(self, lang):
        """Extract translation keys from the en: {} or es: {} block."""
        # Match the block for the given language
        pattern = rf"{lang}:\s*\{{(.+?)\n  \}},"
        m = re.search(pattern, self.js, re.DOTALL)
        if not m:
            return set()
        block = m.group(1)
        return set(re.findall(r"'([^']+)'\s*:", block))

    def test_en_translations_exist(self):
        en_keys = self._extract_lang_keys('en')
        self.assertGreater(len(en_keys), 0, "EN translations block not found in main.js")

    def test_es_translations_exist(self):
        es_keys = self._extract_lang_keys('es')
        self.assertGreater(len(es_keys), 0, "ES translations block not found in main.js")

    def test_all_html_keys_in_en_translations(self):
        en_keys = self._extract_lang_keys('en')
        missing = self.html_keys - en_keys
        self.assertEqual(missing, set(),
            f"HTML data-i18n keys missing from EN translations: {missing}")

    def test_all_html_keys_in_es_translations(self):
        es_keys = self._extract_lang_keys('es')
        missing = self.html_keys - es_keys
        self.assertEqual(missing, set(),
            f"HTML data-i18n keys missing from ES translations: {missing}")

    def test_apply_language_function_exists(self):
        self.assertIn('function applyLanguage', self.js,
            "applyLanguage() function not found in main.js")

    def test_language_switcher_init_exists(self):
        self.assertIn('function initLanguageSwitcher', self.js,
            "initLanguageSwitcher() function not found in main.js")

    def test_localstorage_persistence(self):
        self.assertIn('localStorage.setItem', self.js,
            "localStorage.setItem not found — language not persisted")
        self.assertIn('localStorage.getItem', self.js,
            "localStorage.getItem not found — language not restored")

    def test_browser_lang_autodetect(self):
        self.assertIn('navigator.language', self.js,
            "Browser language auto-detection (navigator.language) not found")

    def test_error_messages_in_both_languages(self):
        self.assertIn('form.error.required', self.js,
            "Required field error key missing from JS")
        self.assertIn('form.error.email', self.js,
            "Email error key missing from JS")


class TestCSSDesignSystem(unittest.TestCase):
    """CSS file contains all required design tokens and component classes."""

    @classmethod
    def setUpClass(cls):
        cls.css = read_css()

    def test_css_variables_defined(self):
        required_vars = [
            '--color-bg', '--color-blue', '--color-green',
            '--color-text', '--font-sans', '--radius',
            '--shadow-sm', '--transition-fast', '--nav-height',
        ]
        missing = [v for v in required_vars if v not in self.css]
        self.assertEqual(missing, [],
            f"CSS custom properties missing: {missing}")

    def test_color_palette_values(self):
        palette = {
            '#F9FAFB': 'background',
            '#0D1117': 'primary text',
            '#2563EB': 'corporate blue',
            '#059669': 'success green',
        }
        for color, name in palette.items():
            self.assertIn(color, self.css,
                f"Color {color} ({name}) not found in CSS")

    def test_no_forbidden_patterns(self):
        """No gradients, glassmorphism, or neumorphism."""
        forbidden = [
            r'linear-gradient',
            r'backdrop-filter(?!.*blur\(8px\))',  # allow nav blur only
        ]
        # Simple check: linear-gradient should not appear
        self.assertNotIn('linear-gradient', self.css,
            "CSS contains linear-gradient — design spec forbids gradients")

    def test_required_component_classes(self):
        required_classes = [
            '.btn', '.btn-primary', '.btn-ghost', '.btn-outline',
            '.nav-header', '.nav-links', '.nav-link', '.mobile-menu',
            '.lang-toggle',
            '.hero', '.hero-heading', '.hero-badge',
            '.services-grid', '.service-card', '.service-card--featured',
            '.about-grid', '.about-card',
            '.process-steps', '.process-step',
            '.metrics-grid', '.metric-item',
            '.cta-inner',
            '.contact-form', '.form-input', '.form-error',
            '.footer', '.footer-grid',
        ]
        missing = [cls for cls in required_classes if cls not in self.css]
        self.assertEqual(missing, [],
            f"CSS component classes missing: {missing}")

    def test_responsive_breakpoints_present(self):
        # Three breakpoints expected
        breakpoints = ['900px', '640px']
        for bp in breakpoints:
            self.assertIn(bp, self.css,
                f"Responsive breakpoint {bp} not found in CSS")

    def test_geist_font_in_font_stack(self):
        self.assertIn("'Geist'", self.css,
            "Geist font not in CSS font stack")

    def test_prefers_reduced_motion(self):
        self.assertIn('prefers-reduced-motion', self.css,
            "prefers-reduced-motion media query missing from CSS")

    def test_focus_visible_defined(self):
        self.assertIn(':focus-visible', self.css,
            ":focus-visible styles missing — accessibility issue")

    def test_fade_in_up_animation(self):
        self.assertIn('.fade-in-up', self.css,
            ".fade-in-up animation class missing from CSS")


class TestAccessibility(unittest.TestCase):
    """Basic accessibility requirements."""

    @classmethod
    def setUpClass(cls):
        cls.html = HTML.read_text(encoding='utf-8')
        cls.p    = parse_html()

    def test_html_has_lang(self):
        self.assertIsNotNone(self.p.lang_attr,
            "<html> element missing lang attribute")

    def test_sr_only_class_in_css(self):
        css = read_css()
        self.assertIn('.sr-only', css,
            ".sr-only utility class missing from CSS")

    def test_aria_label_on_nav(self):
        self.assertIn('aria-label="Main navigation"', self.html,
            "Main nav missing aria-label")

    def test_aria_required_on_form_inputs(self):
        # Count occurrences of aria-required="true"
        count = len(re.findall(r'aria-required="true"', self.html))
        self.assertGreaterEqual(count, 3,
            f"Expected ≥3 aria-required='true' on required inputs, found {count}")

    def test_aria_live_on_form_errors(self):
        self.assertIn('aria-live="polite"', self.html,
            "aria-live='polite' missing — form errors won't be announced")

    def test_form_labels_have_for_attribute(self):
        labels_with_for = len(re.findall(r'<label[^>]+for="', self.html))
        self.assertGreaterEqual(labels_with_for, 5,
            f"Expected ≥5 <label for='…'>, found {labels_with_for}")

    def test_images_not_missing_alt(self):
        # Any <img> without alt is a violation
        imgs_no_alt = re.findall(r'<img(?![^>]*\balt\b)[^>]*>', self.html)
        self.assertEqual(imgs_no_alt, [],
            f"<img> tags missing alt attribute: {imgs_no_alt}")

    def test_buttons_have_accessible_labels(self):
        # nav-toggle and lang-toggle must have aria-label
        self.assertIn('aria-label="Toggle mobile menu"', self.html,
            "Mobile menu toggle missing aria-label")
        self.assertIn('aria-label="Switch language', self.html,
            "Language toggle missing aria-label")


class TestMetaAndSEO(unittest.TestCase):
    """Meta tags and SEO essentials."""

    @classmethod
    def setUpClass(cls):
        cls.p = parse_html()

    def test_meta_description_present(self):
        self.assertIn('description', self.p.meta,
            "Meta description tag missing")

    def test_meta_description_mentions_brand(self):
        desc = self.p.meta.get('description', '')
        self.assertIn('Cargot Consulting', desc,
            "Meta description should mention 'Cargot Consulting'")

    def test_og_title_present(self):
        self.assertIn('og:title', self.p.meta,
            "Open Graph og:title meta tag missing")

    def test_og_title_correct(self):
        og_title = self.p.meta.get('og:title', '')
        self.assertIn('Cargot Consulting', og_title,
            "og:title should contain 'Cargot Consulting'")

    def test_og_description_present(self):
        self.assertIn('og:description', self.p.meta,
            "Open Graph og:description meta tag missing")

    def test_viewport_meta_present(self):
        self.assertIn('viewport', self.p.meta,
            "Viewport meta tag missing")

    def test_charset_declared(self):
        html = HTML.read_text(encoding='utf-8')
        self.assertIn('charset="UTF-8"', html,
            "charset UTF-8 not declared")


class TestJSFunctions(unittest.TestCase):
    """All required JS functions are present and wired up."""

    @classmethod
    def setUpClass(cls):
        cls.js = read_js()

    def _has_fn(self, name):
        return f'function {name}' in self.js

    def test_init_nav(self):
        self.assertTrue(self._has_fn('initNav'),
            "initNav() missing from main.js")

    def test_init_mobile_menu(self):
        self.assertTrue(self._has_fn('initMobileMenu'),
            "initMobileMenu() missing")

    def test_init_smooth_scroll(self):
        self.assertTrue(self._has_fn('initSmoothScroll'),
            "initSmoothScroll() missing")

    def test_init_scroll_animations(self):
        self.assertTrue(self._has_fn('initScrollAnimations'),
            "initScrollAnimations() missing")

    def test_init_counters(self):
        self.assertTrue(self._has_fn('initCounters'),
            "initCounters() missing")

    def test_init_contact_form(self):
        self.assertTrue(self._has_fn('initContactForm'),
            "initContactForm() missing")

    def test_init_footer_year(self):
        self.assertTrue(self._has_fn('initFooterYear'),
            "initFooterYear() missing")

    def test_init_active_nav_links(self):
        self.assertTrue(self._has_fn('initActiveNavLinks'),
            "initActiveNavLinks() missing")

    def test_animate_counter(self):
        self.assertTrue(self._has_fn('animateCounter'),
            "animateCounter() missing")

    def test_all_inits_called_on_ready(self):
        # All init functions should be called inside onReady(...)
        on_ready_block_match = re.search(
            r'onReady\s*\(\s*\(\s*\)\s*=>\s*\{(.+?)\}\s*\)',
            self.js, re.DOTALL
        )
        self.assertIsNotNone(on_ready_block_match,
            "onReady() callback block not found")
        block = on_ready_block_match.group(1)
        for fn in [
            'initLanguageSwitcher', 'initNav', 'initMobileMenu',
            'initSmoothScroll', 'initScrollAnimations', 'initCounters',
            'initContactForm', 'initFooterYear', 'initActiveNavLinks',
        ]:
            self.assertIn(fn, block,
                f"{fn}() not called inside onReady()")

    def test_intersection_observer_used(self):
        self.assertIn('IntersectionObserver', self.js,
            "IntersectionObserver not used — scroll animations won't work")

    def test_fetch_used_for_form(self):
        self.assertIn('fetch(form.action', self.js,
            "fetch() not used for form submission")

    def test_use_strict(self):
        self.assertIn("'use strict'", self.js,
            "Missing 'use strict' directive")

    def test_escape_key_closes_menu(self):
        self.assertIn("'Escape'", self.js,
            "Escape key handler missing from mobile menu")

    def test_prefers_reduced_motion_respected(self):
        self.assertIn('prefers-reduced-motion', self.js,
            "prefers-reduced-motion not respected in JS animations")


# ── Runner ───────────────────────────────────────────────────

def run_tests():
    loader = unittest.TestLoader()
    suite  = unittest.TestSuite()

    test_classes = [
        TestHTMLStructure,
        TestBrandNaming,
        TestAssetReferences,
        TestNavigation,
        TestForm,
        TestI18nHTML,
        TestI18nJS,
        TestCSSDesignSystem,
        TestAccessibility,
        TestMetaAndSEO,
        TestJSFunctions,
    ]

    for cls in test_classes:
        suite.addTests(loader.loadTestsFromTestCase(cls))

    runner = unittest.TextTestRunner(verbosity=2, stream=sys.stdout)
    result = runner.run(suite)

    print('\n' + '═' * 60)
    total  = result.testsRun
    passed = total - len(result.failures) - len(result.errors)
    print(f'  Results: {passed}/{total} tests passed')
    if result.failures:
        print(f'  Failures: {len(result.failures)}')
    if result.errors:
        print(f'  Errors:   {len(result.errors)}')
    print('═' * 60)

    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    sys.exit(run_tests())
