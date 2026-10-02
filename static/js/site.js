// Elementos da página.
const progressBar = document.querySelector('#progressBar');
const menuToggle = document.querySelector('#menuToggle');
const navLinks = document.querySelector('#navLinks');
const gengar = document.querySelector('#gengarEasterEgg');
const gengarToast = document.querySelector('#gengarToast');
const summonGengar = document.querySelector('#summonGengar');
const gengarGlobalCount = document.querySelector('#gengarGlobalCount');
const goodMorningGengar = document.querySelector('#goodMorningGengar');

// Frases aleatórias; os marcos ficam em personalMessage().
const gengarMessages = [
    'Gengar esteve aqui. A Mia provavelmente vai culpar você.',
    'Você encontrou a assombração oficial da equipe.',
    'Não alimente o Gengar depois da meia-noite. Não, pera...',
    'Dex Belrose não foi ideia minha. — Gengar',
    'Parabéns. Você clicou exatamente onde não devia.'
];

let progressFrame = null;
let gengarToastTimer = null;

// Barra de progresso da leitura.
function updateProgress() {
    if (!progressBar) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function requestProgressUpdate() {
    if (progressFrame) return;

    progressFrame = window.requestAnimationFrame(() => {
        updateProgress();
        progressFrame = null;
    });
}

// Menu mobile.
function setMenuState(isOpen) {
    if (!navLinks || !menuToggle) return;

    navLinks.classList.toggle('is-open', isOpen);
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
}

function toggleMenu() {
    if (!navLinks) return;
    setMenuState(!navLinks.classList.contains('is-open'));
}

function closeMenu() {
    setMenuState(false);
}

// Posiciona o Gengar longe das bordas.
function showGengar() {
    if (!gengar || document.hidden) return;

    const safeX = Math.min(110, Math.max(64, window.innerWidth * 0.12));
    const safeTop = 96;
    const safeBottom = 120;
    const availableWidth = Math.max(0, window.innerWidth - safeX * 2);
    const availableHeight = Math.max(0, window.innerHeight - safeTop - safeBottom);

    gengar.style.left = `${safeX + Math.random() * availableWidth}px`;
    gengar.style.top = `${safeTop + Math.random() * availableHeight}px`;
    gengar.classList.add('is-visible');

    // Esconde se ninguém clicar.
    window.clearTimeout(showGengar.hideTimer);
    showGengar.hideTimer = window.setTimeout(() => {
        gengar.classList.remove('is-visible');
    }, 6500);
}

function formatCount(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

// O localStorage pode estar bloqueado em alguns navegadores.
function getPersonalClicks() {
    try {
        return Number(localStorage.getItem('miaGengarClicks') || 0);
    } catch {
        return 0;
    }
}

function savePersonalClicks(value) {
    try {
        localStorage.setItem('miaGengarClicks', String(value));
    } catch {
        // Sem armazenamento local, fica só o contador global.
    }
}

// Mensagens por número de cliques.
function personalMessage(clicks) {
    const milestones = {
        1: 'Você encontrou o Gengar.',
        10: 'Ele está começando a ficar irritado.',
        50: 'A Mia pediu para você parar.',
        100: 'Você claramente não tem nada melhor para fazer.',
        666: '...por que exatamente 666 vezes?',
        1000: 'Mil vezes. O Gengar agora considera isso uma amizade.'
    };

    return milestones[clicks] || gengarMessages[Math.floor(Math.random() * gengarMessages.length)];
}

// Reinicia o timer se o toast já estiver aberto.
function showGengarToast(content, angry = false, duration = 5200) {
    if (!gengarToast) return;

    window.clearTimeout(gengarToastTimer);
    gengarToast.innerHTML = content;
    gengarToast.classList.toggle('is-angry', angry);
    gengarToast.classList.add('is-visible');

    gengarToastTimer = window.setTimeout(() => {
        gengarToast.classList.remove('is-visible', 'is-angry');
    }, duration);
}

// Carrega o contador global.
async function loadGengarCount() {
    if (!gengarGlobalCount) return;

    try {
        const response = await fetch('/api/gengar');
        if (!response.ok) return;

        const data = await response.json();
        gengarGlobalCount.textContent = formatCount(data.clicks);
    } catch (error) {
        console.warn('Contador do Gengar indisponível.', error);
    }
}

// Soma o clique local e tenta registrar o global.
async function catchGengar() {
    if (!gengar) return;
    gengar.classList.remove('is-visible');

    const personalClicks = getPersonalClicks() + 1;
    savePersonalClicks(personalClicks);

    let globalClicks = null;

    try {
        const response = await fetch('/api/gengar/click', { method: 'POST' });
        if (response.ok) {
            const data = await response.json();
            globalClicks = data.clicks;
            if (gengarGlobalCount) gengarGlobalCount.textContent = formatCount(globalClicks);
        }
    } catch (error) {
        console.warn('Não foi possível registrar o clique global.', error);
    }

    const globalLine = globalClicks === null
        ? '<div class="gengar-line gengar-global">Contador global indisponível no momento.</div>'
        : `<div class="gengar-line gengar-global">O site inteiro já encontrou ele <strong>${formatCount(globalClicks)}</strong> vezes.</div>`;

    showGengarToast(`
        <div class="gengar-line gengar-message">${personalMessage(personalClicks)}</div>
        <div class="gengar-line gengar-personal">Você é responsável por <strong>${formatCount(personalClicks)}</strong> clique${personalClicks === 1 ? '' : 's'}.</div>
        ${globalLine}
    `);
}

// Anima a entrada das seções.
function setupRevealAnimations() {
    const elements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
}

// Destaca no menu a seção atual.
function setupActiveNavigation() {
    if (!('IntersectionObserver' in window)) return;

    const links = [...document.querySelectorAll('[data-nav-section]')];
    const sections = links
        .map((link) => document.getElementById(link.dataset.navSection))
        .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        links.forEach((link) => {
            const isActive = link.dataset.navSection === visible.target.id;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.1, 0.35] });

    sections.forEach((section) => observer.observe(section));
}

// Relações dos Cisnes.
// Pares e tipos usados no mapa.
const cisneNames = {
    declan: 'Declan St Clair', killian: 'Killian Belrose', dex: 'Dex Belrose', reid: 'Reid Montgomery', chuck: 'Chuck Ashford',
    charlotte: 'Charlotte Sparks', melissa: 'Melissa Jang', olivia: 'Olivia Cornélia Valmont', lara: 'Lara Kerrigan', zuri: 'Zuri Mayosi Mcfarland'
};

const relationLabels = {
    frenemies: 'Frenemies', besties: 'Besties', hooked: 'Já se pegaram', exes: 'Ex-namorados', fighting: 'Brigados', dating: 'Em um relacionamento'
};

const cisneRelations = [
    // Declan
    ['declan', 'killian', 'besties'],
    ['declan', 'killian', 'hooked'],
    ['declan', 'charlotte', 'hooked'],
    ['declan', 'charlotte', 'dating'],
    ['declan', 'melissa', 'hooked'],

    // Killian
    ['killian', 'reid', 'frenemies'],
    ['killian', 'charlotte', 'hooked'],
    ['killian', 'melissa', 'hooked'],
    ['killian', 'melissa', 'dating'],
    ['killian', 'lara', 'hooked'],
    ['killian', 'zuri', 'hooked'],

    // Dex
    ['dex', 'chuck', 'besties'],
    ['dex', 'olivia', 'hooked'],
    ['dex', 'olivia', 'dating'],

    // Reid
    ['reid', 'chuck', 'besties'],
    ['reid', 'lara', 'fighting'],
    ['reid', 'charlotte', 'fighting'],
    ['reid', 'zuri', 'hooked'],

    // Chuck
    ['chuck', 'olivia', 'exes'],
    ['chuck', 'melissa', 'besties'],
    ['chuck', 'zuri', 'besties'],

    // Meninas
    ['charlotte', 'olivia', 'frenemies'],
    ['melissa', 'olivia', 'besties'],
    ['zuri', 'olivia', 'besties']
];

const relationResult = document.querySelector('#relationResult');
const characterButtons = document.querySelectorAll('[data-character]');

function showCharacterRelations(character) {
    if (!relationResult || !cisneNames[character]) return;

    characterButtons.forEach((button) => {
        const isActive = button.dataset.character === character;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    const matches = cisneRelations.filter(([a, b]) => a === character || b === character);
    const list = document.createElement('div');
    list.className = 'relation-list';

    matches.forEach(([a, b, type]) => {
        const other = a === character ? b : a;
        const tag = document.createElement('div');
        tag.className = `relation-tag ${type}`;

        const name = document.createElement('span');
        name.textContent = cisneNames[other];

        const label = document.createElement('small');
        label.textContent = relationLabels[type];

        tag.append(name, label);
        list.append(tag);
    });

    relationResult.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = cisneNames[character];
    relationResult.append(title, list);
}

characterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => showCharacterRelations(button.dataset.character));
});

// Easter egg: bom dia para o Gengar.
function triggerGengarTakeover() {
    if (!gengarToast || document.body.classList.contains('gengar-shake')) return;

    document.body.classList.add('gengar-shake');

    window.setTimeout(() => {
        document.body.classList.remove('gengar-shake');
        showGengarToast(`
            <div class="gengar-line gengar-message"><strong>O Gengar da Mia ficou puto contigo.</strong></div>
            <div class="gengar-line gengar-personal">Você só precisava ter deixado ele quieto.</div>
        `, true, 5000);
    }, 1800);
}

document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', requestProgressUpdate, { passive: true });
window.addEventListener('resize', requestProgressUpdate, { passive: true });

menuToggle?.addEventListener('click', toggleMenu);
gengar?.addEventListener('click', catchGengar);
summonGengar?.addEventListener('click', showGengar);
goodMorningGengar?.addEventListener('click', triggerGengarTakeover);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
});

document.addEventListener('click', (event) => {
    if (!navLinks?.classList.contains('is-open')) return;
    if (navLinks.contains(event.target) || menuToggle?.contains(event.target)) return;
    closeMenu();
});

// Primeira aparição após 9 s.
window.setTimeout(showGengar, 9000);

// Depois disso, tenta reaparecer a cada 28 s.
window.setInterval(() => {
    if (gengar && !gengar.classList.contains('is-visible')) showGengar();
}, 28000);

setupRevealAnimations();
setupActiveNavigation();
updateProgress();
loadGengarCount();


// Galerias dos livros.
const artGalleries = [...document.querySelectorAll('[data-art-gallery]')];
const artLightbox = document.querySelector('#artLightbox');
const artLightboxImage = document.querySelector('#artLightboxImage');
const artLightboxCaption = document.querySelector('#artLightboxCaption');
const artLightboxCounter = document.querySelector('#artLightboxCounter');
const artLightboxClose = document.querySelector('#artLightboxClose');
const artLightboxPrev = document.querySelector('#artLightboxPrev');
const artLightboxNext = document.querySelector('#artLightboxNext');

let activeGalleryArts = [];
let currentArtIndex = 0;
let lastGalleryTrigger = null;

// Atualiza a arte aberta, legenda e contador.
function renderGalleryArt(index) {
    if (!activeGalleryArts.length || !artLightboxImage) return;

    currentArtIndex = (index + activeGalleryArts.length) % activeGalleryArts.length;
    const thumbnail = activeGalleryArts[currentArtIndex].querySelector('img');
    if (!thumbnail) return;

    artLightboxImage.src = thumbnail.src;
    artLightboxImage.alt = thumbnail.alt;
    if (artLightboxCaption) artLightboxCaption.textContent = thumbnail.alt;
    if (artLightboxCounter) artLightboxCounter.textContent = `${currentArtIndex + 1} / ${activeGalleryArts.length}`;
}

// Abre o lightbox da galeria selecionada.
function openArtLightbox(index, trigger, galleryName) {
    if (!artLightbox) return;

    lastGalleryTrigger = trigger || null;
    artLightbox.setAttribute('aria-label', `Visualizador das artes de ${galleryName}`);
    renderGalleryArt(index);
    artLightbox.classList.add('is-open');
    artLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    artLightboxClose?.focus();
}

function closeArtLightbox() {
    if (!artLightbox) return;

    artLightbox.classList.remove('is-open');
    artLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    artLightboxImage?.removeAttribute('src');
    lastGalleryTrigger?.focus();
}

// Cada livro mantém sua própria lista de artes.
artGalleries.forEach((gallery) => {
    const galleryArts = [...gallery.querySelectorAll('[data-art-item]')];
    const galleryName = gallery.dataset.galleryName || 'Galeria';

    galleryArts.forEach((button, index) => {
        button.addEventListener('click', () => {
            activeGalleryArts = galleryArts;
            openArtLightbox(index, button, galleryName);
        });
    });
});

artLightboxClose?.addEventListener('click', closeArtLightbox);
artLightboxPrev?.addEventListener('click', () => renderGalleryArt(currentArtIndex - 1));
artLightboxNext?.addEventListener('click', () => renderGalleryArt(currentArtIndex + 1));

artLightbox?.addEventListener('click', (event) => {
    if (event.target === artLightbox) closeArtLightbox();
});

document.addEventListener('keydown', (event) => {
    if (!artLightbox?.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeArtLightbox();
    if (event.key === 'ArrowLeft') renderGalleryArt(currentArtIndex - 1);
    if (event.key === 'ArrowRight') renderGalleryArt(currentArtIndex + 1);
});

\n\n// Jojômetro: converte metros/centímetros e mantém o desenho na mesma escala.\nconst alturaLeitor = document.querySelector('#alturaLeitor');\nconst calcularJojinhas = document.querySelector('#calcularJojinhas');\nconst jojometroMensagem = document.querySelector('#jojometroMensagem');\nconst jojometroIndice = document.querySelector('#jojometroIndice');\nconst jojometroResult = document.querySelector('#jojometroResult');\nconst readerPerson = document.querySelector('#readerPerson');\nconst readerHeightLabel = document.querySelector('#readerHeightLabel');\n\nfunction normalizarAltura(valor) {\n    const limpo = String(valor).trim().replace(',', '.').replace(/[^0-9.]/g, '');\n    const numero = Number.parseFloat(limpo);\n    if (!Number.isFinite(numero)) return null;\n    return numero <= 3 ? Math.round(numero * 100) : Math.round(numero);\n}\n\nfunction calcularAlturaEmJojinhas() {\n    const altura = normalizarAltura(alturaLeitor?.value);\n    if (!altura || altura < 50 || altura > 300) {\n        jojometroResult?.classList.add('is-error');\n        if (jojometroMensagem) jojometroMensagem.textContent = 'Coloque uma altura entre 50 e 300 cm.';\n        if (jojometroIndice) jojometroIndice.textContent = 'Exemplo: 1,78 ou 178.';\n        return;\n    }\n\n    jojometroResult?.classList.remove('is-error');\n    const jojinhasInteiras = Math.floor(altura / 150);\n    const sobra = altura % 150;\n    const indice = altura / 150;\n\n    let mensagem;\n    if (altura === 150) {\n        mensagem = 'Você tem exatamente 1 Jojinha.';\n    } else if (altura < 150) {\n        mensagem = `Você tem ${indice.toFixed(2).replace('.', ',')} Jojinhas.`;\n    } else if (sobra === 0) {\n        mensagem = `Você tem exatamente ${jojinhasInteiras} Jojinhas.`;\n    } else {\n        mensagem = `Você tem ${jojinhasInteiras} ${jojinhasInteiras === 1 ? 'Jojinha' : 'Jojinhas'} + ${sobra} cm.`;\n    }\n\n    if (jojometroMensagem) jojometroMensagem.textContent = mensagem;\n    if (jojometroIndice) {\n        const extra = altura === 150 ? ' Cientificamente preocupante.' : '';\n        jojometroIndice.textContent = `Índice Jojinha: ${indice.toFixed(2).replace('.', ',')} · Sua altura: ${altura} cm.${extra}`;\n    }\n    if (readerHeightLabel) readerHeightLabel.textContent = `${altura} cm`;\n\n    // O gráfico usa 220 cm como topo; valores maiores continuam proporcionais sem estourar o quadro.\n    if (readerPerson) {\n        const alturaVisual = Math.min(altura, 220) / 220 * 100;\n        readerPerson.style.height = `calc((100% - 36px) * ${alturaVisual / 100})`;\n    }\n}\n\ncalcularJojinhas?.addEventListener('click', calcularAlturaEmJojinhas);\nalturaLeitor?.addEventListener('keydown', (event) => {\n    if (event.key === 'Enter') calcularAlturaEmJojinhas();\n});\nalturaLeitor?.addEventListener('input', () => {\n    if (alturaLeitor.value.trim()) calcularAlturaEmJojinhas();\n});\n