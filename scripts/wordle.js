"use strict";
// import { CIDADES } from "./cities";

class Worldler {
  // VARIAVEIS DE CUSTOMIZACAO DO JOGO INCLUINDO CORES,
  //  CHANCES E TAMANHO DAS PALAVRAS. CRIADAS COMO PRIVATE MEMBERS
  //  PARA DIFERENCIAR DAS VARIAVEIS DE LOGICA DO JOGO NO CONSTRUTOR.
  #MAX_GUESS = 0;
  #WORD_SIZE = 0;
  #COLOR_MAIN = "#5A45DA";
  #COLOR_ALT = "#e38944";
  #COLOR_NEUTRAL = "#4A4A4A";

  constructor(array) {
    // VARIAVEIS PARA DEFINIR A PALAVRA A SER ENCONTRADA
    this.wordArray = array;
    this.rightGuessString =
      this.wordArray[
        Math.floor(Math.random() * this.wordArray.length)
      ].toLowerCase();
    // DEFINIR DIFICULDADE PARA ARRAY AGNOSTICO AO NUMERO DE LETRAS
    this.#WORD_SIZE = this.rightGuessString.length;
    this.#MAX_GUESS = this.#WORD_SIZE - 2 > 4 ? 4 : this.#WORD_SIZE - 2;
    // VARIAVEIS DE OPERACAO DA LOGICA DO JOGO
    this.guessesRemaining = this.#MAX_GUESS;
    this.currentGuess = [];
    this.nextLetter = 0;
  }

  restartGame() {
    // REDEFINIR VARIAVEIS
    this.rightGuessString =
      this.wordArray[
        Math.floor(Math.random() * this.wordArray.length)
      ].toLowerCase();
    this.#WORD_SIZE = this.rightGuessString.length;
    this.#MAX_GUESS = this.#WORD_SIZE - 2 > 4 ? 4 : this.#WORD_SIZE - 2;
    this.guessesRemaining = this.#MAX_GUESS;
    this.currentGuess = [];
    this.nextLetter = 0;
    // REINVOCAR FUNCOES
    this.createMap();
    document.querySelector(".game--container").innerHTML = "";
    this.initBoard();
  }

  init() {
    // CRIAR TABULEIRO E TECLADO DO JOGO E EM SEGUIDA
    //  DEFINIR SEUS EVENT LISTENERS RESPECTIVOS.
    this.createMap();
    this.initBoard();
    this.initVirtualKeyboard();
    this.initKeyboardEvents();
    this.initVirtualKeyboardEvents();
    this.initModalEventListeners();
  }

  checkWordsArray() {
    // CERTIFICAR QUE TODAS AS PALAVRAS DO ARRAY DE PALAVRAS
    //  TEM A MESMA LENGTH
    const bool =
      this.wordArray.length ===
      this.wordArray.filter((e) => e.length === this.#WORD_SIZE).length;
    if (!bool) {
      this.alertDOM("Invalid word array!");
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
      this.alertDOM("Letras insuficientes!");
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
      this.alertDOM("Resposta certa!");
      this.guessesRemaining = 0;
      this.addRestartButton();
      return;
    } else {
      this.guessesRemaining -= 1;
      this.currentGuess = [];
      this.nextLetter = 0;
    }
    // LOGICA PARA CHECAR SE O JOGO DEVE ACABAR
    if (this.guessesRemaining === 0) {
      this.alertDOM(`A palavra certa era: "${this.rightGuessString}"`);
      this.addRestartButton();
    }
  }

  addRestartButton() {
    const h1 = document.getElementById("title");
    h1.insertAdjacentHTML(
      "afterend",
      `<a href="#"><h2 id="restart">clique aqui para reiniciar!<h2></a>`
    );
    document.getElementById("restart").addEventListener("click", () => {
      document.location.reload(true);
    });
  }

  shadeKeyboard(letter, color) {
    // PEGAR NODE LIST COM TODAS AS LETRAS
    let keys = document.querySelectorAll(".kbd--btn");
    // APLICAR FUNCAO ANONIMA EM ELEMENTOS DA NODE LIST
    keys.forEach((key) => {
      // ACHAR LETRA DA NODE LIST QUE CORRESPONDE AO ARG
      if (key.textContent.toLowerCase() === letter) {
        // GUARDAR COR ATUAL DA LETRA
        let memCol = key.style.backgroundColor;
        // CHECAR SE A COR JA E A COR MAIN
        if (memCol === `${this.#COLOR_MAIN}`) {
          return;
        }
        // CHECAR SE A LETRA JA E DA COR ALT E O ARG
        //  NAO E DA COR MAIN, SIGNIFICANDO QUE NAO
        //  SERA NECESSARIO TROCAR
        if (
          memCol === `${this.#COLOR_ALT}` &&
          color !== `${this.#COLOR_MAIN}`
        ) {
          return;
        }
        // SE NENHUMA GUARD CLAUSE ENGATILHAR, APLICAR NOVA COR
        key.style.backgroundColor = color;
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
  toggleModal() {
    document.getElementById("modal").classList.toggle("hidden");
  }
  initModalEventListeners() {
    const modal = document.getElementById("modal");
    document.getElementById("rules").addEventListener("click", () => {
      this.toggleModal();
    });
    document.getElementById("close--modal").addEventListener("click", () => {
      this.toggleModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden"))
        this.toggleModal();
    });
  }

  generateStaticEmbed() {
    // FUNCAO ALTERNATIVA A STREETVIEW QUE GERA UMA FOTO BASEADA EM UMA
    // SEARCH PELA PALAVRA SECRETA.
    const imgDiv = document.querySelector(".map--container");
    const img = document.createElement("img");
    const location = this.rightGuessString;
    const size = `${imgDiv.offsetWidth}x${imgDiv.offsetHeight}`;
    img.src = `https://maps.googleapis.com/maps/api/streetview?location=${location}8&size=${size}&key=AIzaSyCEX0HMqKwrrLQxvZFIUiAD3VFF1ksM8NA`;
    imgDiv.appendChild(img);
  }

  createAdaptiveMap() {
    var geocoder = new google.maps.Geocoder();
    var address = "2 Simei Street 3, Singapore, Singapore 529889";
    //var address = "1 Hacienda Grove, Singapore 457908";
    //var address = "105 Simei Street 1, Singapore 520105";

    geocoder.geocode({ address: address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();

        var svService = new google.maps.StreetViewService();
        var panoRequest = {
          location: results[0].geometry.location,
          preference: google.maps.StreetViewPreference.NEAREST,
          radius: 50,
          source: google.maps.StreetViewSource.OUTDOOR,
        };

        var findPanorama = function (radius) {
          panoRequest.radius = radius;
          svService.getPanorama(panoRequest, function (panoData, status) {
            if (status === google.maps.StreetViewStatus.OK) {
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById(".map--container"),
                {
                  pano: panoData.location.pano,
                }
              );
            } else {
              //Handle other statuses here
              if (radius > 200) {
                this.alertDOM("Street View is not available");
              } else {
                findPanorama(radius + 5);
              }
            }
          });
        };

        findPanorama(50);
      }
    });
  }

  alertDOM(string) {
    const h1 = document.getElementById("title");
    const h1Content = h1.textContent;
    h1.textContent = string;
    setTimeout(() => {
      h1.textContent = h1Content;
    }, 5000);
  }

  createMap() {
    // CALLBACK QUE SERA CHAMADA PELO SCRIPT DO GOOGLE MAPS NO HTML

    // CRIAR REQUEST
    const request = new XMLHttpRequest();
    request.open(
      "GET",
      `https://maps.googleapis.com/maps/api/geocode/json?address=city+center+${this.rightGuessString}&key=AIzaSyCEX0HMqKwrrLQxvZFIUiAD3VFF1ksM8NA`
    );
    request.send();

    // IMPLEMENTAR A CRIACAO DO MAPA DENTRO DO EVENTO "LOAD"
    request.addEventListener("load", function () {
      // PARSE DA JSON PARA SER USADA DENTRO DO OBJ OPTIONS
      const [data] = JSON.parse(this.responseText).results;
      let location = data.geometry.location;
      // LOGICA DE DIVERSIFICACAO DO PANORAMA
      location.lat +=
        ((Math.random() * 5) / 1000) * (Math.random() < 0.5 ? -1 : 1);
      location.lng +=
        ((Math.random() * 5) / 1000) * (Math.random() < 0.5 ? -1 : 1);
      // CRIAR OBJ DE OPCOES
      let options = {
        position: location,
        preference: google.maps.StreetViewPreference.BEST,
        radius: 5000,
        source: google.maps.StreetViewSource.OUTDOOR,
        disableDefaultUI: true,
        streetViewControl: false,
        linksControl: false,
        panControl: false,
        enableCloseButton: false,
        showRoadLabels: false,
      };
      // CRIACAO DO PANORAMA DO STREET VIEW
      new google.maps.StreetViewPanorama(
        document.querySelector(".map--container"),
        options
      );
    });
  }

  //////////////// FIM DA CLASSE WORLDLER ////////////////
}
const arr = [
  "tokyo",
  "hanoi",
  "paris",
  "kyoto",
  "sofia",
  "lagos",
  "milan",
  "perth",
  "seoul",
  "miami",
  "osaka",
  "medan",
  "delhi",
  "dubai",
  "hague",
  "macau",
  "minsk",
  "cairo",
  "tunis",
  "dakar",
  "accra",
  "eeklo",
  "kabul",
  "texas",
  "moscow",
  "dhaka",
  "cairo",
  "beijing",
  "mumbai",
  "karachi",
  "istanbul",
  "kolkata",
  "manila",
  "tianjin",
  "mexico",
  "mumbai",
  "lahore",
  "chennai",
  "bogota",
  "jakarta",
  "lima",
  "bangkok",
  "nagoya",
  "london",
  "tehran",
  "luanda",
  "santiago",
  "toronto",
  "ankara",
  "nairobi",
  "sydney",
  "brasilia",
  "rome",
  "kano",
  "salvador",
  "curitiba",
  "berlin",
  "krakow",
  "busan",
  "asuncion",
  "campinas",
  "kuwait",
  "athens",
  "lisbon",
  "caracas",
  "algiers",
  "chicago",
  "brisbane",
  "beirut",
  "fortaleza",
  "brasilia",
  "salvador",
  "manaus",
  "recife",
  "goiania",
  "belem",
  "guarulhos",
];

const game = new Worldler(arr);
game.init();

// TODO: array agnostico 5 ou 6 letras / usar best parametro para pegar melhores panoramas / REFRESCAR PAGINA QNDO NAO HOUVER PROPRIEDADE GEOMETRY
