# WEVOL — Plano de responsividade e ajustes de layout

Guia de trabalho para as próximas sessões. Objetivo: alinhar o site aos 4 frames
do Figma (tamanhos de fonte, espaçamentos, aspect-ratios) e introduzir tipografia/
espaçamento fluidos com `clamp()`. **O menu já está pronto** (não refazer).

---

## 1. Stack e comandos

- **Astro 7** + **Tailwind v4** (via `@tailwindcss/vite`) + **GSAP/ScrollTrigger/SplitText** + **Lenis** (scroll suave).
- Tokens de design em `src/styles/global.css` (`@theme`): cores `--color-wevol-*`, fontes `--font-sans` (Instrument Sans), `--font-serif-alt` (Instrument Serif).
- Dev: `npm run dev` (local, olhar no navegador — não gerar screenshots à toa).
- Build: `npm run build`. Animações globais em `src/scripts/animations.ts` (reveal por scroll — **manter**).

## 2. Convenções de trabalho

- **Branch de desenvolvimento:** `claude/project-context-devices-rslld5`. Publicar = fast-forward de `main` (o deploy do GitHub Pages roda em push na `main`, via `.github/workflows/deploy.yml`). Site ao vivo: https://felipe-brosa.github.io/wevol/
- **Publicar só com aprovação do Felipe.** Acumular várias sections antes de verificar/publicar.
- **Economia de tokens (importante):** preferir que o Felipe confira o visual local/ao vivo em vez do agente ler screenshots (imagem lida = caro). Puxar o Figma **por section, na hora de implementar**. Evitar respostas gigantes de API. Sessões longas ficam caras — preferir sessões novas por fase.
- Identidade de commits: `Claude <noreply@anthropic.com>`.

## 3. Breakpoints (decididos)

Tailwind default + `--breakpoint-2xl: 1440px` (já setado em global.css). Frames do Figma: **Mobile 402 · Tablet 875 · Desktop 1280 · Desktop Large 1440**.

| Tier | Faixa | Frame Figma |
|---|---|---|
| Mobile | 320–767 | 402px |
| Tablet | 768–1279 | 875px |
| Desktop | 1280–1439 | 1280px |
| Desktop Large | ≥1440 | 1440px |

- **Menu overlay ↔ menu-em-linha:** troca em **1280** (`xl:`). Divisão de fonte mobile/tablet do overlay em **768** (`md:`). (Já implementado.)
- Usar breakpoints só para mudanças **estruturais** (nº de colunas, overlay vs inline). Tamanho de fonte/espaçamento → `clamp()`.

## 4. Sistema fluido com `clamp()`

- Ancorar nos extremos: **min = mobile (402)**, **max = desktop large (1440)**; usar 875/1280 como conferência.
- Fórmula sempre com `rem` no meio (acessibilidade): `clamp(MIN, Arem + Bvw, MAX)` — **nunca vw puro** no meio (quebra o zoom de texto).
- Aplicar a: títulos, corpo de texto e **espaçamentos** (padding de section, gaps). Centralizar como utilitários/tokens reutilizáveis.
- **Ressalva:** `clamp()` é interpolação linear entre 2 pontos. Se os 4 tamanhos definidos no Figma não crescerem ~linearmente com a largura, um único `clamp()` não passa exato pelos 4 — aceitar aproximação suave ou adicionar override pontual num breakpoint. Sinalizar ao Felipe quando ocorrer.
- Muitos títulos **já usam `clamp()`** com valores chutados → **re-derivar** os endpoints a partir dos tamanhos reais do Figma.

## 5. Fonte de design (Figma)

- fileKey: `MGmH5cwPJoQoaqC2EF9imB`
- Frames de página inteira (puxar por section, não a página toda — fica ilegível/caro):
  - Desktop Large (1440): `4158:57`
  - Desktop (1280): `4158:70`
  - Tablet (875): `4158:83`
  - Mobile (402): `4158:108`
- Foco: **tamanho de fonte, espaçamento, aspect-ratio**. Animações que o agente já criou podem ficar (serão revistas depois).

## 6. Assets

- **Vídeo placeholder do Hero:** `public/videos/hero-placeholder.webm` (o vídeo real virá depois; mesmo arquivo serve de placeholder para a section 11 — Histórias).
- Ícones em `public/icons/`, imagens em `public/images/`.

---

## 7. Sections — diagnóstico e tarefas

Ordem no `src/pages/index.astro`: Hero, CorpoUnico, Jornada, Tecnologias, Experiencia, Objetivos, UnidadeCarousel, Franquia, Localizador, Historias, Blog, CtaFinal, Footer.

### 1. Hero → `Hero.astro` · Baixo
- Trocar fundo **imagem → vídeo** (`public/videos/hero-placeholder.webm`): `<video autoplay muted loop playsinline>` com `object-cover`, `fetchpriority`/poster opcional.
- Garantir **100vh × 100vw exatos** (hoje é `min-h-svh`).
- **Manter o gradiente** overlay atual (já mescla com a section de baixo).

### 2. Seu corpo é único → `CorpoUnico.astro` · **Alto**
- **Chips flutuantes** sobre a imagem (4). Desktop: flutuam com **wiggle leve, dessincronizado**. Mobile: aparece **só 1**, ciclando entre os 4 com **fade-in-from-below**. (Conteúdo/posições: extrair do Figma.)
- **Elemento que vaza para o Hero** (só **desktop**): fica atrás dos elementos da section 2, **acima do vídeo do Hero**. Atenção: a section hoje tem `overflow-hidden` → precisará ajustar para permitir o vazamento + z-index entre sections.
- Fonts/espaçamentos por Figma.

### 3. Seletor de tabs → `Jornada.astro` · **Alto**
- **Dots sempre alinhados verticalmente com os textos** das tabs (hoje há hacks `-mt-8`; pode reestruturar).
- Em toda tela: **100% do slide atual + pequena espiada do próximo**. Mobile: **escalar tabs por vw** para não mostrar 2 slides quase inteiros.
- Slides não-selecionados: **opacity 20%**.
- **Último slide mantém a mesma posição** dos outros (espaço vazio ao lado indica fim do carrossel).
- **Setas de navegação no mobile.** No mobile: só o **nome da tab selecionada** aparece, mas **todas as bolinhas** aparecem.

### 4. "A NOVA ERA DO TREINO INTELIGENTE" (pill) → topo de `Tecnologias.astro` · Baixo
- Copiar o layout do Figma (espaçamento/tamanho). Sem complicação.

### 5. A inteligência (8 itens) → grid de `Tecnologias.astro` · Baixo
- Testar **2 colunas no mobile** (hoje 1 col). Seguir tamanhos do Figma.

### 6. Mais que tecnologia → `Experiencia.astro` · Médio
- Seguir layout + **atualizar ícones** (hoje os 6 usam `muscle.svg`; extrair ícones individuais do Figma).

### 7. Objetivos → `Objetivos.astro` · Baixo
- Só espaçamento e tamanho de fonte (Figma).

### 8. Unidade → `UnidadeCarousel.astro` · Baixo
- Só espaçamento e tamanho de fonte (Figma).

### 9. Franquia → `Franquia.astro` · Baixo
- Só espaçamento e tamanho de fonte (Figma).

### 10. Localizador (mapa) → `Localizador.astro` · Baixo
- Só espaçamento e tamanho de fonte (Figma).

### 11. Histórias reais → `Historias.astro` · **Alto**
- Trocar **arco de fotos → carrossel de vídeos**. Centro maior, **100% opacity**; laterais perdem **opacity + tamanho** conforme a distância do centro.
- **Desktop: 5 vídeos visíveis; tablet/mobile: 3.**
- **Hover no vídeo do centro:** leve **dim** + **botão play** (triângulo para a direita dentro de um círculo).
- Placeholder: usar `public/videos/hero-placeholder.webm` até chegarem os vídeos reais.

### 12. Blog → `Blog.astro` · Médio
- Títulos e imagens **distintos** conforme Figma (hoje 3 iguais).
- Adicionar botão de texto estilo hyperlink: **"Ler matéria completa no blog →"**.

### 13. Sua evolução começa agora → `CtaFinal.astro` · Baixo
- Já certo; só seguir espaçamentos do Figma.

### 14. Rodapé → `Footer.astro` · Baixo/Médio
- Seguir o Figma.

---

## 8. Fases sugeridas

Commitar **a cada section** (não perder trabalho se acabar a sessão).

- **Fase 1 — Fundação + sections rápidas:** montar o sistema `clamp()`/espaçamento fluido e aplicar em 1, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14. (~80% do site, risco baixo.)
- **Fase 2 — Interações complexas (uma de cada vez):** (2) chips + vazamento → (3) tabs/carrossel → (11) vídeos.

## 9. Decisões/assets pendentes (extrair na implementação)
- Section 2: conteúdo e posições dos 4 chips; o que é o "elemento que vaza".
- Section 6: os 6 ícones (assets do Figma).
- Section 11: vídeos reais (depois); comportamento do botão play.
- Section 12: títulos/imagens do blog (Figma ou placeholders distintos).

## 10. Já concluído (não refazer)
- **Menu completo:** morph de scroll no desktop (cápsula compacta, hide/show com dwell de 2s), overlay animado tablet/mobile (breakpoint 1280, botão "Menu" + hambúrguer), favicon WEVOL. Arquivo: `src/components/Header.astro`.
