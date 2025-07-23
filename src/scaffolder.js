const { createReactProject } = require('./frameworks/react');
  const { createVueProject } = require('./frameworks/vue');
  const path = require('path');

  class Scaffolder {
      async createProject(options) {
          const { framework, projectName } = options;
          const projectPath = path.join(projectName);

          if (framework === 'react') {
              await createReactProject(projectPath, options);
          } else if (framework === 'vue') {
              await createVueProject(projectPath, options);
          } else {
              throw new Error('Unsupported framework');
          }
      }
  }

  module.exports = Scaffolder;