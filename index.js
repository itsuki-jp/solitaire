class Deque {
  constructor() {
    this.length = 0;
    this.front = this.back = undefined;
  }
  addFront(value) {
    this.length++;
    if (!this.front) this.front = this.back = { value };
    else this.front = this.front.next = { value, prev: this.front };
  }
  removeFront() {
    this.length--;
    let value = this.peekFront();
    if (this.front === this.back) this.front = this.back = undefined;
    else (this.front = this.front.prev).next = undefined;
    return value;
  }
  peekFront() {
    return this.front && this.front.value;
  }
  addBack(value) {
    this.length++;
    if (!this.front) this.front = this.back = { value };
    else this.back = this.back.prev = { value, next: this.back };
  }
  removeBack() {
    this.length--;
    let value = this.peekBack();
    if (this.front === this.back) this.front = this.back = undefined;
    else (this.back = this.back.next).back = undefined;
    return value;
  }
  peekBack() {
    return this.back && this.back.value;
  }
  getLength() {
    return this.length;
  }
}

class Card {
  constructor(symbol, num, size, colour) {
    this.symbol = symbol;
    this.num = num;
    this.size = size;
    this.colour = colour;
    this.faceUp = false;
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
  getPos() {
    return { x: this.x, y: this.y };
  }
  isCliked(cx, cy) {
    if (
      this.x <= cx &&
      cx <= this.x + this.size.x &&
      this.y <= cy &&
      cy <= this.y + this.size.y
    ) {
      return true;
    }
    return false;
  }
  isFaceUp() {
    return this.faceUp;
  }
  setFaceUp() {
    this.faceUp = true;
  }
  setFaceDown() {
    this.faceUp = false;
  }
  getSymbol() {
    return this.symbol;
  }
  getNum() {
    return this.num;
  }
  getName() {
    return this.symbol.toString() + this.num.toString();
  }
}

class Solitaire {
  constructor(canvas, ctx, spaceBetweenCard, cardOverlap, padding) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.clickSetUp();

    this.spaceBetweenCard = spaceBetweenCard;
    this.cardOverlap = cardOverlap;
    this.padding = padding;

    this.symbols = [
      { symbol: "♧", colour: "blue" },
      { symbol: "♤", colour: "blue" },
      { symbol: "♢", colour: "red" },
      { symbol: "♡", colour: "red" },
    ];
    this.nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this.cardSize = { x: 35, y: 50 };

    let cards = this.prepareCards();
    this.stock = new Deque();
    for (let i = 0; i < cards.length; i++) {
      this.stock.addBack(cards[i]);
    }
    this.nextStock = new Card("", "", this.cardSize);
    this.nextStock.setFaceUp();
    this.nextStock.setPos(
      this.padding.x,
      this.padding.y + this.cardOverlap + this.cardSize.y
    );

    this.tableau = []; // 段差になってるやつ
    this.prepareTableau();

    this.foundation = []; // Aとかがおかれるやつ
    this.prepareFoundation();

    this.clickedData1 = null;
    this.clickedData2 = null;
  }
  prepareCards() {
    const cards = [];
    for (const symbol of this.symbols) {
      for (const num of this.nums) {
        const card = new Card(symbol.symbol, num, this.cardSize, symbol.colour);
        card.setPos(this.padding.x, this.padding.y);
        cards.push(card);
      }
    }
    this.shuffle(cards);
    return cards;
  }
  prepareTableau() {
    let tableauLength = 7;
    for (let i = 0; i < tableauLength; i++) {
      this.tableau[i] = [];
      for (let j = 1; j <= i + 1; j++) {
        const card = this.stock.removeBack();
        card.setPos(
          this.padding.x + this.spaceBetweenCard * (i + 1),
          this.padding.y + this.cardOverlap * j
        );
        this.tableau[i].push(card);
      }
      this.tableau[i][i].setFaceUp();
    }
  }
  prepareFoundation() {
    for (let i = 0; i < this.symbols.length; i++) {
      const foundation = new Card(
        this.symbols[i].symbol,
        "",
        this.cardSize,
        this.symbols[i].colour
      );
      foundation.setPos(
        this.padding.x + this.spaceBetweenCard * (7 + 1),
        this.padding.y + this.cardSize.y * i
      );
      foundation.setFaceUp();
      this.foundation.push([foundation]);
    }
  }
  shuffle(obj) {
    for (let i = obj.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i + 1);
      [obj[i], obj[j]] = [obj[j], obj[i]];
    }
  }
  output() {
    if (this.stock.getLength() !== 0) {
      console.log(`stock top: ${this.stock.peekFront.getName()}`);
    }
    for (let i = 0; i < this.tableau.length; i++) {
      const temp = [];
      for (let j = 0; j < this.tableau[i].length; j++) {
        const nowCard = this.tableau[i][j];
        if (nowCard.isFaceUp()) {
          temp.push(nowCard.getName());
        } else {
          temp.push("??");
        }
      }
      console.log(temp.join(" "));
    }
  }
  isStockEmpty() {
    return this.stock.getLength() === 0;
  }
  flip() {
    const cardTop = this.stock.removeFront();
    cardTop.setFaceDown();
    this.stock.addBack(cardTop);
    this.stock.peekFront().setFaceUp();
    this.drawCards();
  }
  clearCanvas() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawCards() {
    this.clearCanvas();
    // waste, stock, tableau, foundation;
    this.drawCard(this.stock.peekFront());
    this.drawCard(this.nextStock);
    this.drawCardSet(this.tableau, "tableau");
    this.drawCardSet(this.foundation, "foundation");
  }
  drawCardSet(cardSet, name) {
    if (name === "stock") {
      if (cardSet.length === 0) {
        return;
      }
      this.drawCard(cardSet[cardSet.length - 1]);
    }
    if (name === "tableau") {
      for (let i = 0; i < cardSet.length; i++) {
        if (cardSet[i].length === 0) continue;
        for (let j = 0; j < cardSet[i].length; j++) {
          this.drawCard(cardSet[i][j]);
        }
      }
    }
    if (name === "foundation") {
      for (let i = 0; i < cardSet.length; i++) {
        this.drawCard(cardSet[i][cardSet[i].length - 1]);
      }
    }
  }
  drawCard(card) {
    this.ctx.beginPath();
    const cardPos = card.getPos();

    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "black";
    this.ctx.rect(cardPos.x, cardPos.y, this.cardSize.x, this.cardSize.y);
    this.ctx.fill();
    this.ctx.stroke();
    if (!card.isFaceUp()) return;

    this.ctx.font = "15px serif";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = card.colour;
    this.ctx.fillText(card.getName(), cardPos.x, cardPos.y);
  }
  getClickPos(e) {
    const rect = e.target.getBoundingClientRect();

    const viewX = e.clientX - rect.left,
      viewY = e.clientY - rect.top;

    const scaleWidth = this.canvas.clientWidth / this.canvas.width,
      scaleHeight = this.canvas.clientHeight / this.canvas.height;

    const canvasX = Math.floor(viewX / scaleWidth),
      canvasY = Math.floor(viewY / scaleHeight);
    return [canvasX, canvasY];
  }
  clickSetUp() {
    this.canvas.addEventListener("click", (e) => {
      const [canvasX, canvasY] = this.getClickPos(e);

      const clickedData = this.searchClickedCard(canvasX, canvasY);
      if (clickedData === undefined) return;
      if (!clickedData.obj.isFaceUp()) return;
      console.log(clickedData.type, clickedData.obj);

      if (clickedData.type === "nextStock") {
        this.flip();
        this.clickedData1 = null;
        return;
      }

      if (this.clickedData1 === null) {
        this.clickedData1 = clickedData;
      } else {
        this.clickedData2 = clickedData;
        this.moveCard();
      }
    });
  }
  searchClickedCard(cx, cy) {
    let searching;

    for (let i = 0; i < this.tableau.length; i++) {
      const len = this.tableau[i].length;
      for (let j = 0; j < len; j++) {
        searching = this.tableau[i][len - j - 1];
        if (searching.isCliked(cx, cy)) {
          return {
            obj: searching,
            type: "tableau",
            index: { i: i, j: len - j - 1 },
          };
        }
      }
    }

    searching = this.stock.peekFront();
    if (searching.isCliked(cx, cy)) {
      return { obj: searching, type: "stock" };
    }

    for (let i = 0; i < this.foundation.length; i++) {
      searching = this.foundation[i][this.foundation[i].length - 1];
      if (searching.isCliked(cx, cy)) {
        return { obj: searching, type: "foundation", index: i };
      }
    }
    searching = this.nextStock;
    if (searching.isCliked(cx, cy)) {
      return { obj: searching, type: "nextStock" };
    }
  }
  clearClicked() {
    this.clickedData1 = null;
    this.clickedData2 = null;
  }
  moveCard() {
    const c1 = this.clickedData1;
    const c2 = this.clickedData2;
    if (c1.type === "stock") {
      if (c2.type === "stock") {
        this.clearClicked();
        return;
      }
      if (c2.type === "tableau") {
        // tableauの一番最後のカード以外がクリックされてた場合
        if (this.tableau[c2.index.i].length !== c2.index.j + 1) {
          this.clearClicked();
          return;
        }
        // 色・数字の規則に当てはまらない場合
        if (c1.obj.colour === c2.obj.colour || c1.obj.num + 1 !== c2.obj.num) {
          this.clearClicked();
          return;
        }
        const stockTop = this.stock.removeFront();
        this.stock.peekFront().setFaceUp();
        this.stock.length--;
        stockTop.setFaceUp();
        const posTemp = c2.obj.getPos();
        stockTop.setPos(posTemp.x, posTemp.y + this.cardOverlap);
        this.tableau[c2.index.i].push(stockTop);
        this.drawCards();
        this.clearClicked();
        return;
      }
      if (c2.type === "foundation") {
      }
    }
  }
}

function test() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const spaceBetweenCard = 100;
  const cardOverlap = 20;
  const padding = { x: 20, y: 20 };
  const solitaire = new Solitaire(
    canvas,
    ctx,
    spaceBetweenCard,
    cardOverlap,
    padding
  );
  solitaire.clearCanvas();
  solitaire.flip();
  solitaire.drawCards();
  console.log(solitaire);
}
test();
