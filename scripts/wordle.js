"use strict";

class Worldler {
  // VARIAVEIS DE CUSTOMIZACAO DO JOGO INCLUINDO CORES,
  //  CHANCES E TAMANHO DAS PALAVRAS. CRIADAS COMO PRIVATE MEMBERS
  //  PARA DIFERENCIAR DAS VARIAVEIS DE LOGICA DO JOGO NO CONSTRUTOR.
  #MAX_GUESS = 4;
  #WORD_SIZE = 6;
  #COLOR_MAIN = "#5A45DA";
  #COLOR_ALT = "#e38944";
  #COLOR_NEUTRAL = "#4A4A4A";

  constructor(array) {
    // VARIAVEIS DE OPERACAO DA LOGICA DO JOGO
    this.guessesRemaining = this.#MAX_GUESS;
    this.currentGuess = [];
    this.nextLetter = 0;
    // VARIAVEIS PARA DEFINIR A PALAVRA A SER ENCONTRADA
    this.wordArray = array;
    this.rightGuessString =
      this.wordArray[Math.floor(Math.random() * array.length)];
  }

  init() {
    // CRIAR TABULEIRO E TECLADO DO JOGO E EM SEGUIDA
    //  DEFINIR SEUS EVENT LISTENERS RESPECTIVOS.
    this.initBoard();
    this.initVirtualKeyboard();
    this.initKeyboardEvents();
    this.initVirtualKeyboardEvents();
    this.checkWordsArray();
  }

  checkWordsArray() {
    // CERTIFICAR QUE TODAS AS PALAVRAS DO ARRAY DE PALAVRAS
    //  TEM A MESMA LENGTH
    const bool =
      this.wordArray.length ===
      this.wordArray.filter((e) => e.length === this.#WORD_SIZE).length;
    if (!bool) {
      alert("Invalid word array!");
    }
  }
  initBoard() {
    // GET CONTAINER DO JOGO
    let container = document.querySelector(".game--container");

    // CRIAR UMA LINHA PARA CADA CHANCE
    for (let i = 0; i < this.#MAX_GUESS; i++) {
      let row = document.createElement("div");
      row.classList.add("letter--row");

      // CRIAR UMA CAIXA PARA CADA LETRA DE CADA CHANCE
      for (let j = 0; j < this.#WORD_SIZE; j++) {
        row.insertAdjacentHTML("afterbegin", `<div class="box"></div>`);
      }

      // INSERIR LINHA NO CONTAINER
      container.insertAdjacentElement("afterbegin", row);
    }
  }

  initVirtualKeyboard() {
    // CRIAR LAYOUT DE FORMA PROGRAMATICA,
    //  PARA SER ADAPTADO PARA OUTROS FORMATOS, EM QUAL CASO
    //  SERIA PRECISO MUDAR O RegEx EM initKeyboardEvents()
    const layout = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
    ];

    // GET CONTAINER DO TECLADO
    let container = document.querySelector(".kbd--container");

    // CRIAR UMA LINHA PARA CADA LINHA DO LAYOUT
    for (let i = 0; i < layout.length; i++) {
      let row = document.createElement("div");
      row.classList.add(`kbd--row${i + 1}`);

      // CRIAR UMA CAIXA PARA CADA TECLA
      for (let key of layout[i]) {
        row.insertAdjacentHTML(
          "beforeend",
          `<button class="kbd--btn">${key}</button>`
        );
      }

      // INSERIR LINHA NO CONTAINER
      container.insertAdjacentElement("beforeend", row);
    }
  }

  insertLetter(key) {
    // CHECAR SE AINDA HA ESPACO PARA LETRAS NA FILEIRA
    if (this.nextLetter === this.#WORD_SIZE) return;
    // FORMATAR PARA LOWER CASE
    let pressedKey = key.toLowerCase();
    // PEGAR PROXIMA CAIXA DA MESMA FORMA QUE EM deleteLetter()
    let row = document.querySelectorAll(".letter--row");
    let currentRow = row[this.#MAX_GUESS - this.guessesRemaining];
    let box = currentRow.children[this.nextLetter];
    // MODIFICAR CONTEUDO DA CAIXA ASSIM COMO CSS
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    // ADICIONAR LETRA AO ARRAY
    this.currentGuess.push(pressedKey);
    // ATUALIZAR VAR DE INDICE DA PROXIMA LETRA
    this.nextLetter += 1;
  }

  deleteLetter() {
    // PEGAR A CAIXA ATUAL DINAMICAMENTE COM BASE NO TOTAL
    //  DE LINHAS this.#MAX_GUESS E NA VARIAVEL QUE INDICA
    //  O INDICE DA PROXIMA LETRA. CRIANDO UM ARRAY DE CHILDREN
    //  ELEMENTS E BUSCANDO A CAIXA NESSE ARRAY.
    let row = document.querySelectorAll(".letter--row");
    let currentRow = row[this.#MAX_GUESS - this.guessesRemaining];
    let box = currentRow.children[this.nextLetter - 1];
    // REMOVER CONTEUDO, CLASSE E VARIAVEL CONTIDA NO ARRAY
    box.textContent = "";
    box.classList.remove("filled-box");
    this.currentGuess.pop();
    // DIMINUIR O CONTADOR DE INDICE DA PROXIMA LETRA
    this.nextLetter -= 1;
  }

  checkGuess() {
    // PEGAR A FILEIRA ATUAL COM BASE NOS NUMEROS DE TENTATIVAS RESTANTES
    let row = document.querySelectorAll(".letter--row");
    let currentRow = row[this.#MAX_GUESS - this.guessesRemaining];
    // GERAR STRING COM CONTEUDO DA ARRAY DA TENTATIVA ATUAL
    let guessString = this.currentGuess.reduce((str, el) => (str += el), "");
    // GERAR ARRAY COM STRING DA RESPOSTA CERTA, PARA PODER SER COMPARADO COM O
    //  ARRAY DA TENTATIVA ATUAL, E MODIFICADO PARA A LOGICA DE LETRAS REPITIDAS
    let rightGuess = Array.from(this.rightGuessString);
    // CHECAR QUE HA LETRAS SUFICIENTES NA STRING DA TENTATIVA ATUAL
    if (guessString.length !== this.#WORD_SIZE) {
      alert("Letras insuficientes!");
      return;
    }

    // LOGICA PARA DEFINIR ESTADO DE CADA LETRA, SEJA CORRETA NO MESMO LUGAR,
    //  CORRETA MAS EM OUTRO LUGAR E INCORRETA. UTILIZANDO ESTE LOOP PARA
    //  COLORIR A LETRA NO TABULEIRO E SUA CONTRAPARTE NO TECLADO VIRTUAL.
    for (let i = 0; i < this.#WORD_SIZE; i++) {
      // VARIAVEL QUE VAI GUARDAR O RGB A SER ATRIBUIDO
      let letterColor = "";
      // PEGAR A DO NOSSO ARRAY DA TENTATIVA E SUA CAIXA CORRESPONDENTE
      let box = currentRow.children[i];
      let letter = this.currentGuess[i];
      // IDNETIFICAR SE A LETRA DA VEZ SE ENCONTRA NA PALAVRA ESCONDIDA
      let letterPosition = rightGuess.indexOf(this.currentGuess[i]);
      // SE NAO FOR ENCONTRADA (-1), SERA COLORIDA COM COR NEUTRA
      if (letterPosition === -1) {
        letterColor = `${this.#COLOR_NEUTRAL}`;
      } else {
        // CASO ENCONTRADA E NO MESMO INDICE, SERA COLORIDA COM COR MAIN
        if (this.currentGuess[i] === this.rightGuessString[i]) {
          letterColor = `${this.#COLOR_MAIN}`;
        } else {
          // CASO ENCONTRADA MAS NAO NO MESMO INDICE, SERA COLORIDA COM COR ALT
          letterColor = `${this.#COLOR_ALT}`;
        }
        // MARCAR O ARRAY DA RESPOSTA CERTA PARA QUE MULTIPLAS INSTANCIAS
        //  DA MESMA LETRA SEJAM COLORIDAS.
        rightGuess[letterPosition] = "#";
      }

      // CRIAR UMA CASCATA DE DELAYS DE FORMA ASSINCRONA
      //  PARA QUE AS ALTERACOES NAO ACONTECAM INSTANTANEAMENTE.
      let delay = 250 * i;
      setTimeout(() => {
        box.style.backgroundColor = letterColor;
        this.shadeKeyboard(letter, letterColor);
      }, delay);
    }

    // LOGICA PARA CHECAR SE A RESPOSTA ESTA CERTA
    if (guessString === this.rightGuessString) {
      alert("Resposta certa!");
      this.guessesRemaining = 0;
      return;
    } else {
      this.guessesRemaining -= 1;
      this.currentGuess = [];
      this.nextLetter = 0;
    }
    // LOGICA PARA CHECAR SE O JOGO DEVE ACABAR
    if (this.guessesRemaining === 0) {
      alert("Voce usou todas as tentativas!");
      alert(`A palavra certa era: "${rightGuessString}"`);
    }
  }

  shadeKeyboard(letter, color) {
    // PEGAR NODE LIST COM TODAS AS LETRAS
    let keys = document.querySelectorAll(".kbd--btn");
    // APLICAR FUNCAO ANONIMA EM ELEMENTOS DA NODE LIST
    keys.forEach((key) => {
      // ACHAR LETRA DA NODE LIST QUE CORRESPONDE AO ARG
      console.log("trigger-1");
      if (key.textContent.toLowerCase() === letter) {
        console.log("trigger0");
        // GUARDAR COR ATUAL DA LETRA
        let memCol = key.style.backgroundColor;
        // CHECAR SE A COR JA E A COR MAIN
        if (memCol === `${this.#COLOR_MAIN}`) {
          console.log("trigger1");

          return;
        }
        // CHECAR SE A LETRA JA E DA COR ALT E O ARG
        //  NAO E DA COR MAIN, SIGNIFICANDO QUE NAO
        //  SERA NECESSARIO TROCAR
        if (
          memCol === `${this.#COLOR_ALT}` &&
          color !== `${this.#COLOR_MAIN}`
        ) {
          console.log("trigger2");
          return;
        }
        // SE NENHUMA GUARD CLAUSE ENGATILHAR, APLICAR NOVA COR
        key.style.backgroundColor = color;

        console.log(key);
        console.log(key.style.backgroundColor);
        console.log(color);
      }
    });
  }

  initKeyboardEvents() {
    document.addEventListener("keyup", (e) => {
      // CHECAR SE O JOGO É POSSÍVEL ADVINHAR
      if (!this.guessesRemaining) return;
      // PEGAR LETRA DO KEYBOARD EVENT
      let pressedKey = String(e.key);
      // CHECAR SE A TECLA FOI BACKSPACE
      if (pressedKey === "Backspace" && this.nextLetter !== 0) {
        this.deleteLetter();
        return;
      }
      // CHECAR SE A TECLA FOI ENTER
      if (pressedKey === "Enter") {
        this.checkGuess();
        return;
      }
      // CHECAR SE A LETRA SE ENCONTRA NO ALFABETO
      let valid = pressedKey.match(/[a-z]/gi);
      // CHECAR SE A LETRA E VALIDA
      if (!valid) return;
      // CHECAR SE OUTRAS TECLAS FORAM PRESSIONADAS
      if (valid.length > 1) return;
      // FINALMENTE, INVOCAR INSERT LETTER
      this.insertLetter(pressedKey);
    });
  }

  initVirtualKeyboardEvents() {
    // PEGAR DIV ONDE SERA GERADO O TECLADO
    let virtualKbd = document.querySelector(".kbd--container");
    // ADICIONAR EVENT LISTENER NO DIV INTEIRO
    virtualKbd.addEventListener("click", (e) => {
      // UTILIZAR PROPAGACAO DE EVENTOS PARA OBTER
      //  INFORMACOES DA TECLA CLICADA.
      const target = e.target;
      // CHECAR SE O QUE FOI CLICADO E UMA TECLA
      if (!target.classList.contains("kbd--btn")) return;
      // RESGATAR O TEXTO DENTRO DA TECLA
      let key = target.textContent;
      // SUBSTITUIR PARA VALORES VALIDOS AO KeyboardEvent()
      if (key === "DEL") key = "Backspace";
      if (key === "ENTER") key = "Enter";
      // EMULAR UM KEYBOARD EVENT PARA SER PROCESSADO
      //  PELO EVENT HANDLER DE TECLADOS.
      document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    });
  }

  //////////////// FIM DA CLASSE WORLDLER ////////////////
}

const arr = ["arrays", "ferals", "brites", "broths"];
const game = new Worldler(arr);
game.init();

