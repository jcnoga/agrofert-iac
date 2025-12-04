import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- NOVOS IMPORTS ---
import { calcularCalagem, calcularGessagem } from './modules/utils.js';
import { recomendarMilho } from './modules/milho.js';
// Futuramente: import { recomendarSoja } from './modules/soja.js';

// ... (Configuração do Firebase continua igual) ...

const app = {
    // ... (data, init, loadAllData continuam iguais) ...

    // --- NOVA FUNÇÃO DE RECOMENDAÇÃO MODULAR ---
    gerarRecomendacaoCompleta: function(id) {
        const a = this.data.amostras.find(i => i.id === id);
        if(!a) return;

        const culturaNorm = a.cultura.toLowerCase().trim();
        
        let rec = null;
        let calagem = null;
        let gessagem = null;

        // SELETOR DE CULTURAS
        if (culturaNorm.includes('milho')) {
            // Chama o arquivo separado do milho
            rec = recomendarMilho(a);
            // Calagem Milho: Meta V% = 60
            calagem = calcularCalagem(a, 60); 
            gessagem = calcularGessagem(a);
        } 
        else if (culturaNorm.includes('soja')) {
            // Exemplo futuro:
            // rec = recomendarSoja(a);
            // calagem = calcularCalagem(a, 60);
            alert("Módulo Soja ainda não implementado."); return;
        }
        else {
            alert("Cultura não suportada para cálculo automático ainda.");
            return;
        }

        // --- DAQUI PARA BAIXO É IGUAL (HTML DO RELATÓRIO) ---
        // Apenas ajuste para usar rec.nutrientes.N ao invés de rec.N
        
        const N_total = rec.nutrientes.N;
        const P_total = rec.nutrientes.P;
        const K_total = rec.nutrientes.K;

        // ... lógica de parcelamento (1/3 plantio, etc) ...
        // ... geração do HTML ...
        
        // Exemplo rápido de ajuste no HTML:
        // onde era ${rec.N}, agora use ${N_total}
        
        this.exibirModalRelatorio(a, rec, calagem, gessagem, N_total, P_total, K_total);
    },

    // Sugestão: Crie uma função só para desenhar o HTML e limpar o código acima
    exibirModalRelatorio: function(a, rec, calagem, gessagem, N, P, K) {
        // Cole aqui todo aquele HTML gigante do relatório
        // Substituindo as variáveis
        const html = `... (seu html aqui) ...`;
        
        document.getElementById('conteudoRecomendacao').innerHTML = html;
        document.getElementById('modalRecomendacao').style.display = 'block';
    }

    // ... (resto do app continua igual) ...
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());