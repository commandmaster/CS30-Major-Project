let scriptName = process.argv[2];
let scriptType = process.argv[3];

if (scriptName === undefined || scriptType === undefined) {
    console.log('Please provide a script name and type');
    process.exit(1);
}


const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


scriptName = scriptName.trim();
scriptName = scriptName.replaceAll(' ', '');
scriptName = scriptName[0].toUpperCase() + scriptName.slice(1);

scriptType = scriptType.trim();
scriptType = scriptType.replaceAll(' ', '');
scriptType = scriptType.toLowerCase();

const scriptTypes = new Map([
    ['entity', 'entityScripts'],
    ['level', 'levelScripts'],
]);

const scriptTemplates = new Map([
    ['entity', 'entityTemplate.ejs'],
    ['level', 'levelManagerTemplate.ejs'],
]);

const namingConvention = new Map([
    ['entity', ''],
    ['level', 'LevelManager'],
]);

if (!scriptTypes.has(scriptType)) {
    console.log('Invalid script type');
    process.exit(1);
}

async function createTheScript(){
    const destinationPath = path.join(__dirname, '../public', 'assets', 'scripts', scriptTypes.get(scriptType));
    const sourceTemplatePath = path.join(__dirname, 'scriptingTemplates', scriptTemplates.get(scriptType));  
    const templateContent = await fs.promises.readFile(sourceTemplatePath)

    const scriptPath = path.join(destinationPath, scriptName + namingConvention.get(scriptType) + '.js');
    const renderedTemplate = ejs.render(templateContent.toString(), {className: scriptName + namingConvention.get(scriptType)});
    await fs.promises.writeFile(scriptPath, renderedTemplate, 'utf8');

    console.log('Script created successfully at ' + scriptPath);
}

createTheScript();

