/**
 * app.js - Versão Corrigida e Simplificada
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE (COLOQUE SUAS CHAVES AQUI NOVAMENTE) ---

const firebaseConfig = {
  apiKey: "AIzaSyDGd2QBLfYTyAtSwaqsJci-sy9stmb1TGQ",
  authDomain: "agrofert-2a6e3.firebaseapp.com",
  projectId: "agrofert-2a6e3",
  storageBucket: "agrofert-2a6e3.firebasestorage.app",
  messagingSenderId: "776623089218",
  appId: "1:776623089218:web:3a7ccee8cedede2bd5afdb"
};


// Inicializa o Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = {
    data: {
        amostras: [], agronomos: [], culturas: [], tecnologias: [], quimicos: []
    },
    
    // --- INICIALIZAÇÃO ---
    init: async function() {
        console.log("Iniciando sistema...");
        await this.loadAllData(); // Carrega tudo do Firebase
        this.setupEventListeners(); // Ativa os botões de salvar
        this.renderAllTables(); // Desenha as tabelas
        this.populateSelects(); // Preenche os selects
        this.updateDashboard();
    },

    // --- CARREGAMENTO DE DADOS ---
    loadAllData: async function() {
        try {
            const collections = ['amostras', 'agronomos', 'culturas', 'tecnologias', 'quimicos'];
            
            for (const colName of collections) {
                const snapshot = await getDocs(collection(db, colName));
                // Mapeia os documentos convertendo para array e guardando o ID
                this.data[colName] = snapshot.docs.map(doc => ({
                    id: doc.id, 
                    ...doc.data()
                }));
            }
            console.log("Dados carregados:", this.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro ao conectar no Firebase. Verifique o console (F12) e suas chaves.");
        }
    },

    // --- SALVAMENTO GERAL (Função Helper) ---
    saveToFirebase: async function(colName, data, id = null) {
        try {
            if(id) {
                // Edição
                await updateDoc(doc(db, colName, id), data);
                alert("Registro atualizado com sucesso!");
            } else {
                // Inclusão
                await addDoc(collection(db, colName), data);
                alert("Registro cadastrado com sucesso!");
            }
            
            // Recarrega tudo para atualizar a tela
            await this.loadAllData();
            this.renderAllTables();
            this.populateSelects();
            this.updateDashboard();
            return true; // Sucesso
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar no banco de dados.");
            return false;
        }
    },

    // --- EXCLUSÃO ---
    deleteData: async function(colName, id) {
        if(!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await deleteDoc(doc(db, colName, id));
            await this.loadAllData();
            this.renderAllTables();
            this.populateSelects();
            this.updateDashboard();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir registro.");
        }
    },

    // --- FUNÇÕES ESPECÍFICAS DE SALVAMENTO (UMA PARA CADA FORMULÁRIO) ---
    
    salvarAgronomo: async function() {
        const id = document.getElementById('idAgronomo').value;
        const dados = {
            nome: document.getElementById('nomeAgronomo').value,
            crea: document.getElementById('creaAgronomo').value
        };
        if(await this.saveToFirebase('agronomos', dados, id)) {
            this.limparForm('agronomoForm', 'idAgronomo');
        }
    },

    salvarCultura: async function() {
        const id = document.getElementById('idCultura').value;
        const dados = {
            nome: document.getElementById('nomeCultura').value,
            tipo: document.getElementById('tipoCultura').value,
            producao: document.getElementById('prodCultura').value
        };
        if(await this.saveToFirebase('culturas', dados, id)) {
            this.limparForm('culturaForm', 'idCultura');
        }
    },

    salvarTecnologia: async function() {
        const id = document.getElementById('idTec').value;
        const dados = {
            nome: document.getElementById('nomeTec').value,
            regiao: document.getElementById('regiaoTec').value
        };
        if(await this.saveToFirebase('tecnologias', dados, id)) {
            this.limparForm('tecForm', 'idTec');
        }
    },

    salvarQuimico: async function() {
        const id = document.getElementById('idQuimico').value;
        const dados = {
            sigla: document.getElementById('siglaQuimico').value,
            nome: document.getElementById('nomeQuimico').value,
            unidade: document.getElementById('unidadeQuimico').value
        };
        if(await this.saveToFirebase('quimicos', dados, id)) {
            this.limparForm('quimicoForm', 'idQuimico');
        }
    },

    salvarAmostra: async function() {
        const id = document.getElementById('idAmostra').value;
        const form = document.getElementById('amostraForm');
        
        // Pega todos os valores explicitamente
        const dados = {
            produtor: document.getElementById('samp_produtor').value,
            propriedade: document.getElementById('samp_propriedade').value,
            cidade: document.getElementById('samp_cidade').value,
            agro: document.getElementById('samp_agro').value,
            protocolo: document.getElementById('samp_protocolo').value,
            talhao: document.getElementById('samp_talhao').value,
            data: document.getElementById('samp_data').value,
            cultura: document.getElementById('samp_cultura').value,
            producao: parseFloat(document.getElementById('samp_producao').value) || 0,
            espacamento: document.getElementById('samp_espacamento').value,
            
            // Química e Física (convertendo para número)
            ph: parseFloat(document.getElementById('samp_ph').value) || 0,
            mo: parseFloat(document.getElementById('samp_mo').value) || 0,
            p: parseFloat(document.getElementById('samp_p').value) || 0,
            s: parseFloat(document.getElementById('samp_s').value) || 0,
            ca: parseFloat(document.getElementById('samp_ca').value) || 0,
            mg: parseFloat(document.getElementById('samp_mg').value) || 0,
            k: parseFloat(document.getElementById('samp_k').value) || 0,
            hal: parseFloat(document.getElementById('samp_hal').value) || 0,
            al: parseFloat(document.getElementById('samp_al').value) || 0,
            argila: parseFloat(document.getElementById('samp_argila').value) || 0,
            areia: parseFloat(document.getElementById('samp_areia').value) || 0,
            zn: parseFloat(document.getElementById('samp_zn').value) || 0,
            b: parseFloat(document.getElementById('samp_b').value) || 0,
            mn: parseFloat(document.getElementById('samp_mn').value) || 0,
            cu: parseFloat(document.getElementById('samp_cu').value) || 0,
            fe: parseFloat(document.getElementById('samp_fe').value) || 0,
            mo_micro: parseFloat(document.getElementById('samp_mo_micro').value) || 0
        };

        if(await this.saveToFirebase('amostras', dados, id)) {
            this.limparForm('amostraForm', 'idAmostra');
        }
    },

    // --- EVENT LISTENERS (Ligando os botões) ---
    setupEventListeners: function() {
        document.getElementById('agronomoForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.salvarAgronomo(); });
        document.getElementById('culturaForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.salvarCultura(); });
        document.getElementById('tecForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.salvarTecnologia(); });
        document.getElementById('quimicoForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.salvarQuimico(); });
        document.getElementById('amostraForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.salvarAmostra(); });
    },

    // --- RENDERIZAÇÃO DAS TABELAS ---
    renderAllTables: function() {
        // Amostras
        this.renderTable('listaCorpoAmostra', this.data.amostras, (item) => `
            <td><small>${item.protocolo || '-'}</small><br><strong>${item.talhao}</strong></td>
            <td>${item.produtor}</td>
            <td>${item.cultura}</td>
            <td>
                <button class="btn-rec" onclick="app.gerarRecomendacao('${item.id}')">Relat.</button>
                <button class="btn-action btn-cancel" onclick="app.editarItem('amostras', '${item.id}')">✎</button>
                <button class="btn-action btn-cancel" onclick="app.deleteData('amostras', '${item.id}')">🗑️</button>
            </td>
        `);

        // Agrônomos
        this.renderTable('listaCorpoAgro', this.data.agronomos, (item) => `
            <td>${item.nome}</td><td>${item.crea}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('agronomos', '${item.id}')">✎</button>
                <button class="btn-action btn-cancel" onclick="app.deleteData('agronomos', '${item.id}')">🗑️</button></td>
        `);

        // Culturas
        this.renderTable('listaCorpoCultura', this.data.culturas, (item) => `
            <td>${item.nome}</td><td>${item.tipo}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('culturas', '${item.id}')">✎</button>
                <button class="btn-action btn-cancel" onclick="app.deleteData('culturas', '${item.id}')">🗑️</button></td>
        `);

        // Tecnologias
        this.renderTable('listaCorpoTec', this.data.tecnologias, (item) => `
            <td>${item.nome}</td><td>${item.regiao}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('tecnologias', '${item.id}')">✎</button>
                <button class="btn-action btn-cancel" onclick="app.deleteData('tecnologias', '${item.id}')">🗑️</button></td>
        `);

        // Químicos
        this.renderTable('listaCorpoQuimico', this.data.quimicos, (item) => `
            <td>${item.sigla}</td><td>${item.nome}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('quimicos', '${item.id}')">✎</button>
                <button class="btn-action btn-cancel" onclick="app.deleteData('quimicos', '${item.id}')">🗑️</button></td>
        `);
    },

    renderTable: function(tbodyId, dataArray, rowHtmlFunc) {
        const tbody = document.getElementById(tbodyId);
        if(!tbody) return;
        tbody.innerHTML = '';
        if(dataArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum registro encontrado.</td></tr>';
            return;
        }
        dataArray.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtmlFunc(item);
            tbody.appendChild(tr);
        });
    },

    // --- EDIÇÃO (Preencher formulário) ---
    editarItem: function(colName, id) {
        const item = this.data[colName].find(i => i.id === id);
        if(!item) return;

        // Redireciona para a aba correta e preenche
        if(colName === 'amostras') {
            this.navigateTo('amostras');
            document.getElementById('idAmostra').value = id;
            document.getElementById('samp_produtor').value = item.produtor;
            document.getElementById('samp_propriedade').value = item.propriedade;
            document.getElementById('samp_cidade').value = item.cidade;
            document.getElementById('samp_agro').value = item.agro;
            document.getElementById('samp_protocolo').value = item.protocolo;
            document.getElementById('samp_talhao').value = item.talhao;
            document.getElementById('samp_data').value = item.data;
            document.getElementById('samp_cultura').value = item.cultura;
            document.getElementById('samp_producao').value = item.producao;
            document.getElementById('samp_ph').value = item.ph;
            document.getElementById('samp_mo').value = item.mo;
            document.getElementById('samp_p').value = item.p;
            document.getElementById('samp_k').value = item.k;
            document.getElementById('samp_ca').value = item.ca;
            document.getElementById('samp_mg').value = item.mg;
            document.getElementById('samp_hal').value = item.hal;
            document.getElementById('samp_al').value = item.al;
            document.getElementById('samp_argila').value = item.argila;
            // (Adicione os outros campos se necessário, mas estes são os principais para o teste)
        } else if (colName === 'agronomos') {
            this.navigateTo('agronomos');
            document.getElementById('idAgronomo').value = id;
            document.getElementById('nomeAgronomo').value = item.nome;
            document.getElementById('creaAgronomo').value = item.crea;
        } else if (colName === 'culturas') {
            this.navigateTo('culturas');
            document.getElementById('idCultura').value = id;
            document.getElementById('nomeCultura').value = item.nome;
            document.getElementById('tipoCultura').value = item.tipo;
            document.getElementById('prodCultura').value = item.producao;
        }
    },

    // --- OUTROS ---
    limparForm: function(formId, idFieldId) {
        document.getElementById(formId).reset();
        document.getElementById(idFieldId).value = '';
    },

    navigateTo: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        if(viewId === 'amostras') {
            this.populateSelects();
        }
    },

    populateSelects: function() {
        const selAgro = document.getElementById('samp_agro');
        const selCult = document.getElementById('samp_cultura');
        
        if(selAgro && this.data.agronomos) {
            selAgro.innerHTML = '<option value="">Selecione...</option>' + 
                this.data.agronomos.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('');
        }
        if(selCult && this.data.culturas) {
            selCult.innerHTML = '<option value="">Selecione...</option>' + 
                this.data.culturas.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
        }
    },

    preencherTeste: function() {
        document.getElementById('samp_produtor').value = "Produtor Teste";
        document.getElementById('samp_propriedade').value = "Gleba X";
        document.getElementById('samp_cidade').value = "Cidade Teste";
        document.getElementById('samp_talhao').value = "T-01";
        document.getElementById('samp_data').valueAsDate = new Date();
        document.getElementById('samp_producao').value = "10";
        document.getElementById('samp_ph').value = 5.0;
        document.getElementById('samp_mo').value = 25;
        document.getElementById('samp_p').value = 12;
        document.getElementById('samp_k').value = 0.2;
        document.getElementById('samp_ca').value = 2.0;
        document.getElementById('samp_mg').value = 0.8;
        document.getElementById('samp_hal').value = 3.5;
        document.getElementById('samp_al').value = 0.2;
        document.getElementById('samp_argila').value = 30;
    },

    updateDashboard: function() {
        if(document.getElementById('dashTotalAmostras')) document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        if(document.getElementById('dashTotalCulturas')) document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
        if(document.getElementById('dashTotalAgronomos')) document.getElementById('dashTotalAgronomos').textContent = this.data.agronomos.length;
    },

    // --- RECOMENDAÇÃO (Código simplificado para manter o foco no cadastro) ---
    gerarRecomendacao: function(id) {
        const amostra = this.data.amostras.find(a => a.id === id);
        if(!amostra) return;
        document.getElementById('conteudoRecomendacao').innerHTML = `<h2>Relatório</h2><p>Amostra ID: ${id}</p><p>Produtor: ${amostra.produtor}</p><p>Em breve lógica de cálculo.</p>`;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },

    fecharModal: function() {
        document.getElementById('modalRecomendacao').style.display = 'none';
    },

    atualizarDetalhesCultura: function() {
        // Opção para futura implementação de preenchimento automático
    }
};

window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});