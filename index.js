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
    this.cardSize = { x: 20, y: 50 };

    this.waste = []; // 山札からひっくり返されたやつ

    this.stock = []; // 山札
    this.prepareStock();
    this.shuffle();

    this.tableau = []; // 段差になってるやつ
    this.prepareTableau();

    this.foundation = []; // Aとかがおかれるやつ
  }
  prepareStock() {
    for (const symbol of this.symbols) {
      for (const num of this.nums) {
        const card = new Card(symbol, num);
        card.setPos(this.padding.x, this.padding.y);
        this.stock.push(card);
      }
    }
  }
  prepareTableau() {
    let tableauLength = 7;
    for (let i = 0; i < tableauLength; i++) {
      this.tableau[i] = [];
      for (let j = 1; j <= i + 1; j++) {
        const card = this.stock.pop();
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
  shuffle() {
    for (let i = this.stock.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i + 1);
      [this.stock[i], this.stock[j]] = [this.stock[j], this.stock[i]];
    }
  }
  output() {
    console.log(`stock length: ${this.stock.length}`);
    if (this.waste.length !== 0) {
      console.log(`waste top: ${this.waste[this.waste.length - 1].getName()}`);
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
    return this.stock.length === 0;
  }
  isWasteEmpty() {
    return this.waste.length === 0;
  }
  waste2Stock() {
    for (const card of this.waste) {
      card.setPos(this.padding.x, this.padding.y);
      card.setFaceDown();
      this.stock.push(card);
    }
    this.waste = [];
  }
  flip() {
    if (!this.isWasteEmpty) {
      this.waste[this.waste.length - 1].setFaceDown();
    }

    const cardFromStock = this.stock.pop();
    cardFromStock.setFaceUp();
    cardFromStock.setPos(
      this.padding.x,
      this.padding.y + this.cardSize.y + this.cardOverlap
    );
    this.waste.push(cardFromStock);
  }
}

class Solitaire {
  constructor() {
    const spaceBetweenCard = 100;
    const cardOverlap = 20;
    const padding = { x: 20, y: 20 };
    this.Board = new Board(spaceBetweenCard, cardOverlap, padding);
  }
  flipStock() {
    if (this.Board.isStockEmpty()) {
      this.Board.waste2Stock();
    }
    this.Board.flip();
  }
}

function game() {}

const solitaire = new Solitaire();
solitaire.Board.output();
for (let i = 0; i < 100; i++) {
  console.log("------------------------------------");
  console.log(solitaire.Board.stock[solitaire.Board.stock.length - 1]);
  solitaire.flipStock();
  // solitaire.Board.output();
}
