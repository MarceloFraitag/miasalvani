# Mia Salvani — Site Oficial

Site da escritora Mia Salvani, dedicado à série *Cisnes de New York*. Reúne os livros, galerias, personagens e algumas brincadeiras para as leitoras.

**Versão atual:** 6.4

## Conteúdo

- **Livros:** Albatroz, Abutre, Harpia, Juízes (prequel) e Corvo, com capas, sinopses e links de compra.
- **Spotify:** playlists de Albatroz, Abutre, Harpia e Corvo, acessíveis pelos cards dos livros.
- **Galerias:** artes dos livros e dos personagens, com visualização ampliada.
- **Relações:** painel de conexões entre personagens.
- **Jojômetro:** compara a altura da leitora com a Jojinha (1,50 m) e um dos cinco meninos. Usa as silhuetas do projeto e as artes oficiais da Mia na seleção.
- **Marielei:** brincadeira com variações de nomes.
- **Gengar:** botão fixo de bom dia, mensagens aleatórias, tema roxo temporário e contador de interações.
- **Quadro surpresa:** mostra “NÃO CLIQUE.” e revela “Em breve...” ao ser acionado.

## Alturas do Jojômetro

| Personagem | Altura |
| --- | ---: |
| Jojinha | 1,50 m |
| Dex | 1,92 m |
| Declan | 1,96 m |
| Killian | 1,92 m |
| Reid | 1,98 m |
| Chuck | 1,89 m |

A altura da leitora é informada no formulário. A régua usa uma escala comum para as três silhuetas. Os retratos dos meninos são artes oficiais da Mia; nenhuma arte gerada por IA faz parte do projeto.

## Tecnologias

- Python, FastAPI e Jinja2
- HTML, CSS e JavaScript
- SQLite para o contador global do Gengar
- Render para hospedagem

## Executar localmente

Requer Python instalado. Na pasta do projeto, execute:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Abra `http://127.0.0.1:8000`.

## Arquivos principais

| Caminho | Conteúdo |
| --- | --- |
| `main.py` | Rotas FastAPI, catálogo e contador do Gengar |
| `templates/index.html` | Estrutura e conteúdo do site |
| `static/css/style.css` | Layout, temas e responsividade |
| `static/js/site.js` | Interações, galerias, Jojômetro e Gengar |
| `static/images/` | Capas, galerias e silhuetas |
| `render.yaml` | Configuração de deploy no Render |

## API

- `GET /api/livros` — catálogo dos livros
- `GET /api/gengar` — total global de interações
- `POST /api/gengar/click` — registra uma interação
- `GET /health` — estado da aplicação

## Publicação

O contador usa o caminho definido em `GENGAR_DB_PATH`. Em produção, configure esse caminho em armazenamento persistente. **Não substitua o banco de produção pelo banco local.**

Antes de publicar, teste o menu, as galerias, os links, o modo Gengar e o Jojômetro no computador e no celular. Atualize o parâmetro `?v=` do CSS e do JavaScript quando alterar esses arquivos.

## Histórico resumido

| Versão | Alterações |
| --- | --- |
| V2–V3 | Estrutura do site, catálogo, contador e melhorias de interface |
| V4–V4.1 | Preparação de Corvo e correções de publicação |
| V5 | Capa, sinopse e galeria de Corvo |
| V6–V6.1 | Playlists, quadro surpresa e modo Gengar com duração de 4 segundos |
| V6.2 | Seleção dos meninos e comparação de alturas |
| V6.3–V6.3.2 | Terceira silhueta, escala da régua e correções de proporção |
| V6.4 | Revisão de documentação e comentários, sem mudanças de interface |

Corvo foi lançado em 27 de outubro de 2026.
