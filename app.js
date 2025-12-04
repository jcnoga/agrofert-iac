/**
 * app.js - Versão com Firebase Firestore
 */

// 1. IMPORTAÇÕES DO FIREBASE (Via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. CONFIGURAÇÃO (Pegue estes dados no Console do Firebase)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// 3. INICIALIZAÇÃO
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = {
    // ESTADO LOCAL (Mantém uma cópia para renderizar a tela rapidamente)
    data: {
        amostras: [],
        agronomos: [],
        culturas: []
    },
    
    // --- INICIALIZAÇÃO ---
    init: async function() {
        console.log("Iniciando App com Firebase...");
        await this.loadData(); // Agora é assíncrono (await)
        this.setupEventListeners();
        this.populateSelects(); // Popula selects após carregar dados
        this.renderTableAmostras();
    },

    // --- CARREGAR DADOS (SUBSTITUIÇÃO SOLICITADA) ---
    loadData: async function() {
        try {
            // Buscando as coleções do Firebase
            const colecoes = ['amostras', 'agronomos', 'culturas'];
            
            for (const nomeColecao of colecoes) {
                const querySnapshot = await getDocs(collection(db, nomeColecao));
                
                // Mapeia os documentos convertendo para array de objetos
                // Importante: O ID do Firestore vem separado em doc.id
                this.data[nomeColecao] = querySnapshot.docs.map(doc => ({
                    id: doc.id, // Agora o ID é uma string (ex: "7f8sa7f8as")
                    ...doc.data()
                }));
            }
            
            this.updateDashboard();
            console.log("Dados carregados com sucesso!");
            
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            alert("Erro de conexão com o banco de dados.");
        }
    },

    // --- SALVAR DADOS (SUBSTITUIÇÃO SOLICITADA) ---
    // Agora aceita um único objeto e o nome da coleção, em vez da lista inteira
    saveData: async function(nomeColecao, objetoDados, id = null) {
        try {
            if (id) {
                // MODO EDIÇÃO: Atualiza documento existente
                const docRef = doc(db, nomeColecao, id);
                await updateDoc(docRef, objetoDados);
                alert("Registro atualizado com sucesso!");
            } else {
                // MODO INCLUSÃO: Adiciona novo documento (o ID é gerado automático)
                await addDoc(collection(db, nomeColecao), objetoDados);
                alert("Registro salvo com sucesso!");
            }

            // Recarrega os dados para atualizar a tabela
            await this.loadData();
            this.renderTableAmostras();

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar dados.");
        }
    },

    // --- EXCLUIR DADOS ---
    excluirAmostra: async function(id) {
        if(confirm('Tem certeza que deseja excluir esta amostra?')) {
            try {
                await deleteDoc(doc(db, "amostras", id));
                await this.loadData(); // Recarrega
                this.renderTableAmostras();
            } catch (error) {
                console.error("Erro ao excluir:", error);
            }
        }
    },

    // --- NAVEGAÇÃO ---
    navigateTo: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`view-${viewId}`).classList.add('active');
        const navLink = document.getElementById(`nav-${viewId}`);
        if(navLink) navLink.classList.add('active');
        
        if(viewId === 'amostras') {
            this.populateSelects(); // Garante que selects estejam atualizados
            this.renderTableAmostras();
        }
    },

    // --- MÉTODOS DE UI ---
    updateDashboard: function() {
        document.getElementById('dashTotalAmostras').textContent = this.data.amostras.length;
        document.getElementById('dashTotalCulturas').textContent = this.data.culturas.length;
    },

    populateSelects: function() {
        const selAgro = document.getElementById('samp_agro');
        const selCult = document.getElementById('samp_cultura');
        
        // Verifica se existem dados antes de mapear
        if(this.data.agronomos) {
            selAgro.innerHTML = '<option value="">Selecione...</option>' + 
                this.data.agronomos.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('');
        }
        
        if(this.data.culturas) {
            selCult.innerHTML = '<option value="">Selecione...</option>' + 
                this.data.culturas.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
        }
    },

    renderTableAmostras: function() {
        const tbody = document.getElementById('listaCorpoAmostra');
        tbody.innerHTML = '';
        
        this.data.amostras.forEach(a => {
            // Precisamos passar o ID como string entre aspas simples na chamada das funções onclick
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><small>${a.protocolo || 'N/A'}</small><br><strong>${a.talhao}</strong></td>
                <td>${a.produtor}</td>
                <td>${a.cultura}</td>
                <td>${a.data ? new Date(a.data).toLocaleDateString() : '-'}</td>
                <td>
                    <button class="btn-rec" onclick="app.gerarRecomendacao('${a.id}')">Relatório</button>
                    <button class="btn-action btn-cancel" onclick="app.carregarEdicao('${a.id}')" style="padding: 0.5rem">✎</button>
                    <button class="btn-action btn-cancel" onclick="app.excluirAmostra('${a.id}')" style="padding: 0.5rem">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    setupEventListeners: function() {
        document.getElementById('amostraForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    },

    // Wrapper para pegar os dados do form e chamar o saveData
    handleFormSubmit: function() {
        const idVal = document.getElementById('idAmostra').value; // ID do documento (se edição)
        const form = document.getElementById('amostraForm');
        
        const amostraObj = {
            produtor: form.samp_produtor.value,
            propriedade: form.samp_propriedade.value,
            cidade: form.samp_cidade.value,
            agro: form.samp_agro.value,
            protocolo: form.samp_protocolo.value,
            talhao: form.samp_talhao.value,
            data: form.samp_data.value,
            cultura: form.samp_cultura.value,
            producao: Number(form.samp_producao.value),
            // Química
            ph: Number(form.samp_ph.value),
            mo: Number(form.samp_mo.value),
            p: Number(form.samp_p.value),
            s: Number(form.samp_s.value || 0),
            ca: Number(form.samp_ca.value),
            mg: Number(form.samp_mg.value),
            k: Number(form.samp_k.value),
            hal: Number(form.samp_hal.value),
            al: Number(form.samp_al.value),
            // Física
            argila: Number(form.samp_argila.value),
            areia: Number(form.samp_areia.value),
            // Micro
            zn: Number(form.samp_zn.value),
            b: Number(form.samp_b.value),
            mn: Number(form.samp_mn.value),
            cu: Number(form.samp_cu.value),
            fe: Number(form.samp_fe.value),
            mo_micro: Number(form.samp_mo_micro.value)
        };

        // Chama a função adaptada para Firebase
        // Se idVal existir (não for vazio), ele atualiza. Se for vazio, cria novo.
        this.saveData('amostras', amostraObj, idVal || null);

        form.reset();
        document.getElementById('idAmostra').value = "";
    },

    carregarEdicao: function(id) {
        const amostra = this.data.amostras.find(a => a.id === id);
        if(!amostra) return;

        document.getElementById('idAmostra').value = amostra.id;
        
        // Mapear campos simples
        const map = {
            'samp_produtor': amostra.produtor, 'samp_propriedade': amostra.propriedade,
            'samp_cidade': amostra.cidade, 'samp_agro': amostra.agro,
            'samp_protocolo': amostra.protocolo, 'samp_talhao': amostra.talhao,
            'samp_data': amostra.data, 'samp_cultura': amostra.cultura,
            'samp_producao': amostra.producao, 'samp_ph': amostra.ph,
            'samp_mo': amostra.mo, 'samp_p': amostra.p, 'samp_s': amostra.s,
            'samp_ca': amostra.ca, 'samp_mg': amostra.mg, 'samp_k': amostra.k,
            'samp_hal': amostra.hal, 'samp_al': amostra.al, 'samp_argila': amostra.argila,
            'samp_areia': amostra.areia, 'samp_zn': amostra.zn, 'samp_b': amostra.b,
            'samp_mn': amostra.mn, 'samp_cu': amostra.cu, 'samp_fe': amostra.fe,
            'samp_mo_micro': amostra.mo_micro
        };

        for (const [key, value] of Object.entries(map)) {
            const el = document.getElementById(key);
            if(el) el.value = value || '';
        }
    },

    // --- RECOMENDAÇÃO (Mantém lógica original) ---
    gerarRecomendacao: function(id) {
        const amostra = this.data.amostras.find(a => a.id === id);
        if(!amostra) return;
        
        // ... (Mantenha a lógica de cálculo de milho aqui igual ao código anterior) ...
        // Como o ID agora é string, certifique-se de que a busca .find() funcione (ela funcionará)
        
        // Exemplo simples para teste visual
        const html = `<h2>Relatório Firebase</h2><p>Gerando para ID: ${id}</p><p>Produtor: ${amostra.produtor}</p>`;
        document.getElementById('conteudoRecomendacao').innerHTML = html;
        document.getElementById('modalRecomendacao').style.display = 'block';
    },

    fecharModal: function() {
        document.getElementById('modalRecomendacao').style.display = 'none';
    },

    preencherTeste: function() {
        document.getElementById('samp_produtor').value = "Produtor Firebase";
        // ... (Resto do preenchimento igual) ...
    }
};

// Tornar o app globalmente acessível para o HTML (devido ao type="module")
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});