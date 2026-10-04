# Heirloom Logistics — Website

Static marketing site for Heirloom Logistics, a moving company based in Nairobi, Kenya.

## Stack

- Plain HTML5, CSS3, vanilla JavaScript
- No build step, no dependencies, no frameworks
- Google Fonts (Playfair Display 700, Inter 400/500/600)
- Unsplash images (hosted CDN, responsive via `srcset`)

## File structure

```
/
├── index.html                  Homepage
├── about.html                  Company story, values, team
├── services.html               Service detail + pricing
├── heirloom-standard.html      Differentiators, process, guarantees
├── service-areas.html          Coverage — Nairobi + 47 counties
├── faq.html                    Accordion FAQ (+ FAQPage schema)
├── contact.html                Quote form → WhatsApp
├── packing-guide.html          Lead magnet: First Night Survival Guide
├── privacy.html                Privacy policy
├── terms.html                  Terms of service
├── 404.html                    Not found
├── style.css                   Design system + all page styles
├── packing-guide.css           Guide-only styles + print stylesheet
├── script.js                   Nav, FAQ, form → WhatsApp, tracking
├── robots.txt
├── sitemap.xml
└── README.md
```

## Local development

Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

`DEBUG` mode in `script.js` logs to the console on `localhost` / `127.0.0.1` only.

## Design tokens

All colours, spacing, radii and typography live in `:root` in `style.css`. Change them there — never hard-code a hex value in a component.

### Colour roles

| Token | Value | Use |
|---|---|---|
| `--color-charcoal` | `#1A1A1A` | Body text, dark sections, footer |
| `--color-ivory` | `#F7F5F0` | Page background, alternating sections |
| `--color-gold` | `#B08D57` | Decorative only — icons, borders on dark |
| `--color-gold-dark` | `#7A5C33` | Text on light backgrounds (5.66:1 ✅) |
| `--color-gold-fill` | `#8A6B3D` | Button fills with white text (4.84:1 ✅) |
| `--color-whatsapp` | `#0B7A6B` | WhatsApp buttons (5.24:1 ✅) |

⚠️ **Do not use `--color-gold` for text or as a button fill** — it fails WCAG AA at 3.09:1 against white.

## Accessibility

Targets WCAG 2.2 AA.

- Every page has a skip link to `#main-content`
- One `<h1>` per page; no heading-level skips
- All interactive elements are native `<button>` / `<a>`
- Focus states use `:focus-visible` with a visible gold outline
- `prefers-reduced-motion` disables animation and smooth scroll
- FAQ accordion uses `aria-expanded` + `aria-controls` + `role="region"`
- All content images have descriptive `alt`; decorative images have `alt=""`

## Forms

The quote form on `contact.html` does **not** post to any backend. Instead, `script.js` builds a formatted WhatsApp message from the field values and navigates the user to:

```
https://wa.me/254702555093?text=<encoded message>
```

The user reviews the message and presses send inside WhatsApp. Nothing is transmitted until they do.

### Why this pattern

- No third-party data processor, no API keys, no backend to maintain
- Works on every device that has WhatsApp installed
- Kenyan users overwhelmingly prefer WhatsApp over email or web forms
- Fully progressive: `<noscript>` on `contact.html` hides the form and shows direct WhatsApp / call buttons

### Changing the WhatsApp number

The number appears in three places. Update all three together:

1. `script.js` → `const WHATSAPP_NUMBER = '254702555093';` (international format, no `+`, no spaces)
2. All HTML files → every `href="https://wa.me/254702555093..."` link
3. All HTML files → every `href="tel:+254702555093"` link

### Message format

`buildWhatsAppMessage()` in `script.js` controls the exact message. WhatsApp supports `*bold*`, `_italic_`, and `~strikethrough~`. Line breaks use `\n` and are encoded by `encodeURIComponent()`.

### Honeypot

The form includes a `_gotcha` hidden field. Any submission where it is filled is silently ignored.

## Deployment

1. Upload all files to web root
2. Confirm HTTPS is enforced
3. Verify `sitemap.xml` and `robots.txt` are reachable
4. Submit the sitemap in Google Search Console
5. Test the quote form end to end on a real phone

## Maintenance

- Update `<lastmod>` in `sitemap.xml` when page content changes
- Keep the `<span id="current-year">` element in every footer — `script.js` populates it
- Test new pages at 320px, 375px, 768px, 1024px, 1440px