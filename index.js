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
  constructor(symbol, num, size, colour, fillColour = "white") {
    this.symbol = symbol;
    this.num = num;
    this.size = size;
    this.colour = colour; // symbol の色
    this.faceUp = false;
    this.fillColour = fillColour;
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
    // this.nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this.nums = [1, 2, 3, 4, 5, 6, 7, 8];
    this.cardSize = { x: 35, y: 50 };

    let cards = this.prepareCards();
    this.stock = new Deque(); // 山札
    for (let i = 0; i < cards.length; i++) {
      this.stock.addBack(cards[i]);
    }
    this.nextStock = new Card("", "", this.cardSize, "");
    this.nextStock.setFaceUp();
    this.nextStock.setPos(
      this.padding.x,
      this.padding.y + this.cardOverlap + this.cardSize.y
    );

    this.tableau = []; // 段差になってるやつ
    this.prepareTableau();

    this.tableauBtm = []; // 段差のやつの，上に一枚もない場合
    for (let i = 0; i < this.tableau.length; i++) {
      const btm = new Card("E", "", this.cardSize, "", "lightgreen");
      btm.setPos(
        this.padding.x + this.spaceBetweenCard * (i + 1),
        this.padding.y
      );
      btm.setFaceUp();
      this.tableauBtm.push(btm);
    }

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
          this.padding.y + this.cardOverlap * (j - 1)
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
    if (this.stock.peekBack() === undefined) return;
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
    if (this.stock.peekBack() !== undefined) {
      this.drawCard(this.stock.peekFront());
    }
    this.drawCard(this.nextStock);
    this.drawCardSet(this.tableauBtm, "tableauBtm");
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
    if (name === "tableauBtm") {
      for (let i = 0; i < cardSet.length; i++) {
        this.drawCard(cardSet[i]);
      }
    }
  }
  drawCard(card) {
    this.ctx.beginPath();
    const cardPos = card.getPos();

    this.ctx.fillStyle = card.fillColour;
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
        this.drawCards();
        this.clearClicked();
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
            idx: { i: i, j: len - j - 1 },
          };
        }
      }
    }
    for (let i = 0; i < this.tableauBtm.length; i++) {
      searching = this.tableauBtm[i];
      if (searching.isCliked(cx, cy)) {
        return {
          obj: searching,
          type: "tableauBtm",
          idx: { i: i },
        };
      }
    }

    searching = this.stock.peekFront();
    if (searching !== undefined && searching.isCliked(cx, cy)) {
      return { obj: searching, type: "stock" };
    }

    for (let i = 0; i < this.foundation.length; i++) {
      searching = this.foundation[i][this.foundation[i].length - 1];
      if (searching.isCliked(cx, cy)) {
        return { obj: searching, type: "foundation", idx: { i: i } };
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
        return;
      }
      if (c2.type === "tableau") {
        // tableauの一番最後のカード以外がクリックされてた場合
        if (this.tableau[c2.idx.i].length !== c2.idx.j + 1) {
          // pass
        }
        // 色・数字の規則に当てはまらない場合
        else if (
          c1.obj.colour === c2.obj.colour ||
          c1.obj.num + 1 !== c2.obj.num
        ) {
          // pass
        } else {
          const posTemp = c2.obj.getPos();
          this.moveFromStock(
            this.tableau[c2.idx.i],
            posTemp.x,
            posTemp.y + this.cardOverlap
          );
        }
      }
      if (
        c2.type === "tableauBtm" &&
        c1.obj.num === this.nums[this.nums.length - 1]
      ) {
        const posTemp = c2.obj.getPos();
        this.moveFromStock(this.tableau[c2.idx.i], posTemp.x, posTemp.y);
      }
      if (c2.type === "foundation") {
        if (
          ((c1.obj.num === 1 && c2.obj.num === "") ||
            c1.obj.num === c2.obj.num + 1) &&
          c1.obj.symbol === c2.obj.symbol
        ) {
          const posTemp = c2.obj.getPos();
          this.moveFromStock(this.foundation[c2.idx.i], posTemp.x, posTemp.y);
        }
      }
    }
    if (c1.type === "tableau") {
      if (c2.type === "stock") {
        return;
      }
      if (c2.type === "tableau") {
        if (c1.obj.num + 1 === c2.obj.num && c1.obj.colour !== c2.obj.colour) {
          if (c1.idx.j !== 0) {
            this.tableau[c1.idx.i][c1.idx.j - 1].setFaceUp();
          }
          const c1Len = this.tableau[c1.idx.i].length;
          const c2Len = this.tableau[c2.idx.i].length;
          for (let j = 0; j < c1Len - c1.idx.j; j++) {
            const card = this.tableau[c1.idx.i][c1.idx.j];
            const posTemp = this.tableau[c2.idx.i][c2Len - 1 + j].getPos();
            card.setPos(posTemp.x, posTemp.y + this.cardOverlap);
            this.tableau[c2.idx.i].push(card);
            this.tableau[c1.idx.i].splice(c1.idx.j, 1);
          }
        }
      }
      if (
        c2.type === "tableauBtm" &&
        c1.obj.num === this.nums[this.nums.length - 1]
      ) {
        if (c1.idx.j !== 0) {
          this.tableau[c1.idx.i][c1.idx.j - 1].setFaceUp();
        }
        const c1Len = this.tableau[c1.idx.i].length;
        const c2Len = this.tableau[c2.idx.i].length;
        for (let j = 0; j < c1Len - c1.idx.j; j++) {
          const card = this.tableau[c1.idx.i][c1.idx.j];
          let posTemp = c2.obj.getPos();
          posTemp.y -= this.cardOverlap;
          if (j !== 0) {
            posTemp = this.tableau[c2.idx.i][c2Len - 1 + j].getPos();
          }
          card.setPos(posTemp.x, posTemp.y + this.cardOverlap);
          this.tableau[c2.idx.i].push(card);
          this.tableau[c1.idx.i].splice(c1.idx.j, 1);
        }
      }
      if (c2.type === "foundation") {
        if (c1.obj.symbol !== c1.obj.symbol) return;
        if (this.tableau[c1.idx.i].length !== c1.idx.j + 1) return;
        if (
          (c2.obj.num === "" && c1.obj.num === 1) ||
          c1.obj.num === c2.obj.num + 1
        ) {
          // Move c1 to foundation
          const card = this.tableau[c1.idx.i][c1.idx.j];
          const posTemp = c2.obj.getPos();
          card.setPos(posTemp.x, posTemp.y);
          this.foundation[c2.idx.i].push(card);
          this.tableau[c1.idx.i].splice(c1.idx.j, 1);
          if (this.tableau[c1.idx.i].length !== 0) {
            this.tableau[c1.idx.i][c1.idx.j - 1].setFaceUp();
          }
        }
      }
    }
  }
  moveFromStock(addTo, nx, ny) {
    const stockTop = this.stock.removeFront();
    if (this.stock.peekFront() !== undefined) {
      this.stock.peekFront().setFaceUp();
    }
    stockTop.setFaceUp();
    stockTop.setPos(nx, ny);
    addTo.push(stockTop);
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
