# torinchacko.github.io

Personal portfolio site, served with GitHub Pages.

## Structure

```
index.html              site markup
assets/css/style.css    styles
assets/js/main.js       interactions (nav, scroll reveal, typing effect, particles)
resume/resume.tex       resume source
resume/resume.pdf       compiled resume (auto-built, do not edit by hand)
```

## Updating the resume

Edit `resume/resume.tex` and push to `main`. A GitHub Actions workflow
(`.github/workflows/build-resume.yml`) compiles it with LaTeX and commits the
resulting `resume/resume.pdf` back to the repo automatically. No local LaTeX
install required.
