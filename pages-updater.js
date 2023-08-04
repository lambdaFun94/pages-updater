const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pagesImportRegex = /"@yext\/pages\/components"/g;
const replacementText = '"@yext/sites-components"';

// Function to install npm packages
const installPackages = (targetDirectory) => {
  try {
    execSync(`npm install @yext/pages@latest @yext/sites-components@latest --prefix ${targetDirectory}`, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error installing packages:', error.message);
    process.exit(1);
  }
};

// Function to recursively process and replace imports in files
const processDirectoryRecursively = (currentPath) => {
  const files = fs.readdirSync(currentPath);

  files.forEach((file) => {
    const filePath = path.join(currentPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isGitDirectory = path.basename(filePath) === '.git';
    const isNodeModulesDirectory = path.basename(filePath) === 'node_modules';
    const fileExtension = path.extname(filePath);

    if (isDirectory && !isGitDirectory && !isNodeModulesDirectory) {
      processDirectoryRecursively(filePath);
    } else if ([".js", ".ts", ".tsx"].includes(fileExtension) && !isNodeModulesDirectory) {
      replaceImports(filePath);
    }
  });
};

// Function to replace imports in a file
const replaceImports = (filePath) => {
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    const modifiedContent = fileContent.replace(pagesImportRegex, replacementText);
    fs.writeFileSync(filePath, modifiedContent, 'utf8'); // Update the file content
    console.log(`Imports replaced in: ${filePath}`);
  } catch (error) {
    console.error('Error processing file:', error.message);
  }
};

// Function to update package.json scripts
const updatePackageScripts = (targetDirectory) => {
  const packageJsonPath = path.resolve(targetDirectory, 'package.json');

  try {
    const packageJson = require(packageJsonPath);
    packageJson.scripts = {
      "dev": "pages dev",
      "prod": "pages prod"
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json scripts updated.');
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
};

// Entry point
const main = async () => {
  if (process.argv.length !== 3) {
    console.error('Usage: node script.js <directoryPath>');
    process.exit(1);
  }

  const directoryPath = process.argv[2];

  // Install packages, recursively process imports (excluding .git and node_modules directories), and update package.json scripts in the specified directory
  installPackages(directoryPath);
  processDirectoryRecursively(directoryPath);
  updatePackageScripts(directoryPath);
};

main();

