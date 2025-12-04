// modules/milho.js
import { interpolacaoLinear } from './utils.js';

export function recomendarMilho(amostra) {
    const prodEsperada = parseFloat(amostra.producao) || 10;
    const P_resina = parseFloat(amostra.p) || 0;
    const K_cmolc = parseFloat(amostra.k) || 0;
    const K_mmol = K_cmolc * 10; // Conversão mmolc

    // 1. NITROGÊNIO (Tabela IAC)
    const tabN = [
        {x: 4, y: 60}, {x: 6, y: 90}, {x: 8, y: 120}, 
        {x: 10, y: 150}, {x: 12, y: 180}, {x: 14, y: 210}, {x: 16, y: 240}
    ];
    const doseN = Math.round(interpolacaoLinear(prodEsperada, tabN));

    // 2. FÓSFORO
    let doseP_base = 0;
    if (P_resina <= 7) doseP_base = 120;
    else if (P_resina <= 15) doseP_base = 90;
    else if (P_resina <= 30) doseP_base = 60;
    else if (P_resina <= 60) doseP_base = 30;
    else doseP_base = 0;
    
    const ajusteP = (prodEsperada - 10) * 12;
    const doseP_final = Math.max(0, doseP_base + ajusteP);

    // 3. POTÁSSIO
    let doseK_base = 0;
    if (K_mmol <= 0.7) doseK_base = 120;
    else if (K_mmol <= 1.5) doseK_base = 90;
    else if (K_mmol <= 3.0) doseK_base = 60;
    else if (K_mmol <= 5.0) doseK_base = 30;
    else doseK_base = 0;

    const ajusteK = (prodEsperada - 10) * 12;
    const doseK_final = Math.max(0, doseK_base + ajusteK);

    return {
        nutrientes: {
            N: doseN,
            P: Math.round(doseP_final),
            K: Math.round(doseK_final)
        },
        meta: prodEsperada,
        obs: "Milho Safra Normal"
    };
}