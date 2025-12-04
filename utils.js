// modules/utils.js

// Interpolação Linear (Usada para encontrar N na tabela)
export function interpolacaoLinear(x, tabela) {
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
}

// Cálculo de Calagem (Genérico)
export function calcularCalagem(a, culturaMetaV, prnt = 80) {
    const Ca = parseFloat(a.ca) || 0;
    const Mg = parseFloat(a.mg) || 0;
    const K = parseFloat(a.k) || 0;
    const HAl = parseFloat(a.hal) || 0;

    const SB = Ca + Mg + K;
    const CTC = SB + HAl;
    const V_atual = CTC > 0 ? (SB / CTC) * 100 : 0;
    
    let NC = 0;
    if (V_atual < culturaMetaV) {
        NC = ((culturaMetaV - V_atual) * CTC) / prnt;
    }
    
    return {
        necessidade: NC > 0,
        toneladas: Math.max(0, NC).toFixed(1),
        v_atual: V_atual.toFixed(1),
        ctc: CTC.toFixed(2)
    };
}

// Cálculo de Gessagem (Genérico)
export function calcularGessagem(a) {
    const argila = parseFloat(a.argila) || 20;
    const dose = 50 * argila;
    const doseFinal = Math.min(dose, 2000); // Trava de segurança 2t/ha
    
    return {
        recomendado: doseFinal > 0,
        kg_ha: doseFinal.toFixed(0)
    };
}