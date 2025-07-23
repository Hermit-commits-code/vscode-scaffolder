const fs = require('fs');
  const path = require('path');

  function saveMetadata(projectPath, options) {
      try {
          const metadata = {
              projectName: options.projectName,
              framework: options.framework,
              useTypescript: options.useTypescript,
              useTailwind: options.useTailwind,
              useEslint: options.useEslint,
              usePrettier: options.usePrettier,
              useRouter: options.useRouter,
              packageManager: options.packageManager,
              createdAt: new Date().toISOString(),
              version: '1.0.0'
          };
          fs.writeFileSync(path.join(projectPath, '.scaffold.json'), JSON.stringify(metadata, null, 2));
      } catch (error) {
          throw new Error(`Failed to save metadata: ${error.message}`);
      }
  }

  module.exports = { saveMetadata };