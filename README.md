# 🎭 Teatro EAC — Estou a caminho

Site das peças do **Encontro de Adolescentes com Cristo** (Paróquia de Santo Antônio, Campina Grande — PB).

Navegue as peças e personagens, veja falas, cenas e o passo a passo de cada apresentação.

## 📖 Peças

- **1ª** — Todo começo gera sempre um "Pré-conceito"
- **2ª** — O Bom Samaritano
- **3ª** — Cenas Relâmpago — Amigos de Jesus
- **Especial** — O Júri de Bruno: culpado ou inocente?

## 🎨 Como rodar localmente

Basta subir um servidor HTTP na pasta e abrir o navegador:

```bash
python3 -m http.server 8000
```

Depois abra <http://localhost:8000>.

## 📁 Estrutura

- `index.html` — página única (SPA)
- `styles.css` — visual (tema teatro, dark/light)
- `data.js` — dados das peças e personagens
- `app.js` — roteamento por hash e views

## 🌐 GitHub Pages

Após o push, ative o Pages em **Settings → Pages** apontando para a branch `main` (root) e o site fica público.
