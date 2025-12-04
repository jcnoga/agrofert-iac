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


// Inicializa o App
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = {
    data: { 
        amostras: [], 
        agronomos: [], 
        culturas: [], 
        tecnologias: [], 
        quimicos: [] 
    },
    
    // --- INICIALIZAÇÃO ---
    init: async function() {
        console.log("Sistema iniciando...");
        
        // 1. Configura os botões de salvar (Listeners)
        this.setupEventListeners();
        
        // 2. Carrega os dados do banco
        await this.loadAllData();
        
        // 3. Desenha as tabelas e selects
        this.renderAllTables();
        this.populateSelects();
        this.updateDashboard();
    },

    // --- CARREGAMENTO DE DADOS ---
    loadAllData: async function() {
        try {
            console.log("Carregando dados do Firebase...");
            const collections = ['amostras', 'agronomos', 'culturas', 'tecnologias', 'quimicos'];
            
            for (const colName of collections) {
                const snapshot = await getDocs(collection(db, colName));
                this.data[colName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            console.log("Dados carregados com sucesso:", this.data);
        } catch (error) {
            console.error("Erro CRÍTICO ao carregar dados:", error);
            alert("Erro ao conectar no Firebase. Verifique se as chaves no app.js estão corretas.");
        }
    },

    // --- FUNÇÃO CENTRAL DE SALVAR ---
    saveToFirebase: async function(colName, data, id) {
        try {
            console.log(`Salvando em ${colName}:`, data);
            
            if(id) {
                // Editar
                await updateDoc(doc(db, colName, id), data);
                alert("Registro atualizado com sucesso!");
            } else {
                // Criar Novo
                await addDoc(collection(db, colName), data);
                alert("Registro cadastrado com sucesso!");
            }
            
            // Atualiza a tela
            await this.loadAllData();
            this.renderAllTables();
            this.populateSelects();
            this.updateDashboard();
            return true;
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar: " + error.message);
            return false;
        }
    },

    // --- EXCLUSÃO ---
    deleteData: async function(colName, id) {
        if(confirm("Tem certeza que deseja excluir este registro?")) {
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
        }
    },

    // --- FUNÇÕES DE CAPTURA DOS FORMULÁRIOS ---

    salvarAgronomo: function() {
        const id = document.getElementById('idAgronomo').value;
        const data = {
            nome: document.getElementById('nomeAgronomo').value,
            crea: document.getElementById('creaAgronomo').value
        };
        this.saveToFirebase('agronomos', data, id).then(ok => { 
            if(ok) this.limparForm('agronomoForm', 'idAgronomo'); 
        });
    },

    salvarCultura: function() {
        const id = document.getElementById('idCultura').value;
        const data = {
            nome: document.getElementById('nomeCultura').value,
            tipo: document.getElementById('tipoCultura').value,
            producao: document.getElementById('prodCultura').value
        };
        this.saveToFirebase('culturas', data, id).then(ok => { 
            if(ok) this.limparForm('culturaForm', 'idCultura'); 
        });
    },

    salvarTecnologia: function() {
        const id = document.getElementById('idTec').value;
        const data = {
            nome: document.getElementById('nomeTec').value,
            regiao: document.getElementById('regiaoTec').value
        };
        this.saveToFirebase('tecnologias', data, id).then(ok => { 
            if(ok) this.limparForm('tecForm', 'idTec'); 
        });
    },

    salvarQuimico: function() {
        const id = document.getElementById('idQuimico').value;
        const data = {
            sigla: document.getElementById('siglaQuimico').value,
            nome: document.getElementById('nomeQuimico').value,
            unidade: document.getElementById('unidadeQuimico').value
        };
        this.saveToFirebase('quimicos', data, id).then(ok => { 
            if(ok) this.limparForm('quimicoForm', 'idQuimico'); 
        });
    },

    salvarAmostra: function() {
        const id = document.getElementById('idAmostra').value;
        // Pega os valores com segurança
        const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
        const getNum = (id) => document.getElementById(id) ? (parseFloat(document.getElementById(id).value) || 0) : 0;

        const data = {
            produtor: getVal('samp_produtor'),
            propriedade: getVal('samp_propriedade'),
            cidade: getVal('samp_cidade'),
            agro: getVal('samp_agro'),
            protocolo: getVal('samp_protocolo'),
            talhao: getVal('samp_talhao'),
            data: getVal('samp_data'),
            cultura: getVal('samp_cultura'),
            producao: getNum('samp_producao'),
            esp_linha: getNum('samp_esp_linha'),
            esp_cova: getNum('samp_esp_cova'),
            ph: getNum('samp_ph'), mo: getNum('samp_mo'), p: getNum('samp_p'), s: getNum('samp_s'),
            ca: getNum('samp_ca'), mg: getNum('samp_mg'), k: getNum('samp_k'), hal: getNum('samp_hal'), al: getNum('samp_al'),
            argila: getNum('samp_argila'), areia: getNum('samp_areia'),
            zn: getNum('samp_zn'), b: getNum('samp_b'), mn: getNum('samp_mn'), cu: getNum('samp_cu'), fe: getNum('samp_fe'), mo_micro: getNum('samp_mo_micro')
        };

        this.saveToFirebase('amostras', data, id).then(ok => { 
            if(ok) this.limparForm('amostraForm', 'idAmostra'); 
        });
    },

    // --- CONFIGURAÇÃO DE EVENTOS (LISTENERS) ---
    setupEventListeners: function() {
        // Função auxiliar para adicionar evento com segurança
        const addSubmitListener = (formId, callback) => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    callback();
                });
            } else {
                console.warn(`Aviso: Formulário ${formId} não encontrado no HTML.`);
            }
        };

        addSubmitListener('agronomoForm', () => this.salvarAgronomo());
        addSubmitListener('culturaForm', () => this.salvarCultura());
        addSubmitListener('tecForm', () => this.salvarTecnologia());
        addSubmitListener('quimicoForm', () => this.salvarQuimico());
        addSubmitListener('amostraForm', () => this.salvarAmostra());
    },

    // --- RENDERIZAÇÃO DE TABELAS ---
    renderAllTables: function() {
        // Renderiza cada tabela se houver dados
this.renderTable('listaCorpoAmostra', this.data.amostras, i => `
    <td>${i.produtor}<br><small>${i.talhao}</small></td>
    <td>
        ${i.cultura} <br>
        <!-- AQUI ESTÁ A MUDANÇA: Formata o número e adiciona "t/ha" -->
        <small style="color: #2e7d32;">
            Prod: ${(parseFloat(i.producao) || 0).toFixed(2)} t/ha
        </small>
    </td>
    <td>
        <button class="btn-rec" onclick="app.gerarRecomendacao('${i.id}')">Relat.</button> 
        <button class="btn-action btn-cancel" onclick="app.editarItem('amostras','${i.id}')">✎</button> 
        <button class="btn-action btn-cancel" onclick="app.deleteData('amostras','${i.id}')">🗑️</button>
    </td>
`);

        this.renderTable('listaCorpoAgro', this.data.agronomos, i => `
            <td>${i.nome}</td><td>${i.crea}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('agronomos','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('agronomos','${i.id}')">🗑️</button></td>
        `);

        this.renderTable('listaCorpoCultura', this.data.culturas, i => `
            <td>${i.nome}</td><td>${i.tipo}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('culturas','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('culturas','${i.id}')">🗑️</button></td>
        `);

        this.renderTable('listaCorpoTec', this.data.tecnologias, i => `
            <td>${i.nome}</td><td>${i.regiao}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('tecnologias','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('tecnologias','${i.id}')">🗑️</button></td>
        `);

        this.renderTable('listaCorpoQuimico', this.data.quimicos, i => `
            <td>${i.sigla}</td><td>${i.nome}</td>
            <td><button class="btn-action btn-cancel" onclick="app.editarItem('quimicos','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('quimicos','${i.id}')">🗑️</button></td>
        `);
    },

    renderTable: function(tbodyId, list, htmlFunc) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        
        tbody.innerHTML = '';
        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px; color:#999;">Nenhum registro encontrado.</td></tr>';
            return;
        }

        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = htmlFunc(item);
            tbody.appendChild(tr);
        });
    },

    // --- EDIÇÃO (Preenchimento) ---
    editarItem: function(col, id) {
        const item = this.data[col].find(i => i.id === id);
        if(!item) return;

        // Função auxiliar para setar valor
        const setVal = (domId, val) => {
            const el = document.getElementById(domId);
            if(el) el.value = val !== undefined ? val : '';
        };

        if (col === 'agronomos') {
            this.navigateTo('agronomos');
            setVal('idAgronomo', id);
            setVal('nomeAgronomo', item.nome);
            setVal('creaAgronomo', item.crea);
        } else if (col === 'culturas') {
            this.navigateTo('culturas');
            setVal('idCultura', id);
            setVal('nomeCultura', item.nome);
            setVal('tipoCultura', item.tipo);
            setVal('prodCultura', item.producao);
        } else if (col === 'tecnologias') {
            this.navigateTo('tecnologias');
            setVal('idTec', id);
            setVal('nomeTec', item.nome);
            setVal('regiaoTec', item.regiao);
        } else if (col === 'quimicos') {
            this.navigateTo('quimicos');
            setVal('idQuimico', id);
            setVal('siglaQuimico', item.sigla);
            setVal('nomeQuimico', item.nome);
            setVal('unidadeQuimico', item.unidade);
        } else if (col === 'amostras') {
            this.navigateTo('amostras');
            setVal('idAmostra', id);
            setVal('samp_produtor', item.produtor);
            setVal('samp_propriedade', item.propriedade);
            setVal('samp_cidade', item.cidade);
            setVal('samp_agro', item.agro);
            setVal('samp_protocolo', item.protocolo);
            setVal('samp_talhao', item.talhao);
            setVal('samp_data', item.data);
            setVal('samp_cultura', item.cultura);
            setVal('samp_producao', item.producao);
            setVal('samp_esp_linha', item.esp_linha);
            setVal('samp_esp_cova', item.esp_cova);
            // Preenche o resto dos campos quimicos...
            ['ph','mo','p','s','ca','mg','k','hal','al','argila','areia','zn','b','mn','cu','fe','mo_micro'].forEach(key => {
                setVal('samp_' + key, item[key]);
            });
        }
    },

    // --- UTILITÁRIOS ---
    limparForm: function(formId, idId) {
        const form = document.getElementById(formId);
        if(form) form.reset();
        const idField = document.getElementById(idId);
        if(idField) idField.value = '';
    },

    navigateTo: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        
        const view = document.getElementById(`view-${viewId}`);
        if(view) view.classList.add('active');
        
        const link = document.getElementById(`nav-${viewId}`);
        if(link) link.classList.add('active');

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

    preencherTeste: function() {
        const rand = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
        const set = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val; };

        set('samp_produtor', "Produtor Teste");
        set('samp_propriedade', "Fazenda Boa Vista");
        set('samp_cidade', "Uberlândia/MG");
        set('samp_talhao', "T-99");
        set('samp_protocolo', "LAB-1234");
        if(document.getElementById('samp_data')) document.getElementById('samp_data').valueAsDate = new Date();
        set('samp_producao', "12");
        set('samp_esp_linha', "0.8");
        set('samp_esp_cova', "0.2");
        set('samp_ph', rand(4.5, 6.5));
        set('samp_mo', rand(15, 45));
        set('samp_p', rand(5, 30));
        set('samp_s', rand(2, 12));
        set('samp_ca', rand(1.0, 4.0));
        set('samp_mg', rand(0.5, 1.5));
        set('samp_k', rand(0.1, 0.6));
        set('samp_hal', rand(1.5, 4.5));
        set('samp_al', rand(0.0, 0.8));
        set('samp_argila', Math.floor(rand(15, 60)));
        set('samp_areia', Math.floor(rand(10, 50)));
        set('samp_zn', rand(0.5, 3.0));
        set('samp_b', rand(0.1, 0.6));
        set('samp_mn', rand(2.0, 15.0));
        set('samp_cu', rand(0.2, 2.0));
        set('samp_fe', rand(15, 60));
        set('samp_mo_micro', rand(0.01, 0.1));
    },

    updateDashboard: function() {
        if(document.getElementById('dashTotalAmostras')) document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        if(document.getElementById('dashTotalAgronomos')) document.getElementById('dashTotalAgronomos').textContent = this.data.agronomos.length;
        if(document.getElementById('dashTotalCulturas')) document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },

gerarRecomendacao: function(id) {
    const amostra = this.data.amostras.find(a => a.id === id);
    if(!amostra) return;

    // 1. Converter strings para números
    const Ca = parseFloat(amostra.ca) || 0;
    const Mg = parseFloat(amostra.mg) || 0;
    const K = parseFloat(amostra.k) || 0;
    const HAl = parseFloat(amostra.hal) || 0;

    // 2. Cálculos Básicos
    const SB = Ca + Mg + K; // Soma de Bases
    const CTC = SB + HAl;   // Capacidade de Troca Catiônica
    const V = (CTC > 0) ? ((SB / CTC) * 100).toFixed(2) : 0; // Saturação por bases (%)

    // 3. Gerar o HTML
    const html = `
        <h2>Relatório Técnico</h2>
        <p><strong>Produtor:</strong> ${amostra.produtor}</p>
        <p><strong>Cultura:</strong> ${amostra.cultura}</p>
        <hr>
        <h3>Análise de Fertilidade</h3>
        <ul>
            <li><strong>Soma de Bases (SB):</strong> ${SB.toFixed(2)} cmolc/dm³</li>
            <li><strong>CTC (pH 7.0):</strong> ${CTC.toFixed(2)} cmolc/dm³</li>
            <li><strong>Saturação por Bases (V%):</strong> ${V}%</li>
        </ul>
        <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; margin-top: 10px;">
            <strong>Interpretação:</strong><br>
            ${V < 50 ? "⚠️ Solo Ácido - Necessário Calagem" : "✅ Saturação Adequada (dependendo da cultura)"}
        </div>
    `;

    document.getElementById('conteudoRecomendacao').innerHTML = html;
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