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
  constructor(symbol, num) {
    this.symbol = symbol;
    this.num = num;
    this.faceUp = false;
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
  getPos() {
    return { x: this.x, y: this.y };
  }
  isCollided(x, y, diff) {
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

class Board {
  constructor(spaceBetweenCard, cardOverlap, padding) {
    this.spaceBetweenCard = spaceBetweenCard;
    this.cardOverlap = cardOverlap;
    this.padding = padding;

    this.symbols = ["♤", "♧", "♢", "♡"];
    this.nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this.cardSize = { x: 35, y: 50 };

    let cards = this.prepareCards();
    this.stock = new Deque();
    for (let i = 0; i < cards.length; i++) {
      this.stock.addBack(cards[i]);
    }

    this.tableau = []; // 段差になってるやつ
    this.prepareTableau();

    this.foundation = []; // Aとかがおかれるやつ
  }
  prepareCards() {
    const cards = []
    for (const symbol of this.symbols) {
      for (const num of this.nums) {
        const card = new Card(symbol, num);
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
      this.foundation.push([]);
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
  // Todo: 書き換える
  flip() {
    const cardTop = this.stock.removeFront();
    cardTop.setFaceDown();
    this.stock.addBack(cardTop);
    const cardNext = this.stock.peekFront();
    cardNext.setFaceUp();
  }
}

class Solitaire {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;

    const spaceBetweenCard = 100;
    const cardOverlap = 20;
    const padding = { x: 20, y: 20 };
    this.Board = new Board(spaceBetweenCard, cardOverlap, padding);
  }
  clearCanvas() {
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawCards() {
    // waste, stock, tableau, foundation;
    // this.drawCardSet(this.Board.stock.peekFront(), "stock");
    this.drawCard(this.Board.stock.peekFront());
  }
  drawCardSet(cardSet, name) {
    if (name === "stock") {
      if (cardSet.length === 0) {
        return;
      }
      this.drawCard(cardSet[cardSet.length - 1]);
    }
  }
  drawCard(card) {
    this.ctx.font = "15px serif";
    const cardPos = card.getPos();

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(
      cardPos.x,
      cardPos.y,
      this.Board.cardSize.x,
      this.Board.cardSize.y
    );
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(card.getName(), cardPos.x, cardPos.y);
    console.log(card.getName())

  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const solitaire = new Solitaire(canvas, ctx);
solitaire.clearCanvas();
solitaire.Board.flip();
solitaire.drawCards()

function test() {
  const solitaire = new Solitaire();
  solitaire.Board.output();
  for (let i = 0; i < 100; i++) {
    console.log("------------------------------------");
    console.log(solitaire.Board.stock[solitaire.Board.stock.getLength() - 1]);
    solitaire.Board.flip();
    // solitaire.Board.output();
  }
}
