const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const { initializeGit } = require('../utils/git');
  const { saveMetadata } = require('../utils/metadata');

  async function createVueProject(projectPath, options) {
      const { projectName, useTypescript, useTailwind, useEslint, usePrettier, useRouter, packageManager } = options;

      // Create Vite project
      const template = useTypescript ? 'vue-ts' : 'vue';
      execSync(`${packageManager} create vite@latest ${projectName} -- --template ${template}`, {
          cwd: path.dirname(projectPath),
          stdio: 'inherit'
      });

      // Change to project directory
      process.chdir(projectPath);

      // Install additional dependencies
      const devDeps = [];
      const deps = [];
      if (useTailwind) devDeps.push('@tailwindcss/postcss@latest', 'postcss@latest', 'autoprefixer@latest');
      if (useEslint) devDeps.push('eslint', 'eslint-config-prettier', 'eslint-plugin-vue');
      if (usePrettier) devDeps.push('prettier');
      if (useRouter) deps.push('vue-router@4');

      if (devDeps.length > 0) {
          execSync(`${packageManager} ${packageManager === 'yarn' ? 'add -D' : 'install --save-dev'} ${devDeps.join(' ')}`, { stdio: 'inherit' });
      }
      if (deps.length > 0) {
          execSync(`${packageManager} ${packageManager === 'yarn' ? 'add' : 'install'} ${deps.join(' ')}`, { stdio: 'inherit' });
      }

      // Configure Tailwind CSS
      if (useTailwind) {
          fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), `
  /** @type {import('tailwindcss').Config} */
  module.exports = {
      content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
      theme: { extend: {} },
      plugins: []
  };
          `);
          fs.writeFileSync(path.join(projectPath, 'postcss.config.cjs'), `
  module.exports = {
      plugins: {
          '@tailwindcss/postcss': {},
          autoprefixer: {}
      }
  };
          `);
          fs.writeFileSync(path.join(projectPath, 'src/style.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;
          `);
          // Update main.js/ts to import style.css
          const mainFile = path.join(projectPath, 'src', useTypescript ? 'main.ts' : 'main.js');
          let mainContent = fs.readFileSync(mainFile, 'utf8');
          mainContent = mainContent.replace(
              `import { createApp } from 'vue'`,
              `import { createApp } from 'vue'\nimport './style.css'`
          );
          fs.writeFileSync(mainFile, mainContent);
      }

      // Configure ESLint
      if (useEslint) {
          fs.writeFileSync(path.join(projectPath, '.eslintrc.json'), JSON.stringify({
              env: { browser: true, es2021: true },
              extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier'],
              parser: 'vue-eslint-parser',
              parserOptions: { ecmaVersion: 12, sourceType: 'module' },
              plugins: ['vue'],
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

      // Configure Vue Router
      if (useRouter) {
          // Create router.js/ts
          const routerFile = path.join(projectPath, 'src', useTypescript ? 'router.ts' : 'router.js');
          fs.writeFileSync(routerFile, `
${useTypescript ? 'import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";' : 'import { createRouter, createWebHistory } from "vue-router";'}
import Home from './views/Home.vue';

const routes${useTypescript ? ': RouteRecordRaw[]' : ''} = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
          `);
          // Create Home.vue
          fs.mkdirSync(path.join(projectPath, 'src/views'), { recursive: true });
          fs.writeFileSync(path.join(projectPath, 'src/views/Home.vue'), `
<template>
  <div class="home">
    <h1>Welcome to ${projectName}</h1>
  </div>
</template>

<script${useTypescript ? ' lang="ts"' : ''}>
${useTypescript ? 'import { defineComponent } from "vue";\nexport default defineComponent({\n  name: "Home"\n});' : 'export default { name: "Home" };'}
</script>

<style scoped>
.home {
  text-align: center;
}
</style>
          `);
          // Update main.js/ts
          const mainFile = path.join(projectPath, 'src', useTypescript ? 'main.ts' : 'main.js');
          let mainContent = fs.readFileSync(mainFile, 'utf8');
          mainContent = mainContent.replace(
              `import App from './App.vue'`,
              `import App from './App.vue'\nimport router from './router'`
          );
          mainContent = mainContent.replace(
              `createApp(App).mount('#app')`,
              `createApp(App).use(router).mount('#app')`
          );
          fs.writeFileSync(mainFile, mainContent);
          // Update App.vue
          const appFile = path.join(projectPath, 'src/App.vue');
          fs.writeFileSync(appFile, `
<template>
  <router-view />
</template>

<script${useTypescript ? ' lang="ts"' : ''}>
${useTypescript ? 'import { defineComponent } from "vue";\nexport default defineComponent({\n  name: "App"\n});' : 'export default { name: "App" };'}
</script>
          `);
      }

      // Initialize Git repository
      initializeGit(projectPath);

      // Save metadata
      saveMetadata(projectPath, options);
  }

  module.exports = { createVueProject };