const fs = require('node:fs');
const path = require('node:path');

const input = path.resolve(__dirname, process.argv[2] || 'resume.json');
const output = path.resolve(__dirname, process.argv[3] || 'resume.html');
const resume = JSON.parse(fs.readFileSync(input, 'utf8'));

if (!resume.basics?.name || !Array.isArray(resume.work)) {
  throw new Error('The resume must contain basics.name and a work array.');
}

const { render } = require('./jsonresume-theme-thomash');
fs.writeFileSync(output, render(resume));
console.log(`Built ${output}`);
