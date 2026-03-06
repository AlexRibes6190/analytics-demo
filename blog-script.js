// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// ==========================================
// SCROLL DEPTH TRACKING
// ==========================================
// ⚠️ DESACTIVADO - Ahora usamos el trigger de GTM
// El trigger "Scroll Depth" de GTM lo maneja automáticamente

// ==========================================
// READING PROGRESS BAR
// ==========================================
window.addEventListener('scroll', function() {
    const article = document.querySelector('.article-content');
    if (!article) return;
    
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    const progress = Math.min(100, Math.max(0, 
        ((scrollY - articleTop + windowHeight) / articleHeight) * 100
    ));
    
    const progressBar = document.getElementById('reading-progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
});

// ==========================================
// SOCIAL SHARE CLICKS
// ==========================================
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const socialNetwork = this.getAttribute('data-social');
        
        window.dataLayer.push({
            event: 'social_share',
            social_network: socialNetwork,
            article_title: document.title
        });
        
        console.log(`✅ Social share: ${socialNetwork}`);
        
        // Simular apertura de ventana de share
        alert(`Compartiendo en ${socialNetwork}... (esto abriría la ventana de compartir)`);
    });
});

// ==========================================
// INTERNAL & EXTERNAL LINK CLICKS
// ==========================================
document.querySelectorAll('.article-content a').forEach(link => {
    link.addEventListener('click', function(e) {
        const isExternal = !this.href.includes(window.location.hostname);
        const linkType = isExternal ? 'external' : 'internal';
        
        window.dataLayer.push({
            event: 'article_link_click',
            link_type: linkType,
            link_url: this.href,
            link_text: this.textContent.trim(),
            article_title: document.title
        });
        
        console.log(`✅ Link click (${linkType}): ${this.textContent.trim()}`);
    });
});

// ==========================================
// TABLE OF CONTENTS NAVIGATION
// ==========================================
document.querySelectorAll('.toc a').forEach(link => {
    link.addEventListener('click', function(e) {
        const sectionName = this.textContent.trim();
        
        window.dataLayer.push({
            event: 'toc_click',
            section_name: sectionName,
            article_title: document.title
        });
        
        console.log(`✅ TOC click: ${sectionName}`);
    });
});

// ==========================================
// CODE COPY TO CLIPBOARD
// ==========================================
document.querySelectorAll('.copy-code-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const codeBlock = this.parentElement.querySelector('code');
        const codeText = codeBlock.textContent;
        
        // Copy to clipboard
        navigator.clipboard.writeText(codeText).then(() => {
            // Visual feedback
            this.textContent = '✅ Copiado!';
            setTimeout(() => {
                this.textContent = '📋 Copiar';
            }, 2000);
            
            // DataLayer push
            window.dataLayer.push({
                event: 'code_copy',
                article_title: document.title
            });
            
            console.log('✅ Code copied to clipboard');
        });
    });
});

// ==========================================
// RELATED ARTICLES CLICKS
// ==========================================
document.querySelectorAll('.related-articles a').forEach((link, index) => {
    link.addEventListener('click', function(e) {
        const relatedTitle = this.querySelector('h4').textContent.trim();
        
        window.dataLayer.push({
            event: 'related_article_click',
            related_article_title: relatedTitle,
            related_article_position: index + 1,
            current_article_title: document.title
        });
        
        console.log(`✅ Related article click: ${relatedTitle} (position ${index + 1})`);
    });
});

// ==========================================
// INTERACTIVE CALLOUT BUTTON
// ==========================================
document.querySelectorAll('.callout-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        
        window.dataLayer.push({
            event: 'callout_interaction',
            callout_action: action,
            article_title: document.title
        });
        
        console.log(`✅ Callout interaction: ${action}`);
        alert('Redirigiendo a más información...');
    });
});

// ==========================================
// CHECKLIST INTERACTIONS
// ==========================================
document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const item = this.getAttribute('data-item');
        const isChecked = this.checked;
        
        window.dataLayer.push({
            event: 'checklist_interaction',
            checklist_item: item,
            item_checked: isChecked,
            article_title: document.title
        });
        
        console.log(`✅ Checklist: ${item} - ${isChecked ? 'checked' : 'unchecked'}`);
    });
});

// ==========================================
// POLL WIDGET
// ==========================================
document.querySelectorAll('.poll-option').forEach(btn => {
    btn.addEventListener('click', function() {
        const option = this.getAttribute('data-option');
        
        window.dataLayer.push({
            event: 'poll_response',
            poll_question: 'install_preference',
            poll_answer: option,
            article_title: document.title
        });
        
        console.log(`✅ Poll response: ${option}`);
        
        // Show results
        document.querySelector('.poll-results').style.display = 'block';
        document.querySelector('.poll-options').style.display = 'none';
        
        const resultTexts = {
            'gtm': 'GTM es la opción más profesional 👍',
            'manual': 'La instalación manual te da control total 🔧',
            'plugin': 'Los plugins facilitan mucho el trabajo ⚡'
        };
        
        document.getElementById('poll-result-text').textContent = resultTexts[option] || '';
    });
});

// ==========================================
// RATING WIDGET
// ==========================================
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        
        window.dataLayer.push({
            event: 'article_rating',
            rating_value: parseInt(rating),
            article_title: document.title
        });
        
        console.log(`✅ Article rated: ${rating} stars`);
        
        // Visual feedback
        document.querySelector('.rating-feedback').style.display = 'block';
        document.querySelector('.rating-stars').style.opacity = '0.5';
    });
});

// ==========================================
// NEWSLETTER FORM
// ==========================================
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        window.dataLayer.push({
            event: 'newsletter_signup',
            signup_location: 'article_bottom',
            article_title: document.title
        });
        
        console.log('✅ Newsletter signup');
        
        // Show success message
        this.style.display = 'none';
        document.querySelector('.newsletter-success').style.display = 'block';
    });
}

// ==========================================
// PAGE VIEW EVENT (cuando carga el artículo)
// ==========================================
window.dataLayer.push({
    event: 'blog_post_view',
    article_title: document.title,
    article_category: document.querySelector('.blog-category')?.textContent || 'Sin categoría'
});

console.log('📝 Blog post loaded - All tracking initialized');
