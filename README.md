# FisioAgenda - Sistema de Agendamento para Clínicas de Fisioterapia

Sistema completo de gerenciamento de serviços e envio de links de agendamento via WhatsApp na nuvem.

## Funcionalidades

- **Gerenciamento de Serviços**: CRUD completo com categorias, preços e durações
- **Integração Calendly**: Geração automática de links de agendamento
- **WhatsApp Cloud API**: Envio de mensagens diretamente da nuvem
- **Mensagens Automáticas**: Modelos personalizados para saudação, lembrete e reativação
- **Envio em Lote**: Importação de CSV para envio massivo
- **Dashboard**: Visão geral do sistema

## Arquitetura

```
fisioagenda/
├── index.html          # Interface principal
├── src/
│   ├── styles.css      # Estilos
│   └── app.js          # Lógica do cliente
├── api/
│   ├── send-message.js # Envio via WhatsApp API
│   └── webhook.js      # Receber atualizações
├── vercel.json         # Configuração de deploy
└── .env.example        # Variáveis de ambiente
```

## Deploy Gratuito no Vercel

### 1. Preparar o Repositório

```bash
# Inicializar Git
git init
git add .
git commit -m "Initial commit"
```

### 2. Criar Conta no GitHub

1. Acesse [github.com](https://github.com)
2. Crie uma conta gratuita
3. Crie um novo repositório chamado `fisioagenda`

### 3. Enviar para o GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/fisioagenda.git
git branch -M main
git push -u origin main
```

### 4. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta do GitHub
3. Clique em "New Project"
4. Selecione o repositório `fisioagenda`
5. Clique em "Deploy"

Pronto! Seu sistema estará rodando gratuitamente na nuvem.

## Configuração do WhatsApp Business API

### 1. Criar Conta no Meta Business

1. Acesse [business.facebook.com](https://business.facebook.com)
2. Crie uma conta Business (gratuita)
3. Valide seu e-mail e telefone

### 2. Ativar WhatsApp Business API

1. No Meta Business Suite, vá em **Configurações** → **WhatsApp**
2. Clique em **Iniciar** para ativar a API
3. Adicione seu número de telefone

### 3. Gerar Token de Acesso

1. Na página do WhatsApp API, clique em **Gerar Token**
2. Copie o token gerado
3. No FisioAgenda, vá em **WhatsApp** → **Credenciais da API**
4. Cole o token nos campos correspondentes

### 4. Configurar Webhook

1. No Meta Business, vá em **Configurações** → **WhatsApp** → **Webhook**
2. Clique em **Editar** na URL do webhook
3. Cole: `https://seu-app.vercel.app/api/webhook`
4. Use o Token de Verificação gerado no FisioAgenda
5. Marque os eventos: `messages`, `message_status`

## Configuração do Calendly

### 1. Criar Conta no Calendly

1. Acesse [calendly.com](https://calendly.com)
2. Crie uma conta gratuita
3. Configure seus horários disponíveis

### 2. Configurar no FisioAgenda

1. Vá em **Configurações** → **Integração Calendly**
2. Insira seu nome de usuário (parte da URL)
3. Para cada serviço, configure o slug do evento

### 3. Criar Eventos no Calendly

Para cada serviço, crie um tipo de evento específico:

1. No Calendly, clique em **New Event Type**
2. Escolha **One-on-One**
3. Configure nome, duração e descrição
4. Copie o slug da URL (parte final)
5. No FisioAgenda, edite o serviço e insira o slug

## Uso Diário

### Enviar Link Individual

1. Vá em **Mensagens**
2. Selecione o serviço
3. Digite o nome e telefone do cliente
4. Escolha o modelo de mensagem
5. Clique em **Enviar via WhatsApp**

### Envio em Lote

1. Prepare um CSV com: `nome,telefone,serviço`
2. Vá em **Mensagens** → **Envio em Lote**
3. Arraste o arquivo CSV
4. Confirme e envie

## Variáveis de Ambiente (Opcional)

No Vercel, você pode configurar variáveis de ambiente:

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - `WHATSAPP_VERIFY_TOKEN`: Token de verificação do webhook

## Suporte

Para dúvidas ou problemas:

1. Verifique o README do repositório
2. Consulte a documentação do Meta Business
3. Abra uma issue no GitHub

## Licença

MIT License - Uso livre para fins comerciais e pessoais.
