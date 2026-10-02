# Mia Salvani — Site Oficial V3

Site em FastAPI para apresentar Mia Salvani, a série **Cisnes de New York**, os livros, as relações entre personagens e a equipe.

## Estrutura

- `main.py` — inicia o FastAPI, mantém a API de livros e o contador global do Gengar.
- `templates/index.html` — conteúdo e estrutura da página principal.
- `static/css/style.css` — visual, responsividade, animações e ajustes da V3.
- `static/js/site.js` — menu, barra de leitura, relações e easter eggs.
- `static/images/` — fotos, capas e imagens usadas no site.

## Rodar localmente

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Depois abra `http://127.0.0.1:8000`.

## Alterações rápidas

As cores principais ficam no começo de `static/css/style.css`, dentro de `:root`.
Os textos, links e cards dos livros ficam em `templates/index.html`.
As frases e o tempo de aparição do Gengar ficam em `static/js/site.js`.
O catálogo JSON da rota `/api/livros` fica em `main.py`.
As relações ficam em `cisneRelations`, também no `site.js`.

## Contador do Gengar

O site possui dois contadores:

- **Global:** salvo em `data/gengar.db` pelo FastAPI/SQLite.
- **Pessoal:** salvo no navegador de cada visitante com `localStorage`.

Em hospedagens com sistema de arquivos temporário, defina `GENGAR_DB_PATH` apontando para um disco persistente ou conecte um banco externo para o total global sobreviver a novos deploys.

## V3.0

- Mantida a estrutura funcional da V2.
- Corrigido o atalho de **Juízes**, que antes parava no card de **Harpia**.
- Menu mobile fecha com `Esc`, clique externo e seleção de link.
- Seção atual agora fica destacada no menu durante a navegação.
- Melhorias de foco, teclado e leitor de tela.
- Relações dos Cisnes agora atualizam o estado acessível dos botões.
- Animações de entrada possuem fallback para navegadores sem `IntersectionObserver`.
- Posicionamento do Gengar evita melhor as bordas, menu e contador.
- `localStorage` deixa de ser ponto único de falha do easter egg.
- SQLite ganhou espera para bloqueio, reduzindo falhas em cliques simultâneos.
- Adicionada rota `/health` para checagem simples de hospedagem.
- Acabamento visual refinado sem trocar a identidade azul/escura da V2.


## Galerias

As artes ficam separadas por livro dentro de `static/images/`:

- Albatroz: 17 artes
- Abutre: 13 artes
- Harpia: 20 artes
- Juízes: 17 artes

As galerias usam o mesmo lightbox, com navegação por clique, setas do teclado e `Esc`. As imagens estão em WebP para reduzir o peso do site.
