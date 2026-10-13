from pathlib import Path
from typing import List
import os
import sqlite3
from threading import Lock

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Pastas do projeto.
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("GENGAR_DB_PATH", BASE_DIR / "data" / "gengar.db"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
DB_LOCK = Lock()

app = FastAPI(title="Site Oficial - Mia Salvani", version="4.0.0")
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


class Livro(BaseModel):
    id: int
    titulo: str
    ordem: str
    premissa: str
    capa_url: str


# Livros exibidos pela API.
CATALOGO_LIVROS = [
    {"id": 1, "titulo": "Albatroz", "ordem": "Cisnes de New York — Livro 1", "premissa": "O início do dark romance que apresenta o universo dos Cisnes de New York.", "capa_url": "/static/images/capas/albatroz.jpg"},
    {"id": 2, "titulo": "Abutre", "ordem": "Cisnes de New York — Livro 2", "premissa": "A continuação da série aprofunda relações perigosas, rivalidades e obsessões.", "capa_url": "/static/images/capas/abutre.jpg"},
    {"id": 3, "titulo": "Harpia", "ordem": "Cisnes de New York — Livro 3", "premissa": "Melissa Jang e Killian Belrose ocupam o centro do terceiro volume.", "capa_url": "/static/images/capas/harpia.jpg"},
    {"id": 4, "titulo": "Juízes", "ordem": "Prequel / Obra da Série", "premissa": "O prequel expande o passado e as origens do universo dos Cisnes.", "capa_url": "/static/images/capas/juizes.jpg"},
    {"id": 5, "titulo": "Corvo", "ordem": "Cisnes de New York — Livro 4", "premissa": "Lançamento anunciado para 27 de outubro de 2026.", "capa_url": ""},
]


def abrir_banco():
    """Abre o SQLite com timeout para concorrência."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute("PRAGMA busy_timeout = 10000")
    return conn


def preparar_contador():
    """Cria o contador se ainda não existir."""
    with abrir_banco() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS gengar_counter (id INTEGER PRIMARY KEY CHECK (id = 1), clicks INTEGER NOT NULL DEFAULT 0)")
        conn.execute("INSERT OR IGNORE INTO gengar_counter (id, clicks) VALUES (1, 0)")
        conn.commit()


def total_gengar():
    """Lê o total global."""
    with abrir_banco() as conn:
        row = conn.execute("SELECT clicks FROM gengar_counter WHERE id = 1").fetchone()
        return row[0] if row else 0


preparar_contador()


@app.get("/api/livros", response_model=List[Livro])
def listar_livros():
    return CATALOGO_LIVROS


@app.get("/api/gengar")
def consultar_gengar():
    return {"clicks": total_gengar()}


@app.post("/api/gengar/click")
def registrar_gengar():
    with DB_LOCK:
        with abrir_banco() as conn:
            conn.execute("UPDATE gengar_counter SET clicks = clicks + 1 WHERE id = 1")
            conn.commit()
            clicks = conn.execute("SELECT clicks FROM gengar_counter WHERE id = 1").fetchone()[0]
    return {"clicks": clicks}


@app.get("/health")
def health_check():
    return {"status": "ok", "version": app.version}


@app.get("/")
def home_page(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")
