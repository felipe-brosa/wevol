# WEVOL — Plano de responsividade e ajustes de layout

Guia de trabalho para as próximas sessões. Objetivo: alinhar o site aos 4 frames
do Figma (tamanhos de fonte, espaçamentos, aspect-ratios) e introduzir tipografia/
espaçamento fluidos com `clamp()`. **O menu já está pronto** (não refazer).

---

## ⏳ Onde paramos (atualizado — sessão 2)

> **MODO DE TRABALHO AGORA: SÓ LOCAL, SEM GITHUB.** O Felipe está desenvolvendo no
> computador de casa e vai acumular tudo para subir de uma vez depois. **Não commitar
> nem dar push** — apenas editar os arquivos no disco. Verificar cada mudança com
> `npm run build` (tem que passar limpo); o Felipe confere no `npm run dev`. O
> `git add/commit/push` fica por conta do Felipe, quando ele decidir.

### Concluído
- **Fase 1 inteira** — sistema fluido montado + todas as sections rápidas re-derivadas do
  Figma (ver §10). **Zero `vw` puro restante** (o último — rótulo da tab do Jornada — foi
  resolvido junto do #3).
- **Fase 2 · #2 CorpoUnico** — título fluido, **4 chips** (wiggle dessincronizado no
  desktop / 1 ciclando no mobile) e o **"elemento que vaza"** para o Hero
  (`overflow-x-clip` + `isolate`; asset `public/icons/corpo-bleed.svg`; sem tocar no Hero).
- **Fase 2 · #3 Jornada** (tabs/carrossel) — reestruturado (ver §10). Dots alinhados aos
  rótulos (sem `-mt-8`); md+ = lista vertical, `<md` = fileira de dots + nome selecionado +
  setas; slides = `viewport − gap − peek` (1 inteiro + espiada em toda tela); não-ativos a
  20% de opacidade; último slide fica flush à esquerda com vazio à direita. `vw` puro do
  rótulo trocado por `clamp` ancorado em rem.
- **Fase 2 · #11 Historias** (arco de fotos → **carrossel de vídeos** coverflow) — ver §10.
  Center card maior a 100% opacidade; laterais encolhem + desbotam com a distância; desktop
  (≥1280) mostra 5, tablet/mobile 3; clicar numa lateral recentra; hover no centro = dim +
  botão play; vídeo = placeholder (`hero-placeholder.webm`).
- **Fonte corrigida** — títulos usam **Instrument Sans estática**
  (`@fontsource/instrument-sans` 400/500/600/700), **não** mais a variável. `--font-sans`
  em `global.css` = `'Instrument Sans', system-ui, sans-serif`.

- **Polimento · #12 Blog** — 3 posts com **títulos e imagens distintos** (títulos do Figma;
  imagens = `tech-biotriagem`/`tech-ems`/`tech-estacao` como placeholders) + link
  **"Ler matéria completa no blog →"** por card (Sans 500 16px `grad-1`, underline via
  `border-b`, seta que desliza no hover). Imagem do card 320px.

- **Polimento · #5 Experiencia** — os 6 ícones agora são os **glifos Iconify exatos do Figma**
  (`tabler:clock`, `icon-park-outline:muscle`, `material-symbols:list`,
  `hugeicons:body-part-leg`, `flowbite:users-outline`, `nimbus:ecosystem`), embutidos inline
  com `currentColor` = **wevol-orange** (#ff3d00, cor do Figma), `size-10`.
- **Polimento · #4 Tecnologias** — pill refeito conforme Figma (single `#111`, rounded-full,
  Sans **Medium 14px**, tracking 0.5em desktop / 0.2em mobile p/ caber); grid agora
  **2 colunas no mobile** → 4 no tablet/desktop (`grid-cols-2 md:grid-cols-4`), cards
  `aspect-square` (mobile/tablet) / `aspect-[286/320]` (desktop), gap 12→24, título responsivo.
- **Polimento · #8 UnidadeCarousel** — alturas fixas trocadas por **aspect-ratio do Figma**
  por tier: `aspect-[370/438]` (mobile) · `md:aspect-[827/909]` (tablet) ·
  `lg:aspect-[1216/900]` (desktop, junto com os thumbnails).

### Próximos
**Nada pendente de layout/responsividade** — Fase 1, Fase 2 e o polimento de todas as sections
estão feitos e conferidos nos 4 tiers. O que resta é **conteúdo real** (não é layout):
vídeos reais das Histórias (hoje placeholder `hero-placeholder.webm`), fotos reais do Blog
(hoje placeholders `tech-*`), e o vídeo real do Hero. Trocar quando os assets chegarem.

---

## 1. Stack e comandos

- **Astro 7** + **Tailwind v4** (via `@tailwindcss/vite`) + **GSAP/ScrollTrigger/SplitText** + **Lenis** (scroll suave).
- Tokens de design em `src/styles/global.css` (`@theme`): cores `--color-wevol-*`, fontes `--font-sans` (Instrument Sans), `--font-serif-alt` (Instrument Serif).
- Dev: `npm run dev` (local, olhar no navegador — não gerar screenshots à toa).
- Build: `npm run build`. Animações globais em `src/scripts/animations.ts` (reveal por scroll — **manter**).

## 2. Convenções de trabalho

- **SÓ LOCAL POR ENQUANTO — não commitar nem dar push.** Ver o bloco "Onde paramos" no
  topo. O Felipe acumula tudo e sobe de uma vez depois. (O deploy do GitHub Pages roda em
  push na `main` via `.github/workflows/deploy.yml`; site ao vivo:
  https://felipe-brosa.github.io/wevol/. A branch `claude/project-context-devices-rslld5`
  existe no remoto mas **não** é usada enquanto o trabalho for local.)
- **Verificar antes de entregar:** `npm run build` tem que passar limpo; o Felipe confere
  o visual no `npm run dev`.
- **Economia de tokens (importante):** preferir que o Felipe confira o visual local/ao vivo em vez do agente ler screenshots (imagem lida = caro; e o screenshot automático **trava** nesta página por causa das animações GSAP infinitas — a página nunca fica idle). Para verificar sem screenshot, dá para medir via JS no navegador (ex.: `document.documentElement.scrollWidth`, `getComputedStyle`, posições de elementos). Puxar o Figma **por section, na hora de implementar** (usar `excludeScreenshot: true` no `get_design_context` para baratear). Sessões longas ficam caras — preferir sessões novas por fase.
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

> **JÁ IMPLEMENTADO em `src/styles/global.css` (usar, não recriar):**
> - **`.wv-ftype`** — utilitário de fonte fluida. Uso: `class="wv-ftype [--fs-min:36] [--fs-max:48]"`
>   (números em px). Interpola 402→1440 com min/max em `rem` + 1 ponto `rem+vw` — acessível,
>   **nunca `vw` puro**. Substitui todo `text-[clamp(...vw...)]` chutado.
> - **`--wv-pad-x`** (16→32px) — já aplicado no `.wv-container` (padding lateral).
> - **`--wv-section-y`** (64→96px) — ritmo vertical padrão; usar `py-[var(--wv-section-y)]`
>   (mas conferir: nem toda section é 64→96; ex.: Localizador é 96 flat).
> - **Cuidado**: nem todo título é fluido (alguns são flat, ex.: Localizador/Blog = **Serif
>   60px fixo**) e a **família varia** (Sans `.wv-title` vs Serif `.wv-title-alt`). Sempre
>   puxar o Figma da section e conferir **família + tamanho nos 2 extremos** antes de aplicar.

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
- **Fundação fluida** (`global.css`): `.wv-ftype`, `--wv-pad-x`, `--wv-section-y` (ver §4).
- **Fonte**: Instrument Sans **estática** (não variável) — `Layout.astro` importa
  `@fontsource/instrument-sans/400|500|600|700.css`; `--font-sans` sem a variável.
- **Fase 1 — sections re-derivadas do Figma** (fonte/espaçamento fluidos, sem `vw` puro):
  - **#1 Hero**: imagem→**vídeo** (`hero-placeholder.webm`, com `poster`), **`h-svh`** (100vh),
    título 48→128, sub 24→30, centralizado no mobile / à esquerda no desktop.
  - **#5 Tecnologias** (título 36→48).
  - **#6 Experiencia** (48→60 · 60→72).
  - **#7 Objetivos** (título 36→48; itens 24px; padding fluido; lista empilha no mobile).
  - **#9 Franquia** (36→60 · corpo 16→20 · "Seja um franqueado" 48→72).
  - **#10 Localizador** e **#12 Blog** (título = **Serif 60px fixo** — o código chutado usava Sans 48).
  - **#13 CtaFinal** (título 48→128; **subtítulo trocado de Serif p/ Sans** 20→30, conforme Figma).
  - **#14 Footer** (links = 36px fixo).
  - **#11 Historias**: título 36→60 (a interação está logo abaixo, na Fase 2).
- **Fase 2 · #11 Historias** (`Historias.astro`): título 36→60; **coverflow de vídeos**
  (JS inline, sem lib). Cards `<button>` absolutos centrados; posição/escala/opacidade por
  offset ao ativo (loop infinito, wrap p/ direção mais curta). Center 360×581 (`md+`, via
  `--hist-cw: clamp(260→360)` + `aspect-[360/581]`) / 260×419 (mobile); escala lateral
  0.944/0.889, opacidade 1/0.6/0.25; `range` = 2 (≥1280, 5 cards) / 1 (3 cards). `step` medido
  do `offsetWidth`. Clique numa lateral recentra; clique no centro dá play/pause; hover no
  centro = dim + botão play (SVG). Vídeo = `hero-placeholder.webm` (poster distinto por card).
  **Nota:** as transições CSS ficam congeladas no preview pane — conferir por estilo inline.
- **Fase 2 · #3 Jornada** (`Jornada.astro`): título 30→72; **md+** = lista vertical de tabs
  com trilho de dots alinhado a cada rótulo (dot centrado na 1ª linha via
  `top: calc(0.625 * var(--jt-fs))`), rótulo fluido `clamp(20→34px)` (Sans 400), ativo em
  `grad-1`; **`<md`** = fileira horizontal de dots (todos) + nome da etapa (Sans 500 18px
  `grad-1`) + setas prev/next (desabilitam nos extremos). Carrossel finito (sem loop):
  `--jt-slide-w = viewport − 24 − peek` setado por JS (fallback em `<style>` por breakpoint),
  slides portrait 534px (`<lg`) / landscape 464px (`lg+`), não-ativos `opacity-20`, e o
  **ativo sempre flush à esquerda** (último deixa vazio à direita = fim). Auto-advance 4s
  mantido, para no último. Sangra até a borda direita da tela pra mostrar a espiada.
- **Fase 2 · #2 CorpoUnico** (`CorpoUnico.astro` + lógica de chips em `scripts/animations.ts`):
  título serif 48→72; **4 chips** posicionados por % relativos à imagem va600 (desktop:
  wiggle dessincronizado; mobile: 1 ciclando com fade-up); **elemento que vaza** para o Hero
  (`overflow-x-clip` + `isolate` na section, forma `public/icons/corpo-bleed.svg` com
  `rotate-180`, atrás do conteúdo via z-index). Ícones dos chips são **placeholders SVG inline**
  (dá pra trocar pelos exatos do Figma depois).
