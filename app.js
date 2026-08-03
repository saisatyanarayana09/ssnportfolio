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

// 🌟 THE TYPEWRITER LOGIC
const typeEffect = (element, texts, wait = 3000) => {
    let txtIndex = 0, charIndex = 0, isDeleting = false;
    const type = () => {
        if(!element || !texts || texts.length === 0) return;
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

document.addEventListener("DOMContentLoaded", async () => {
    let state = null;
    
    try {
        // 🚀 THE CACHE BUSTER: Forces the browser to pull the absolute newest data.json every time
        const timestamp = new Date().getTime();
        const response = await fetch(`data.json?t=${timestamp}`, { cache: "no-store" });
        
        if (response.ok) {
            state = await response.json();
        } else {
            console.error("No live data.json found. The portfolio is currently empty.");
            return;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!state) return;

    // 1. RENDER HERO (Split Layout)
    if (state.hero && state.hero.name) {
        const h = state.hero;
        
        // Dynamic Meta Badges
        const availHtml = h.meta?.availability ? `<div class="pulse-container"><div class="pulse"></div> ${h.meta.availability}</div>` : '';
        const locHtml = h.meta?.location ? `<div class="location-badge" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid var(--glass-border); font-weight: 600;">📍 ${h.meta.location}</div>` : '';
        
        // Social Toggle Logic
        const socialHtml = h.toggles?.showSocial ? `
            <div class="social-links" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-start;">
                <a href="#" target="_blank" class="btn-outline">GitHub</a>
                <a href="#" target="_blank" class="btn-outline">LinkedIn</a>
            </div>` : '';
            
        renderSection('hero', `
            <div class="hero-content">
                <div class="hero-text">
                    <div class="hero-badges" style="display: flex; gap: 1rem; justify-content: flex-start; margin-bottom: 1.5rem;">
                        ${availHtml} ${locHtml}
                    </div>
                    <h1 class="hero-title">Hi, I'm <br/> <span style="color: var(--text-main);">${h.name}</span></h1>
                    <h2 class="hero-subtitle">${h.title || ''}</h2>
                    <h3 class="hero-typing"><span id="typewriter" class="typing"></span></h3>
                    <p class="hero-desc">${h.valueProp || ''}</p>
                    ${socialHtml}
                </div>
                
                <div class="hero-visual">
                    <div class="hero-image-wrapper glass-card">
                        ${h.media?.profilePhoto ? `<img src="${h.media.profilePhoto}" class="hero-img" alt="Profile Photo">` : `<div style="color: var(--text-muted); text-align:center; padding: 4rem;">No Image Uploaded</div>`}
                    </div>
                </div>
            </div>
            
            <a href="#education" class="scroll-indicator">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
            </a>
        `);
        
        if (h.meta?.dynamicText && h.meta.dynamicText.length > 0) {
            typeEffect(document.getElementById('typewriter'), h.meta.dynamicText);
        }
    }

    // 2. RENDER EDUCATION TIMELINE
    // Filter out blank entries
    const validEdu = (state.education || []).filter(e => e.course || e.institution);
    
    const renderTimeline = (arr, mapper) => arr && arr.length ? `<div class="timeline">${arr.map(mapper).join('')}</div>` : '';
    const eduHTML = validEdu.length 
        ? `<h2 class="section-title">Education Timeline</h2>` + renderTimeline(validEdu, e => `
            <div class="timeline-item glass-card" style="margin-bottom: 0;">
                <h3 style="color:var(--primary); margin-bottom:0.5rem">${e.course || 'Degree Title'}</h3>
                <p style="font-weight:600; font-size:1.1rem">${e.institution || 'Institution Name'}</p>
                <p class="text-muted" style="margin-top:0.5rem">📅 ${e.from || 'Start'} - ${e.to || 'End'}</p>
            </div>`) 
        : '';
    renderSection('education', eduHTML);

    // 3. RENDER CONTENT GRIDS
    // Filter out blank entries so empty cards don't render
    const validCerts = (state.certifications || []).filter(c => c.title);
    const validProjs = (state.projects || []).filter(p => p.title);
    
    const renderCards = (arr, mapper) => arr && arr.length ? `<div class="grid">${arr.map(mapper).join('')}</div>` : '';
    
    const certHTML = validCerts.length 
        ? `<h2 class="section-title">Certifications</h2>` + renderCards(validCerts, c => `
            <div class="glass-card">
                ${c.image ? `<img src="${c.image}" class="img-preview" alt="${c.title}">` : ''}
                <h3>${c.title}</h3>
                <p class="text-muted" style="margin-top:0.5rem">${c.desc || ''}</p>
            </div>`) 
        : '';
    renderSection('certifications', certHTML);

    const projHTML = validProjs.length 
        ? `<h2 class="section-title">Featured Projects</h2>` + renderCards(validProjs, p => `
            <div class="glass-card">
                ${p.image ? `<img src="${p.image}" class="img-preview" alt="${p.title}">` : ''}
                <h3>${p.title}</h3>
                <p class="text-muted" style="margin-top:0.5rem">${p.desc || ''}</p>
            </div>`) 
        : '';
    renderSection('projects', projHTML);

    // 4. RENDER CONTACT FORM (Dynamic Endpoint)
    const formEndpoint = state.contact?.formEndpoint || 'https://api.web3forms.com/submit';
    
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

    // 5. FORM SUBMISSION LOGIC
    setTimeout(() => {
        const form = document.getElementById('contact-form');
        const status = document.getElementById('form-status');
        const btn = document.getElementById('submit-btn');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault(); 
                btn.innerText = "Sending..."; 
                
                try {
                    // Uses the dynamic endpoint from the CMS!
                    const response = await fetch(formEndpoint, { 
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

        // A. DEDICATED LOGO HIDER
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
