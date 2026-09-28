# Update and build the CV

Edit `resume.json`, then run:

```sh
npm --prefix jsonresume-theme-thomash ci --ignore-scripts
npm run compileResume
```

The small local theme dependency set is sufficient. The old root dependencies,
resume-cli, Puppeteer 1.x and translation service are not needed for this build.
The builder works independently of the checkout location and does not open a browser
or update translation files. Preview `resume.html`, then print to an A4 PDF without
browser headers/footers. Verify page breaks and text before sharing.

Do not use the legacy `./compileResume` shell wrapper: it invokes automatic translation.
The translation helper contains a legacy embedded credential that needs separate
revocation/replacement; do not expose it or run it as part of CV generation.

## September 2026 review

- Added employment at Deel II GmbH, 1 September 2025 to 31 August 2026. Employer,
  dates and software-development occupation match the employment certificate.
  Client/project branding and achievements remain to be confirmed, not invented.
- Removed unverified Pollinations user/community counts and March 2025 announcements.
- Existing historic roles, qualifications and contact details are retained, not newly
  verified. In particular, confirm whether Envisioning is still ongoing, the current
  contact address, LinkedIn URL and the scope of current Pollinations activity.
- A founder/project entry is not evidence of present salaried employment or weekly hours.
- Review the generated CV before submitting; nothing is sent to an employer or BA by building it.
