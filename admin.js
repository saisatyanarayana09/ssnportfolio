// --- UPDATE YOUR SAVING FUNCTION WITH THIS ---
async function saveStateToStorage() {
    // 1. Grab Modal Elements
    const modal = document.getElementById('save-modal');
    const spinner = document.getElementById('modal-spinner');
    const text = document.getElementById('modal-text');
    const subtext = document.getElementById('modal-subtext');
    const closeBtn = document.getElementById('modal-close');
    const saveBtn = document.getElementById('manual-save-btn');

    // 2. Phase A: Trigger Modal & Lock UI
    modal.classList.remove('hidden');
    spinner.classList.remove('hidden');
    closeBtn.classList.add('hidden');
    
    text.innerText = "Encrypting & Syncing to GitHub...";
    text.style.color = "var(--text-main)";
    subtext.innerText = "Please do not close this tab.";
    subtext.classList.remove('hidden');
    
    saveBtn.disabled = true; 
    saveBtn.innerText = "Syncing...";

    try {
        // Base64 encode the JSON, handling special characters and emojis safely
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));
        
        // Setup API Body
        const body = {
            message: "CMS Update: Data Synced via Admin Panel",
            content: content,
            sha: currentSha
        };

        // GitHub API Call
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("GitHub API rejected the update");

        const data = await response.json();
        currentSha = data.content.sha; // Update SHA for next time

        // 3. Phase B: Success State
        spinner.classList.add('hidden');
        subtext.classList.add('hidden');
        text.innerText = "Data Successfully Synchronized!";
        text.style.color = "var(--success)"; // Turns Green

        // 4. Phase C: Auto-Close Modal
        setTimeout(() => {
            modal.classList.add('hidden');
            saveBtn.disabled = false;
            saveBtn.innerText = "Force Sync to Repo";
        }, 1500);

    } catch (error) {
        // 5. Error State
        console.error("Save Error:", error);
        
        spinner.classList.add('hidden');
        subtext.classList.add('hidden');
        text.innerText = "Sync Failed. Check Console.";
        text.style.color = "var(--danger)"; // Turns Red
        
        closeBtn.classList.remove('hidden'); // Let user manually close it
        saveBtn.disabled = false;
        saveBtn.innerText = "Force Sync to Repo";
    }
}
