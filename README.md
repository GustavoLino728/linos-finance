# Organização Financeira App

> **Aplicativo PWA para controle financeiro pessoal com integração ao Google Sheets**










---

## **Sobre o Projeto**

Este é um **projeto pessoal** desenvolvido por **Gustavo Lino** com o objetivo de treinar minhas experiências em desenvolvimento full-stack e resolver um problema real que muitos enfrentam: **a organização financeira pessoal**.

### **Por que este app existe?**

Como muitas pessoas, eu sempre tive dificuldades para:

- Controlar meus gastos mensais
- Categorizar despesas de forma organizada
- Ter uma visão clara de onde meu dinheiro estava sendo gasto
- Manter dados financeiros sincronizados entre dispositivos
- Acessar informações financeiras mesmo offline


A solução? Um aplicativo que integra com **Google Sheets** (que já uso para controle financeiro) e funciona tanto no **celular quanto no computador**, com suporte **offline completo**.

---

## **Evolução do Projeto**

### **Ideia Inicial: React Native + Expo**

- **Objetivo**: Criar um APK para Android
- **Limitação**: Precisaria desenvolver separadamente para iOS
- **Problema**: Duas bases de código diferentes para manter


### **Solução Final: PWA (Progressive Web App)**

- **Vantagem**: Funciona em **iPhone, Android e Desktop**
- **Benefício**: Uma única base de código
- **Resultado**: Experiência nativa em qualquer dispositivo


---

## **Funcionalidades**

### **Autenticação**

- Cadastro com nome, email e link da planilha Google Sheets
- Login persistente (não precisa logar toda vez)
- Cada usuário tem sua planilha separada


### **Lançamentos Financeiros**

#### **📈 Entradas (Receitas)**

- Descrição
- Valor
- Data (com DatePicker integrado)


#### **📉 Saídas (Despesas)**

- Descrição
- Valor
- Data
- Categoria (modal com opções)
- Método de Pagamento (modal com opções)
- **Parcelamento inteligente**: Para cartão de crédito

- Checkbox "Parcelado"
- Input para número de parcelas
- Backend divide automaticamente por mês





### **Funcionalidades Offline**

- **Funciona 100% offline** após primeira carga
- Salva transações localmente quando sem internet
- **Sincronização automática** quando volta online
- Indicadores visuais de status de conexão
- Cache inteligente de recursos


### **Interface & UX**

- **Modo escuro/claro** com toggle
- Design responsivo (mobile-first)
- Paleta de cores personalizada
- Feedback visual para todas as ações
- Experiência similar a app nativo


### **Monitoramento**

- Status de conexão com internet (Verde/Vermelho)
- Status de conexão com backend (Conectado/Desconectado)
- Contador de transações pendentes de sincronização
- Botão de sincronização manual


---

## ️ **Tecnologias Utilizadas**

### **🎯 Frontend (PWA)**

| Tecnologia | Versão | Função
|-----|-----|-----
| **Next.js** | 14.0.4 | Framework React com SSR/SSG
| **React** | 18.2.0 | Biblioteca para interfaces
| **TypeScript** | 5.3.0 | Tipagem estática
| **Tailwind CSS** | 3.3.6 | Framework CSS utility-first
| **Lucide React** | 0.294.0 | Biblioteca de ícones


### **📱 PWA & Offline**

| Tecnologia | Função
|-----|-----|-----
| **Service Worker** | Cache offline e sincronização
| **IndexedDB** | Banco de dados local
| **Web App Manifest** | Instalação como app nativo
| **Cache API** | Sistema de cache inteligente


### **🔧 Backend**

| Tecnologia | Função
|-----|-----|-----
| **Python Flask** | API REST
| **Supabase** | Banco de dados (PostgreSQL)
| **Google Sheets API** | Integração com planilhas
| **Google OAuth2** | Autenticação com Google


### **☁️ Deploy & Infraestrutura**

| Serviço | Função
|-----|-----|-----
| **Render** | Hospedagem backend e frontend
| **Supabase Cloud** | Banco de dados gerenciado
| **Google Cloud** | APIs do Google Sheets


---

## ️ **Arquitetura do Sistema**

```plaintext
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend PWA  │    │   Backend API   │    │  Google Sheets  │
│                 │    │                 │    │                 │
│ • Next.js       │◄──►│ • Flask         │◄──►│ • Planilha User │
│ • IndexedDB     │    │ • Supabase      │    │ • Aba Lançamentos│
│ • Service Worker│    │ • Google API    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Cache Offline   │    │   Database      │
│                 │    │                 │
│ • Transações    │    │ • Usuários      │
│ • Recursos      │    │ • Autenticação  │
│ • Sincronização │    │                 │
└─────────────────┘    └─────────────────┘
```

---

## **Como Funciona**

### **1. Cadastro & Setup**

1. Usuário cria conta com email e nome
2. Fornece link da planilha Google Sheets
3. Backend configura acesso à planilha específica


### **2. Lançamentos Online**

1. Usuário registra entrada/saída no app
2. Dados são enviados para o backend
3. Backend processa e salva na planilha Google Sheets
4. Confirmação visual no app


### **3. Modo Offline**

1. App detecta perda de conexão
2. Transações são salvas no IndexedDB local
3. Interface mostra status "offline"
4. Contador de transações pendentes


### **4. Sincronização**

1. App detecta retorno da conexão
2. Sincronização automática das transações pendentes
3. Dados são enviados para o backend
4. Limpeza do cache local após confirmação


---

## **Como Executar**

### **Pré-requisitos**

- Node.js 18+
- Python 3.8+
- Conta no Supabase
- Projeto no Google Cloud Console


### **Backend**

```shellscript
cd backend/
pip install -r requirements.txt
python api.py
```

### **Frontend**

```shellscript
cd frontend/
npm install --legacy-peer-deps
npm run dev
```


---

## **Objetivos de Aprendizado**

Este projeto me permitiu praticar e aprender:


### **Backend**

- ✅ Flask para APIs REST
- ✅ Integração com Google Sheets API
- ✅ Supabase como BaaS
- ✅ Autenticação e autorização
- ✅ CORS e segurança web


### **DevOps & Deploy**

- ✅ Deploy em produção (Render)
- ✅ Configuração de domínios
- ✅ Variáveis de ambiente
- ✅ Monitoramento de aplicações


---

## **Próximas Funcionalidades**

- Dashboard com gráficos e analytics
- Orçamento por categoria com alertas
- Transações recorrentes automáticas
- Notificações push inteligentes
- Exportação de relatórios em PDF
- Metas financeiras e acompanhamento


---

## **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## ‍ **Autor**

**Gustavo Lino**

- 💼 Desenvolvedor Backend
- 🎯 Foco em resolver problemas reais com tecnologia
- 📧 gustavoaraujoln728@gmail.com
- 🔗 Linkedin
- 🐙 [Seu GitHub]


---

<div>**⭐ Se este projeto te ajudou, considere dar uma estrela!**

*Desenvolvido com ❤️ por Gustavo Lino*

</div>