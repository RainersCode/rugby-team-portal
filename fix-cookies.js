// Fix Next.js cookies() async warnings
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files containing cookies() that are not already using await
const findCommand = 'grep -l "const cookieStore = cookies()" --include="*.tsx" --include="*.ts" -r src';

try {
  const filePaths = execSync(findCommand)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);

  console.log(`Found ${filePaths.length} files to fix.`);

  filePaths.forEach(filePath => {
    console.log(`Fixing ${filePath}`);
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the pattern
    const updatedContent = content.replace(
      /const cookieStore = cookies\(\);/g,
      'const cookieStore = await cookies();'
    );
    
    // Write the file back
    fs.writeFileSync(filePath, updatedContent);
  });

  console.log('All done! Fixed all files.');
} catch (error) {
  console.error('Error:', error.message);
} 