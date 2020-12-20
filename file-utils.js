
const fs = require('fs');
const path = require("path");

async function loadFile(filePath) {
    try {
        const internalPath = path.resolve(__dirname, filePath);
        const content = await fs.promises.readFile(internalPath, "utf8");
        return JSON.parse(content);
    } catch (e) {
        console.error("Error during loadFile", e);
        return null;
    }
}

async function saveFile(filePath, data) {
    try {
        const internalPath = path.resolve(__dirname, filePath);
        const content = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(internalPath, content);
    } catch (e) {
        console.error("Error during saveFile", e);
    }
}

module.exports = {
    loadFile, saveFile
};