const vscode = require('vscode');
  const Scaffolder = require('./src/scaffolder');

  /**
   * @param {vscode.ExtensionContext} context
   */
  function activate(context) {
      console.log('VSCode Scaffolder is now active!');

      let disposable = vscode.commands.registerCommand('vscodeScaffolder.createProject', async () => {
          try {
              // Prompt for project name
              const projectName = await vscode.window.showInputBox({
                  prompt: 'Enter project name',
                  placeHolder: 'my-react-app',
                  validateInput: (value) => {
                      if (!value || !/^[a-zA-Z0-9_-]+$/.test(value)) {
                          return 'Project name must be non-empty and contain only letters, numbers, hyphens, or underscores';
                      }
                      return null;
                  }
              });
              if (!projectName) return; // User cancelled

              // Prompt for framework (React only for now)
              const framework = await vscode.window.showQuickPick(['React'], {
                  placeHolder: 'Select framework'
              });
              if (!framework) return; // User cancelled

              // Prompt for TypeScript
              const useTypescript = await vscode.window.showQuickPick(['Yes', 'No'], {
                  placeHolder: 'Use TypeScript?'
              });
              if (!useTypescript) return; // User cancelled

              // Prompt for Tailwind CSS
              const useTailwind = await vscode.window.showQuickPick(['Yes', 'No'], {
                  placeHolder: 'Use Tailwind CSS?'
              });
              if (!useTailwind) return; // User cancelled

              // Prompt for ESLint
              const useEslint = await vscode.window.showQuickPick(['Yes', 'No'], {
                  placeHolder: 'Use ESLint?'
              });
              if (!useEslint) return; // User cancelled

              // Prompt for Prettier
              const usePrettier = await vscode.window.showQuickPick(['Yes', 'No'], {
                  placeHolder: 'Use Prettier?'
              });
              if (!usePrettier) return; // User cancelled

              // Prompt for React Router
              const useRouter = await vscode.window.showQuickPick(['Yes', 'No'], {
                  placeHolder: 'Use React Router?'
              });
              if (!useRouter) return; // User cancelled

              // Prompt for package manager
              const packageManager = await vscode.window.showQuickPick(['npm', 'yarn', 'pnpm'], {
                  placeHolder: 'Select package manager'
              });
              if (!packageManager) return; // User cancelled

              // Create options object
              const options = {
                  projectName,
                  framework: framework.toLowerCase(),
                  useTypescript: useTypescript === 'Yes',
                  useTailwind: useTailwind === 'Yes',
                  useEslint: useEslint === 'Yes',
                  usePrettier: usePrettier === 'Yes',
                  useRouter: useRouter === 'Yes',
                  packageManager
              };

              // Initialize scaffolder and create project
              const scaffolder = new Scaffolder();
              await scaffolder.createProject(options);

              vscode.window.showInformationMessage(`Project ${projectName} created successfully!`);
          } catch (error) {
              vscode.window.showErrorMessage(`Failed to create project: ${error.message}`);
          }
      });

      context.subscriptions.push(disposable);
  }

  function deactivate() {}

  module.exports = {
      activate,
      deactivate
  };