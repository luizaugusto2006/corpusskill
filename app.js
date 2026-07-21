// Dados iniciais padrão
const defaultClinicData = {
    name: 'Clínica de Fisioterapia',
    address: '',
    phone: '',
    email: ''
};

const defaultServices = [
    {
        id: 1,
        name: 'Acupuntura',
        description: 'Tratamento terapêutico que utiliza agulhas para estimular pontos específicos do corpo, promovendo equilíbrio e alívio de dores.',
        duration: 60,
        price: 120,
        category: 'Acupuntura',
        color: '#E91E63'
    },
    {
        id: 2,
        name: 'Massagem Terapêutica',
        description: 'Técnicas manuais para alívio de tensões musculares, melhora da circulação e promoção do bem-estar.',
        duration: 50,
        price: 100,
        category: 'Massagem',
        color: '#9C27B0'
    },
    {
        id: 3,
        name: 'RPG - Reeducação Postural',
        description: 'Método de tratamento que corrige desequilíbrios posturais e previne dores na coluna e articulações.',
        duration: 55,
        price: 110,
        category: 'RPG',
        color: '#3F51B5'
    },
    {
        id: 4,
        name: 'Fisioterapia Ortopédica',
        description: 'Reabilitação de lesões musculoesqueléticas, fraturas e pós-operatórios com exercícios e técnicas manuais.',
        duration: 45,
        price: 90,
        category: 'Fisioterapia',
        color: '#2196F3'
    },
    {
        id: 5,
        name: 'Pilates Terapêutico',
        description: 'Exercícios de controle motor e fortalecimento do core para prevenção e reabilitação de lesões.',
        duration: 55,
        price: 80,
        category: 'Pilates',
        color: '#00BCD4'
    },
    {
        id: 6,
        name: 'Avaliação Fisioterapêutica',
        description: 'Análise completa da condição física e postural para diagnóstico e planejamento do tratamento.',
        duration: 40,
        price: 70,
        category: 'Avaliação',
        color: '#FF9800'
    }
];

// Estado da aplicação
let clinicData = {};
let services = [];
let editingServiceId = null;
let serviceToDelete = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderClinicName();
    renderServices();
});

// Carregar dados do localStorage ou usar padrões
function loadData() {
    const savedClinic = localStorage.getItem('clinicData');
    const savedServices = localStorage.getItem('clinicServices');

    clinicData = savedClinic ? JSON.parse(savedClinic) : { ...defaultClinicData };
    services = savedServices ? JSON.parse(savedServices) : [...defaultServices];
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('clinicData', JSON.stringify(clinicData));
    localStorage.setItem('clinicServices', JSON.stringify(services));
}

// Renderizar nome da clínica no header
function renderClinicName() {
    const headerName = document.getElementById('clinicName');
    headerName.textContent = clinicData.name || 'Clínica de Fisioterapia';
}

// Abrir modal de configurações
function openSettings() {
    const modal = document.getElementById('settingsModal');
    const nameInput = document.getElementById('clinicNameInput');
    const addressInput = document.getElementById('clinicAddress');
    const phoneInput = document.getElementById('clinicPhone');
    const emailInput = document.getElementById('clinicEmail');

    nameInput.value = clinicData.name || '';
    addressInput.value = clinicData.address || '';
    phoneInput.value = clinicData.phone || '';
    emailInput.value = clinicData.email || '';

    modal.classList.add('active');
}

// Fechar modal de configurações
function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

// Salvar configurações
function saveSettings() {
    const nameInput = document.getElementById('clinicNameInput');
    const addressInput = document.getElementById('clinicAddress');
    const phoneInput = document.getElementById('clinicPhone');
    const emailInput = document.getElementById('clinicEmail');

    clinicData.name = nameInput.value.trim();
    clinicData.address = addressInput.value.trim();
    clinicData.phone = phoneInput.value.trim();
    clinicData.email = emailInput.value.trim();

    saveData();
    renderClinicName();
    closeSettings();
    showToast('Configurações salvas com sucesso!', 'success');
}

// Renderizar lista de serviços
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    const emptyState = document.getElementById('emptyState');

    if (services.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = services.map(service => `
        <div class="service-card" style="border-left-color: ${service.color}" onclick="editService(${service.id})">
            <div class="service-card-header">
                <h3 class="service-name">${escapeHtml(service.name)}</h3>
                ${service.category ? `<span class="service-category">${escapeHtml(service.category)}</span>` : ''}
            </div>
            ${service.description ? `<p class="service-description">${escapeHtml(service.description)}</p>` : ''}
            <div class="service-details">
                <div class="service-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${service.duration} min
                </div>
                <div class="service-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    R$ ${service.price.toFixed(2)}
                </div>
            </div>
            <div class="service-actions">
                <button class="btn-icon" onclick="event.stopPropagation(); editService(${service.id})" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon delete" onclick="event.stopPropagation(); openConfirmModal(${service.id})" title="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Abrir modal de serviço (novo)
function openServiceModal(serviceId = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const deleteBtn = document.getElementById('btnDeleteService');
    const colorInput = document.getElementById('serviceColor');
    const colorLabel = document.getElementById('colorLabel');

    // Limpar formulário
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('serviceDuration').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceCategory').value = '';
    document.getElementById('serviceColor').value = '#4CAF50';
    colorLabel.textContent = '#4CAF50';

    if (serviceId) {
        const service = services.find(s => s.id === serviceId);
        if (service) {
            title.textContent = 'Editar Serviço';
            deleteBtn.style.display = 'block';
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description || '';
            document.getElementById('serviceDuration').value = service.duration;
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('serviceCategory').value = service.category || '';
            document.getElementById('serviceColor').value = service.color;
            colorLabel.textContent = service.color;
        }
    } else {
        title.textContent = 'Novo Serviço';
        deleteBtn.style.display = 'none';
    }

    editingServiceId = serviceId;
    modal.classList.add('active');
}

// Fechar modal de serviço
function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
    editingServiceId = null;
}

// Editar serviço
function editService(id) {
    openServiceModal(id);
}

// Salvar serviço
function saveService() {
    const id = document.getElementById('serviceId').value;
    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const duration = parseInt(document.getElementById('serviceDuration').value);
    const price = parseFloat(document.getElementById('servicePrice').value);
    const category = document.getElementById('serviceCategory').value;
    const color = document.getElementById('serviceColor').value;

    // Validações
    if (!name) {
        showToast('Por favor, informe o nome do serviço.', 'error');
        return;
    }

    if (!duration || duration < 15) {
        showToast('A duração deve ser de pelo menos 15 minutos.', 'error');
        return;
    }

    if (isNaN(price) || price < 0) {
        showToast('Por favor, informe um preço válido.', 'error');
        return;
    }

    if (id) {
        // Editar existente
        const index = services.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            services[index] = {
                ...services[index],
                name,
                description,
                duration,
                price,
                category,
                color
            };
            showToast('Serviço atualizado com sucesso!', 'success');
        }
    } else {
        // Criar novo
        const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
        services.push({
            id: newId,
            name,
            description,
            duration,
            price,
            category,
            color
        });
        showToast('Serviço criado com sucesso!', 'success');
    }

    saveData();
    renderServices();
    closeServiceModal();
}

// Abrir modal de confirmação
function openConfirmModal(serviceId) {
    serviceToDelete = serviceId;
    const service = services.find(s => s.id === serviceId);
    document.getElementById('confirmServiceName').textContent = service.name;
    document.getElementById('confirmModal').classList.add('active');
}

// Fechar modal de confirmação
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    serviceToDelete = null;
}

// Confirmar exclusão
function confirmDelete() {
    if (serviceToDelete !== null) {
        services = services.filter(s => s.id !== serviceToDelete);
        saveData();
        renderServices();
        showToast('Serviço excluído com sucesso!', 'success');
    }
    closeConfirmModal();
    closeServiceModal();
}

// Excluir serviço (do modal de edição)
function deleteService() {
    if (editingServiceId) {
        openConfirmModal(editingServiceId);
    }
}

// Atualizar label da cor
document.addEventListener('DOMContentLoaded', () => {
    const colorInput = document.getElementById('serviceColor');
    const colorLabel = document.getElementById('colorLabel');

    colorInput.addEventListener('input', (e) => {
        colorLabel.textContent = e.target.value;
    });
});

// Mostrar toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fechar modais com Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettings();
        closeServiceModal();
        closeConfirmModal();
    }
});

// Fechar modais clicando fora
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeSettings();
            closeServiceModal();
            closeConfirmModal();
        }
    });
});
