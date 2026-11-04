# ♻️ Recicla+ — Plataforma de Coleta Seletiva Municipal

**Tecnologia, sustentabilidade e inovação para uma gestão mais inteligente de resíduos.**

O **Recicla+** é uma plataforma web concebida para apoiar a gestão, o monitoramento e o incentivo à coleta seletiva municipal. Desenvolvido com foco em um projeto piloto para **Coxim, Mato Grosso do Sul**, o sistema conecta cidadãos, coletores e gestores públicos por meio de diferentes interfaces acessíveis diretamente pelo navegador.

A proposta é utilizar a tecnologia para facilitar o acompanhamento dos Ecopontos, organizar o registro de materiais recicláveis e incentivar a participação da comunidade por meio de um sistema de pontuação.

---

## 📌 Principais módulos e interfaces

| Interface | Caminho | Plataforma | Descrição |
|---|---|---|---|
| **Painel do Gestor** | `/index.html` | Desktop | Dashboard com indicadores, monitoramento das coletas, mapa interativo dos Ecopontos e gráficos de composição dos resíduos. |
| **App do Coletor** | `/coletor/index.html` | Mobile / PWA | Interface para identificação dos cidadãos, leitura de QR Code, classificação de materiais, registro de pesagens e histórico de entregas. |
| **Cartão do Cidadão** | `/morador/index.html` | Mobile / Web | Credencial digital com QR Code pessoal para identificação nos Ecopontos. |

As interfaces possuem navegação entre si. O App do Coletor conta com layout adaptável, priorizando a utilização em dispositivos móveis durante as atividades de coleta.

## ⚡ Funcionalidades

### 🗺️ Painel de monitoramento
- Dashboard com indicadores das coletas;
- Mapa interativo com 15 Ecopontos mapeados em Coxim-MS;
- Identificação de Ecopontos operacionais e em manutenção;
- Acompanhamento percentual da ocupação;
- Alertas visuais para pontos com capacidade crítica, a partir de 85%;
- Gráficos para visualização da composição dos materiais recebidos.

### 📱 Aplicativo do coletor
- Identificação do cidadão por QR Code;
- Classificação dos materiais entregues;
- Registro de pesagens;
- Histórico de entregas;
- Interface adaptada para dispositivos móveis;
- Armazenamento local para utilização sem conexão com a internet.

### 👤 Cartão digital do cidadão
- Credencial digital individual;
- QR Code pessoal para identificação;
- Interface acessível pelo navegador.

### 🔄 Sincronização entre interfaces

A comunicação entre as telas abertas no mesmo navegador utiliza a API **BroadcastChannel**, por meio do canal `recicla_sync`.

Dessa forma, uma entrega registrada no App do Coletor pode atualizar os indicadores do Painel do Gestor sem a necessidade de recarregar a página.

### 🏆 Gamificação e EcoCréditos

O sistema utiliza pontuação proporcional ao peso e à categoria do material entregue, incentivando a participação dos cidadãos na coleta seletiva.

| Material | Pontuação |
|---|---:|
| Eletrônicos | 50 pontos/kg |
| Metal | 30 pontos/kg |
| Plástico | 15 pontos/kg |
| Vidro | 10 pontos/kg |
| Papelão | 5 pontos/kg |

### 📷 Leitura de QR Code

O sistema oferece diferentes possibilidades de identificação:
- Leitura pela câmera do dispositivo;
- Leitura de QR Code a partir de arquivos de imagem;
- Interpretação de payloads em formato JSON;
- Suporte a strings personalizadas no formato `RECICLA:ID:Nome:Bairro`;
- Simulação de leitura para testes.

## 🛠️ Tecnologias utilizadas

A aplicação foi estruturada sem necessidade de etapa de compilação (*build step*). As bibliotecas são carregadas diretamente por CDN.

| Tecnologia | Aplicação no projeto |
|---|---|
| [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) | Estruturação das interfaces |
| [Vue 3](https://vuejs.org/) | Reatividade e organização da interface |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização e construção dos layouts |
| [Dexie 4](https://dexie.org/) | Manipulação simplificada do banco local |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB) | Persistência dos registros no navegador |
| [html5-qrcode](https://github.com/mebjas/html5-qrcode) | Leitura de QR Codes |
| [Leaflet 1.9.4](https://leafletjs.com/) | Mapas interativos dos Ecopontos |
| [Chart.js 4.4.1](https://www.chartjs.org/) | Construção de gráficos e indicadores |
| FontAwesome 6 | Ícones da interface |
| [Google Fonts](https://fonts.google.com/) | Tipografia Inter |
| Service Worker | Cache e suporte à operação offline |

## 📁 Estrutura do repositório

```text
Recicla/
├── index.html              # Painel do Gestor Municipal
├── README.md               # Documentação do projeto
├── AGENTS.md               # Diretrizes para os agentes de IA
├── shared/
│   └── db.js               # Camada de dados compartilhada
├── coletor/
│   ├── index.html          # Aplicativo do Coletor
│   ├── manifest.json       # Configuração PWA
│   └── sw.js               # Service Worker
└── morador/
    └── index.html          # Cartão Digital do Cidadão
```

## 🚀 Como executar localmente

### Pré-requisitos
- Python 3 instalado;
- Navegador atualizado.

### 1. Inicie o servidor

Abra o terminal na pasta raiz do projeto e execute:

```bash
python3 -m http.server 5000
```

No Windows, caso o comando `python3` não funcione, utilize:

```bash
python -m http.server 5000
```

### 2. Acesse a aplicação

Abra o navegador e acesse:

**http://localhost:5000**

### 3. Teste a integração

Para visualizar o fluxo entre as interfaces:

1. Abra o Painel do Gestor em `http://localhost:5000`.
2. Abra o App do Coletor em `http://localhost:5000/coletor/`.
3. Realize o registro de uma entrega pelo App do Coletor.
4. Observe a atualização dos indicadores no Painel do Gestor.

> **Importante:** recursos como câmera e Service Worker funcionam melhor em `localhost` ou em um domínio HTTPS. Abrir os arquivos diretamente pelo explorador (`file://`) pode impedir o funcionamento desses recursos.

## 💾 Persistência e funcionamento offline

O projeto utiliza **IndexedDB**, por meio da biblioteca Dexie 4, para armazenar localmente os registros de entrega.

O banco de dados utilizado é identificado como `recicla`, com a tabela `entregas`.

O Service Worker (`sw.js`) oferece suporte ao cache dos recursos da aplicação, permitindo que determinados recursos continuem disponíveis mesmo em locais sem conexão.

A comunicação entre o Painel do Gestor e o App do Coletor acontece por meio do BroadcastChannel, dentro do mesmo navegador.

**Observação:** o protótipo não possui backend ou sincronização centralizada entre diferentes dispositivos. Os registros permanecem armazenados no ambiente local do navegador.

## 🎓 Contexto do projeto e desenvolvimento com IA

O Recicla+ surgiu durante um **treinamento conduzido por um professor, com o objetivo de preparar participantes para atuar como monitores em um minicurso de Engenharia de Prompt**.

A experiência teve como proposta explorar, na prática, a elaboração de prompts, o direcionamento de ferramentas de inteligência artificial e a utilização de agentes para a construção de soluções tecnológicas.

O desenvolvimento da aplicação aconteceu em diferentes etapas:

**1. Gemini — Geração inicial do código**

O processo começou no Gemini, utilizado para gerar a primeira versão do código da aplicação a partir das orientações funcionais e da proposta do projeto.

**2. Antigravity IDE — Ambiente de desenvolvimento**

O código inicial foi organizado em uma pasta de projeto no Antigravity IDE, ambiente utilizado para dar continuidade ao desenvolvimento com o auxílio de agentes de IA.

**3. Agentes de IA — Implementação e aprimoramento**

A partir da estrutura inicial, os agentes foram orientados a implementar funcionalidades, integrar bibliotecas, desenvolver interfaces, corrigir comportamentos e realizar melhorias conforme as solicitações feitas durante o processo.

**4. Refinamento contínuo**

A aplicação passou por sucessivas modificações, com elaboração de novos prompts, avaliação dos resultados e ajustes para atender aos requisitos definidos.

A participação humana esteve presente na concepção da proposta, definição das funcionalidades, elaboração das instruções, direcionamento dos agentes e avaliação das implementações.

O Recicla+ representa uma experiência prática de **Engenharia de Prompt e desenvolvimento assistido por agentes de IA**, explorando novas possibilidades de construção e evolução de aplicações web.

## 📍 Status do projeto

**Protótipo funcional para demonstração e validação de fluxo.**

O Recicla+ ainda não está preparado para utilização como sistema oficial de gestão municipal.

Para uma possível implantação em ambiente real, seriam necessários aprimoramentos como:

- Desenvolvimento de backend para armazenamento e sincronização centralizada;
- Implementação de autenticação e controle de acesso;
- Proteção e validação dos dados dos cidadãos;
- Testes de segurança e confiabilidade;
- Definição de políticas de tratamento de dados em conformidade com a LGPD;
- Validação das informações e dos Ecopontos junto aos responsáveis municipais.

---

**Recicla+ — Pequenas ações, grandes transformações.** ♻️
