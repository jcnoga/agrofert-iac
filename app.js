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

// --- SUBSTITUA A FUNÇÃO preencherTeste NO SEU APP.JS ---

preencherTeste: function() {
    // Função auxiliar para gerar números com casas decimais fixas
    // Ex: rand(5, 10, 2) gera algo como 7.42
    const rand = (min, max, dec = 2) => (Math.random() * (max - min) + min).toFixed(dec);
    
    // Função auxiliar para definir valor no input
    const set = (id, val) => { 
        const el = document.getElementById(id); 
        if(el) el.value = val; 
    };

    // 1. DADOS GERAIS (Cenário: Soja no Cerrado)
    const produtores = ["João da Silva", "Fazenda Santa Maria", "Agropecuária Boi Verde", "José Santos"];
    set('samp_produtor', produtores[Math.floor(Math.random() * produtores.length)]);
    set('samp_propriedade', "Gleba A - Talhão " + Math.floor(Math.random() * 20));
    set('samp_cidade', "Rio Verde/GO");
    set('samp_protocolo', "LAB-" + Math.floor(Math.random() * 10000));
    set('samp_talhao', "T-" + Math.floor(Math.random() * 50));
    
    // Data de hoje
    if(document.getElementById('samp_data')) {
        document.getElementById('samp_data').valueAsDate = new Date();
    }

    // Cultura: Soja
    set('samp_cultura', "Soja"); 
    set('samp_producao', "3.8"); // ~63 sacas/ha (Produtividade realista)
    set('samp_esp_linha', "0.50"); // 50cm entre linhas
    set('samp_esp_cova', "0.20");  // 20cm entre plantas

    // 2. QUÍMICA (Solo levemente ácido, precisando de correção)
    // pH entre 5.0 e 5.8
    const ph = parseFloat(rand(5.0, 5.8, 1)); 
    set('samp_ph', ph);

    // Se o pH é baixo, geralmente tem Alumínio (0.2 a 0.8)
    // Se o pH for melhor (>5.5), o Alumínio é baixo ou zero
    const al = ph < 5.5 ? rand(0.2, 0.8, 2) : "0.00";
    set('samp_al', al);

  // Matéria Orgânica em % (Geralmente vai de 1.5% a 5.0% em solos agrícolas)
    set('samp_mo', rand(1.5, 4.5, 1));
    set('samp_p', rand(8, 25, 1));    // Fósforo: 8 a 25 mg/dm³
    set('samp_s', rand(4, 12, 1));    // Enxofre: 4 a 12 mg/dm³

    set('samp_k', rand(0.15, 0.35, 2)); // Potássio
    set('samp_ca', rand(1.5, 3.5, 2));  // Cálcio
    set('samp_mg', rand(0.5, 1.2, 2));  // Magnésio
    set('samp_hal', rand(2.5, 5.5, 2)); // Acidez Potencial (H+Al)

    // 3. FÍSICA (Solo médio/argiloso)
    const argila = Math.floor(rand(35, 60, 0));
    const areia = Math.floor(rand(15, 40, 0));
    // (O resto seria silte, não precisamos calcular para o form)
    set('samp_argila', argila);
    set('samp_areia', areia);

    // 4. MICRONUTRIENTES (Valores típicos)
    set('samp_zn', rand(0.8, 2.5, 2));  // Zinco
    set('samp_b', rand(0.15, 0.45, 2)); // Boro
    set('samp_mn', rand(4.0, 15.0, 1)); // Manganês
    set('samp_cu', rand(0.5, 1.5, 2));  // Cobre
    set('samp_fe', rand(20, 60, 1));    // Ferro (geralmente alto)
    set('samp_mo_micro', rand(0.01, 0.05, 3)); // Molibdênio (valor muito baixo)
},
    updateDashboard: function() {
        if(document.getElementById('dashTotalAmostras')) document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        if(document.getElementById('dashTotalAgronomos')) document.getElementById('dashTotalAgronomos').textContent = this.data.agronomos.length;
        if(document.getElementById('dashTotalCulturas')) document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },

// --- SUBSTITUA ESTA FUNÇÃO NO SEU APP.JS ---

// --- ATUALIZE ESTA FUNÇÃO NO SEU APP.JS ---

gerarRecomendacao: function(id) {
    const a = this.data.amostras.find(i => i.id === id);
    if(!a) return;

    // --- 1. PREPARAÇÃO DOS DADOS ---
    const val = (v) => parseFloat(v) || 0;
    const fmt = (v) => val(v).toFixed(2);
    const fmt1 = (v) => val(v).toFixed(1); // Para P, S e MO
    const fmt3 = (v) => val(v).toFixed(3); // Para Molibdênio

    // Cálculos Químicos
    const SB  = val(a.ca) + val(a.mg) + val(a.k);
    const CTC = SB + val(a.hal);
    const V   = CTC > 0 ? ((SB / CTC) * 100) : 0;
    
    // Cálculo de Saturação por Alumínio (m%)
    const somaBasesAl = SB + val(a.al);
    const m = somaBasesAl > 0 ? (val(a.al) / somaBasesAl) * 100 : 0;

    // Cálculo Físico (Silte é o que sobra)
    const argila = Math.floor(val(a.argila));
    const areia = Math.floor(val(a.areia));
    const silte = 100 - argila - areia;

    // --- 2. GERAÇÃO DO HTML ---
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.4;">
            
            <!-- CABEÇALHO -->
            <div style="background: #e8f5e9; padding: 10px; border-radius: 6px; border-left: 5px solid #2e7d32; margin-bottom: 10px;">
                <h2 style="margin: 0; color: #1b5e20; font-size: 1.4rem;">Relatório de Análise de Solo</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; margin-top: 8px;">
                    <div><strong>Produtor:</strong> ${a.produtor}</div>
                    <div><strong>Propriedade:</strong> ${a.propriedade || '-'}</div>
                    <div><strong>Município:</strong> ${a.cidade || '-'}</div>
                    <div><strong>Resp. Técnico:</strong> ${a.agro || '-'}</div>
                </div>
            </div>

            <!-- IDENTIFICAÇÃO E CULTURA -->
            <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                <strong style="color: #2e7d32;">IDENTIFICAÇÃO:</strong>
                <span style="margin-right: 15px;">Prot: <b>${a.protocolo || '-'}</b></span>
                <span style="margin-right: 15px;">Talhão: <b>${a.talhao}</b></span>
                <span style="margin-right: 15px;">Data: <b>${a.data ? a.data.split('-').reverse().join('/') : '-'}</b></span>
                <br>
                <strong style="color: #2e7d32;">CULTURA:</strong>
                <span style="margin-right: 10px;">${a.cultura}</span>
                <span style="margin-right: 10px;">Prod: <b>${fmt(a.producao)} t/ha</b></span>
                <span>Espaçamento: <b>${fmt(a.esp_linha)}m x ${fmt(a.esp_cova)}m</b></span>
            </div>

            <!-- BLOCO 1: MACRONUTRIENTES E CÁLCULOS -->
            <h4 style="margin: 0 0 5px 0; background: #eee; padding: 4px 8px; font-size: 0.9rem; border-radius: 4px;">1. Química do Solo (Macro + Bases)</h4>
            
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; font-size: 0.8rem; text-align: center; margin-bottom: 10px;">
                <!-- Linha 1 -->
                <div class="box-res"><strong>pH (H₂O)</strong><br>${fmt(a.ph)}</div>
                <div class="box-res"><strong>M.O.</strong><br>${fmt1(a.mo)}%</div>
                <div class="box-res"><strong>P (Resina)</strong><br>${fmt1(a.p)} <small>mg</small></div>
                <div class="box-res"><strong>S</strong><br>${fmt1(a.s)} <small>mg</small></div>
                <div class="box-res" style="background: #e3f2fd;"><strong>CTC</strong><br>${fmt(CTC)}</div>

                <!-- Linha 2 -->
                <div class="box-res"><strong>Ca</strong><br>${fmt(a.ca)}</div>
                <div class="box-res"><strong>Mg</strong><br>${fmt(a.mg)}</div>
                <div class="box-res"><strong>K</strong><br>${fmt(a.k)}</div>
                <div class="box-res" style="background: #fff3e0;"><strong>H+Al</strong><br>${fmt(a.hal)}</div>
                <div class="box-res" style="background: #e8f5e9;"><strong>SB</strong><br>${fmt(SB)}</div>
            </div>

            <!-- ÍNDICES DE SATURAÇÃO (IMPORTANTE) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; text-align: center; margin-bottom: 15px;">
                <div style="padding: 6px; border-radius: 4px; background: ${V < 50 ? '#ffcdd2' : '#c8e6c9'}; border: 1px solid #ddd;">
                    <strong>Saturação por Bases (V%):</strong> <span style="font-size:1.1em">${fmt(V)}%</span>
                </div>
                <div style="padding: 6px; border-radius: 4px; background: ${m > 20 ? '#ffccbc' : '#f5f5f5'}; border: 1px solid #ddd;">
                    <strong>Sat. Alumínio (m%):</strong> 
                    <span style="font-size:1.1em">${fmt(m)}%</span> 
                    <small>(${val(a.al).toFixed(2)} cmolc)</small>
                </div>
            </div>

            <!-- BLOCO 2: MICRONUTRIENTES E FÍSICA -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                
                <!-- Coluna da Esquerda: Micros -->
                <div>
                    <h4 style="margin: 0 0 5px 0; background: #eee; padding: 4px 8px; font-size: 0.9rem; border-radius: 4px;">2. Micronutrientes (mg/dm³)</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; font-size: 0.8rem; text-align: center;">
                        <div class="box-res"><strong>Zn</strong><br>${fmt(a.zn)}</div>
                        <div class="box-res"><strong>B</strong><br>${fmt(a.b)}</div>
                        <div class="box-res"><strong>Mn</strong><br>${fmt(a.mn)}</div>
                        <div class="box-res"><strong>Cu</strong><br>${fmt(a.cu)}</div>
                        <div class="box-res"><strong>Fe</strong><br>${fmt(a.fe)}</div>
                        <div class="box-res"><strong>Mo</strong><br>${fmt3(a.mo_micro)}</div>
                    </div>
                </div>

                <!-- Coluna da Direita: Física -->
                <div>
                    <h4 style="margin: 0 0 5px 0; background: #eee; padding: 4px 8px; font-size: 0.9rem; border-radius: 4px;">3. Textura (%)</h4>
                    <div style="font-size: 0.85rem; padding: 5px; border: 1px solid #eee; border-radius: 4px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Argila:</span> <strong>${argila}%</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span>Areia:</span> <strong>${areia}%</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; color: #777;">
                            <span>Silte:</span> <span>${silte}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RODAPÉ DE ESTILO -->
            <style>
                .box-res { border: 1px solid #ddd; padding: 4px; border-radius: 4px; background: #fff; }
            </style>
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