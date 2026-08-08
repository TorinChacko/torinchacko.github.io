# Torin Chacko — Portfolio

[![Validate Site](https://github.com/TorinChacko/torinchacko.github.io/actions/workflows/validate-site.yml/badge.svg)](https://github.com/TorinChacko/torinchacko.github.io/actions/workflows/validate-site.yml)

Personal portfolio for backend, systems, and performance-engineering work, served with GitHub Pages at [torinchacko.github.io](https://torinchacko.github.io/).

![Portfolio social preview](assets/images/og-card.png)

## Highlights

- Terminal-framed interface built on the Nocturne design system
- Experience and education timeline
- Evidence-focused project case studies
- Responsive, accessible, reduced-motion-aware interface
- Automated résumé compilation and site validation

## Structure

```
index.html              site markup
assets/css/nocturne.css design-system tokens and component classes
assets/css/site.css     terminal theme and page layout
assets/js/main.js       footer year
assets/images/          social and preview graphics
resume/resume.tex       resume source
resume/resume.pdf       compiled resume (auto-built, do not edit by hand)
scripts/check-site.mjs  local-reference and metadata validation
```

`nocturne.css` is the source of truth for the system's look — retune tokens
there rather than overriding rules downstream. `site.css` layers the
terminal theme (JetBrains Mono, green accent, near-black ground) over those
tokens and holds all page-specific layout; it never hardcodes a color.

## Local preview

Run a static server from the repository root:

```powershell
python -m http.server 8777
```

Then open `http://localhost:8777`. Run the repository checks with:

```powershell
node --check assets/js/main.js
node scripts/check-site.mjs
```

## Updating the resume

Edit `resume/resume.tex` and push to `main`. A GitHub Actions workflow
(`.github/workflows/build-resume.yml`) compiles it with LaTeX and commits the
resulting `resume/resume.pdf` back to the repo automatically. No local LaTeX
install required.
