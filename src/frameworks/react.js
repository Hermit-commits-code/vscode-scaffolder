const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  async function createReactProject(projectPath, options) {
      const { projectName, useTypescript, useTailwind, useEslint, usePrettier, useRouter, packageManager } = options;

      // Create Vite project
      const template = useTypescript ? 'react-ts' : 'react';
      execSync(`${packageManager} create vite@latest ${projectName} -- --template ${template}`, {
          cwd: path.dirname(projectPath),
          stdio: 'inherit'
      });

      // Change to project directory
      process.chdir(projectPath);

      // Install additional dependencies
      const devDeps = [];
      const deps = [];
      if (useTailwind) devDeps.push('tailwindcss', 'postcss', 'autoprefixer');
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
          execSync(`${packageManager} run tailwindcss init -p`, { stdio: 'inherit' });
          fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), `
  /** @type {import('tailwindcss').Config} */
  module.exports = {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: { extend: {} },
      plugins: []
  };
          `);
          fs.appendFileSync(path.join(projectPath, 'src/index.css'), `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
          `);
      }

      // Configure ESLint
      if (useEslint) {
          fs.writeFileSync(path.join(projectPath, '.eslintrc.json'), JSON.stringify({
              env: { browser: true, es2021: true },
              extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
              parserOptions: { ecmaVersion: 12, sourceType: 'module' },
              plugins: ['react', 'react-hooks'],
              rules: {}
          }, null, 2));
      }

      // Configure Prettier
      if (usePrettier) {
          fs.writeFileSync(path.join(projectPath, '.prettierrc'), JSON.stringify({
              semi: true,
              trailingComma: 'es5',
              singleQuote: true,
              printWidth: 80,
              tabWidth: 2,
              useTabs: false
          }, null, 2));
      }

      // Configure React Router (basic setup)
      if (useRouter) {
          const mainFile = path.join(projectPath, 'src', useTypescript ? 'main.tsx' : 'main.jsx');
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
  }

  module.exports = { createReactProject };