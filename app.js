const STORAGE_KEY = 'portfolio_cms_state';

const renderSection = (id, html) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (html) { 
        el.innerHTML = html; 
        el.classList.remove('hidden'); 
    } else { 
        el.classList.add('hidden'); 
    }
};

// 🌟 THE FIXED TYPEWRITER LOGIC
const typeEffect = (element, texts, wait = 3000) => {
    let txtIndex = 0, charIndex = 0, isDeleting = false;
    const type = () => {
        if(!element) return;
        const current = texts[txtIndex % texts.length];
        element.innerHTML = current.substring(0, charIndex);
        
        if(!isDeleting && charIndex < current.length) { 
            charIndex++; 
            setTimeout(type, 100); 
        }
        else if(isDeleting && charIndex > 0) { 
            charIndex--; 
            setTimeout(type, 50); 
        }
        else { 
            isDeleting = !isDeleting; 
            if (!isDeleting) txtIndex++; // Successfully moves to the next word
            setTimeout(type, isDeleting ? wait : 500); 
        }
    };
    type();
};

document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const state = stored ? JSON.parse(stored) : null;

    if (!state) { 
        console.error("No CMS Data found. Please login to Admin panel."); 
        return; 
    }

    // 1. RENDER HERO
    if (state.hero && state.hero.name) {
        const h = state.hero;
        const bgImage = h.media?.profilePhoto ? `background-image: url('${h.media.profilePhoto}');` : 'background: var(--bg-base);';
            
        renderSection('hero', `
            <div class="hero-bg" style="${bgImage}">
                <div class="hero-overlay">
                    <div class="pulse-container"><div class="pulse"></div> ${h.meta?.availability || 'Available to Work'}</div>
                    <h1 class="hero-title">Hi, I'm ${h.name}</h1>
                    <h2 class="hero-subtitle">${h.title || ''}</h2>
                    <h3 class="hero-typing"><span id="typewriter" class="typing"></span></h3>
                    <p class="hero-desc">${h.valueProp || ''}</p>
                    
                    <a href="#education" class="scroll-indicator">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 5v14M19 12l-7 7-7-7"/>
                        </svg>
                    </a>
                </div>
            </div>
        `);
        if (h.meta?.dynamicText && h.meta.dynamicText.length > 0) {
            typeEffect(document.getElementById('typewriter'), h.meta.dynamicText);
        }
    }

    // 2. RENDER EDUCATION TIMELINE
    const renderTimeline = (arr, mapper) => arr && arr.length ? `<div class="timeline">${arr.map(mapper).join('')}</div>` : '';
    const eduHTML = state.education && state.education.length 
        ? `<h2 class="section-title">Education Timeline</h2>` + renderTimeline(state.education, e => `
            <div class="timeline-item glass-card" style="margin-bottom: 0;">
                <h3 style="color:var(--primary); margin-bottom:0.5rem">${e.course || 'Degree Title'}</h3>
                <p style="font-weight:600; font-size:1.1rem">${e.institution || 'Institution Name'}</p>
                <p class="text-muted" style="margin-top:0.5rem">📅 ${e.from || 'Start'} - ${e.to || 'End'}</p>
            </div>`) 
        : '';
    renderSection('education', eduHTML);

    // 3. RENDER CONTENT GRIDS
    const renderCards = (arr, mapper) => arr && arr.length ? `<div class="grid">${arr.map(mapper).join('')}</div>` : '';
    
    const certHTML = state.certifications && state.certifications.length 
        ? `<h2 class="section-title">Certifications</h2>` + renderCards(state.certifications, c => `
            <div class="glass-card">
                ${c.image ? `<img src="${c.image}" class="img-preview">` : ''}
                <h3>${c.title || 'Certification Title'}</h3>
                <p class="text-muted" style="margin-top:0.5rem">${c.desc || 'No description provided.'}</p>
            </div>`) 
        : '';
    renderSection('certifications', certHTML);

    const projHTML = state.projects && state.projects.length 
        ? `<h2 class="section-title">Featured Projects</h2>` + renderCards(state.projects, p => `
            <div class="glass-card">
                ${p.image ? `<img src="${p.image}" class="img-preview">` : ''}
                <h3>${p.title || 'Project Title'}</h3>
                <p class="text-muted" style="margin-top:0.5rem">${p.desc || 'No description provided.'}</p>
            </div>`) 
        : '';
    renderSection('projects', projHTML);

    // 4. RENDER CONTACT FORM
    renderSection('contact', `
        <div class="glass-card" style="max-width: 600px; margin: 0 auto; width: 100%;">
            <h2 class="section-title" style="border:none; text-align:center; width:100%;">Let's Build Together</h2>
            <p style="margin-bottom: 2rem; text-align:center; color: var(--text-muted);">Fill out the form below and I'll get back to you shortly.</p>
            <form id="contact-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="hidden" name="access_key" value="882e5816-a0f8-4657-b15b-b86c85e8390b">
                <input type="text" name="name" placeholder="Your Name" required>
                <input type="email" name="email" placeholder="Your Email" required>
                <textarea name="message" placeholder="Your Message" rows="5" required style="resize: vertical;"></textarea>
                <button type="submit" id="submit-btn" class="btn-primary" style="width: 100%; font-size: 1.1rem; margin-top: 0.5rem;">Send Message</button>
                <p id="form-status" style="text-align: center; margin-top: 0.5rem; display: none; color: var(--success); font-weight: bold;"></p>
            </form>
        </div>
    `);

    // 5. WEB3FORMS SUBMISSION LOGIC
    setTimeout(() => {
        const form = document.getElementById('contact-form');
        const status = document.getElementById('form-status');
        const btn = document.getElementById('submit-btn');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); 
                btn.innerText = "Sending..."; 
                
                try {
                    const response = await fetch('https://api.web3forms.com/submit', { 
                        method: 'POST', 
                        body: new FormData(form) 
                    });
                    
                    if (response.ok) {
                        form.reset(); 
                        btn.innerText = "Send Message";
                        status.innerText = "Message sent successfully!";
                        status.style.color = "var(--success)";
                        status.style.display = "block";
                        setTimeout(() => { status.style.display = "none"; }, 5000);
                    } else {
                        throw new Error('Failed');
                    }
                } catch (error) {
                    btn.innerText = "Send Message";
                    status.innerText = "Something went wrong. Please try again.";
                    status.style.color = "var(--danger)"; 
                    status.style.display = "block";
                }
            });
        }
    }, 100);

    // 6. SCROLL REVEAL ANIMATIONS
    setTimeout(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => { 
                if (e.isIntersecting) e.target.classList.add('visible'); 
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }, 100); 

    // 7. SCROLL SPY LOGIC & BRAND LOGO HIDER
    setTimeout(() => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const brandLogo = document.querySelector('.top-right-brand');
        const heroSection = document.getElementById('hero');

        // A. DEDICATED LOGO HIDER (Watches only the Hero Section)
        if (brandLogo && heroSection) {
            const logoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        brandLogo.classList.remove('brand-hidden');
                    } else {
                        brandLogo.classList.add('brand-hidden');
                    }
                });
            }, { threshold: 0.1 }); 
            logoObserver.observe(heroSection);
        }

        // B. NAVIGATION HIGHLIGHTS
        const scrollSpy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.3 }); 
        
        sections.forEach(sec => scrollSpy.observe(sec));
    }, 200);
});

// 8. AUTO-REFRESH MAGIC
window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) window.location.reload();
});