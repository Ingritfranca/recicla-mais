---
name: recicla-core
description: Diretrizes de arquitetura, banco local Dexie 4, PWA offline, padrões CDN e fluxos operacionais da plataforma Recicla+ (MS).
---

# Skill: Recicla+ Core Development & Architecture

Esta skill orienta o desenvolvimento, manutenção e evolução da plataforma **Recicla+**, projetada para a gestão de coleta seletiva e ecopontos em municípios do Mato Grosso do Sul (com foco inicial em Coxim-MS).

---

## 1. Princípios Arquiteturais & Stack Estrita

- **Zero Build Tools / 100% CDN**: Não utilizar empacotadores (Webpack, Vite) a menos que explicitamente solicitado. As páginas rodam diretamente no navegador.
- **Vue 3 Global**: Usar a versão UMD via CDN (`Vue.createApp`).
- **Tailwind CSS 4**: Utilizar o script de runtime `@tailwindcss/browser@4`.
- **Dexie 4**: Persistência no IndexedDB via banco `recicla` (versão 1) e tabela `entregas`.
- **html5-qrcode 2.3.8**: Leitura de QR Codes de moradores via câmera e arquivo.
- **Não reinventar a roda**: Usar Chart.js para gráficos e Leaflet para mapas.

---

## 2. Mapa de Telas & Proporções Visuais

| Rota / Arquivo | Destinatário | Proporção / Layout | Tecnologias Principais |
|---|---|---|---|
| `/index.html` | Gestores Municipais | Desktop Widescreen **16:9** | Vue 3, Leaflet, Chart.js, Dexie 4 |
| `/coletor/index.html` | Coletores nos Ecopontos | Mobile Portrait **9:16**, PWA Offline | Vue 3, html5-qrcode, Dexie 4, Service Worker |
| `/morador/index.html` | Munícipes / Cidadãos | Mobile Responsivo (Cartão Virtual) | Vue 3, QRCode.js |
| `/shared/db.js` | Camada Compartilhada | Módulo UMD | Dexie 4, BroadcastChannel API |

---

## 3. Modelo de Dados Dexie 4 (`recicla`)

```javascript
const db = new Dexie('recicla');
db.version(1).stores({
  entregas: '++id, morador_id, material, peso_kg, ecoponto_id, data_hora, coletor_id, status_sinc'
});
```

### Campos Obrigatórios:
- `morador_id`: Identificador do morador (ex: `MS-CXM-00101`).
- `material`: Um dos tipos permitidos (`papelao`, `plastico`, `vidro`, `metal`, `eletronicos`, `outros`).
- `peso_kg`: Valor numérico positivo em quilogramas (ex: `12.5`).
- `ecoponto_id`: ID numérico do Ecoponto de coleta (1 a 15).
- `data_hora`: Timestamp ISO 8601.

---

## 4. Skills Operacionais dos Agentes

### Agente Coletor (`/coletor/`)
- **Leitura Resiliente**: Reconhecer QR Codes em JSON, string formatada (`RECICLA:ID:Nome:Bairro`) ou ID puro.
- **Feedback Sensorial**: Bip sonoro (Web Audio API) e vibração tátil ao ler o QR Code com sucesso.
- **Atalhos de Pesagem**: Botões rápidos para pesagem e seleção direta do material.
- **Resiliência Offline**: Gravação garantida no Dexie sem necessidade de conectividade.

### Agente Gestor (`/`)
- **Telemetria de Ecopontos**: Monitorar ocupação estimada das caçambas com marcadores pulsantes (ciano para operacional, vermelho para manutenção ou crítico).
- **Sincronização em Tempo Real**: Atualização instantânea dos indicadores ao receber eventos pelo `BroadcastChannel`.
- **Ações Rápidas**: Solicitar esvaziamento e inspecionar a base local diretamente pelo navegador.

---

## 5. Procedimentos de Teste e Validação

1. Iniciar servidor local: `python -m http.server 5000`
2. Validar `/` no navegador verificando mapa, gráficos e lista de entregas.
3. Validar `/coletor/` bipando ou simulando a entrega de um morador.
4. Conferir a atualização instantânea dos totais no dashboard do gestor.
