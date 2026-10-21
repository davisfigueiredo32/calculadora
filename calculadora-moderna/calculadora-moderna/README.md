# Calculadora Moderna

Calculadora completa com tema escuro, feita apenas com **HTML5, CSS3 e JavaScript puro**. Não usa frameworks, bibliotecas, `eval()` nem qualquer dependência: basta abrir o `index.html` no navegador.

## Tecnologias

- HTML5 (estrutura e acessibilidade)
- CSS3 (variáveis, grid, gradientes, media queries, `prefers-reduced-motion`)
- JavaScript (Vanilla JS)

## Estrutura das pastas

```
calculadora-moderna/
├── index.html        # estrutura da página
├── css/
│   └── style.css     # visual e responsividade
├── js/
│   └── script.js     # lógica da calculadora e interface
├── assets/
│   └── favicon.svg   # ícone da aba do navegador
└── README.md
```

No `script.js`, a classe `Calculator` guarda o estado e as regras (sem tocar na página), e a função `initUI()` liga essa lógica aos botões e ao teclado.

## Como abrir no VS Code

1. Extraia o arquivo `calculadora-moderna.zip`.
2. Abra o VS Code.
3. Vá em **File > Open Folder...** (Arquivo > Abrir Pasta) e selecione a pasta `calculadora-moderna`.

## Como executar

- **Mais simples:** dê dois cliques em `index.html` (ou clique com o botão direito no arquivo e escolha *Open with* > seu navegador).
- **Opcional, com recarregamento automático:** instale a extensão *Live Server* no VS Code, clique com o botão direito em `index.html` e escolha **Open with Live Server**.

## Como usar o teclado

| Tecla | Ação |
| --- | --- |
| `0` a `9` | Digitar números |
| `.` ou `,` | Vírgula decimal |
| `+` `-` `*` (ou `x`) `/` | Somar, subtrair, multiplicar, dividir |
| `%` | Porcentagem |
| `Enter` ou `=` | Calcular o resultado |
| `Backspace` | Apagar o último dígito (DEL) |
| `Escape` ou `Delete` | Limpar tudo (AC) |

## Detalhes de comportamento

- **Operações consecutivas:** `2 + 3 + 4 =` resulta em `9`. Depois de `=`, você pode continuar com um operador usando o resultado.
- **Porcentagem:** sozinha divide por 100 (`50 %` → `0,5`). Depois de `+` ou `−`, calcula a porcentagem do primeiro número (`200 + 10 %` → `20`, e `=` dá `220`).
- **Precisão:** `0,1 + 0,2` resulta em `0,3`, pois os resultados são arredondados para 12 dígitos significativos.
- **Erros:** divisão por zero e resultados fora do limite mostram uma mensagem; qualquer tecla seguinte recomeça a calculadora.
- **Números grandes:** a fonte diminui para caber no display e valores muito grandes ou pequenos usam notação científica.
