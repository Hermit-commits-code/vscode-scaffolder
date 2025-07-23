const path = require('path');
  const { createReactProject } = require('./frameworks/react');
  const { createVueProject } = require('./frameworks/vue');

  class Scaffolder {
      async createProject(options) {
          const { projectName, framework, packageManager } = options;
          const projectPath = path.join(process.cwd(), projectName);

          if (!['npm', 'yarn', 'pnpm'].includes(packageManager)) {
              throw new Error('Invalid package manager. Use npm, yarn, or pnpm.');
          }

          if (framework === 'react') {
              await createReactProject(projectPath, options);
          } else if (framework === 'vue') {
              await createVueProject(projectPath, options);
          } else {
              throw new Error(`Unsupported framework: ${framework}`);
          }
      }
  }

  module.exports = Scaffolder;