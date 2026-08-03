const renderSection = (id, html) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (html) { el.innerHTML = html; el.classList.remove('hidden'); } 
    else { el.classList.add('hidden'); }
};

// 🌟 THE TYPEWRITER LOGIC
const typeEffect = (element, texts, wait = 3000) => {
    let txtIndex = 0, charIndex = 0, isDeleting = false;
    const type = () => {
        if(!element || !texts || texts.length === 0) return;
        const current = texts[txtIndex % texts.length];
        element.innerHTML = current.substring(0, charIndex);
        
        if(!isDeleting && charIndex < current.length) { charIndex++; setTimeout(type, 100); }
        else if(isDeleting && charIndex > 0) { charIndex--; setTimeout(type, 50); }
        else { isDeleting = !isDeleting; if (!isDeleting) txtIndex++; setTimeout(type, isDeleting ? wait : 500); }
    };
    type();
};

document.addEventListener("DOMContentLoaded", async () => {
    let state = null;
    
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`data.json?t=${timestamp}`, { cache: "no-store" });
        if (response.ok) { state = await response.json(); } 
        else { console.error("No live data.json found."); return; }
    } catch (error) { console.error("Error fetching data:", error); return; }

    if (!state) return;

    // 1. RENDER HERO
    if (state.hero && state.hero.name) {
        const h = state.hero;
        const bgImage = h.media?.profilePhoto ? `background-image: url('${h.media.profilePhoto}');` : 'background: var(--bg-base);';

        const availHtml = h.meta?.availability ? `<div class="pulse-container"><div class="pulse"></div> ${h.meta.availability}</div>` : '';
        const locHtml = h.meta?.location ? `<div class="location-badge" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid var(--glass-border); font-weight: 600;">📍 ${h.meta.location}</div>` : '';
        
        let socialHtml = '';
        if (h.social && (h.social.github || h.social.linkedin)) {
            socialHtml = `<div class="social-links" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-start;">`;
            if (h.social.github) {
                socialHtml += `<a href="${h.social.github}" target="_blank" class="btn-outline">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
                </a>`;
            }
            if (h.social.linkedin) {
                socialHtml += `<a href="${h.social.linkedin}" target="_blank" class="btn-outline">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> LinkedIn
                </a>`;
            }
            socialHtml += `</div>`;
        }
            
        renderSection('hero', `
            <div class="mobile-hero-bg" style="${bgImage}"></div>
            <div class="mobile-hero-overlay"></div>
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
            
            <!-- Guaranteed absolute centering for down arrow -->
            <div style="position: absolute; bottom: 2rem; width: 100%; left: 0; display: flex; justify-content: center; align-items: center; z-index: 10;">
                <a href="#education" class="scroll-indicator" style="position: relative; left: auto; transform: none;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                </a>
            </div>
        `);
        
        if (h.meta?.dynamicText && h.meta.dynamicText.length > 0) { typeEffect(document.getElementById('typewriter'), h.meta.dynamicText); }
    }

    // 2. RENDER EDUCATION
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

    // 4. RENDER CONTACT FORM 
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
                e.preventDefault(); btn.innerText = "Sending..."; 
                try {
                    const response = await fetch(formEndpoint, { method: 'POST', body: new FormData(form) });
                    if (response.ok) {
                        form.reset(); btn.innerText = "Send Message";
                        status.innerText = "Message sent successfully!"; status.style.color = "var(--success)"; status.style.display = "block";
                        setTimeout(() => { status.style.display = "none"; }, 5000);
                    } else { throw new Error('Failed'); }
                } catch (error) {
                    btn.innerText = "Send Message"; status.innerText = "Something went wrong. Please try again.";
                    status.style.color = "var(--danger)"; status.style.display = "block";
                }
            });
        }
    }, 100);

    // 6. SCROLL REVEAL ANIMATIONS
    setTimeout(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }, 100); 

    // 7. SCROLL SPY LOGIC (Fixed for better precision)
    setTimeout(() => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const brandLogo = document.querySelector('.top-right-brand');
        const heroSection = document.getElementById('hero');

        if (brandLogo && heroSection) {
            const logoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { brandLogo.classList.remove('brand-hidden'); } 
                    else { brandLogo.classList.add('brand-hidden'); }
                });
            }, { threshold: 0.1 }); 
            logoObserver.observe(heroSection);
        }

        // Updated rootMargin and threshold ensures nav highlights instantly and correctly
        const scrollSpy = new IntersectionObserver((entries) => {
            let activeId = null;
            entries.forEach(entry => {
                if (entry.isIntersecting) { activeId = entry.target.getAttribute('id'); }
            });
            if (activeId) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) link.classList.add('active');
                });
            }
        }, { threshold: 0.1, rootMargin: "-20% 0px -60% 0px" }); 
        
        sections.forEach(sec => scrollSpy.observe(sec));
    }, 200);
});
