class Player {
  constructor(color = '#000000') {
    this.color = color
  }
  changeColor(newColor) {
    this.color = newColor
  }
  toString() {
    return this.color
  }
}



class Game {
  PLAYER1 = new Player('#ff0000')
  PLAYER2 = new Player('#0000ff')
  constructor(height, width) {
    this.height = height 
    this.width = width 
    this.board = []
    this.currPlayer = this.PLAYER1
    this.isPlaying = false
    this.bootstrap()
    this.init()

  }

  bootstrap() {
    this.listenStartGame()
    this.listenRestartGame()
    this.listenPlayerColorChange()
  }

  init() {
    this.makeBoard()
    this.makeHtmlBoard()
    this.showStartDialog()
   
  }

  listenPlayerColorChange() {
    /** @type {HTMLInputElement} */
    const $player1 = document.getElementById('player1')

    /** @type {HTMLInputElement} */
    const $player2 = document.getElementById('player2')

    $player1.addEventListener('change', (ev) => {
      this.PLAYER1.changeColor($player1.value)
    })

    $player2.addEventListener('change', () => {
      this.PLAYER2.changeColor($player2.value)
    })
  }

  listenStartGame() {
    const $startBtn = document.getElementById('start')
    $startBtn.addEventListener('click', () => {
      this.isPlaying = true
      this.closeStartDialog()
    })
  }

  listenRestartGame() {
    const $restartBtn = document.getElementById('restart')
    $restartBtn.addEventListener('click', () => {
      this.restartGame()
      this.closeResult()
    })
  }

  makeBoard() {
    const HEIGHT= this.height
    const WIDTH = this.width
    const board = this.board
    for (let y = 0; y < HEIGHT; y++) {
      board.push(Array.from({ length: WIDTH }));
    }
  }

  makeHtmlBoard() {
    const $board = document.getElementById('board');
    const WIDTH = this.width
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));
  
    for (let x = 0; x < WIDTH; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
    }
  
    $board.append(top);
  
    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');
  
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `${y}-${x}`);
        row.append(cell);
      }
  
      $board.append(row);
    }
  }

  handleClick(evt) {
    if (!this.isPlaying) return
    // get x from ID of clicked cell
    const x = +evt.target.id;
  
    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }
  
    // place piece in board and add to HTML table
    this.board[y][x] = this.currPlayer;
    this.placeInTable(y, x);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player <input disabled type="color" value="${this.currPlayer}"> won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currPlayer = this.currPlayer === this.PLAYER1 ? this.PLAYER2 : this.PLAYER1
  }

  findSpotForCol(x) {
    const HEIGHT = this.height
    const board = this.board
    for (let y = HEIGHT - 1; y >= 0; y--) {
      if (!board[y][x]) {
        return y;
      }
    }
    return null;
  }

  placeInTable(y, x) {
    const currPlayer = this.currPlayer
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.style.setProperty('--color', currPlayer.color) 
    piece.style.top = -50 * (y + 2);
  
    const spot = document.getElementById(`${y}-${x}`);
    spot.append(piece);
  }

  checkForWin() {
    const HEIGHT = this.height
    const WIDTH = this.width
    const board = this.board 
    const currPlayer = this.currPlayer
    function _win(cells) {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
  
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < HEIGHT &&
          x >= 0 &&
          x < WIDTH &&
          board[y][x] === currPlayer
      );
    }
  
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
  
        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
  startGame() {
    this.isPlaying = true 
    this.closeStartDialog()
  }
  showStartDialog() {
    /** @type {HTMLDialogElement} */
    const $dialog = document.getElementById("start-dialog")
    $dialog.showModal()
  }
  closeStartDialog() {
    /** @type {HTMLDialogElement} */
    const $dialog = document.getElementById("start-dialog")
    $dialog.close()
  }
  showResult() {
    const $result = document.getElementById('result-dialog')
    $result.showModal()
  }
  closeResult() {
    const $result = document.getElementById('result-dialog')
    $result.close()
  }
  endGame(msg) {
    const $message = document.getElementById('message')
    $message.innerHTML = msg
    this.isPlaying = false
    this.showResult()
  }
  restartGame() {
    this.board = []
    this.isPlaying = false 
    this.currPlayer = this.PLAYER1
    const $board = document.getElementById('board')
    emptyChildren($board)
    this.init()
  }
}
/** @param {HTMLElement} $ele */
function emptyChildren($ele) {
  while($ele.hasChildNodes()) {
    $ele.lastChild.remove()
  }
}
new Game(6, 7)