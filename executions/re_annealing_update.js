/**
 * @file re_annealing_update.js
 * @description Updates the ARI directives based on feedback to prevent future false positives.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../directives/ari_config.json');

function updateSkipList(newBadKeyword) {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

        if (!config.re_annealing.auto_skip_keywords.includes(newBadKeyword)) {
            config.re_annealing.auto_skip_keywords.push(newBadKeyword);
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
            console.log(`Successfully added "${newBadKeyword}" to skip list. System has 're-annealed'.`);
            return { success: true, message: `Added ${newBadKeyword}` };
        }

        return { success: false, message: "Keyword already exists." };
    } catch (error) {
        console.error("Failed to update config:", error.message);
        return { success: false, error: error.message };
    }
}

// In n8n, this would be a 'Code' node receiving the feedback reason
// const reason = $json.feedback_reason;
// return updateSkipList(reason);

module.exports = { updateSkipList };
