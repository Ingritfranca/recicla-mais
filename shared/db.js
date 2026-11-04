/**
 * Recicla+ (v0) — Camada de Dados Compartilhada
 * Banco de Dados Local: Dexie 4
 * Banco: 'recicla', Versão: 1, Tabela: 'entregas'
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['dexie'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('dexie'));
    } else {
        root.ReciclaDB = factory(root.Dexie);
    }
}(typeof self !== 'undefined' ? self : this, function (Dexie) {
    'use strict';

    if (!Dexie) {
        console.error('Dexie não encontrado! Certifique-se de incluir a biblioteca Dexie 4 via CDN.');
    }

    const db = new Dexie('recicla');

    // Esquema estrito v1 conforme AGENTS.md
    db.version(1).stores({
        entregas: '++id, morador_id, material, peso_kg, ecoponto_id, data_hora, coletor_id, status_sinc'
    });

    // Materiais padrão aceitos pela plataforma
    const MATERIAIS = [
        { id: 'papelao', name: 'Papelão', color: '#0ea5e9', icon: 'fa-box' },
        { id: 'plastico', name: 'Plástico', color: '#8b5cf6', icon: 'fa-bottle-water' },
        { id: 'vidro', name: 'Vidro', color: '#10b981', icon: 'fa-champagne-glasses' },
        { id: 'metal', name: 'Metal', color: '#f59e0b', icon: 'fa-can-food' },
        { id: 'eletronicos', name: 'Eletrônicos', color: '#ec4899', icon: 'fa-microchip' },
        { id: 'outros', name: 'Outros', color: '#94a3b8', icon: 'fa-recycle' }
    ];

    // Ecopontos de Coxim - MS
    const ECOPONTOS = [
        { id: 1, name: 'Ecoponto Central', lat: -18.5029, lng: -54.7570, status: 'active', bairro: 'Centro' },
        { id: 2, name: 'Coop. Recicla Coxim', lat: -18.5110, lng: -54.7450, status: 'active', bairro: 'Vila Santo André' },
        { id: 3, name: 'Ponto Senhor Divino', lat: -18.4950, lng: -54.7620, status: 'active', bairro: 'Senhor Divino' },
        { id: 4, name: 'Praça da Concha', lat: -18.5045, lng: -54.7595, status: 'active', bairro: 'Concha Acústica' },
        { id: 5, name: 'Ecoponto Piracema', lat: -18.5200, lng: -54.7500, status: 'active', bairro: 'Piracema' },
        { id: 6, name: 'Escola Municipal', lat: -18.4900, lng: -54.7400, status: 'active', bairro: 'Jardim Alvorada' },
        { id: 7, name: 'Ecoponto Flávio Garcia', lat: -18.5080, lng: -54.7700, status: 'maintenance', bairro: 'Flávio Garcia' },
        { id: 8, name: 'Supermercado Central', lat: -18.5010, lng: -54.7550, status: 'active', bairro: 'Centro' },
        { id: 9, name: 'Ecoponto Vila Bela', lat: -18.4850, lng: -54.7520, status: 'active', bairro: 'Vila Bela' },
        { id: 10, name: 'Terminal Rodoviário', lat: -18.5060, lng: -54.7480, status: 'active', bairro: 'Rodoviária' },
        { id: 11, name: 'Ponto Mendes Mourão', lat: -18.5150, lng: -54.7650, status: 'active', bairro: 'Mendes Mourão' },
        { id: 12, name: 'Descarte Solidário', lat: -18.4980, lng: -54.7680, status: 'active', bairro: 'Silviolândia' },
        { id: 13, name: 'Ecoponto Santa Maria', lat: -18.5250, lng: -54.7580, status: 'active', bairro: 'Santa Maria' },
        { id: 14, name: 'Feira do Produtor', lat: -18.5000, lng: -54.7500, status: 'active', bairro: 'Centro' },
        { id: 15, name: 'Nova Coxim', lat: -18.4800, lng: -54.7450, status: 'active', bairro: 'Nova Coxim' }
    ];

    // Moradores simulados para teste e emissão de QR pessoal
    const MORADORES_EXEMPLO = [
        { id: 'MS-CXM-00101', nome: 'Maria Santos Oliveira', bairro: 'Senhor Divino', cpfMascarado: '***.451.891-**' },
        { id: 'MS-CXM-00102', nome: 'José Carlos Albuquerque', bairro: 'Centro', cpfMascarado: '***.198.321-**' },
        { id: 'MS-CXM-00103', nome: 'Ana Paula Ferreira', bairro: 'Piracema', cpfMascarado: '***.723.654-**' },
        { id: 'MS-CXM-00104', nome: 'Roberto Silva Guimarães', bairro: 'Vila Bela', cpfMascarado: '***.889.012-**' },
        { id: 'MS-CXM-00105', nome: 'Cláudia Mendes Rocha', bairro: 'Flávio Garcia', cpfMascarado: '***.332.905-**' }
    ];

    // BroadcastChannel para sincronização em tempo real entre abas (Gestor e Coletor)
    let syncChannel = null;
    try {
        syncChannel = new BroadcastChannel('recicla_sync');
    } catch (e) {
        console.warn('BroadcastChannel não suportado neste navegador.');
    }

    const listeners = new Set();

    function notificarMudanca(tipo, dados) {
        listeners.forEach(fn => {
            try { fn({ tipo, dados }); } catch (err) { console.error(err); }
        });
        if (syncChannel) {
            try {
                syncChannel.postMessage({ tipo, dados, timestamp: Date.now() });
            } catch (err) { }
        }
    }

    if (syncChannel) {
        syncChannel.onmessage = (event) => {
            listeners.forEach(fn => {
                try { fn(event.data); } catch (err) { console.error(err); }
            });
        };
    }

    /**
     * Semente de dados inicial caso o banco local esteja vazio
     */
    async function seedDadosIniciaisSeVazio() {
        const total = await db.entregas.count();
        if (total > 0) return;

        console.info('Recicla+: Populando banco Dexie "recicla" com dados iniciais de demonstração para Coxim-MS...');

        const entregasIniciais = [];
        const agora = Date.now();
        const umDiaMs = 24 * 60 * 60 * 1000;

        // Distribuição aproximada dos pesos de referência da versão v0
        const proporcoes = [
            { material: 'papelao', metaKg: 4250, count: 65 },
            { material: 'plastico', metaKg: 3800, count: 60 },
            { material: 'vidro', metaKg: 2100, count: 35 },
            { material: 'metal', metaKg: 1550, count: 30 },
            { material: 'eletronicos', metaKg: 600, count: 18 },
            { material: 'outros', metaKg: 200, count: 10 }
        ];

        proporcoes.forEach(p => {
            let restanteKg = p.metaKg;
            for (let i = 0; i < p.count; i++) {
                const isUltimo = i === p.count - 1;
                const peso = isUltimo ? Math.max(1, Math.round(restanteKg)) : Math.max(1, Math.round((p.metaKg / p.count) * (0.6 + Math.random() * 0.8)));
                restanteKg -= peso;

                const morador = MORADORES_EXEMPLO[Math.floor(Math.random() * MORADORES_EXEMPLO.length)];
                const ecoponto = ECOPONTOS[Math.floor(Math.random() * ECOPONTOS.length)];
                const dataRandom = new Date(agora - Math.random() * (14 * umDiaMs)).toISOString();

                entregasIniciais.push({
                    morador_id: morador.id,
                    morador_nome: morador.nome,
                    morador_bairro: morador.bairro,
                    material: p.material,
                    peso_kg: Math.max(0.5, peso),
                    ecoponto_id: ecoponto.id,
                    ecoponto_nome: ecoponto.name,
                    data_hora: dataRandom,
                    coletor_id: 'COL-01',
                    coletor_nome: 'Marcos Coletor',
                    status_sinc: 'local'
                });
            }
        });

        await db.entregas.bulkAdd(entregasIniciais);
        console.info(`Recicla+: ${entregasIniciais.length} entregas inseridas no banco Dexie com sucesso.`);
    }

    /**
     * Registrar uma nova entrega no banco Dexie
     */
    async function registrarEntrega(dados) {
        if (!dados.morador_id || !dados.material || !dados.peso_kg) {
            throw new Error('Campos obrigatórios: morador_id, material, peso_kg');
        }

        const novaEntrega = {
            morador_id: String(dados.morador_id),
            morador_nome: dados.morador_nome || 'Morador não identificado',
            morador_bairro: dados.morador_bairro || 'Não informado',
            material: dados.material,
            peso_kg: parseFloat(dados.peso_kg),
            ecoponto_id: Number(dados.ecoponto_id || 1),
            ecoponto_nome: dados.ecoponto_nome || 'Ecoponto Central',
            data_hora: dados.data_hora || new Date().toISOString(),
            coletor_id: dados.coletor_id || 'COL-01',
            coletor_nome: dados.coletor_nome || 'Coletor 01',
            status_sinc: 'local'
        };

        const id = await db.entregas.add(novaEntrega);
        novaEntrega.id = id;

        notificarMudanca('nova_entrega', novaEntrega);
        return novaEntrega;
    }

    /**
     * Retorna todas as entregas ordenadas por data (mais recente primeiro)
     */
    async function listarEntregas(limite = 50) {
        return await db.entregas
            .reverse()
            .sortBy('data_hora')
            .then(lista => lista.slice(0, limite));
    }

    /**
     * Calcula métricas agregadas gerais da coleta
     */
    async function obterEstatisticasGerais() {
        const todas = await db.entregas.toArray();

        const totaisPorMaterial = {};
        MATERIAIS.forEach(m => {
            totaisPorMaterial[m.id] = { ...m, kg: 0, entregas: 0 };
        });

        let totalKg = 0;
        const totalEntregas = todas.length;

        todas.forEach(e => {
            const mat = e.material || 'outros';
            const peso = Number(e.peso_kg) || 0;
            if (totaisPorMaterial[mat]) {
                totaisPorMaterial[mat].kg += peso;
                totaisPorMaterial[mat].entregas += 1;
            } else {
                totaisPorMaterial['outros'].kg += peso;
                totaisPorMaterial['outros'].entregas += 1;
            }
            totalKg += peso;
        });

        const listaMateriais = Object.values(totaisPorMaterial);
        const sorted = [...listaMateriais].sort((a, b) => b.kg - a.kg);
        const topMaterial = sorted.length > 0 && sorted[0].kg > 0 ? sorted[0] : { name: 'N/A', kg: 0 };
        const topMaterialPorcentagem = totalKg > 0 ? ((topMaterial.kg / totalKg) * 100).toFixed(1) : 0;

        return {
            totalKg,
            totalEntregas,
            topMaterial,
            topMaterialPorcentagem,
            materiais: listaMateriais
        };
    }

    /**
     * Retorna o volume total por Ecoponto para calcular a capacidade/ocupação
     */
    async function obterMetricasPorEcoponto() {
        const todas = await db.entregas.toArray();
        const ecopontosMap = {};

        ECOPONTOS.forEach(ep => {
            ecopontosMap[ep.id] = {
                ...ep,
                totalKg: 0,
                totalEntregas: 0,
                capacidadeCalculada: ep.status === 'maintenance' ? 'N/A' : '0%'
            };
        });

        todas.forEach(e => {
            const epId = Number(e.ecoponto_id);
            if (ecopontosMap[epId]) {
                ecopontosMap[epId].totalKg += Number(e.peso_kg) || 0;
                ecopontosMap[epId].totalEntregas += 1;
            }
        });

        // Simulação dinâmica de capacidade (estimando caçamba de 2.000kg)
        Object.values(ecopontosMap).forEach(ep => {
            if (ep.status === 'active') {
                const capPct = Math.min(100, Math.round((ep.totalKg % 2000) / 20));
                ep.capacidadeCalculada = `${capPct}%`;
            }
        });

        return Object.values(ecopontosMap);
    }

    /**
     * Esvaziar caçamba de um ecoponto (coleta de caminhão solicitada)
     */
    async function esvaziarEcoponto(ecopontoId) {
        // Marca ou reduz a carga para fins da interface
        notificarMudanca('ecoponto_esvaziado', { ecopontoId });
    }

    /**
     * Registrar ouvinte de alterações do banco em tempo real
     */
    function onMudanca(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    return {
        db,
        MATERIAIS,
        ECOPONTOS,
        MORADORES_EXEMPLO,
        seedDadosIniciaisSeVazio,
        registrarEntrega,
        listarEntregas,
        obterEstatisticasGerais,
        obterMetricasPorEcoponto,
        esvaziarEcoponto,
        onMudanca
    };
}));
