const vscode = require('vscode');
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const { initializeGit } = require('../utils/git');
  const { saveMetadata } = require('../utils/metadata');

  async function createReactProject(projectPath, options) {
      const { projectName, useTypescript, useTailwind, useEslint, usePrettier, useRouter, packageManager } = options;

      // Check package manager availability
      let effectivePackageManager = packageManager;
      if (packageManager === 'pnpm') {
          try {
              execSync('pnpm --version', { stdio: 'ignore' });
          } catch (error) {
              throw new Error('pnpm-not-installed');
          }
      }

      // Resolve project directory
      const projectDir = path.resolve(projectPath);

      // Create Vite project
      const template = useTypescript ? 'react-ts' : 'react';
      let viteCommand = `${effectivePackageManager} create vite ${projectName} --template ${template}`;
      if (effectivePackageManager === 'pnpm') {
          viteCommand += ' --yes'; // Skip interactive prompts
      }
      try {
          const terminal = vscode.window.createTerminal('Vite Scaffold');
          terminal.show();
          terminal.sendText(`cd ${path.dirname(projectDir)} && ${viteCommand}`);
          await new Promise((resolve, reject) => {
              const checkInterval = setInterval(() => {
                  if (fs.existsSync(path.join(projectDir, 'package.json'))) {
                      clearInterval(checkInterval);
                      terminal.dispose();
                      resolve();
                  }
              }, 1000);
              setTimeout(() => {
                  clearInterval(checkInterval);
                  terminal.dispose();
                  reject(new Error('Vite project creation timed out'));
              }, 30000);
          });
      } catch (error) {
          if (effectivePackageManager === 'pnpm') {
              vscode.window.showWarningMessage(`pnpm failed: ${error.message}. Falling back to npm.`);
              effectivePackageManager = 'npm';
              viteCommand = `${effectivePackageManager} create vite ${projectName} --template ${template}`;
              const terminal = vscode.window.createTerminal('Vite Scaffold Fallback');
              terminal.show();
              terminal.sendText(`cd ${path.dirname(projectDir)} && ${viteCommand}`);
              await new Promise((resolve, reject) => {
                  const checkInterval = setInterval(() => {
                      if (fs.existsSync(path.join(projectDir, 'package.json'))) {
                          clearInterval(checkInterval);
                          terminal.dispose();
                          resolve();
                      }
                  }, 1000);
                  setTimeout(() => {
                      clearInterval(checkInterval);
                      terminal.dispose();
                      reject(new Error('Fallback npm project creation timed out'));
                  }, 30000);
              });
          } else {
              throw new Error(`Failed to create Vite project: ${error.message}`);
          }
      }

      // Verify project directory is populated
      if (!fs.existsSync(path.join(projectDir, 'package.json'))) {
          throw new Error('Project creation failed: package.json not found');
      }

      // Change to project directory
      process.chdir(projectDir);

      // Install additional dependencies
      const devDeps = [];
      const deps = [];
      if (useTailwind) devDeps.push('@tailwindcss/postcss@latest', 'postcss@latest', 'autoprefixer@latest');
      if (useEslint) devDeps.push('eslint', 'eslint-config-prettier', 'eslint-plugin-react', 'eslint-plugin-react-hooks');
      if (usePrettier) devDeps.push('prettier');
      if (useRouter) deps.push('react-router-dom');

      if (devDeps.length > 0) {
          execSync(`${effectivePackageManager} ${effectivePackageManager === 'yarn' ? 'add -D' : 'install --save-dev'} ${devDeps.join(' ')}`, { stdio: 'inherit' });
      }
      if (deps.length > 0) {
          execSync(`${effectivePackageManager} ${effectivePackageManager === 'yarn' ? 'add' : 'install'} ${deps.join(' ')}`, { stdio: 'inherit' });
      }

      // Configure Tailwind CSS
      if (useTailwind) {
          fs.writeFileSync(path.join(projectDir, 'tailwind.config.js'), `
  /** @type {import('tailwindcss').Config} */
  module.exports = {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: { extend: {} },
      plugins: []
  };
          `);
          fs.writeFileSync(path.join(projectDir, 'postcss.config.cjs'), `
  module.exports = {
      plugins: {
          '@tailwindcss/postcss': {},
          autoprefixer: {}
      }
  };
          `);
          fs.writeFileSync(path.join(projectDir, 'src/index.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;
          `);
      }

      // Configure ESLint
      if (useEslint) {
          fs.writeFileSync(path.join(projectDir, '.eslintrc.json'), JSON.stringify({
              env: { browser: true, es2021: true },
              extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
              parserOptions: { ecmaVersion: 12, sourceType: 'module' },
              plugins: ['react', 'react-hooks'],
              rules: {}
          }, null, 2));
      }

      // Configure Prettier
      if (usePrettier) {
          fs.writeFileSync(path.join(projectDir, '.prettierrc'), JSON.stringify({
              semi: true,
              trailingComma: 'es5',
              singleQuote: true,
              printWidth: 80,
              tabWidth: 2,
              useTabs: false
          }, null, 2));
      }

      // Configure React Router
      if (useRouter) {
          const mainFile = path.join(projectDir, 'src', useTypescript ? 'main.tsx' : 'main.jsx');
          let mainContent = fs.readFileSync(mainFile, 'utf8');
          mainContent = mainContent.replace(
              `import App from './App'`,
              `import { BrowserRouter } from 'react-router-dom';\nimport App from './App'`
          );
          mainContent = mainContent.replace(
              `<App />`,
              `<BrowserRouter>\n        <App />\n      </BrowserRouter>`
          );
          fs.writeFileSync(mainFile, mainContent);
      }

      // Initialize Git repository
      initializeGit(projectDir);

      // Save metadata
      saveMetadata(projectDir, options);
  }

  module.exports = { createReactProject };