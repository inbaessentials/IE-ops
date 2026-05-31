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

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Spacing: Change space-y-4 to space-y-6 in forms and drawer wrappers
  content = content.replace(/className="([^"]*)space-y-4([^"]*)"/g, (match, p1, p2) => {
    // Only upgrade if it looks like a form wrapper or drawer inner div
    if (match.includes('form') || match.includes('bg-white') || match.includes('p-')) {
      return `className="${p1}space-y-6${p2}"`;
    }
    return match;
  });

  // 2. Input/Select/Textarea font weight
  // Look for font-semibold or font-bold text-gray-900 in inputs
  content = content.replace(/(<(?:input|select|textarea)[^>]*className="[^"]*)font-semibold([^"]*")/, '$1font-medium$2');
  content = content.replace(/(<(?:input|select|textarea)[^>]*className="[^"]*)font-bold([^"]*")/, '$1font-medium$2');
  // Also soften text-gray-900 to text-gray-800 in inputs for a cleaner look
  content = content.replace(/(<(?:input|select|textarea)[^>]*className="[^"]*)text-gray-900([^"]*")/, '$1text-gray-800$2');
  
  // Since some elements might have multiple occurrences or be multi-line, a global regex replacing className specifically for form controls might be safer if we just match `className="..."` inside those tags. 
  // Let's do a broader replace for common input patterns.
  content = content.replace(/outline-none font-semibold text-gray-900/g, 'outline-none font-medium text-gray-800');
  content = content.replace(/outline-none font-bold text-gray-900/g, 'outline-none font-medium text-gray-800');
  content = content.replace(/text-gray-900 font-semibold text-sm/g, 'text-gray-800 font-medium text-sm');
  content = content.replace(/text-sm font-semibold text-gray-900/g, 'text-sm font-medium text-gray-800');

  // 3. Label typography
  // Old style 1: block text-sm font-semibold text-gray-900 mb-1
  content = content.replace(/className="block text-sm font-semibold text-gray-900 mb-1"/g, 'className="block text-xs font-medium text-gray-600 mb-1"');
  // Old style 2: block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider
  content = content.replace(/className="block text-\[10px\] font-medium text-gray-500 mb-1 uppercase tracking-wider"/g, 'className="block text-xs font-medium text-gray-600 mb-1"');
  // Old style 3: block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider
  content = content.replace(/className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider"/g, 'className="block text-xs font-medium text-gray-600 mb-1"');
  // Old style 4: block text-sm font-bold text-gray-700 mb-1
  content = content.replace(/className="block text-sm font-bold text-gray-700 mb-1"/g, 'className="block text-xs font-medium text-gray-600 mb-1"');

  // Let's strip the asterisks from labels to make it cleaner, or keep them but remove uppercase manually.
  content = content.replace(/>([^<]+) \*/g, '>$1 *'); // just a check, leaving text alone since users might want required indicator

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Refactored drawer typography in ${file}`);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
