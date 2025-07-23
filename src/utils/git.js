const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  function initializeGit(projectPath) {
      try {
          // Initialize Git repository
          execSync('git init', { cwd: projectPath, stdio: 'inherit' });

          // Create .gitignore
          const gitignoreContent = `
node_modules/
dist/
.vscode-test/
*.log
          `;
          fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent);

          // Stage and commit
          execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
          execSync('git commit -m "Initial commit: Scaffolded project"', { cwd: projectPath, stdio: 'inherit' });
      } catch (error) {
          throw new Error(`Failed to initialize Git: ${error.message}`);
      }
  }

  module.exports = { initializeGit };