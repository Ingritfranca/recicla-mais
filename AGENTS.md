# AGENTS.md — Recicla+ (Plataforma de Coleta Seletiva Municipal - MS)

Plataforma inteligente de coleta seletiva e telemetria de Ecopontos para municípios do Mato Grosso do Sul (piloto Coxim-MS). Moradores possuem QR pessoal de cidadão; coletores realizam a bipagem nos postos e registram as pesagens; gestores públicos acompanham os indicadores em tempo real.

---

## 1. Telas e Diretrizes de Visualização

- `/` — **Painel do Gestor Municipal**:
  - Visualização desktop widescreen **16:9**, clean e informativa.
  - Telemetria de resíduos, mapa interativo de Ecopontos e composição volumétrica por material.
- `/coletor/` — **App do Coletor nos Ecopontos**:
  - Interface mobile portrait **9:16**, PWA com funcionamento 100% offline.
  - Operação tátil veloz para leitura de QR, seleção de material e entrada de pesagem.
- `/morador/` — **Cartão Digital do Cidadão**:
  - Credencial do munícipe com QR Code pessoal para apresentação nos postos de descarte.

---

## 2. Bibliotecas Permitidas (Via CDN Estrito)

- **Reatividade:** Vue 3 (`https://unpkg.com/vue@3/dist/vue.global.js`)
- **Estilização:** Tailwind CSS 4 (`https://unpkg.com/@tailwindcss/browser@4`)
- **Banco de Dados Local:** Dexie 4 (`https://unpkg.com/dexie@4/dist/dexie.js`)
- **Scanner de QR Code:** html5-qrcode 2.3.8 (`https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js`)
- **Componentes Prontos de Visualização:**
  - Mapas: Leaflet 1.9.4
  - Gráficos: Chart.js 4.4.1
  - Ícones: FontAwesome 6

---

## 3. Banco de Dados Local (Dexie 4)

- **Banco:** `recicla`
- **Versão:** `1`
- **Tabela:** `entregas`
- **Esquema:**
  ```javascript
  db.version(1).stores({
    entregas: '++id, morador_id, material, peso_kg, ecoponto_id, data_hora, coletor_id, status_sinc'
  });
  ```

---

## 4. Matriz de Skills dos Agentes

### 🛠️ Skill 1: Scanner e Identificação de Cidadão (html5-qrcode)
- Decodificação de QR Codes em múltiplos formatos: JSON (`{"id": "...", "nome": "..."}`), formato string (`RECICLA:ID:Nome:Bairro`) e ID direto.
- Resiliência com suporte a câmera traseira/frontal, leitura de imagem em arquivo e atalho de simulação para testes.
- Feedback sensorial: Beep acústico (Web Audio API) e vibração háptica (`navigator.vibrate`) no reconhecimento bem-sucedido.

### ⚖️ Skill 2: Pesagem Ágil e Classificação de Resíduos
- Suporte aos 6 tipos de materiais municipais: *Papelão, Plástico, Vidro, Metal, Eletrônicos e Outros*.
- Entrada rápida de peso com incrementos táteis (`+0.5kg`, `+1kg`, `+5kg`, `+10kg`).
- Validação estrita de peso positivo antes de autorizar a gravação.

### 💾 Skill 3: Resiliência Offline & PWA (Dexie 4 + Service Worker)
- Gravação transacional direta no IndexedDB via Dexie 4.
- Service Worker com estratégia de cache para permitir que o coletor registre coletas mesmo em áreas sem sinal de internet.
- Histórico local das entregas do turno persistido no aparelho do operador.

### 🗺️ Skill 4: Telemetria Geoespacial & Monitoramento de Caçambas
- Mapa Leaflet com os 15 Ecopontos municipais de Coxim-MS.
- Marcadores pulsantes com diferenciação de estado (operacional vs. manutenção).
- Cálculo dinâmico de ocupação de caçamba com alerta visual para pontos com capacidade crítica (≥ 85%).
- Ação interativa para solicitação de esvaziamento por caminhão de coleta.

### ⚡ Skill 5: Sincronização em Tempo Real (BroadcastChannel)
- Comunicação reativa entre abas do navegador: coletas registradas no `/coletor/` refletem instantaneamente no painel do gestor `/` sem necessidade de recarregar a página.

### 🌱 Skill 6: Gamificação e EcoCréditos (Cidadão Sustentável)
- Pontuação ecológica proporcional ao impacto ambiental do material entregue:
  - Eletrônicos: 50 pts/kg | Alumínio/Metal: 30 pts/kg | Plástico: 15 pts/kg | Vidro: 10 pts/kg | Papelão: 5 pts/kg.
  - Acúmulo de pontos vinculado ao identificador do morador para incentivos municipais futuros.

---

## 5. Regras Mandatórias de Engenharia

1. **Não reinventar a roda**: Proibido implementar soluções artesanais de mapa, gráfico, scanner QR ou engine de banco de dados; utilize estritamente as bibliotecas permitidas.
2. **Design Premium**: O painel e o aplicativo devem apresentar estética visual de alta qualidade (glassmorphism, micro-animações, paleta HSL/ciano, tipografia Inter).
3. **Padrão de Telas**: Respeitar rigorosamente o formato 16:9 no painel do gestor e o formato 9:16 mobile no app do coletor.
