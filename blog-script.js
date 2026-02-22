// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// ==========================================
// SCROLL DEPTH TRACKING
// ==========================================
// ⚠️ DESACTIVADO - Ahora usamos el trigger de GTM
// El trigger "Scroll Depth" de GTM lo maneja automáticamente

// ==========================================
// 2. SOCIAL SHARE CLICKS
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
// 3. INTERNAL & EXTERNAL LINK CLICKS
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
// 4. TABLE OF CONTENTS NAVIGATION
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
// 5. CODE COPY TO CLIPBOARD
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
// 6. RELATED ARTICLES CLICKS
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
// PAGE VIEW EVENT (cuando carga el artículo)
// ==========================================
window.dataLayer.push({
    event: 'blog_post_view',
    article_title: document.title,
    article_category: document.querySelector('.blog-category')?.textContent || 'Sin categoría'
});

console.log('📝 Blog post loaded - All tracking initialized');
