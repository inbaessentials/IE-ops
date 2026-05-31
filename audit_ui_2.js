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
  // Dashboard basic table headers
  { regex: /<th className="py-3 px-6">/g, replace: '<th className="py-3 px-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
  { regex: /<th className="py-3 px-6 text-center">/g, replace: '<th className="py-3 px-6 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
  { regex: /<th className="py-3 px-6 text-right">/g, replace: '<th className="py-3 px-6 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
  // Dashboard table 2
  { regex: /<th className="p-4">/g, replace: '<th className="p-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
  { regex: /<th className="p-4 pl-6">/g, replace: '<th className="p-4 pl-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
  { regex: /<th className="p-4 pr-6">/g, replace: '<th className="p-4 pr-6 text-[10px] font-medium text-gray-500 uppercase tracking-wider">' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated unstyled headers in ${file}`);
    changedCount++;
  }
});

console.log(`\nDone! Audited and updated ${changedCount} files.`);
