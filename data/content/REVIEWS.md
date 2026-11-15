# Depoimentos da home e Galeria

`data/content/reviews.json` alimenta as duas páginas. Cada cartão mostra a foto do criador, uma frase entre aspas e o link para o review completo. Não exibe título nem miniatura do vídeo.

```json
{
  "name": "Nome do criador",
  "url": "https://www.youtube.com/watch?v=ID_DO_VIDEO",
  "review": { "pt": "Frase real confirmada.", "en": "Confirmed translation." },
  "enabled": true
}
```

- `url` identifica a publicação em `youtube.json` ou `instagram.json`. O avatar, a prioridade e a data são obtidos dessa publicação automaticamente.
- `avatarSource` é opcional: URL de outra publicação desses arquivos cujo avatar será usado. Permite usar a foto local do Instagram para um review do YouTube sem duplicar caminhos.
- `review` aceita texto ou traduções `pt`/`en`; `quote` continua aceito por compatibilidade. Entradas sem frase ficam ocultas.
- `priority` e `date` são opcionais e substituem os valores herdados. Data no formato `DD/MM/AAAA` (ou ISO).
- Ordenação igual aos destaques da Galeria: `max(0, 180 - dias desde a publicação mais recente da lista exibida) + priority * 24`, em ordem decrescente. Desempate pela data mais recente.
- `enabled: false` oculta a entrada.
- `provisional: true` sinaliza visivelmente uma frase provisória. Remova ou defina `false` somente após substituir pelo trecho confirmado.

A lista atual contém uma frase provisória fornecida para a montagem visual. Substitua-a pela citação real antes de tratá-la como depoimento confirmado.
