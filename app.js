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
        this.setupEventListeners();
        await this.loadAllData();
        this.renderAllTables();
        this.populateSelects();
        this.updateDashboard();
        
        // Garante que a primeira tela ativa seja a Home
        this.navigateTo('home');
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
            console.log("Dados carregados.");
        } catch (error) {
            console.error("Erro CRÍTICO ao carregar dados:", error);
            alert("Erro ao conectar no Firebase. Verifique o console (F12).");
        }
    },

    // --- SALVAR ---
    saveToFirebase: async function(colName, data, id) {
        try {
            if(id) {
                await updateDoc(doc(db, colName, id), data);
                alert("Registro atualizado!");
            } else {
                await addDoc(collection(db, colName), data);
                alert("Registro cadastrado!");
            }
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

    // --- EXCLUIR ---
    deleteData: async function(colName, id) {
        if(confirm("Tem certeza que deseja excluir?")) {
            try {
                await deleteDoc(doc(db, colName, id));
                await this.loadAllData();
                this.renderAllTables();
                this.populateSelects();
                this.updateDashboard();
            } catch (error) {
                console.error("Erro ao excluir:", error);
            }
        }
    },

    // --- NAVEGAÇÃO (CORRIGIDA) ---
    navigateTo: function(viewId) {
        // 1. Esconde todas as views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        // 2. Desativa todos os links
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        
        // 3. Mostra a view desejada
        const view = document.getElementById(`view-${viewId}`);
        if(view) view.classList.add('active');
        
        // 4. Ativa o link do menu
        const link = document.getElementById(`nav-${viewId}`);
        if(link) link.classList.add('active');

        // 5. Se for amostras, atualiza selects
        if(viewId === 'amostras') this.populateSelects();
    },

    // --- CAPTURA DE FORMULÁRIOS ---
    salvarAgronomo: function() {
        const id = document.getElementById('idAgronomo').value;
        const data = { nome: document.getElementById('nomeAgronomo').value, crea: document.getElementById('creaAgronomo').value };
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
        const data = { nome: document.getElementById('nomeTec').value, regiao: document.getElementById('regiaoTec').value };
        this.saveToFirebase('tecnologias', data, id).then(ok => { if(ok) this.limparForm('tecForm', 'idTec'); });
    },

    salvarQuimico: function() {
        const id = document.getElementById('idQuimico').value;
        const data = { sigla: document.getElementById('siglaQuimico').value, nome: document.getElementById('nomeQuimico').value, unidade: document.getElementById('unidadeQuimico').value };
        this.saveToFirebase('quimicos', data, id).then(ok => { if(ok) this.limparForm('quimicoForm', 'idQuimico'); });
    },

    salvarAmostra: function() {
        const id = document.getElementById('idAmostra').value;
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
            // Química
            ph: getNum('samp_ph'), mo: getNum('samp_mo'), p: getNum('samp_p'), s: getNum('samp_s'),
            ca: getNum('samp_ca'), mg: getNum('samp_mg'), k: getNum('samp_k'), hal: getNum('samp_hal'), al: getNum('samp_al'),
            // Física e Micro
            argila: getNum('samp_argila'), areia: getNum('samp_areia'),
            zn: getNum('samp_zn'), b: getNum('samp_b'), mn: getNum('samp_mn'), cu: getNum('samp_cu'), fe: getNum('samp_fe'), mo_micro: getNum('samp_mo_micro')
        };

        this.saveToFirebase('amostras', data, id).then(ok => { if(ok) this.limparForm('amostraForm', 'idAmostra'); });
    },

    setupEventListeners: function() {
        const addSubmit = (fid, cb) => { const f = document.getElementById(fid); if(f) f.addEventListener('submit', (e) => { e.preventDefault(); cb(); }); };
        addSubmit('agronomoForm', () => this.salvarAgronomo());
        addSubmit('culturaForm', () => this.salvarCultura());
        addSubmit('tecForm', () => this.salvarTecnologia());
        addSubmit('quimicoForm', () => this.salvarQuimico());
        addSubmit('amostraForm', () => this.salvarAmostra());
    },

    // --- RENDERIZAÇÃO ---
    renderAllTables: function() {
        this.renderTable('listaCorpoAgro', this.data.agronomos, i => `<td>${i.nome}</td><td>${i.crea}</td><td><button class="btn-action btn-cancel" onclick="app.editarItem('agronomos','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('agronomos','${i.id}')">🗑️</button></td>`);
        
        this.renderTable('listaCorpoCultura', this.data.culturas, i => `<td>${i.nome}</td><td>${i.tipo}</td><td><button class="btn-action btn-cancel" onclick="app.editarItem('culturas','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('culturas','${i.id}')">🗑️</button></td>`);
        
        this.renderTable('listaCorpoTec', this.data.tecnologias, i => `<td>${i.nome}</td><td>${i.regiao}</td><td><button class="btn-action btn-cancel" onclick="app.editarItem('tecnologias','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('tecnologias','${i.id}')">🗑️</button></td>`);
        
        this.renderTable('listaCorpoQuimico', this.data.quimicos, i => `<td>${i.sigla}</td><td>${i.nome}</td><td><button class="btn-action btn-cancel" onclick="app.editarItem('quimicos','${i.id}')">✎</button> <button class="btn-action btn-cancel" onclick="app.deleteData('quimicos','${i.id}')">🗑️</button></td>`);

        // TABELA DE AMOSTRAS (COM OS DOIS BOTÕES DE RECOMENDAÇÃO)
        this.renderTable('listaCorpoAmostra', this.data.amostras, i => `
            <td>${i.produtor}<br><small>${i.talhao}</small></td>
            <td>
                ${i.cultura} <br>
                <small style="color: #2e7d32;">Prod: ${(parseFloat(i.producao) || 0).toFixed(1)} t/ha</small>
            </td>
            <td>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <!-- Botão Relatório Simples -->
                    <button class="btn-rec" onclick="app.gerarRecomendacao('${i.id}')" title="Análise Rápida (Grid)">📊</button> 
                    
                    <!-- Botão Recomendação IAC -->
                    <button class="btn-rec" style="background:#ff9800;" onclick="app.gerarRecomendacaoCompleta('${i.id}')" title="Recomendação IAC 100">🚜</button>

                    <button class="btn-action btn-cancel" onclick="app.editarItem('amostras','${i.id}')">✎</button> 
                    <button class="btn-action btn-cancel" onclick="app.deleteData('amostras','${i.id}')">🗑️</button>
                </div>
            </td>
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

    // --- PREENCHIMENTO REALISTA (ATUALIZADO) ---
    preencherTeste: function() {
        const rand = (min, max, dec = 2) => (Math.random() * (max - min) + min).toFixed(dec);
        const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };

        const produtores = ["Fazenda Esperança", "Sítio Boa Vista", "Agro Silva", "Fazenda São José"];
        set('samp_produtor', produtores[Math.floor(Math.random() * produtores.length)]);
        set('samp_propriedade', "Gleba Norte");
        set('samp_cidade', "Rio Verde/GO");
        set('samp_talhao', "T-" + Math.floor(Math.random() * 50));
        set('samp_protocolo', "L-" + Math.floor(Math.random() * 9999));
        if(document.getElementById('samp_data')) document.getElementById('samp_data').valueAsDate = new Date();

        // Dados Milho (para testar IAC)
        set('samp_cultura', "Milho");
        set('samp_producao', "12"); // 12 t/ha
        set('samp_esp_linha', "0.50");
        set('samp_esp_cova', "0.20");

        // Química (Solo Ácido Típico)
        const ph = parseFloat(rand(4.8, 5.8, 1));
        set('samp_ph', ph);
        set('samp_al', ph < 5.5 ? rand(0.3, 1.2, 2) : "0.00"); // Se pH baixo, tem alumínio
        
        set('samp_mo', rand(1.5, 4.5, 1)); // M.O. em %
        set('samp_p', rand(6, 25, 1));
        set('samp_s', rand(5, 15, 1));

        set('samp_k', rand(0.15, 0.45, 2));
        set('samp_ca', rand(1.0, 3.5, 2));
        set('samp_mg', rand(0.4, 1.2, 2));
        set('samp_hal', rand(2.5, 5.0, 2));

        // Física
        set('samp_argila', Math.floor(rand(25, 60, 0)));
        set('samp_areia', Math.floor(rand(20, 50, 0)));

        // Micro
        set('samp_zn', rand(0.5, 2.5, 2));
        set('samp_b', rand(0.1, 0.5, 2));
        set('samp_mn', rand(3.0, 12.0, 1));
        set('samp_cu', rand(0.4, 1.5, 2));
        set('samp_fe', rand(20, 50, 1));
        set('samp_mo_micro', rand(0.01, 0.08, 3));
    },

    // --- RELATÓRIO 1: COMPACTO (GRID) ---
    gerarRecomendacao: function(id) {
        const a = this.data.amostras.find(i => i.id === id);
        if(!a) return;

        const val = (v) => parseFloat(v) || 0;
        const fmt = (v) => val(v).toFixed(2);
        const fmt1 = (v) => val(v).toFixed(1);

        const SB = val(a.ca) + val(a.mg) + val(a.k);
        const CTC = SB + val(a.hal);
        const V = CTC > 0 ? ((SB / CTC) * 100) : 0;
        
        const somaBasesAl = SB + val(a.al);
        const m = somaBasesAl > 0 ? (val(a.al) / somaBasesAl) * 100 : 0;
        const silte = 100 - val(a.argila) - val(a.areia);

        const html = `
            <div style="font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.4;">
                <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; border-left: 5px solid #2e7d32; margin-bottom: 10px;">
                    <h2 style="margin: 0; color: #1b5e20;">Relatório de Análise (Compacto)</h2>
                    <div style="font-size: 0.9rem; margin-top: 5px;">
                        <strong>Produtor:</strong> ${a.produtor} | <strong>Talhão:</strong> ${a.talhao} | <strong>Cultura:</strong> ${a.cultura}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; font-size: 0.8rem; text-align: center; margin-bottom: 10px;">
                    <div class="box-res"><strong>pH</strong><br>${fmt(a.ph)}</div>
                    <div class="box-res"><strong>M.O.</strong><br>${fmt1(a.mo)}%</div>
                    <div class="box-res"><strong>P</strong><br>${fmt1(a.p)}</div>
                    <div class="box-res"><strong>K</strong><br>${fmt(a.k)}</div>
                    <div class="box-res" style="background:#e3f2fd;"><strong>CTC</strong><br>${fmt(CTC)}</div>
                    
                    <div class="box-res"><strong>Ca</strong><br>${fmt(a.ca)}</div>
                    <div class="box-res"><strong>Mg</strong><br>${fmt(a.mg)}</div>
                    <div class="box-res"><strong>Al</strong><br>${fmt(a.al)}</div>
                    <div class="box-res"><strong>H+Al</strong><br>${fmt(a.hal)}</div>
                    <div class="box-res" style="background:#e8f5e9;"><strong>SB</strong><br>${fmt(SB)}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                    <div style="padding: 5px; background: ${V < 50 ? '#ffcdd2' : '#c8e6c9'}; border-radius:4px;">
                        <strong>V%:</strong> ${fmt(V)}%
                    </div>
                    <div style="padding: 5px; background: ${m > 20 ? '#ffccbc' : '#f5f5f5'}; border-radius:4px;">
                        <strong>m%:</strong> ${fmt(m)}%
                    </div>
                </div>
            </div>
        `;
        document.getElementById('conteudoRecomendacao').innerHTML = html;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },

    // --- MOTOR DE CÁLCULO AGRONÔMICO (IAC 100) ---
// --- MOTOR DE CÁLCULO AGRONÔMICO (NOVO PADRÃO IAC MILHO) ---
    agroCalc: {
        // Funções Auxiliares
        val: function(v) { return parseFloat(v) || 0; },
        
        // 1. CÁLCULO DE CALAGEM (IAC: Meta V% = 70 para Milho)
        calcularCalagem: function(a, prnt = 80) {
            const Ca = this.val(a.ca);
            const Mg = this.val(a.mg); // em cmolc/dm3
            const K = this.val(a.k);
            const HAl = this.val(a.hal);

            const SB = Ca + Mg + K;
            const CTC = SB + HAl;
            const V_atual = CTC > 0 ? (SB / CTC) * 100 : 0;
            const V_meta = 70; // Regra IAC para Milho

            let NC = 0;
            if (V_atual < V_meta) {
                NC = ((V_meta - V_atual) * CTC) / prnt;
            }

            // Regra do Magnésio: Mínimo 5 mmolc (0.5 cmolc)
            // Se Mg < 0.5 cmolc, preferir Dolomítico.
            const tipoCalcario = Mg < 0.5 ? "Dolomítico ou Magnesiano" : "Calcítico";

            return {
                necessidade: NC > 0,
                toneladas: Math.max(0, NC).toFixed(1),
                v_atual: V_atual.toFixed(1),
                ctc: CTC.toFixed(2),
                tipo: tipoCalcario,
                obs: Mg < 0.5 ? "Teor de Mg baixo (< 5 mmolc). Priorizar fornecimento de Mg." : "Teor de Mg adequado."
            };
        },

        // 2. CÁLCULO DE P e K (Baseado em Argila e Análise)
        calcularPK_IAC: function(a) {
            const argila = this.val(a.argila);
            const P_resina = this.val(a.p);
            const K_mmol = this.val(a.k) * 10; // Converte cmolc para mmolc (Regra IAC usa mmolc)

            let recP = 0;
            let recK = 0;

            // Lógica de Decisão baseada na Tabela 1
            if (argila <= 20) { // TEXTURA ARENOSA
                // Fósforo
                if (P_resina <= 10) recP = 80;
                else if (P_resina <= 20) recP = 60;
                else if (P_resina <= 30) recP = 40;
                else recP = 20;

                // Potássio
                if (K_mmol <= 0.8) recK = 80;
                else if (K_mmol <= 1.5) recK = 60;
                else if (K_mmol <= 2.5) recK = 40;
                else recK = 20;

            } else if (argila <= 60) { // TEXTURA MÉDIA
                // Fósforo
                if (P_resina <= 10) recP = 100;
                else if (P_resina <= 20) recP = 80;
                else if (P_resina <= 30) recP = 60;
                else recP = 40;

                // Potássio
                if (K_mmol <= 1.0) recK = 100;
                else if (K_mmol <= 2.0) recK = 80;
                else if (K_mmol <= 3.5) recK = 60;
                else recK = 40;

            } else { // TEXTURA ARGILOSA (> 60%)
                // Fósforo
                if (P_resina <= 10) recP = 120;
                else if (P_resina <= 20) recP = 100;
                else if (P_resina <= 30) recP = 80;
                else recP = 60;

                // Potássio
                if (K_mmol <= 1.2) recK = 120;
                else if (K_mmol <= 2.5) recK = 100;
                else if (K_mmol <= 4.5) recK = 80;
                else recK = 60;
            }

            return { P: recP, K: recK };
        },

        // 3. CÁLCULO DE NITROGÊNIO (Baseado em Produtividade e Histórico)
        calcularN_IAC: function(a) {
            // Converte t/ha para Sacas (1 saca = 60kg = 0.06t)
            const producaoTon = this.val(a.producao) || 6; 
            const sacas = producaoTon / 0.06;

            // Tabela 2 IAC
            // Nota: Como não temos o campo "Cultivo Anterior", assumiremos "Gramíneas/Milho" 
            // como cenário padrão (mais conservador/comum).
            // Se fosse Leguminosa, a dose seria menor (40-60).
            
            let recN = 0;

            // Faixa de Produtividade
            if (sacas <= 100) { // Até 6 t/ha
                recN = 80; // Cenário Gramíneas
            } else { // > 100 sacas (> 6 t/ha)
                recN = 100; // Cenário Gramíneas
            }

            return { N: recN, sacas: sacas.toFixed(0) };
        }
    },
    // --- RELATÓRIO 2: IAC 100 COMPLETO ---
// --- NOVA FUNÇÃO DE GERAÇÃO DE RELATÓRIO COMPLETO (IAC) ---
// --- MOTOR DE CÁLCULO AGRONÔMICO (IAC - TABELAS ESTRITAS) ---
    agroCalc: {
        val: function(v) { return parseFloat(v) || 0; },

        // 1. CALAGEM (V% = 70 para Milho)
        calcularCalagem: function(a, prnt = 80) {
            const SB = this.val(a.ca) + this.val(a.mg) + this.val(a.k);
            const CTC = SB + this.val(a.hal);
            const V_atual = CTC > 0 ? (SB / CTC) * 100 : 0;
            
            // Fórmula: NC = (V2 - V1) * CTC / PRNT
            const V_meta = 70; 
            let NC = 0;
            
            if (V_atual < V_meta) {
                NC = ((V_meta - V_atual) * CTC) / prnt;
            }

            // Critério do Magnésio (Mg < 5 mmolc ou 0.5 cmolc)
            const tipo = this.val(a.mg) < 0.5 ? "Dolomítico (Rico em Mg)" : "Calcítico";

            return {
                toneladas: Math.max(0, NC).toFixed(1),
                v_atual: V_atual.toFixed(1),
                tipo: tipo
            };
        },

        // 2. NITROGÊNIO (TABELA 2 - SEM INTERPOLAÇÃO)
        calcularN_Tabela: function(a) {
            // Conversão: t/ha para sacas de 60kg
            const prodTon = this.val(a.producao) || 6; 
            const sacas = prodTon / 0.06;
            
            // Cenário Padrão: Cultivo anterior Gramíneas (Braquiária/Milheto)
            // Tabela 2:
            // <= 100 sacas: 80 kg/ha
            // > 100 sacas: 100 kg/ha
            
            let doseN = 0;
            if (sacas <= 100) {
                doseN = 80;
            } else {
                doseN = 100;
            }

            return { N: doseN, sacas: sacas.toFixed(0) };
        },

        // 3. FÓSFORO E POTÁSSIO (TABELA 1 - FAIXAS ESTRITAS)
        calcularPK_Tabela: function(a) {
            const argila = this.val(a.argila);
            const P = this.val(a.p);           // mg/dm3
            const K_mmol = this.val(a.k) * 10; // Converte cmolc para mmolc

            let recP = 0;
            let recK = 0;

            // --- SELEÇÃO PELA TEXTURA (ARGILA) ---
            
            if (argila <= 20) { 
                // === TEXTURA ARENOSA (<= 20%) ===
                
                // Fósforo (P)
                if (P <= 10) recP = 80;
                else if (P <= 20) recP = 60;
                else if (P <= 30) recP = 40;
                else recP = 20; // > 30

                // Potássio (K)
                if (K_mmol <= 0.8) recK = 80;
                else if (K_mmol <= 1.5) recK = 60;
                else if (K_mmol <= 2.5) recK = 40;
                else recK = 20; // > 2.5

            } else if (argila <= 60) {
                // === TEXTURA MÉDIA (21 - 60%) ===
                
                // Fósforo (P)
                if (P <= 10) recP = 100;
                else if (P <= 20) recP = 80;
                else if (P <= 30) recP = 60;
                else recP = 40; // > 30

                // Potássio (K)
                if (K_mmol <= 1.0) recK = 100;
                else if (K_mmol <= 2.0) recK = 80;
                else if (K_mmol <= 3.5) recK = 60;
                else recK = 40; // > 3.5

            } else {
                // === TEXTURA ARGILOSA (> 60%) ===
                
                // Fósforo (P)
                if (P <= 10) recP = 120;
                else if (P <= 20) recP = 100;
                else if (P <= 30) recP = 80;
                else recP = 60; // > 30

                // Potássio (K)
                if (K_mmol <= 1.2) recK = 120;
                else if (K_mmol <= 2.5) recK = 100;
                else if (K_mmol <= 4.5) recK = 80;
                else recK = 60; // > 4.5
            }

            return { P: recP, K: recK };
        }
    },

    // --- GERAÇÃO DO RELATÓRIO (COM REGRAS DE PARCELAMENTO) ---
    gerarRecomendacaoCompleta: function(id) {
        const a = this.data.amostras.find(i => i.id === id);
        if(!a) return;

        const argila = parseFloat(a.argila) || 0;
        const culturaNorm = a.cultura.toLowerCase().trim();
        const isSafrinha = culturaNorm.includes('safrinha');
        const isArenoso = argila <= 20;

        // 1. Cálculos baseados nas tabelas
        const calagem = this.agroCalc.calcularCalagem(a);
        const pk = this.agroCalc.calcularPK_Tabela(a);
        const n_calc = this.agroCalc.calcularN_Tabela(a);

        let recN = n_calc.N;
        let recP = pk.P;
        let recK = pk.K;

        // 2. Ajuste Safrinha (-20%)
        let avisoSafrinha = "";
        if (isSafrinha) {
            recN = Math.round(recN * 0.8);
            recK = Math.round(recK * 0.8);
            avisoSafrinha = "<br><span style='color:red; font-size:0.8em'>* Doses de N e K reduzidas em 20% (Safrinha)</span>";
        }

        // 3. Regras de Parcelamento (Texto 5.1 e Observações Tabela 1)
        let htmlTabela = "";
        const P_plantio = recP; // Todo P no sulco

        if (isArenoso) {
            // == ARENOSO: PARCELAR EM 3 VEZES ==
            // N: 1/3 Plantio, 1/3 Cob (V4), 1/3 Cob (V8)
            // K: 1/3 Plantio, 1/3 Cob (V4), 1/3 Cob (V8)
            
            const N_p = Math.round(recN / 3);
            const K_p = Math.round(recK / 3);
            const N_rest = recN - (N_p * 2); // O que sobra vai na última
            const K_rest = recK - (K_p * 2);

            htmlTabela = `
                <tr>
                    <td><strong>Plantio</strong><br><small>No sulco</small></td>
                    <td>N: <strong>${N_p}</strong> | P₂O₅: <strong>${P_plantio}</strong> | K₂O: <strong>${K_p}</strong></td>
                </tr>
                <tr>
                    <td><strong>1ª Cobertura</strong><br><small>V4-V6 (30 dias)</small></td>
                    <td>N: <strong>${N_p}</strong> | K₂O: <strong>${K_p}</strong></td>
                </tr>
                <tr>
                    <td><strong>2ª Cobertura</strong><br><small>V8-V10 (50 dias)</small></td>
                    <td>N: <strong>${N_rest}</strong> | K₂O: <strong>${K_rest}</strong></td>
                </tr>
            `;
        } else {
            // == TEXTURA MÉDIA/ARGILOSA ==
            // N: 1/3 Plantio, 2/3 Cobertura (V4)
            // K: 1/2 Plantio, 1/2 Cobertura (V4)
            
            const N_p = Math.round(recN / 3);
            const N_c = recN - N_p;
            
            const K_p = Math.round(recK / 2);
            const K_c = recK - K_p;

            htmlTabela = `
                <tr>
                    <td><strong>Plantio</strong><br><small>No sulco</small></td>
                    <td>N: <strong>${N_p}</strong> | P₂O₅: <strong>${P_plantio}</strong> | K₂O: <strong>${K_p}</strong></td>
                </tr>
                <tr>
                    <td><strong>Cobertura</strong><br><small>V4-V6 (Afilhamento)</small></td>
                    <td>N: <strong>${N_c}</strong> | K₂O: <strong>${K_c}</strong></td>
                </tr>
            `;
        }

        // 4. Montar HTML
        const html = `
            <div class="report-container">
                <div class="report-header">
                    <h2>Recomendação Oficial (IAC Tabelado)</h2>
                    <p><strong>Cultura:</strong> ${a.cultura} ${isSafrinha ? '(Safrinha)' : ''}</p>
                    <p><strong>Meta:</strong> ${n_calc.sacas} sacas/ha | <strong>Argila:</strong> ${argila}% (${isArenoso ? 'Arenoso' : 'Médio/Argiloso'})</p>
                </div>

                <div class="report-section">
                    <h3>1. Correção</h3>
                    <div class="grid-2">
                        <div class="card-rec warning">
                            <h4>Calagem</h4>
                            <p class="big-num">${calagem.toneladas} <small>t/ha</small></p>
                            <small>Meta V% = 70</small>
                            <p class="obs">Tipo: ${calagem.tipo}</p>
                        </div>
                        <div class="card-rec info">
                            <h4>Orgânica</h4>
                            <p>Esterco Curral: <strong>15-20 t/ha</strong></p>
                            <small>Ou Cama de Frango: 4-6 t/ha</small>
                        </div>
                    </div>
                </div>

                <div class="report-section">
                    <h3>2. Adubação Mineral (kg/ha) ${avisoSafrinha}</h3>
                    <div class="nutri-summary">
                        <span>N Total: <strong>${recN}</strong></span>
                        <span>P₂O₅ Total: <strong>${recP}</strong></span>
                        <span>K₂O Total: <strong>${recK}</strong></span>
                    </div>
                    <table class="rec-table">
                        <thead><tr><th>Época</th><th>Doses (Elemento Puro)</th></tr></thead>
                        <tbody>${htmlTabela}</tbody>
                    </table>
                </div>

                <div class="report-section">
                    <h3>3. Micronutrientes (Foliar)</h3>
                    <table class="rec-table">
                        <tr><td><strong>Zinco (Zn)</strong></td><td>300-400 g/ha</td><td>15-20 DAE</td></tr>
                        <tr><td><strong>Boro (B)</strong></td><td>150-200 g/ha</td><td>25-30 DAE</td></tr>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('conteudoRecomendacao').innerHTML = html;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },
        // 4. HTML do Relatório
        const html = `
            <div class="report-container">
                <div class="report-header">
                    <h2>Recomendação Agronômica (Padrão IAC)</h2>
                    <p><strong>Cultura:</strong> ${a.cultura} ${isSafrinha ? '(Safrinha)' : '(Safra Verão)'}</p>
                    <p><strong>Produtor:</strong> ${a.produtor} | <strong>Meta:</strong> ${n_calc.sacas} sacas/ha</p>
                </div>

                <!-- CORREÇÃO -->
                <div class="report-section">
                    <h3>1. Correção do Solo</h3>
                    <div class="grid-2">
                        <div class="card-rec warning">
                            <h4>Calagem</h4>
                            <p class="big-num">${calagem.toneladas} <small>t/ha</small></p>
                            <small>Meta V%: 70% (Milho)</small>
                            <p class="obs">Tipo Sugerido: <strong>${calagem.tipo}</strong><br>${calagem.obs}</p>
                        </div>
                        <div class="card-rec info">
                            <h4>Orgânica (Opcional)</h4>
                            <p>Esterco de Curral: <strong>15-20 t/ha</strong></p>
                            <p>Ou Cama de Frango: <strong>4-6 t/ha</strong></p>
                            <small class="obs">Pode reduzir necessidade química.</small>
                        </div>
                    </div>
                </div>

                <!-- ADUBAÇÃO -->
                <div class="report-section">
                    <h3>2. Adubação Mineral ${msgSafrinha}</h3>
                    
                    <div class="nutri-summary">
                        <span><strong>N Total:</strong> ${Math.round(recN)} kg/ha</span>
                        <span><strong>P₂O₅ Total:</strong> ${Math.round(recP)} kg/ha</span>
                        <span><strong>K₂O Total:</strong> ${Math.round(recK)} kg/ha</span>
                    </div>

                    <table class="rec-table">
                        <thead>
                            <tr>
                                <th>Época</th>
                                <th>Dose Nutrientes (kg/ha)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${planoAdubacao}
                        </tbody>
                    </table>
                    <p class="obs">
                        * Argila: ${argila}% (${isArenoso ? 'Arenoso - Parcelamento em 3x' : 'Médio/Argiloso - Parcelamento em 2x'}).<br>
                        * P no sulco. K e N divididos conforme tabela acima.
                    </p>
                </div>

                <!-- MICRONUTRIENTES -->
                <div class="report-section">
                    <h3>3. Micronutrientes (Foliar)</h3>
                    <table class="rec-table">
                        <tr>
                            <td><strong>Zinco (Zn)</strong></td>
                            <td>300 – 400 g/ha</td>
                            <td>15-20 dias após emergência (1 a 2 aplicações)</td>
                        </tr>
                        <tr>
                            <td><strong>Boro (B)</strong></td>
                            <td>150 – 200 g/ha</td>
                            <td>25-30 dias após emergência (1 a 2 aplicações)</td>
                        </tr>
                    </table>
                    <p class="obs">Dispensar se análise de solo indicar teores Altos.</p>
                </div>
            </div>
        `;

        document.getElementById('conteudoRecomendacao').innerHTML = html;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },
    // --- UTILS ---
    limparForm: function(fid, iid) { document.getElementById(fid).reset(); document.getElementById(iid).value = ''; },
    editarItem: function(col, id) {
        const item = this.data[col].find(i => i.id === id);
        if(!item) return;
        this.navigateTo(col);
        const setVal = (k, v) => { const el = document.getElementById(k); if(el) el.value = v; };
        
        if(col === 'amostras') {
            setVal('idAmostra', id);
            ['produtor','propriedade','cidade','agro','protocolo','talhao','data','cultura','producao','esp_linha','esp_cova'].forEach(k => setVal('samp_'+k, item[k]));
            ['ph','mo','p','s','ca','mg','k','hal','al','argila','areia','zn','b','mn','cu','fe','mo_micro'].forEach(k => setVal('samp_'+k, item[k]));
        } else if(col === 'agronomos') {
            setVal('idAgronomo', id); setVal('nomeAgronomo', item.nome); setVal('creaAgronomo', item.crea);
        } else if(col === 'culturas') {
            setVal('idCultura', id); setVal('nomeCultura', item.nome); setVal('tipoCultura', item.tipo); setVal('prodCultura', item.producao);
        } else if(col === 'tecnologias') {
            setVal('idTec', id); setVal('nomeTec', item.nome); setVal('regiaoTec', item.regiao);
        } else if(col === 'quimicos') {
            setVal('idQuimico', id); setVal('siglaQuimico', item.sigla); setVal('nomeQuimico', item.nome); setVal('unidadeQuimico', item.unidade);
        }
    },
    populateSelects: function() {
        const selAgro = document.getElementById('samp_agro');
        const selCult = document.getElementById('samp_cultura');
        if(selAgro && this.data.agronomos) selAgro.innerHTML = '<option value="">Selecione...</option>' + this.data.agronomos.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('');
        if(selCult && this.data.culturas) selCult.innerHTML = '<option value="">Selecione...</option>' + this.data.culturas.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    },
    updateDashboard: function() {
        if(document.getElementById('dashTotalAmostras')) document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        if(document.getElementById('dashTotalAgronomos')) document.getElementById('dashTotalAgronomos').textContent = this.data.agronomos.length;
        if(document.getElementById('dashTotalCulturas')) document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },
    atualizarDetalhesCultura: function() {
        const nome = document.getElementById('samp_cultura').value;
        const item = this.data.culturas.find(c => c.nome === nome);
        if(item) document.getElementById('samp_producao').value = item.producao || '';
    },
    fecharModal: function() { document.getElementById('modalRecomendacao').style.display = 'none'; }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());