const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const { initializeGit } = require('../utils/git');
  const { saveMetadata } = require('../utils/metadata');

  async function createReactProject(projectPath, options) {
      const { projectName, useTypescript, useTailwind, useEslint, usePrettier, useRouter, packageManager } = options;

      // Check package manager availability
      if (packageManager === 'pnpm') {
          try {
              execSync('pnpm --version', { stdio: 'ignore' });
          } catch (error) {
              throw new Error('pnpm-not-installed');
          }
      }

      // Ensure project directory exists
      const projectDir = path.resolve(projectPath);
      if (!fs.existsSync(projectDir)) {
          fs.mkdirSync(projectDir, { recursive: true });
      }

      // Create Vite project
      const template = useTypescript ? 'react-ts' : 'react';
      const viteCommand = packageManager === 'pnpm' ? 'create vite' : 'create vite@latest';
      execSync(`${packageManager} ${viteCommand} ${projectName} --template ${template}`, {
          cwd: path.dirname(projectDir),
          stdio: 'inherit'
      });

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
          execSync(`${packageManager} ${packageManager === 'yarn' ? 'add -D' : 'install --save-dev'} ${devDeps.join(' ')}`, { stdio: 'inherit' });
      }
      if (deps.length > 0) {
          execSync(`${packageManager} ${packageManager === 'yarn' ? 'add' : 'install'} ${deps.join(' ')}`, { stdio: 'inherit' });
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