# Reviews da página inicial

Edite `data/content/reviews.json`, mantendo uma lista JSON. A home lê esse arquivo ao abrir a página, assim como a Galeria lê seus arquivos de conteúdo. Após publicar o arquivo atualizado, os reviews aparecem na próxima carga da página (sujeito ao cache da hospedagem).

A lista começa vazia (`[]`). A seção inteira fica oculta enquanto não houver reviews publicados. Não é necessário editar HTML ou JavaScript.

Modelo de entrada (substitua os exemplos pelos dados reais antes de publicar):

```json
[
  {
    "name": "Nome do influenciador",
    "url": "https://www.youtube.com/watch?v=ID_DO_VIDEO",
    "quote": {
      "pt": "Trecho real do review em português.",
      "en": "English translation of the review excerpt."
    },
    "thumbnail": "https://exemplo.com/imagem-do-review.jpg",
    "enabled": true
  }
]
```

- `name` e `url`: obrigatórios. Use um link HTTP ou HTTPS para o review.
- `quote`: opcional; aceita texto simples ou traduções `pt`/`en`. Sem inglês, usa o português.
- `thumbnail`: opcional; aceita URL externa ou caminho relativo à raiz do site, como `assets/reviews/foto.webp`. Para YouTube, a miniatura é obtida do link automaticamente quando este campo é omitido. Outros links usam o logo como alternativa.
- `youtubeId`: opcional, permite informar o identificador de um vídeo explicitamente.
- `enabled`: opcional; use `false` para guardar um review sem exibi-lo.
- A ordem da lista determina a ordem dos reviews. Separe os objetos com vírgula. JSON não aceita comentários.

Cadastre apenas reviews reais. Nenhum exemplo deste documento é publicado automaticamente.
