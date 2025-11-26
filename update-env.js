const fs = require('fs');
const pathModule = require('path');

function updateFile(filename) {
    const filePath = pathModule.resolve(filename);
    if (!fs.existsSync(filePath)) {
        console.log(`ℹ️ ${filename} does not exist, skipping.`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const newKey = 'SCREENSHOTONE_ACCESS_KEY=80a101e579b70a457ed5';
        const newSecret = 'SCREENSHOTONE_SECRET_KEY=eab3f6800572752dbecf';

        // Update Access Key
        if (content.includes('SCREENSHOTONE_ACCESS_KEY=')) {
            content = content.replace(/SCREENSHOTONE_ACCESS_KEY=.*/g, newKey);
        } else {
            content += `\n${newKey}`;
        }

        // Update Secret Key
        if (content.includes('SCREENSHOTONE_SECRET_KEY=')) {
            content = content.replace(/SCREENSHOTONE_SECRET_KEY=.*/g, newSecret);
        } else {
            content += `\n${newSecret}`;
        }

        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filename} updated successfully`);
    } catch (e) {
        console.error(`❌ Error updating ${filename}:`, e);
    }
}

updateFile('.env');
updateFile('.env.local');
