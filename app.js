/**
 * app.js - Sistema AgroFert
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- COLE SUAS CHAVES DO FIREBASE AQUI ---

const firebaseConfig = {
  apiKey: "AIzaSyDGd2QBLfYTyAtSwaqsJci-sy9stmb1TGQ",
  authDomain: "agrofert-2a6e3.firebaseapp.com",
  projectId: "agrofert-2a6e3",
  storageBucket: "agrofert-2a6e3.firebasestorage.app",
  messagingSenderId: "776623089218",
  appId: "1:776623089218:web:3a7ccee8cedede2bd5afdb"
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = {
    data: { amostras: [], agronomos: [], culturas: [], tecnologias: [], quimicos: [] },
    
    // --- INICIALIZAÇÃO ---
    init: async function() {
        console.log("App iniciado.");
        await this.loadAllData();
        this.setupEventListeners();
        this.renderAllTables();
        this.populateSelects();
        this.updateDashboard();
    },

    // --- CARREGAMENTO DE DADOS (READ) ---
    loadAllData: async function() {
        try {
            const cols = ['amostras', 'agronomos', 'culturas', 'tecnologias', 'quimicos'];
            for (const c of cols) {
                const snap = await getDocs(collection(db, c));
                this.data[c] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        } catch (e) {
            console.error("Erro Firebase:", e);
            alert("Erro de conexão. Verifique suas chaves no arquivo app.js");
        }
    },

    // --- HELPER DE SALVAMENTO ---
    saveToFirebase: async function(colName, data, id) {
        try {
            if(id) {
                await updateDoc(doc(db, colName, id), data);
                alert("Registro atualizado!");
            } else {
                await addDoc(collection(db, colName), data);
                alert("Registro salvo!");
            }
            await this.loadAllData();
            this.renderAllTables();
            this.populateSelects();
            this.updateDashboard();
            return true;
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar: " + e.message);
            return false;
        }
    },

    // --- EXCLUSÃO (DELETE) ---
    deleteData: async function(colName, id) {
        if(confirm("Deseja realmente excluir?")) {
            try {
                await deleteDoc(doc(db, colName, id));
                await this.loadAllData();
                this.renderAllTables();
                this.updateDashboard();
            } catch (e) {
                console.error(e);
                alert("Erro ao excluir.");
            }
        }
    },

    // --- FUNÇÕES DE SALVAR ESPECÍFICAS (CREATE/UPDATE) ---
    
    salvarAmostra: function() {
        const id = document.getElementById('idAmostra').value;
        const data = {
            // Dados Gerais
            produtor: document.getElementById('samp_produtor').value,
            propriedade: document.getElementById('samp_propriedade').value,
            cidade: document.getElementById('samp_cidade').value,
            agro: document.getElementById('samp_agro').value,
            protocolo: document.getElementById('samp_protocolo').value,
            talhao: document.getElementById('samp_talhao').value,
            data: document.getElementById('samp_data').value,
            cultura: document.getElementById('samp_cultura').value,
            producao: parseFloat(document.getElementById('samp_producao').value) || 0,
            
            // Espaçamentos
            esp_linha: parseFloat(document.getElementById('samp_esp_linha').value) || 0,
            esp_cova: parseFloat(document.getElementById('samp_esp_cova').value) || 0,
            
            // Química
            ph: parseFloat(document.getElementById('samp_ph').value) || 0,
            mo: parseFloat(document.getElementById('samp_mo').value) || 0,
            p: parseFloat(document.getElementById('samp_p').value) || 0,
            s: parseFloat(document.getElementById('samp_s').value) || 0,
            ca: parseFloat(document.getElementById('samp_ca').value) || 0,
            mg: parseFloat(document.getElementById('samp_mg').value) || 0,
            k: parseFloat(document.getElementById('samp_k').value) || 0,
            hal: parseFloat(document.getElementById('samp_hal').value) || 0,
            al: parseFloat(document.getElementById('samp_al').value) || 0,
            
            // Física
            argila: parseFloat(document.getElementById('samp_argila').value) || 0,
            areia: parseFloat(document.getElementById('samp_areia').value) || 0,
            
            // Micros
            zn: parseFloat(document.getElementById('samp_zn').value) || 0,
            b: parseFloat(document.getElementById('samp_b').value) || 0,
            mn: parseFloat(document.getElementById('samp_mn').value) || 0,
            cu: parseFloat(document.getElementById('samp_cu').value) || 0,
            fe: parseFloat(document.getElementById('samp_fe').value) || 0,
            mo_micro: parseFloat(document.getElementById('samp_mo_micro').value) || 0
        };
        this.saveToFirebase('amostras', data, id).then(ok => { if(ok) this.limparForm('amostraForm', 'idAmostra'); });
    },

    salvarAgronomo: function() {
        const id = document.getElementById('idAgronomo').value;
        const data = {
            nome: document.getElementById('nomeAgronomo').value,
            crea: document.getElementById('creaAgronomo').value
        };
        this.saveToFirebase('agronomos', data, id).then(ok => { if(ok) this.limparForm('agronomoForm', 'idAgronomo'); });
    },

    salvarCultura: function() {
        const id = document.getElementById('idCultura').value;
        const data = {
            nome: document.getElementById('nomeCultura').value,
            tipo: document.getElementById('tipoCultura').value,
            producao: document.getElementById('prodCultura').value
        };
        this.saveToFirebase('culturas', data, id).then(ok => { if(ok) this.limparForm('culturaForm', 'idCultura'); });
    },

    salvarTecnologia: function() {
        const id = document.getElementById('idTec').value;
        const data = {
            nome: document.getElementById('nomeTec').value,
            regiao: document.getElementById('regiaoTec').value
        };
        this.saveToFirebase('tecnologias', data, id).then(ok => { if(ok) this.limparForm('tecForm', 'idTec'); });
    },

    salvarQuimico: function() {
        const id = document.getElementById('idQuimico').value;
        const data = {
            sigla: document.getElementById('siglaQuimico').value,
            nome: document.getElementById('nomeQuimico').value,
            unidade: document.getElementById('unidadeQuimico').value
        };
        this.saveToFirebase('quimicos', data, id).then(ok => { if(ok) this.limparForm('quimicoForm', 'idQuimico'); });
    },

    // --- PREENCHIMENTO DE TESTE (COMPLETO) ---
    preencherTeste: function() {
        const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
        
        document.getElementById('samp_produtor').value = "Produtor Teste";
        document.getElementById('samp_propriedade').value = "Fazenda Esperança";
        document.getElementById('samp_cidade').value = "Rio Verde/GO";
        document.getElementById('samp_talhao').value = "T-" + Math.floor(Math.random() * 100);
        document.getElementById('samp_protocolo').value = "LAB-" + Math.floor(Math.random() * 9999);
        document.getElementById('samp_data').valueAsDate = new Date();
        document.getElementById('samp_producao').value = "12.5";
        document.getElementById('samp_esp_linha').value = "0.80";
        document.getElementById('samp_esp_cova').value = "0.20";
        
        document.getElementById('samp_ph').value = rand(4.5, 6.5);
        document.getElementById('samp_mo').value = rand(15, 45);
        document.getElementById('samp_p').value = rand(5, 30);
        document.getElementById('samp_s').value = rand(2, 12);
        document.getElementById('samp_ca').value = rand(1.0, 4.0);
        document.getElementById('samp_mg').value = rand(0.5, 1.5);
        document.getElementById('samp_k').value = rand(0.1, 0.6);
        document.getElementById('samp_hal').value = rand(1.5, 4.5);
        document.getElementById('samp_al').value = rand(0.0, 0.8);
        document.getElementById('samp_argila').value = Math.floor(rand(15, 60));
        document.getElementById('samp_areia').value = Math.floor(rand(10, 50));
        
        document.getElementById('samp_zn').value = rand(0.5, 3.0);
        document.getElementById('samp_b').value = rand(0.1, 0.6);
        document.getElementById('samp_mn').value = rand(2.0, 15.0);
        document.getElementById('samp_cu').value = rand(0.2, 2.0);
        document.getElementById('samp_fe').value = rand(15, 60);
        document.getElementById('samp_mo_micro').value = rand(0.01, 0.1);
    },

    // --- CONFIGURAÇÃO DE EVENTOS ---
    setupEventListeners: function() {
        document.getElementById('agronomoForm').addEventListener('submit', (e) => { e.preventDefault(); this.salvarAgronomo(); });
        document.getElementById('culturaForm').addEventListener('submit', (e) => { e.preventDefault(); this.salvarCultura(); });
        document.getElementById('tecForm').addEventListener('submit', (e) => { e.preventDefault(); this.salvarTecnologia(); });
        document.getElementById('quimicoForm').addEventListener('submit', (e) => { e.preventDefault(); this.salvarQuimico(); });
        document.getElementById('amostraForm').addEventListener('submit', (e) => { e.preventDefault(); this.salvarAmostra(); });
    },

    // --- RENDERIZAÇÃO DE TABELAS ---
    renderAllTables: function() {
        this.renderTable('listaCorpoAmostra', this.data.amostras, i => `
            <td>${i.produtor}</td><td>${i.talhao}</td><td>${i.cultura}</td>
            <td>
                <button onclick="app.gerarRecomendacao('${i.id}')">Relat.</button> 
                <button onclick="app.editarItem('amostras','${i.id}')">✎</button> 
                <button onclick="app.deleteData('amostras','${i.id}')">🗑️</button>
            </td>
        `);
        this.renderTable('listaCorpoAgro', this.data.agronomos, i => `
            <td>${i.nome}</td><td>${i.crea}</td>
            <td><button onclick="app.editarItem('agronomos','${i.id}')">✎</button> <button onclick="app.deleteData('agronomos','${i.id}')">🗑️</button></td>
        `);
        this.renderTable('listaCorpoCultura', this.data.culturas, i => `
            <td>${i.nome}</td><td>${i.tipo}</td>
            <td><button onclick="app.editarItem('culturas','${i.id}')">✎</button> <button onclick="app.deleteData('culturas','${i.id}')">🗑️</button></td>
        `);
        this.renderTable('listaCorpoTec', this.data.tecnologias, i => `
            <td>${i.nome}</td><td>${i.regiao}</td>
            <td><button onclick="app.editarItem('tecnologias','${i.id}')">✎</button> <button onclick="app.deleteData('tecnologias','${i.id}')">🗑️</button></td>
        `);
        this.renderTable('listaCorpoQuimico', this.data.quimicos, i => `
            <td>${i.sigla}</td><td>${i.nome}</td>
            <td><button onclick="app.editarItem('quimicos','${i.id}')">✎</button> <button onclick="app.deleteData('quimicos','${i.id}')">🗑️</button></td>
        `);
    },

    renderTable: function(tbodyId, list, htmlCallback) {
        const tb = document.getElementById(tbodyId);
        tb.innerHTML = '';
        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = htmlCallback(item);
            tb.appendChild(tr);
        });
    },

    // --- EDIÇÃO (PREENCHIMENTO DE FORMULÁRIO) ---
    editarItem: function(col, id) {
        const item = this.data[col].find(i => i.id === id);
        if(!item) return;

        if(col === 'amostras') {
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
            document.getElementById('samp_esp_linha').value = item.esp_linha;
            document.getElementById('samp_esp_cova').value = item.esp_cova;
            document.getElementById('samp_ph').value = item.ph;
            document.getElementById('samp_mo').value = item.mo;
            document.getElementById('samp_p').value = item.p;
            document.getElementById('samp_s').value = item.s;
            document.getElementById('samp_ca').value = item.ca;
            document.getElementById('samp_mg').value = item.mg;
            document.getElementById('samp_k').value = item.k;
            document.getElementById('samp_hal').value = item.hal;
            document.getElementById('samp_al').value = item.al;
            document.getElementById('samp_argila').value = item.argila;
            document.getElementById('samp_areia').value = item.areia;
            document.getElementById('samp_zn').value = item.zn;
            document.getElementById('samp_b').value = item.b;
            document.getElementById('samp_mn').value = item.mn;
            document.getElementById('samp_cu').value = item.cu;
            document.getElementById('samp_fe').value = item.fe;
            document.getElementById('samp_mo_micro').value = item.mo_micro;
        } else if (col === 'agronomos') {
            this.navigateTo('agronomos');
            document.getElementById('idAgronomo').value = id;
            document.getElementById('nomeAgronomo').value = item.nome;
            document.getElementById('creaAgronomo').value = item.crea;
        } else if (col === 'culturas') {
            this.navigateTo('culturas');
            document.getElementById('idCultura').value = id;
            document.getElementById('nomeCultura').value = item.nome;
            document.getElementById('tipoCultura').value = item.tipo;
            document.getElementById('prodCultura').value = item.producao;
        } else if (col === 'tecnologias') {
            this.navigateTo('tecnologias');
            document.getElementById('idTec').value = id;
            document.getElementById('nomeTec').value = item.nome;
            document.getElementById('regiaoTec').value = item.regiao;
        } else if (col === 'quimicos') {
            this.navigateTo('quimicos');
            document.getElementById('idQuimico').value = id;
            document.getElementById('siglaQuimico').value = item.sigla;
            document.getElementById('nomeQuimico').value = item.nome;
            document.getElementById('unidadeQuimico').value = item.unidade;
        }
    },

    // --- UTILITÁRIOS ---
    limparForm: function(formId, idId) {
        document.getElementById(formId).reset();
        document.getElementById(idId).value = '';
    },

    navigateTo: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        document.getElementById(`nav-${viewId}`).classList.add('active');
        if(viewId === 'amostras') this.populateSelects();
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

    updateDashboard: function() {
        if(document.getElementById('dashTotalAmostras')) document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        if(document.getElementById('dashTotalAgronomos')) document.getElementById('dashTotalAgronomos').textContent = this.data.agronomos.length;
        if(document.getElementById('dashTotalCulturas')) document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },

    gerarRecomendacao: function(id) {
        const amostra = this.data.amostras.find(a => a.id === id);
        if(!amostra) return;
        document.getElementById('conteudoRecomendacao').innerHTML = `<h2>Relatório</h2><p>Amostra: ${amostra.talhao}</p><p>Em breve cálculos IAC 100.</p>`;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },

    fecharModal: function() { document.getElementById('modalRecomendacao').style.display = 'none'; },
    
    atualizarDetalhesCultura: function() {
        const nome = document.getElementById('samp_cultura').value;
        const item = this.data.culturas.find(c => c.nome === nome);
        if(item) document.getElementById('samp_producao').value = item.producao || '';
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());