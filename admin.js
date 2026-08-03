// ==========================================
// ⚠️ CONFIGURATION: SET YOUR GITHUB DETAILS HERE
// ==========================================
const REPO_OWNER = 'saisatyanarayana09'; 
const REPO_NAME = 'ssnportfolio';       
const FILE_PATH = 'data.json';
// ==========================================

let currentToken = '';
let currentSha = '';
let state = {
    hero: { meta: {}, toggles: {} },
    education: [],
    certifications: [],
    projects: [],
    contact: {}
};

// 1. AUTHENTICATION LOGIC
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('gh-token').value.trim();
    const btn = e.target.querySelector('button');
    btn.innerText = "Authenticating...";

    try {
        // Fetch data.json to validate token and get current file SHA
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error("Invalid Token or Repo not found.");

        const data = await response.json();
        currentToken = token;
        currentSha = data.sha;
        
        // Decode JSON safely (Handles emojis and special characters)
        const decoded = decodeURIComponent(escape(atob(data.content)));
        state = JSON.parse(decoded);

        // Hide Login, Show Dashboard
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        // Initialize Dashboard Fields
        initDashboard();

    } catch (error) {
        console.error(error);
        alert("Login failed! Check your token, username, and repo name.");
        btn.innerText = "Execute Access";
    }
});

// 2. LOGOUT LOGIC
document.getElementById('logout-btn').addEventListener('click', () => {
    currentToken = '';
    currentSha = '';
    document.getElementById('gh-token').value = '';
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
});

// 3. TAB NAVIGATION
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
});

// 4. DATA BINDING & INITIALIZATION
function initDashboard() {
    // Populate Hero Tab
    if (state.hero) {
        document.getElementById('h-name').value = state.hero.name || '';
        document.getElementById('h-title').value = state.hero.title || '';
        document.getElementById('h-valueProp').value = state.hero.valueProp || '';
        
        if (state.hero.meta) {
            document.getElementById('h-dynText').value = state.hero.meta.dynamicText ? state.hero.meta.dynamicText.join(', ') : '';
            document.getElementById('h-location').value = state.hero.meta.location || '';
            document.getElementById('h-avail').value = state.hero.meta.availability || '';
        }
        if (state.hero.toggles) {
            document.getElementById('t-social').checked = !!state.hero.toggles.showSocial;
            document.getElementById('t-clients').checked = !!state.hero.toggles.showClientLogos;
        }
        if (state.hero.media && state.hero.media.profilePhoto) {
            const preview = document.getElementById('h-photo-preview');
            preview.src = state.hero.media.profilePhoto;
            preview.classList.remove('hidden');
        }
    }
    
    // Populate Contact Tab
    if (state.contact) {
        document.getElementById('c-endpoint').value = state.contact.formEndpoint || '';
    }

    // Render Arrays
    renderList('edu-list', state.education, 'education');
    renderList('cert-list', state.certifications, 'certifications');
    renderList('proj-list', state.projects, 'projects');
}

// 5. UPDATE FUNCTIONS (Triggered by HTML onchange)
window.updateHero = (key, value) => {
    state.hero = state.hero || {};
    state.hero[key] = value;
};

window.updateHeroMeta = (key, value) => {
    state.hero = state.hero || {};
    state.hero.meta = state.hero.meta || {};
    state.hero.meta[key] = value;
};

// Auto-Compress Profile Image via HTML5 Canvas
window.handleHeroImage = (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width, height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
            
            state.hero = state.hero || {};
            state.hero.media = state.hero.media || {};
            state.hero.media.profilePhoto = dataUrl;
            
            const preview = document.getElementById('h-photo-preview');
            preview.src = dataUrl;
            preview.classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// 6. DYNAMIC LIST RENDERING (Education, Certifications, Projects)
function renderList(containerId, arrayData, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    (arrayData || []).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'accordion-item';
        div.innerHTML = `
            <div class="accordion-header">
                <span>[${index}] ${item.title || item.course || 'New Entry'}</span>
                <button class="btn-outline btn-danger" style="padding: 0.2rem 0.5rem;" onclick="removeItem('${type}', ${index})">DEL</button>
            </div>
            <div class="accordion-body">
                <input class="saas-input" placeholder="Title / Role / Degree" value="${item.title || item.course || ''}" onchange="updateArrayItem('${type}', ${index}, '${type === 'education' ? 'course' : 'title'}', this.value)">
                ${type === 'education' ? `<input class="saas-input" placeholder="Institution" value="${item.institution || ''}" onchange="updateArrayItem('${type}', ${index}, 'institution', this.value)">` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

window.updateArrayItem = (type, index, key, value) => {
    state[type][index][key] = value;
};

window.removeItem = (type, index) => {
    state[type].splice(index, 1);
    renderList(`${type === 'education' ? 'edu' : type === 'certifications' ? 'cert' : 'proj'}-list`, state[type], type);
};

// Add Item Buttons
document.getElementById('add-edu').addEventListener('click', () => {
    state.education = state.education || [];
    state.education.push({ course: '', institution: '', from: '', to: '' });
    renderList('edu-list', state.education, 'education');
});
document.getElementById('add-cert').addEventListener('click', () => {
    state.certifications = state.certifications || [];
    state.certifications.push({ title: '', desc: '', image: '' });
    renderList('cert-list', state.certifications, 'certifications');
});
document.getElementById('add-proj').addEventListener('click', () => {
    state.projects = state.projects || [];
    state.projects.push({ title: '', desc: '', image: '', link: '' });
    renderList('proj-list', state.projects, 'projects');
});

// 7. SAVE TO GITHUB (WITH MODAL OVERLAY)
window.saveStateToStorage = async () => {
    const modal = document.getElementById('save-modal');
    const spinner = document.getElementById('modal-spinner');
    const text = document.getElementById('modal-text');
    const subtext = document.getElementById('modal-subtext');
    const closeBtn = document.getElementById('modal-close');
    const saveBtn = document.getElementById('manual-save-btn');

    // Trigger Modal
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
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));
        
        const body = {
            message: "CMS Update: Data Synced via Admin Panel",
            content: content,
            sha: currentSha
        };

        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("GitHub API rejected the update");

        const data = await response.json();
        currentSha = data.content.sha; // Update SHA

        // Success state
        spinner.classList.add('hidden');
        subtext.classList.add('hidden');
        text.innerText = "Data Successfully Synchronized!";
        text.style.color = "var(--success)";

        // Auto close modal
        setTimeout(() => {
            modal.classList.add('hidden');
            saveBtn.disabled = false;
            saveBtn.innerText = "Force Sync to Repo";
        }, 1500);

    } catch (error) {
        // Error state
        console.error("Save Error:", error);
        spinner.classList.add('hidden');
        subtext.classList.add('hidden');
        text.innerText = "Sync Failed. Check Console.";
        text.style.color = "var(--danger)"; 
        closeBtn.classList.remove('hidden');
        saveBtn.disabled = false;
        saveBtn.innerText = "Force Sync to Repo";
    }
};
