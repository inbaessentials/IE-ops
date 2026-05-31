const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try { filelist = walkSync(dirFile, filelist); }
    catch (err) { if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile); }
  });
  return filelist;
};

const files = walkSync('./app').filter(f => f.endsWith('.tsx'));

let changedCount = 0;

const replacements = [
  // 1. Table Headers & KPI Labels (General `uppercase tracking-wider` normalizations)
  { regex: /text-xs font-semibold text-gray-500 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-500 uppercase tracking-wider' },
  { regex: /text-xs font-bold text-gray-500 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-500 uppercase tracking-wider' },
  { regex: /text-xs font-bold text-gray-400 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-400 uppercase tracking-wider' },
  { regex: /text-sm font-bold text-gray-400 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-400 uppercase tracking-wider' },
  { regex: /text-\[10px\] font-bold text-gray-500 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-500 uppercase tracking-wider' },
  { regex: /text-sm font-semibold text-gray-600 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-500 uppercase tracking-wider' },
  { regex: /text-\[11px\] font-bold text-gray-500 tracking-wider/g, replace: 'text-[10px] font-medium text-gray-500 uppercase tracking-wider' },
  { regex: /text-\[10px\] font-extrabold text-slate-400 uppercase tracking-wider/g, replace: 'text-[10px] font-medium text-gray-400 uppercase tracking-wider' },

  // 2. Table Data / Main Text (Demote extra-bolds and bolds to semibold and medium)
  { regex: /text-sm font-bold text-gray-900/g, replace: 'text-sm font-semibold text-gray-900' },
  { regex: /text-sm text-gray-900 font-bold/g, replace: 'text-sm text-gray-900 font-semibold' },
  { regex: /text-xs text-gray-600 font-semibold/g, replace: 'text-sm text-gray-600 font-medium' },
  { regex: /text-xs text-gray-500 font-semibold/g, replace: 'text-sm text-gray-500 font-medium' },
  { regex: /text-xs font-semibold text-gray-500/g, replace: 'text-xs font-medium text-gray-500' },
  { regex: /text-xs font-semibold text-gray-600/g, replace: 'text-xs font-medium text-gray-600' },
  
  // 3. Badges and Status Tags (Demote font-bold to font-medium inside tags)
  { regex: /text-\[10px\] font-bold px-2/g, replace: 'text-[10px] font-medium px-2' },
  { regex: /px-2 py-0.5 rounded-md font-bold text-\[10px\]/g, replace: 'px-2 py-0.5 rounded-md font-medium text-[10px]' },
  { regex: /font-bold text-\[10px\]/g, replace: 'font-medium text-[10px]' },
  { regex: /text-\[10px\] font-bold/g, replace: 'text-[10px] font-medium' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated UI fonts in ${file}`);
    changedCount++;
  }
});

console.log(`\nDone! Audited and updated ${changedCount} files.`);
