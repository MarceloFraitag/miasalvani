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



// Jojômetro: aceita altura em metros ou centímetros e atualiza a comparação visual.
const jojometroInput = document.querySelector('#jojometroAltura');
const jojometroButton = document.querySelector('#jojometroCalcular');
const jojometroResult = document.querySelector('#jojometroResultado');
const jojometroPerson = document.querySelector('#jojometroPessoa');
const jojometroReader = document.querySelector('.jojometro-reader');
const jojometroHeightLabel = document.querySelector('#jojometroAlturaLabel');
const jojometroIndex = document.querySelector('#jojometroIndice');

function parseJojometroHeight(value) {
    const clean = String(value).trim().replace(',', '.').replace(/[^0-9.]/g, '');
    const number = Number.parseFloat(clean);
    if (!Number.isFinite(number)) return null;
    return number <= 3 ? Math.round(number * 100) : Math.round(number);
}

function calculateJojinhas() {
    if (!jojometroInput || !jojometroResult) return;
    const cm = parseJojometroHeight(jojometroInput.value);
    if (!cm || cm < 50) {
        jojometroResult.innerHTML = '<strong>Essa altura parece suspeita.</strong><span>Use uma altura a partir de 50 cm.</span>';
        return;
    }
    if (cm > 300) {
        jojometroResult.innerHTML = '<strong>Calma aí, poste de iluminação.</strong><span>O Jojômetro vai até 3 metros.</span>';
        return;
    }
    const full = Math.floor(cm / 150);
    const rest = cm % 150;
    const ratio = cm / 150;
    let message;
    let detail;
    if (cm === 150) {
        message = 'Você tem exatamente 1 Jojinha.';
        detail = 'Cientificamente preocupante.';
    } else if (cm < 150) {
        message = `Você tem ${ratio.toFixed(2).replace('.', ',')} Jojinhas.`;
        detail = `Faltam ${150 - cm} cm para completar uma Jojinha.`;
    } else if (rest === 0) {
        message = `Você tem exatamente ${full} Jojinhas.`;
        detail = 'Uma ocorrência estatisticamente impressionante.';
    } else {
        message = `Você tem ${full} ${full === 1 ? 'Jojinha' : 'Jojinhas'} + ${rest} cm.`;
        detail = `Isso equivale a ${ratio.toFixed(2).replace('.', ',')} Jojinhas.`;
    }
    jojometroResult.innerHTML = `<strong>${message}</strong><span>${detail}</span>`;
    const visualPercent = Math.min(100, (cm / 300) * 100);
    if (jojometroPerson) jojometroPerson.style.height = `${visualPercent}%`;
    if (jojometroReader) jojometroReader.style.setProperty('--reader-height', `${visualPercent}%`);
    if (jojometroHeightLabel) jojometroHeightLabel.textContent = `${cm} cm`;
    if (jojometroIndex) jojometroIndex.textContent = `${ratio.toFixed(2).replace('.', ',')} Jojinhas`;
}
jojometroButton?.addEventListener('click', calculateJojinhas);
jojometroInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') calculateJojinhas(); });
jojometroInput?.addEventListener('input', () => { if (parseJojometroHeight(jojometroInput.value)) calculateJojinhas(); });

// Compartilha pelo sistema quando disponível e copia como alternativa.
function copiarParaAreaDeTransferencia(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(texto);
    }
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return Promise.resolve();
}

async function compartilharOuCopiar(texto, titulo, botao) {
    const conteudo = `${texto}\n${location.origin}${location.pathname}`;
    if (navigator.share) {
        try {
            await navigator.share({ title: titulo, text: texto, url: `${location.origin}${location.pathname}` });
            return;
        } catch (erro) {
            if (erro?.name === 'AbortError') return;
        }
    }
    await copiarParaAreaDeTransferencia(conteudo);
    if (botao) {
        const original = botao.textContent;
        botao.textContent = 'Link copiado!';
        setTimeout(() => { botao.textContent = original; }, 1400);
    }
}

async function copiarTexto(texto, botao) {
    await copiarParaAreaDeTransferencia(`${texto}\n${location.origin}${location.pathname}`);
    const original = botao.textContent;
    botao.textContent = 'Copiado!';
    setTimeout(() => { botao.textContent = original; }, 1400);
}

let ultimoResultadoJojometro = '';
const jojometroCompartilhar = document.querySelector('#jojometroCompartilhar');
const jojometroCopiar = document.querySelector('#jojometroCopiar');

// Complementa o cálculo existente com o texto usado nos botões de compartilhar.
const calcularJojinhasOriginal = calculateJojinhas;
calculateJojinhas = function () {
    calcularJojinhasOriginal();
    const cm = parseJojometroHeight(jojometroInput?.value);
    if (!cm || cm < 50 || cm > 300) return;
    const inteiro = Math.floor(cm / 150);
    const resto = cm % 150;
    const indice = (cm / 150).toFixed(2).replace('.', ',');
    if (cm === 150) ultimoResultadoJojometro = 'Eu tenho exatamente 1 Jojinha de altura 😂';
    else if (cm < 150) ultimoResultadoJojometro = `Eu tenho ${indice} Jojinhas de altura 😂`;
    else if (resto === 0) ultimoResultadoJojometro = `Eu tenho exatamente ${inteiro} Jojinhas de altura 😂`;
    else ultimoResultadoJojometro = `Eu tenho ${inteiro} ${inteiro === 1 ? 'Jojinha' : 'Jojinhas'} + ${resto} cm de altura 😂 Isso equivale a ${indice} Jojinhas.`;
    if (jojometroCompartilhar) jojometroCompartilhar.disabled = false;
    if (jojometroCopiar) jojometroCopiar.disabled = false;
};
// Os listeners antigos apontam para a função anterior; estes garantem a atualização do compartilhamento.
const jojoimetroRefresh = () => calculateJojinhas();
jojometroButton?.addEventListener('click', jojoimetroRefresh);
jojometroInput?.addEventListener('keydown', e => { if (e.key === 'Enter') jojoimetroRefresh(); });
jojometroInput?.addEventListener('input', () => { if (parseJojometroHeight(jojometroInput.value)) jojoimetroRefresh(); });
jojometroCompartilhar?.addEventListener('click', () => compartilharOuCopiar(ultimoResultadoJojometro, 'Meu resultado no Jojômetro', jojometroCompartilhar));
jojometroCopiar?.addEventListener('click', () => copiarTexto(ultimoResultadoJojometro, jojometroCopiar));

// Marielei: sorteia uma variante e mistura com o primeiro nome informado.
const marielVariantes = ['Mariel 7 Bello', 'Maribel', 'Mirabel', 'Mirassol', 'Marissol'];
const marielNome = document.querySelector('#marielNome');
const marielBotao = document.querySelector('#marielizar');
const marielResultado = document.querySelector('#marielResultado');
const marielCompartilhar = document.querySelector('#marielCompartilhar');
const marielCopiar = document.querySelector('#marielCopiar');
let ultimoResultadoMariel = '';

function misturarNomeComMariel(primeiroNome, variante) {
    const nome = primeiroNome.trim();
    const base = variante.replace(/ 7 Bello$/i, '');
    const corteNome = Math.max(1, Math.ceil(nome.length * 0.55));
    const corteBase = Math.max(2, Math.floor(base.length * 0.45));
    let mistura = nome.slice(0, corteNome) + base.slice(corteBase);
    mistura = mistura.charAt(0).toUpperCase() + mistura.slice(1).toLowerCase();
    if (variante === 'Mariel 7 Bello') mistura += ' 7 Bello';
    return mistura;
}

function marielizarNome() {
    const completo = marielNome?.value.trim().replace(/\s+/g, ' ');
    if (!completo || !marielResultado) {
        marielResultado.innerHTML = '<span class="marielizador-kicker">CALMA</span><strong>Digite seu nome primeiro.</strong><span>A Mariel precisa de matéria-prima.</span>';
        return;
    }
    const partes = completo.split(' ');
    const primeiro = partes.shift();
    const resto = partes.join(' ');
    const variante = marielVariantes[Math.floor(Math.random() * marielVariantes.length)];
    const misturado = misturarNomeComMariel(primeiro, variante);
    const final = `${misturado}${resto ? ` ${resto}` : ''}`;
    ultimoResultadoMariel = `Descobri que minha Mariel é ${final} 😂 Variante sorteada: ${variante}.`;
    marielResultado.innerHTML = `<span class="marielizador-kicker">VARIANTE: ${variante}</span><strong>${final}</strong><span>O Marielei falou. Não cabe recurso.</span>`;
    if (marielCompartilhar) marielCompartilhar.disabled = false;
    if (marielCopiar) marielCopiar.disabled = false;
}

marielBotao?.addEventListener('click', marielizarNome);
marielNome?.addEventListener('keydown', e => { if (e.key === 'Enter') marielizarNome(); });
marielCompartilhar?.addEventListener('click', () => compartilharOuCopiar(ultimoResultadoMariel, 'Descubra que Mariel você é', marielCompartilhar));
marielCopiar?.addEventListener('click', () => copiarTexto(ultimoResultadoMariel, marielCopiar));
