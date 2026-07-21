let state = {
    clinic: { name: 'Minha Clínica', address: '', phone: '', email: '' },
    services: [],
    whatsapp: { token: '', phoneId: '', businessId: '', verifyToken: '' },
    calendly: { username: 'smartlamn2026', eventType: '' },
    templates: {
        greeting: `Olá, {nome}! 👋\n\nObrigado pelo interesse em nossos serviços.\n\nPara agendar sua consulta de {servico}, escolha o melhor horário pelo link abaixo:\n\n{link}\n\nQualquer dúvida, estou por aqui!`,
        reminder: `Olá, {nome}, tudo bem? 😊\n\nEstamos definindo os horários da próxima semana.\n\nPara garantir sua vaga para {servico}, acesse nosso link de agendamento:\n\n{link}\n\nAté breve!`,
        reactivation: `Olá, {nome}! \n\nSentimos sua falta na clínica! 🏥\n\nQue tal agendar uma nova sessão de {servico}? Estamos com horários disponíveis:\n\n{link}\n\nSerá um prazer recebê-lo(a) novamente!`
    },
    recentLinks: []
};

let currentTemplate = 'greeting';
let editingServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    init();
});

function loadState() {
    const saved = localStorage.getItem('fisioAgenda');
    if (saved) state = { ...state, ...JSON.parse(saved) };
    if (!state.services.length) {
        state.services = [
            { id: 1, name: 'Acupuntura', description: 'Tratamento com agulhas para equilíbrio e alívio de dores.', duration: 60, price: 120, category: 'Acupuntura', color: '#E91E63', calendlySlug: '' },
            { id: 2, name: 'Massagem Terapêutica', description: 'Alívio de tensões musculares e melhora da circulação.', duration: 50, price: 100, category: 'Massagem', color: '#9C27B0', calendlySlug: '' },
            { id: 3, name: 'RPG - Reeducação Postural', description: 'Correção de desequilíbrios posturais e prevenção de dores.', duration: 55, price: 110, category: 'RPG', color: '#3F51B5', calendlySlug: '' },
            { id: 4, name: 'Fisioterapia Ortopédica', description: 'Reabilitação de lesões musculoesqueléticas e pós-operatórios.', duration: 45, price: 90, category: 'Fisioterapia', color: '#2196F3', calendlySlug: '' },
            { id: 5, name: 'Pilates Terapêutico', description: 'Exercícios de controle motor e fortalecimento do core.', duration: 55, price: 80, category: 'Pilates', color: '#00BCD4', calendlySlug: '' },
            { id: 6, name: 'Avaliação Fisioterapêutica', description: 'Análise completa da condição física e postural.', duration: 40, price: 70, category: 'Avaliação', color: '#FF9800', calendlySlug: '' }
        ];
        save();
    }
}

function save() {
    localStorage.setItem('fisioAgenda', JSON.stringify(state));
}

function init() {
    setupNav();
    renderDashboard();
    renderServices();
    populateServiceSelect();
    updateSettingsForm();
    loadWhatsApp();
    loadCalendly();
    loadTemplates();
    setupUpload();
    updateColorPreview();
}

function setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => { e.preventDefault(); navigateTo(item.dataset.page); };
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');
}

function renderDashboard() {
    document.getElementById('totalServices').textContent = state.services.length;
    const connected = state.whatsapp.token && state.whatsapp.phoneId;
    const ws = document.getElementById('whatsappStatus');
    ws.textContent = connected ? 'Conectado' : 'Não conectado';
    ws.style.color = connected ? 'var(--success)' : 'var(--text-secondary)';
    const cs = document.getElementById('calendlyStatus');
    cs.textContent = state.calendly.username || 'Não configurado';
    cs.style.color = state.calendly.username ? 'var(--success)' : 'var(--text-secondary)';
    renderRecentLinks();
}

function renderRecentLinks() {
    const el = document.getElementById('recentLinks');
    if (!state.recentLinks.length) {
        el.innerHTML = '<p class="empty-state">Nenhum link gerado ainda</p>';
        return;
    }
    el.innerHTML = state.recentLinks.slice(0, 5).map(l => `
        <div class="recent-link-item">
            <div class="recent-link-info">
                <strong>${esc(l.service)}</strong>
                <small>${l.date}</small>
            </div>
            <button class="btn-icon" onclick="copy('${esc(l.url)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
        </div>
    `).join('');
}

function renderServices() {
    const el = document.getElementById('servicesList');
    if (!state.services.length) {
        el.innerHTML = '<p class="empty-state">Nenhum serviço cadastrado</p>';
        return;
    }
    el.innerHTML = state.services.map(s => `
        <div class="service-card" style="border-left-color: ${s.color}" onclick="editService(${s.id})">
            <div class="service-card-header">
                <span class="service-name">${esc(s.name)}</span>
                ${s.category ? `<span class="service-category">${esc(s.category)}</span>` : ''}
            </div>
            ${s.description ? `<p class="service-description">${esc(s.description)}</p>` : ''}
            <div class="service-meta">
                <span>⏱ ${s.duration} min</span>
                <span>💰 R$ ${s.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function openServiceModal(id = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const del = document.getElementById('btnDeleteService');
    
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('serviceDuration').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceCategory').value = '';
    document.getElementById('serviceColor').value = '#10B981';
    document.getElementById('serviceCalendlySlug').value = '';
    
    if (id) {
        const s = state.services.find(x => x.id === id);
        if (s) {
            title.textContent = 'Editar Serviço';
            del.style.display = 'inline-flex';
            document.getElementById('serviceId').value = s.id;
            document.getElementById('serviceName').value = s.name;
            document.getElementById('serviceDescription').value = s.description || '';
            document.getElementById('serviceDuration').value = s.duration;
            document.getElementById('servicePrice').value = s.price;
            document.getElementById('serviceCategory').value = s.category || '';
            document.getElementById('serviceColor').value = s.color;
            document.getElementById('serviceCalendlySlug').value = s.calendlySlug || '';
        }
    } else {
        title.textContent = 'Novo Serviço';
        del.style.display = 'none';
    }
    editingServiceId = id;
    modal.classList.add('active');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
    editingServiceId = null;
}

function editService(id) { openServiceModal(id); }

function saveService() {
    const id = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const desc = document.getElementById('serviceDescription').value.trim();
    const dur = parseInt(document.getElementById('serviceDuration').value);
    const price = parseFloat(document.getElementById('servicePrice').value);
    const cat = document.getElementById('serviceCategory').value;
    const color = document.getElementById('serviceColor').value;
    const slug = document.getElementById('serviceCalendlySlug').value.trim();
    
    if (!name) return toast('Informe o nome', 'error');
    if (!dur || dur < 15) return toast('Duração mínima 15 min', 'error');
    if (isNaN(price) || price < 0) return toast('Preço inválido', 'error');
    
    if (id) {
        const i = state.services.findIndex(x => x.id === parseInt(id));
        if (i !== -1) state.services[i] = { ...state.services[i], name, description: desc, duration: dur, price, category: cat, color, calendlySlug: slug };
        toast('Serviço atualizado!');
    } else {
        const newId = state.services.length ? Math.max(...state.services.map(x => x.id)) + 1 : 1;
        state.services.push({ id: newId, name, description: desc, duration: dur, price, category: cat, color, calendlySlug: slug });
        toast('Serviço criado!');
    }
    save();
    renderServices();
    renderDashboard();
    populateServiceSelect();
    closeServiceModal();
}

function deleteService() {
    if (!editingServiceId) return;
    state.services = state.services.filter(s => s.id !== editingServiceId);
    save();
    renderServices();
    renderDashboard();
    populateServiceSelect();
    closeServiceModal();
    toast('Serviço excluído');
}

function genLink(service) {
    const u = state.calendly.username || 'seu-usuario';
    const s = service.calendlySlug || service.name.toLowerCase().replace(/\s+/g, '-');
    return `https://calendly.com/${u}/${s}`;
}

function loadWhatsApp() {
    document.getElementById('whatsappToken').value = state.whatsapp.token || '';
    document.getElementById('whatsappPhoneId').value = state.whatsapp.phoneId || '';
    document.getElementById('whatsappBusinessId').value = state.whatsapp.businessId || '';
    document.getElementById('verifyToken').value = state.whatsapp.verifyToken || '';
    updateApiBadge();
}

function updateApiBadge() {
    const b = document.getElementById('apiStatusBadge');
    const ok = state.whatsapp.token && state.whatsapp.phoneId;
    b.textContent = ok ? 'Configurado' : 'Não configurado';
    b.className = 'badge' + (ok ? ' success' : '');
}

function generateVerifyToken() {
    const t = 'fisio_' + Math.random().toString(36).substr(2, 16);
    document.getElementById('verifyToken').value = t;
    state.whatsapp.verifyToken = t;
    save();
    toast('Token gerado!');
}

function saveWhatsAppConfig() {
    state.whatsapp.token = document.getElementById('whatsappToken').value.trim();
    state.whatsapp.phoneId = document.getElementById('whatsappPhoneId').value.trim();
    state.whatsapp.businessId = document.getElementById('whatsappBusinessId').value.trim();
    state.whatsapp.verifyToken = document.getElementById('verifyToken').value.trim();
    save();
    updateApiBadge();
    renderDashboard();
    toast('WhatsApp configurado!');
}

function copyWebhookUrl() {
    copy(document.getElementById('webhookUrl').textContent);
}

async function testWhatsAppConnection() {
    const phone = document.getElementById('testPhone').value.trim();
    const result = document.getElementById('testResult');
    if (!phone) return toast('Informe um número', 'error');
    if (!state.whatsapp.token || !state.whatsapp.phoneId) {
        result.style.display = 'block';
        result.className = 'test-result error';
        result.textContent = 'Configure as credenciais primeiro';
        return;
    }
    result.style.display = 'block';
    result.className = 'test-result';
    result.textContent = 'Enviando...';
    try {
        const r = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message: '🏥 Mensagem de teste do FisioAgenda!', token: state.whatsapp.token, phoneId: state.whatsapp.phoneId })
        });
        const d = await r.json();
        result.className = 'test-result ' + (d.success ? 'success' : 'error');
        result.textContent = d.success ? '✅ Enviado com sucesso!' : `❌ ${d.error || 'Erro ao enviar'}`;
    } catch {
        result.className = 'test-result error';
        result.textContent = '❌ Erro de conexão';
    }
}

function loadCalendly() {
    document.getElementById('calendlyUsername').value = state.calendly.username || '';
    document.getElementById('calendlyEventType').value = state.calendly.eventType || '';
}

function saveCalendlySettings() {
    state.calendly.username = document.getElementById('calendlyUsername').value.trim();
    state.calendly.eventType = document.getElementById('calendlyEventType').value.trim();
    save();
    renderDashboard();
    toast('Calendly configurado!');
}

function populateServiceSelect() {
    const sel = document.getElementById('messageService');
    const v = sel.value;
    sel.innerHTML = '<option value="">Selecione um serviço</option>' + state.services.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    if (v) sel.value = v;
}

function selectTemplate(t, btn) {
    currentTemplate = t;
    document.querySelectorAll('.template-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateMessagePreview();
}

function updateMessagePreview() {
    const sid = document.getElementById('messageService').value;
    const name = document.getElementById('clientName').value || '{nome}';
    const preview = document.getElementById('messagePreview');
    if (!sid) {
        preview.innerHTML = '<p class="placeholder-text">Selecione um serviço para ver a mensagem</p>';
        return;
    }
    const s = state.services.find(x => x.id === parseInt(sid));
    if (!s) return;
    const link = genLink(s);
    const msg = (state.templates[currentTemplate] || state.templates.greeting)
        .replace(/{nome}/g, name)
        .replace(/{servico}/g, s.name)
        .replace(/{link}/g, link)
        .replace(/{duracao}/g, s.duration)
        .replace(/{preco}/g, s.price.toFixed(2));
    preview.textContent = msg;
}

function copyMessagePreview() {
    const t = document.getElementById('messagePreview').textContent;
    if (t && !t.includes('Selecione')) copy(t);
}

async function sendWhatsAppMessage() {
    const phone = document.getElementById('recipientPhone').value.trim();
    const sid = document.getElementById('messageService').value;
    const msg = document.getElementById('messagePreview').textContent;
    if (!phone) return toast('Informe o número', 'error');
    if (!sid) return toast('Selecione um serviço', 'error');
    if (!state.whatsapp.token || !state.whatsapp.phoneId) return toast('Configure o WhatsApp primeiro', 'error');
    try {
        const r = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message: msg, token: state.whatsapp.token, phoneId: state.whatsapp.phoneId })
        });
        const d = await r.json();
        if (d.success) {
            toast('Mensagem enviada!');
            const s = state.services.find(x => x.id === parseInt(sid));
            if (s) {
                state.recentLinks.unshift({ service: s.name, url: genLink(s), date: new Date().toLocaleString('pt-BR') });
                state.recentLinks = state.recentLinks.slice(0, 10);
                save();
                renderRecentLinks();
            }
        } else {
            toast(`Erro: ${d.error}`, 'error');
        }
    } catch {
        toast('Erro de conexão', 'error');
    }
}

function setupUpload() {
    const zone = document.getElementById('uploadArea');
    if (!zone) return;
    zone.onclick = () => document.getElementById('csvFile').click();
    zone.ondragover = (e) => { e.preventDefault(); zone.style.borderColor = 'var(--primary)'; };
    zone.ondragleave = () => { zone.style.borderColor = ''; };
    zone.ondrop = (e) => {
        e.preventDefault();
        zone.style.borderColor = '';
        if (e.dataTransfer.files[0]?.name.endsWith('.csv')) processCSV(e.dataTransfer.files[0]);
    };
}

function handleCSVUpload(e) {
    if (e.target.files[0]) processCSV(e.target.files[0]);
}

let batchContacts = [];

function processCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const lines = e.target.result.split('\n').filter(l => l.trim());
        batchContacts = lines.slice(1).map(l => {
            const [nome, tel, serv] = l.split(',').map(c => c.trim());
            return { nome, telefone: tel, servico: serv };
        }).filter(c => c.nome && c.telefone);
        showBatchPreview();
    };
    reader.readAsText(file);
}

function showBatchPreview() {
    document.getElementById('batchPreview').style.display = 'block';
    document.getElementById('batchCount').textContent = batchContacts.length;
    document.getElementById('batchList').innerHTML = batchContacts.slice(0, 10).map(c => `
        <div class="batch-item"><span>${esc(c.nome)}</span><span>${esc(c.telefone)}</span></div>
    `).join('') + (batchContacts.length > 10 ? `<div class="batch-item"><em>E mais ${batchContacts.length - 10}...</em></div>` : '');
}

async function sendBatchMessages() {
    if (!batchContacts.length) return;
    let sent = 0, err = 0;
    for (const c of batchContacts) {
        const s = c.servico ? state.services.find(x => x.name.toLowerCase().includes(c.servico.toLowerCase())) : state.services[0];
        if (!s) { err++; continue; }
        const msg = state.templates.greeting.replace(/{nome}/g, c.nome).replace(/{servico}/g, s.name).replace(/{link}/g, genLink(s));
        try {
            const r = await fetch('/api/send-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: c.telefone, message: msg, token: state.whatsapp.token, phoneId: state.whatsapp.phoneId }) });
            const d = await r.json();
            d.success ? sent++ : err++;
        } catch { err++; }
        await new Promise(r => setTimeout(r, 1000));
    }
    toast(`Enviados: ${sent} | Erros: ${err}`, sent ? 'success' : 'error');
    document.getElementById('batchPreview').style.display = 'none';
    batchContacts = [];
}

function loadTemplates() {
    document.getElementById('templateGreeting').value = state.templates.greeting;
    document.getElementById('templateReminder').value = state.templates.reminder;
    document.getElementById('templateReactivation').value = state.templates.reactivation;
}

function saveTemplates() {
    state.templates.greeting = document.getElementById('templateGreeting').value;
    state.templates.reminder = document.getElementById('templateReminder').value;
    state.templates.reactivation = document.getElementById('templateReactivation').value;
    save();
    toast('Modelos salvos!');
}

function updateSettingsForm() {
    document.getElementById('settingClinicName').value = state.clinic.name || '';
    document.getElementById('settingAddress').value = state.clinic.address || '';
    document.getElementById('settingPhone').value = state.clinic.phone || '';
    document.getElementById('settingEmail').value = state.clinic.email || '';
}

function saveClinicSettings() {
    state.clinic.name = document.getElementById('settingClinicName').value.trim();
    state.clinic.address = document.getElementById('settingAddress').value.trim();
    state.clinic.phone = document.getElementById('settingPhone').value.trim();
    state.clinic.email = document.getElementById('settingEmail').value.trim();
    save();
    toast('Configurações salvas!');
}

function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fisioagenda-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast('Dados exportados!');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            state = { ...state, ...JSON.parse(ev.target.result) };
            save();
            init();
            toast('Dados importados!');
        } catch { toast('Arquivo inválido', 'error'); }
    };
    reader.readAsText(file);
}

function updateColorPreview() {
    const input = document.getElementById('serviceColor');
    const label = document.getElementById('colorValue');
    if (input && label) {
        input.oninput = () => { label.textContent = input.value; };
    }
}

function copy(text) {
    navigator.clipboard.writeText(text).then(() => toast('Copiado!')).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Copiado!');
    });
}

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function esc(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeServiceModal(); });
document.querySelectorAll('.modal-overlay').forEach(o => { o.onclick = (e) => { if (e.target === o) closeServiceModal(); }; });
