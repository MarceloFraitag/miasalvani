# Mia Salvani — Site Oficial V4

Site oficial da Mia Salvani e do universo **Cisnes de New York**. Reúne os livros, informações da autora, relações entre personagens, equipe e o easter egg do Gengar.

## Novidade: Corvo

**Corvo**, quarto livro da série principal, tem lançamento anunciado para **27 de outubro de 2026**. O site apresenta um card de anúncio com um corvo 🐦‍⬛, sem capa ou sinopse fictícias, e uma contagem regressiva até a meia-noite de Brasília (UTC−3). A contagem atualiza a cada segundo e mostra uma mensagem especial quando a data chega. O horário é uma referência para a virada do dia, não uma confirmação da hora oficial de lançamento.

## O que tem no site

- Apresentação da autora e do universo Cisnes de New York.
- Cards de Albatroz, Abutre, Harpia, Juízes e o anúncio de Corvo.
- Relações entre personagens, navegação responsiva e galerias.
- Gengar da Mia com interações e contador de cliques.
- API para consultar os livros e a contagem global do Gengar.

## Rodar no computador

Tenha Python instalado. Na pasta do projeto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Abra http://127.0.0.1:8000. Para conferir o catálogo da API, acesse http://127.0.0.1:8000/api/livros.

## Onde editar

| Arquivo | O que você encontra |
| --- | --- |
| `main.py` | FastAPI, catálogo de livros, endpoints e contador do Gengar |
| `templates/index.html` | Textos, cards, seções e marcação do anúncio de Corvo |
| `static/css/style.css` | Cores, tamanhos, responsividade e aparência do card de Corvo |
| `static/js/site.js` | Menu, relações, interações do Gengar e contagem regressiva |
| `static/images/` | Imagens usadas no site |

Para trocar a data do lançamento, procure `2026-10-27T00:00:00-03:00` em `static/js/site.js`. Para mudar o símbolo do anúncio, procure `corvo-art-symbol` no HTML e no CSS. As cores gerais ficam nas variáveis `:root` do CSS.

## Antes de publicar

1. Confirme que as imagens e os links abrem normalmente.
2. Teste o card de Corvo e a contagem regressiva no celular e no computador.
3. Confira o funcionamento das relações e do Gengar.
4. Não envie `.venv`, `.env` ou arquivos de banco locais ao repositório.

## Histórico

- **V4:** anúncio de Corvo, contagem regressiva, ajuste do tamanho do card, emoji de corvo e documentação atualizada.
- **V3:** melhorias de interface, responsividade e organização do conteúdo.
- **V2:** estrutura do site com FastAPI, catálogo e contador do Gengar.

## Observações

O contador global do Gengar utiliza SQLite. Para ambientes hospedados, configure armazenamento persistente se quiser preservar os cliques entre reinicializações. O conteúdo editorial pode ser atualizado diretamente no HTML e no catálogo da API.


## V4.1 — Correção de publicação

- Os arquivos `style.css` e `site.js` usam `?v=4.1.0` no HTML para evitar reutilizar versões antigas no navegador.
- A capa provisória de Corvo mantém largura máxima de 280 px e o emoji 🐦‍⬛.
- O contador inicia quando o HTML estiver pronto e usa o horário de Brasília em 27/10/2026, às 00h.
- Para a próxima alteração de CSS ou JS, atualize o número `v=` em `templates/index.html`.

Depois do push, confira no Render se o deploy terminou como *Live* e abra os endereços dos arquivos com `?v=4.1.0`.
