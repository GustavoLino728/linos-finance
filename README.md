
# Organização Financeira App 💸

Este é um projeto **pessoal e experimental**, desenvolvido com o objetivo de solucionar uma necessidade real minha: **organizar e registrar meus lançamentos financeiros** de forma simples e acessível.

A proposta é integrar um aplicativo mobile com o Google Planilhas para permitir o controle total dos dados, aliado a um backend em Python — tudo construído por mim com o intuito de aprender e praticar tecnologias modernas, APIs e boas práticas de desenvolvimento fullstack.

---

## ✨ Funcionalidades

- Adição de lançamentos financeiros (entradas e saídas)
- Envio dos dados diretamente para uma planilha Google Sheets
- Integração simples, com interface limpa e funcional
- Backend próprio que intermedeia as requisições com autenticação

---

## 🛠️ Tecnologias Utilizadas

### 🔙 Backend — Python + Flask
- **Python**: linguagem principal do backend
- **Flask**: microframework para API REST
- **gspread**: integração com Google Sheets
- **google-auth**: autenticação com conta de serviço (service account)
- **python-dotenv**: uso de variáveis de ambiente
- **Supabase**: banco de dados usado para mapear o link da planilha de cada usuário (experimento com PostgreSQL via API)

### 📲 Frontend — React Native + Expo
- **React Native**: para criar o aplicativo mobile
- **Expo**: ferramenta para facilitar desenvolvimento e execução do app
- **Fetch API**: para comunicação com a API Flask
- **TypeScript**: adicionando tipagem ao projeto React Native

---

## 📚 Aprendizados

Esse projeto me ajudou a aprofundar conhecimentos práticos em:

- Integração com **APIs do Google** (auth + planilhas)
- Construção de **backends com Python e Flask**
- Criação de **aplicativos mobile com React Native**
- Organização do fluxo de dados entre frontend ↔ backend ↔ serviço externo (Google Sheets)
- Uso de **variáveis de ambiente** e princípios básicos de segurança
- Consumo e gerenciamento de dados via **Supabase** como banco de dados
- Estruturação de um projeto **fullstack modular** (frontend + backend separados)

---

## ▶️ Como executar

### 🔧 Backend (Python) — Windows

1. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   ```

2. Ative o ambiente:
   ```bash
   .\venv\Scripts\activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Crie um arquivo `.env` na raiz do backend e insira suas variáveis:
   ```
   GOOGLE_CREDENTIALS=<sua_credencial_google_em_formato_JSON_escape>
   SUPABASE_URL=<url>
   SUPABASE_ANON_KEY=<chave>
   ```

5. Execute o servidor:
   ```bash
   python api.py
   ```

---

### 📱 Frontend (React Native com Expo) — Windows

1. Instale o [Node.js](https://nodejs.org) (já inclui o npm)
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o projeto com Expo:
   ```bash
   npx expo start
   ```

4. Abra o app com o Expo Go no seu celular ou em um emulador Android/iOS

---

## 🙋‍♂️ Autor

Desenvolvido por **Gustavo Lino** como projeto pessoal de aprendizado.

Se quiser acompanhar minha evolução, estou sempre testando ideias e aprendendo coisas novas.

---
