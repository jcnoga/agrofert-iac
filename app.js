/**
 * AgroFert App Logic
 * Modular structure compatible with GitHub Pages and scalable for Firebase.
 */

const app = {
    // --- STATE MANAGEMENT (LocalStorage Mocking Firebase) ---
    data: {
        amostras: [],
        agronomos: [],
        culturas: []
    },
    
    // --- INITIALIZATION ---
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.populateSelects();
        this.updateDashboard();
        this.renderTableAmostras();
    },

    loadData: function() {
        // In a Firebase scenario, this would be db.collection('...').get()
        this.data.amostras = JSON.parse(localStorage.getItem('amostras_db') || '[]');
        this.data.agronomos = JSON.parse(localStorage.getItem('agronomos_db') || '[{"id":1,"nome":"Dr. Exemplo","crea":"12345"}]');
        this.data.culturas = JSON.parse(localStorage.getItem('culturas_db') || '[{"id":1,"nome":"Milho","tipo":"Anual"},{"id":2,"nome":"Soja","tipo":"Anual"}]');
    },

    saveData: function(collection, data) {
        // Firebase: db.collection(collection).add(data) or .update()
        localStorage.setItem(collection + '_db', JSON.stringify(data));
        this.loadData(); // Reload state
        this.updateDashboard();
    },

    // --- NAVIGATION ---
    navigateTo: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`view-${viewId}`).classList.add('active');
        const navLink = document.getElementById(`nav-${viewId}`);
        if(navLink) navLink.classList.add('active');
        
        // Populate specific view data
        if(viewId === 'amostras') {
            this.populateSelects();
            this.renderTableAmostras();
        }
    },

    // --- UI HELPERS ---
    populateSelects: function() {
        const selAgro = document.getElementById('samp_agro');
        const selCult = document.getElementById('samp_cultura');
        
        selAgro.innerHTML = '<option value="">Selecione...</option>' + 
            this.data.agronomos.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('');
            
        selCult.innerHTML = '<option value="">Selecione...</option>' + 
            this.data.culturas.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    },

    atualizarDetalhesCultura: function() {
        // Logic to autofill production/spacing based on crop selection could go here
    },

    preencherTeste: function() {
        document.getElementById('samp_produtor').value = "Fazenda Modelo";
        document.getElementById('samp_propriedade').value = "Gleba A";
        document.getElementById('samp_cidade').value = "Campinas/SP";
        document.getElementById('samp_talhao').value = "T-01";
        document.getElementById('samp_data').valueAsDate = new Date();
        document.getElementById('samp_producao').value = "12"; // 12 t/ha milho
        
        // Soil Data (Example for Corn Recommendation)
        document.getElementById('samp_ph').value = 4.8;
        document.getElementById('samp_mo').value = 25;
        document.getElementById('samp_p').value = 12; // Baixo
        document.getElementById('samp_k').value = 0.12; // 0.12 cmolc = 1.2 mmolc (Baixo)
        document.getElementById('samp_ca').value = 2.5;
        document.getElementById('samp_mg').value = 0.8;
        document.getElementById('samp_hal').value = 3.2;
        document.getElementById('samp_al').value = 0.6; // High Al
        document.getElementById('samp_argila').value = 28;
    },

    updateDashboard: function() {
        document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },

    // --- CRUD AMOSTRAS ---
    setupEventListeners: function() {
        document.getElementById('amostraForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarAmostra();
        });
    },

    salvarAmostra: function() {
        const idVal = document.getElementById('idAmostra').value;
        const form = document.getElementById('amostraForm');
        
        const amostra = {
            id: idVal ? Number(idVal) : Date.now(),
            produtor: form.samp_produtor.value,
            propriedade: form.samp_propriedade.value,
            cidade: form.samp_cidade.value,
            agro: form.samp_agro.value,
            protocolo: form.samp_protocolo.value,
            talhao: form.samp_talhao.value,
            data: form.samp_data.value,
            cultura: form.samp_cultura.value,
            producao: Number(form.samp_producao.value),
            // Chemistry
            ph: Number(form.samp_ph.value),
            mo: Number(form.samp_mo.value),
            p: Number(form.samp_p.value),
            s: Number(form.samp_s.value || 0),
            ca: Number(form.samp_ca.value),
            mg: Number(form.samp_mg.value),
            k: Number(form.samp_k.value),
            hal: Number(form.samp_hal.value),
            al: Number(form.samp_al.value),
            argila: Number(form.samp_argila.value)
        };

        let lista = this.data.amostras;
        if(idVal) {
            const idx = lista.findIndex(i => i.id == idVal);
            if(idx > -1) lista[idx] = amostra;
        } else {
            lista.push(amostra);
        }
        
        this.saveData('amostras', lista);
        form.reset();
        document.getElementById('idAmostra').value = "";
        this.renderTableAmostras();
    },

    renderTableAmostras: function() {
        const tbody = document.getElementById('listaCorpoAmostra');
        tbody.innerHTML = '';
        
        this.data.amostras.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${a.id}<br><small>${a.talhao}</small></td>
                <td>${a.produtor}</td>
                <td>${a.cultura}</td>
                <td>${new Date(a.data).toLocaleDateString()}</td>
                <td>
                    <button class="btn-rec" onclick="app.gerarRecomendacao(${a.id})">Relatório</button>
                    <button class="btn-action btn-cancel" onclick="app.excluirAmostra(${a.id})" style="padding: 0.5rem">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    excluirAmostra: function(id) {
        if(confirm('Excluir amostra?')) {
            const novaLista = this.data.amostras.filter(a => a.id !== id);
            this.saveData('amostras', novaLista);
            this.renderTableAmostras();
        }
    },

    // --- RECOMMENDATION ENGINE (IAC 100 - MILHO) ---
    gerarRecomendacao: function(id) {
        const amostra = this.data.amostras.find(a => a.id === id);
        if(!amostra) return;

        // 1. Calculations Base
        const K_mmol = amostra.k * 10; // Converter cmolc para mmolc
        const CTC = amostra.ca + amostra.mg + amostra.k + amostra.hal;
        const V_atual = ((amostra.ca + amostra.mg + amostra.k) / CTC) * 100;
        
        let relatorioHTML = "";
        
        // Header
        relatorioHTML += `
            <div class="report-header">
                <h2>Recomendação Agronômica</h2>
                <p><strong>Produtor:</strong> ${amostra.produtor} | <strong>Talhão:</strong> ${amostra.talhao}</p>
                <p><strong>Cultura:</strong> ${amostra.cultura} | <strong>Meta:</strong> ${amostra.producao} t/ha</p>
                <p><small>Baseado no Boletim Técnico IAC 100 (2022)</small></p>
            </div>
        `;

        // Parameters Section
        relatorioHTML += `
            <div class="report-section">
                <h3>Parâmetros do Solo</h3>
                <div class="grid-4">
                    <div><strong>V%:</strong> ${V_atual.toFixed(1)}%</div>
                    <div><strong>CTC:</strong> ${CTC.toFixed(2)} cmolc/dm³</div>
                    <div><strong>Argila:</strong> ${amostra.argila}%</div>
                    <div><strong>P-resina:</strong> ${amostra.p} mg/dm³</div>
                </div>
            </div>
        `;

        if (amostra.cultura.toLowerCase().includes('milho')) {
            relatorioHTML += this.calcularMilho(amostra, V_atual, CTC, K_mmol);
        } else {
            relatorioHTML += `<div class="alert-box">⚠️ Lógica específica para <strong>${amostra.cultura}</strong> ainda não implementada. Exibindo apenas dados brutos.</div>`;
        }

        // Render in Modal
        document.getElementById('conteudoRecomendacao').innerHTML = relatorioHTML;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },

    // --- CORN LOGIC IMPLEMENTATION ---
    calcularMilho: function(amostra, V_atual, CTC, K_mmol) {
        let html = "";
        const PRNT = 80; // Padrão
        const prodEsperada = amostra.producao || 10;

        // 1. Calagem (V% = 60)
        let NC = 0;
        let calagemMsg = "Solo com saturação de bases adequada.";
        
        if (V_atual < 60) {
            NC = ((60 - V_atual) * CTC) / PRNT;
        }
        
        // Aluminum check correction
        if (amostra.al > 0.5) {
            const NC_Al = (amostra.al * 2 + (2 - (amostra.ca + amostra.mg))) / (PRNT/100);
            if(NC_Al > NC) {
                NC = NC_Al;
                calagemMsg = "Necessidade ajustada pelo teor de Alumínio.";
            }
        }

        html += `
            <div class="report-section">
                <h3>1. Correção do Solo (Calagem e Gessagem)</h3>
                <p><strong>Necessidade de Calagem:</strong> ${NC > 0 ? NC.toFixed(1) + ' t/ha' : '0 t/ha'}</p>
                <p><small>${calagemMsg} (Considerando PRNT ${PRNT}%)</small></p>
        `;

        // Gessagem
        let doseGesso = 0;
        // Critério: Ca < 0.5 ou Al% > 20% na subsuperficie (Assumindo que a amostra representa risco se Al superficial for alto)
        // Simplificação: Se argila < 35% e Al > 0.5 na superfície, recomenda gessagem preventiva ou pede análise 20-40.
        if (amostra.argila < 35 && (amostra.ca < 0.5 || amostra.al > 0.5)) {
            doseGesso = 50 * amostra.argila;
            if(doseGesso > 2000) doseGesso = 2000;
             html += `<p><strong>Necessidade de Gesso:</strong> ${doseGesso.toFixed(0)} kg/ha</p>`;
             html += `<p><small>Critério: Teor de argila (${amostra.argila}%) e baixa saturação de Ca/Alta Al.</small></p>`;
        } else {
             html += `<p><strong>Gessagem:</strong> Não recomendada com os dados atuais (verificar camada 20-40cm).</p>`;
        }
        html += `</div>`;

        // 2. Adubação NPK
        
        // Nitrogênio (Tabela 1.1 - Interpolação)
        let doseN = 0;
        if(prodEsperada <= 4) doseN = 60;
        else if(prodEsperada >= 16) doseN = 240;
        else {
            // Linear Approx based on table: roughly 15 kg N per ton above 4
            // 4t=60, 6t=90 (delta 30kg/2t = 15kg/t)
            doseN = 60 + ((prodEsperada - 4) * 15); 
        }

        // Fósforo (P) - Tabela 1.2
        let doseP = 0;
        let classeP = "";
        if(amostra.p <= 7) { classeP = "Muito Baixo"; doseP = 120; }
        else if(amostra.p <= 15) { classeP = "Baixo"; doseP = 90; }
        else if(amostra.p <= 30) { classeP = "Médio"; doseP = 60; }
        else if(amostra.p <= 60) { classeP = "Alto"; doseP = 30; }
        else { classeP = "Muito Alto"; doseP = 0; }
        
        // Ajuste Produtividade P (+- 12kg por t dif de 10)
        doseP = doseP + ((prodEsperada - 10) * 12);
        if(doseP < 0) doseP = 0;

        // Potássio (K) - Tabela 1.3
        let doseK = 0;
        let classeK = "";
        if(K_mmol <= 0.7) { classeK = "Muito Baixo"; doseK = 120; }
        else if(K_mmol <= 1.5) { classeK = "Baixo"; doseK = 90; }
        else if(K_mmol <= 3.0) { classeK = "Médio"; doseK = 60; }
        else if(K_mmol <= 5.0) { classeK = "Alto"; doseK = 30; }
        else { classeK = "Muito Alto"; doseK = 0; }
        
        // Ajuste Produtividade K
        doseK = doseK + ((prodEsperada - 10) * 12);
        if(doseK < 0) doseK = 0;

        html += `
            <div class="report-section">
                <h3>2. Adubação NPK (Doses Totais)</h3>
                <table class="report-table">
                    <tr><th>Nutriente</th><th>Nível no Solo</th><th>Dose Rec. (kg/ha)</th></tr>
                    <tr><td>Nitrogênio (N)</td><td>-</td><td><strong>${Math.round(doseN)}</strong></td></tr>
                    <tr><td>Fósforo (P₂O₅)</td><td>${classeP}</td><td><strong>${Math.round(doseP)}</strong></td></tr>
                    <tr><td>Potássio (K₂O)</td><td>${classeK}</td><td><strong>${Math.round(doseK)}</strong></td></tr>
                </table>
            </div>
        `;

        // 3. Parcelamento
        const nPlantio = Math.round(doseN / 3);
        const nCob = Math.round(doseN * 2 / 3);
        const kPlantio = Math.round(doseK * 0.5);
        const kCob = Math.round(doseK * 0.5);

        html += `
            <div class="report-section">
                <h3>3. Cronograma de Aplicação</h3>
                <table class="report-table">
                    <tr>
                        <th>Época</th>
                        <th>Nutrientes</th>
                        <th>Sugestão de Produto (Exemplo)</th>
                    </tr>
                    <tr>
                        <td><strong>Plantio</strong></td>
                        <td>N: ${nPlantio} kg | P: ${Math.round(doseP)} kg | K: ${kPlantio} kg</td>
                        <td>Aplicar no sulco de plantio. Considerar fonte de Enxofre (20-30kg S/ha).</td>
                    </tr>
                    <tr>
                        <td><strong>1ª Cobertura (V4)</strong></td>
                        <td>N: ${nCob} kg | K: ${kCob} kg</td>
                        <td>Uréia (${Math.round(nCob/0.45)} kg) + KCl (${Math.round(kCob/0.6)} kg).</td>
                    </tr>
                </table>
                <div class="alert-box">
                    <strong>Nota IAC:</strong> Para solos arenosos (argila < 15%), dividir a cobertura de N e K em duas vezes (V4 e V8).
                </div>
            </div>
        `;

        return html;
    },

    fecharModal: function() {
        document.getElementById('modalRecomendacao').style.display = 'none';
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});