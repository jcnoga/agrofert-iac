import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- COLE SUAS CHAVES DO FIREBASE AQUI ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "NUMEROS",
    appId: "CODIGO_APP_ID"
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
    agroCalc: {
        interpolacaoLinear: function(x, tabela) {
            if (x <= tabela[0].x) return tabela[0].y;
            if (x >= tabela[tabela.length - 1].x) return tabela[tabela.length - 1].y;
            for (let i = 0; i < tabela.length - 1; i++) {
                if (x >= tabela[i].x && x <= tabela[i+1].x) {
                    const x1 = tabela[i].x, y1 = tabela[i].y;
                    const x2 = tabela[i+1].x, y2 = tabela[i+1].y;
                    return y1 + ((x - x1) * (y2 - y1) / (x2 - x1));
                }
            }
            return 0;
        },

        calcularCalagem: function(a, culturaMetaV = 60, prnt = 80) {
            const SB = (parseFloat(a.ca)||0) + (parseFloat(a.mg)||0) + (parseFloat(a.k)||0);
            const CTC = SB + (parseFloat(a.hal)||0);
            const V_atual = CTC > 0 ? (SB / CTC) * 100 : 0;
            let NC = 0;
            if (V_atual < culturaMetaV) NC = ((culturaMetaV - V_atual) * CTC) / prnt;
            return { tons: Math.max(0, NC).toFixed(1), v_atual: V_atual.toFixed(1) };
        },

        calcularGessagem: function(a) {
            const dose = 50 * (parseFloat(a.argila)||20);
            return { kg_ha: Math.min(dose, 2000).toFixed(0) };
        },

        calcularMilho: function(a) {
            const prod = parseFloat(a.producao) || 10;
            const P = parseFloat(a.p) || 0;
            const K_mmol = (parseFloat(a.k) || 0) * 10;

            // N
            const tabN = [{x:4,y:60}, {x:6,y:90}, {x:8,y:120}, {x:10,y:150}, {x:12,y:180}, {x:14,y:210}, {x:16,y:240}];
            const N = Math.round(this.interpolacaoLinear(prod, tabN));

            // P
            let P_base = P <= 7 ? 120 : P <= 15 ? 90 : P <= 30 ? 60 : P <= 60 ? 30 : 0;
            const P_final = Math.max(0, P_base + ((prod - 10) * 12));

            // K
            let K_base = K_mmol <= 0.7 ? 120 : K_mmol <= 1.5 ? 90 : K_mmol <= 3.0 ? 60 : K_mmol <= 5.0 ? 30 : 0;
            const K_final = Math.max(0, K_base + ((prod - 10) * 12));

            return { N: N, P: Math.round(P_final), K: Math.round(K_final), prod: prod };
        }
    },

    // --- RELATÓRIO 2: IAC 100 COMPLETO ---
    gerarRecomendacaoCompleta: function(id) {
        const a = this.data.amostras.find(i => i.id === id);
        if(!a) return;

        const culturaNorm = a.cultura.toLowerCase().trim();
        let rec = null, calagem = null, gessagem = null;

        if(culturaNorm.includes('milho')) {
            rec = this.agroCalc.calcularMilho(a);
            calagem = this.agroCalc.calcularCalagem(a, 60, 85);
            gessagem = this.agroCalc.calcularGessagem(a);
        } else {
            alert("Recomendação automática IAC disponível apenas para 'Milho' no momento.");
            return;
        }

        // Distribuição
        const N_plantio = Math.round(rec.N / 3);
        const N_cobertura = rec.N - N_plantio;
        const kgUreia_p = Math.round(N_plantio / 0.45);
        const kgUreia_c = Math.round(N_cobertura / 0.45);
        const kgKCl_p = Math.round((rec.K / 2) / 0.60);
        const kgKCl_c = Math.round((rec.K / 2) / 0.60);

        const html = `
            <div class="report-container">
                <div class="report-header">
                    <h2>Recomendação Agronômica (IAC 100)</h2>
                    <p><strong>Cultura:</strong> ${a.cultura} (Meta: ${rec.prod} t/ha)</p>
                    <p><strong>Produtor:</strong> ${a.produtor} | <strong>Talhão:</strong> ${a.talhao}</p>
                </div>
                <div class="report-section">
                    <h3>1. Correção</h3>
                    <div class="grid-2">
                        <div class="card-rec warning">
                            <h4>Calagem</h4><p class="big-num">${calagem.tons} <small>t/ha</small></p>
                            <small>Meta V%: 60%</small>
                        </div>
                        <div class="card-rec info">
                            <h4>Gessagem</h4><p class="big-num">${gessagem.kg_ha} <small>kg/ha</small></p>
                            <small>Argila: ${a.argila}%</small>
                        </div>
                    </div>
                </div>
                <div class="report-section">
                    <h3>2. Adubação (N-P-K Total: ${rec.N}-${rec.P}-${rec.K})</h3>
                    <table class="rec-table">
                        <thead><tr><th>Época</th><th>Nutrientes (kg/ha)</th><th>Produto Sugerido</th></tr></thead>
                        <tbody>
                            <tr>
                                <td><strong>Plantio</strong></td>
                                <td>N: ${N_plantio} | P: ${rec.P} | K: ${Math.round(rec.K/2)}</td>
                                <td>Uréia: ${kgUreia_p}kg <br> KCl: ${kgKCl_p}kg <br> Fonte P: Ajustar</td>
                            </tr>
                            <tr>
                                <td><strong>Cobertura</strong></td>
                                <td>N: ${N_cobertura} | K: ${Math.round(rec.K/2)}</td>
                                <td>Uréia: ${kgUreia_c}kg <br> KCl: ${kgKCl_c}kg</td>
                            </tr>
                        </tbody>
                    </table>
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