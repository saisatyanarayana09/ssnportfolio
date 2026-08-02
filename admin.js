// --- CONFIGURATION ---
const REPO_OWNER = 'saisatyanarayana09';
const REPO_NAME = 'ssnportfolio';
const FILE_PATH = 'data.json';
let state = { hero: { meta: { dynamicText: [] }, toggles: {}, media: {} }, education: [], certifications: [], projects: [], contact: {} };
let currentSha = null;
let currentToken = null; 

const saveIndicator = document.getElementById('save-indicator');

// 1. Fetch data from GitHub on Login
async function fetchFromGitHub(token) {
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (!res.ok) {
            if (res.status === 404) return true; // File doesn't exist yet, start fresh
            throw new Error("Invalid Token");
        }
        
        const data = await res.json();
        currentSha = data.sha;
        // EMOJI FIX: Properly decode Unicode/Emojis from GitHub's Base64
        state = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// 2. Save Data to GitHub
window.saveStateToStorage = async () => {
    if (!currentToken) return;
    saveIndicator.innerHTML = `<div class="dot" style="background: var(--text-muted); box-shadow: none;"></div> Saving to GitHub...`;
    
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Update via Neumorphic Portfolio CMS",
                // EMOJI FIX: Properly encode Unicode/Emojis back to Base64
                content: btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2)))),
                sha: currentSha
            })
        });

        if (res.ok) {
            const data = await res.json();
            currentSha = data.content.sha;
            saveIndicator.innerHTML = `<div class="dot"></div> Live on Netlify`;
        } else {
            throw new Error("Failed to save");
        }
    } catch (err) {
        saveIndicator.innerHTML = `<div class="dot" style="background: var(--danger); box-shadow: 0 0 10px var(--danger);"></div> Save Failed`;
    }
};

// 3. Authentication UI Logic
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Mounting Drive...";
    
    const token = document.getElementById('gh-token').value;
    const success = await fetchFromGitHub(token);
    
    if (success) {
        currentToken = token;
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        initAdmin();
    } else {
        btn.innerText = "Mount & Authenticate";
        const form = document.getElementById('login-form');
        form.style.animation = 'none';
        void form.offsetWidth; // Reflow
        form.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        alert("Authentication Failed. Check Token & Repo Permissions.");
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    currentToken = null;
    window.location.reload(); 
});

// 4. Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active'); 
        document.getElementById(e.currentTarget.dataset.tab).classList.add('active');
    });
});

// 5. Canvas Compression Engine
const processImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width, height = img.height;
                if (width > MAX_WIDTH) { height = height * (MAX_WIDTH / width); width = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
};

// 6. Accordion & Array Logic
window.toggleAccordion = (element) => {
    const body = element.nextElementSibling;
    const icon = element.querySelector('.toggle-icon');
    if (body.style.display === "none") {
        body.style.display = "block";
        icon.style.transform = "rotate(180deg)";
    } else {
        body.style.display = "none";
        icon.style.transform = "rotate(0deg)";
    }
};

window.updateArrayItem = (arrName, index, key, value) => {
    state[arrName][index][key] = value;
    saveStateToStorage();
    if(key === 'title' || key === 'course') document.getElementById(`${arrName}-title-${index}`).innerText = value || 'New Item';
};

const renderList = (arrName, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    (state[arrName] || []).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'accordion-item';
        let inputsHtml = '';
        if (arrName === 'education') {
            inputsHtml = `
                <label class="saas-label">Degree / Course</label>
                <input type="text" class="saas-input" placeholder="e.g. B.Tech Computer Science" value="${item.course || ''}" onchange="updateArrayItem('${arrName}', ${index}, 'course', this.value)">
                <label class="saas-label">Institution Name</label>
                <input type="text" class="saas-input" placeholder="e.g. Tech University" value="${item.institution || ''}" onchange="updateArrayItem('${arrName}', ${index}, 'institution', this.value)">
                <div style="display:flex; gap:1.5rem;">
                    <div style="flex:1"><label class="saas-label">Start Year</label><input type="text" class="saas-input" placeholder="2020" value="${item.from || ''}" onchange="updateArrayItem('${arrName}', ${index}, 'from', this.value)"></div>
                    <div style="flex:1"><label class="saas-label">End Year</label><input type="text" class="saas-input" placeholder="2024" value="${item.to || ''}" onchange="updateArrayItem('${arrName}', ${index}, 'to', this.value)"></div>
                </div>`;
        } else if (arrName === 'certifications' || arrName === 'projects') {
            inputsHtml = `
                <label class="saas-label">Title</label>
                <input type="text" class="saas-input" placeholder="Enter title" value="${item.title || ''}" onchange="updateArrayItem('${arrName}', ${index}, 'title', this.value)">
                <label class="saas-label">Description</label>
                <textarea class="saas-input" rows="3" placeholder="Enter description..." onchange="updateArrayItem('${arrName}', ${index}, 'desc', this.value)">${item.desc || ''}</textarea>
                <label class="saas-label">Thumbnail Upload</label>
                <input type="file" accept="image/*" class="saas-input" style="padding:1rem;" onchange="handleArrayImage(this, '${arrName}', ${index})">
                <img id="${arrName}-preview-${index}" src="${item.image || ''}" class="img-preview-box ${item.image ? '' : 'hidden'}">`;
        }
        const displayTitle = item.title || item.course || `New ${arrName} Item`;
        div.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <strong id="${arrName}-title-${index}">${displayTitle}</strong>
                <div style="display:flex; align-items:center; gap: 1.5rem;">
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn-outline" style="padding: 0.3rem 0.6rem; font-size: 1.1rem;" onclick="event.stopPropagation(); moveItem('${arrName}', ${index}, -1)">↑</button>
                        <button class="btn-outline" style="padding: 0.3rem 0.6rem; font-size: 1.1rem;" onclick="event.stopPropagation(); moveItem('${arrName}', ${index}, 1)">↓</button>
                        <button class="btn-outline btn-danger" style="padding: 0.3rem 0.6rem; font-size: 1.1rem;" onclick="event.stopPropagation(); deleteItem('${arrName}', ${index})">✕</button>
                    </div>
                    <span class="toggle-icon" style="transition: transform 0.3s; color: var(--accent);">▼</span>
                </div>
            </div>
            <div class="accordion-body" style="display:none;">${inputsHtml}</div>`;
        container.appendChild(div);
    });
};

window.moveItem = (arrName, index, dir) => {
    const arr = state[arrName];
    if(index + dir < 0 || index + dir >= arr.length) return;
    [arr[index], arr[index + dir]] = [arr[index + dir], arr[index]];
    refreshLists(); saveStateToStorage();
};
window.deleteItem = (arrName, index) => { state[arrName].splice(index, 1); refreshLists(); saveStateToStorage(); };

const refreshLists = () => { renderList('education', 'edu-list'); renderList('certifications', 'cert-list'); renderList('projects', 'proj-list'); };

document.getElementById('add-edu').onclick = () => { state.education.push({id: Date.now(), course: '', institution: '', from: '', to: ''}); refreshLists(); saveStateToStorage(); };
document.getElementById('add-cert').onclick = () => { state.certifications.push({id: Date.now(), title: '', desc: '', image: ''}); refreshLists(); saveStateToStorage(); };
document.getElementById('add-proj').onclick = () => { state.projects.push({id: Date.now(), title: '', desc: '', image: ''}); refreshLists(); saveStateToStorage(); };

window.handleArrayImage = async (inputElem, arrName, index) => {
    if(inputElem.files[0]) {
        const base64 = await processImage(inputElem.files[0]);
        updateArrayItem(arrName, index, 'image', base64);
        const preview = document.getElementById(`${arrName}-preview-${index}`);
        if(preview) { preview.src = base64; preview.classList.remove('hidden'); }
    }
};
window.handleHeroImage = async (inputElem) => {
    if(inputElem.files[0]) {
        const base64 = await processImage(inputElem.files[0]);
        state.hero.media.profilePhoto = base64; saveStateToStorage();
        const preview = document.getElementById('h-photo-preview');
        preview.src = base64; preview.classList.remove('hidden');
    }
};

window.updateHero = (key, val) => { state.hero[key] = val; saveStateToStorage(); };
window.updateHeroMeta = (key, val) => { state.hero.meta[key] = val; saveStateToStorage(); };

// 7. Initialize Admin UI with Fetched Data
const initAdmin = () => {
    // Populate Hero Basic
    document.getElementById('h-name').value = state.hero?.name || '';
    document.getElementById('h-title').value = state.hero?.title || '';
    document.getElementById('h-valueProp').value = state.hero?.valueProp || '';
    document.getElementById('h-dynText').value = (state.hero?.meta?.dynamicText || []).join(', ');
    
    // Populate Hero Image
    if(state.hero?.media?.profilePhoto) {
        const preview = document.getElementById('h-photo-preview');
        preview.src = state.hero.media.profilePhoto; 
        preview.classList.remove('hidden');
    }

    // Populate Hero Meta & Contact & Toggles
    const locInput = document.getElementById('h-location');
    if (locInput) locInput.value = state.hero?.meta?.location || '';

    const availInput = document.getElementById('h-avail');
    if (availInput) availInput.value = state.hero?.meta?.availability || '';

    const socialToggle = document.getElementById('t-social');
    if (socialToggle) socialToggle.checked = state.hero?.toggles?.showSocial || false;

    const clientsToggle = document.getElementById('t-clients');
    if (clientsToggle) clientsToggle.checked = state.hero?.toggles?.showClientLogos || false;

    const endpointInput = document.getElementById('c-endpoint');
    if (endpointInput) endpointInput.value = state.contact?.formEndpoint || '';

    // Render Arrays
    refreshLists();
};
