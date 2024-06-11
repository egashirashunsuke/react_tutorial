import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


//stateを持たないコンポーネントをよりシンプルに書く方法
function Square({value,onClick,isWinningSquare}) {
  return (
    <button className={`square ${isWinningSquare ? 'winning' : ''}`} onClick={onClick}>
      {value}
    </button>
  );
}
  
  class Board extends React.Component {
    
    renderSquare(i) {
      const {squares,onClick, winningSquares} = this.props;
      return <
        Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        isWinningSquare={winningSquares.includes(i)}
      />;
    }

    render(){
      const boardSize = 3;
      const board = [];

      for (let row = 0; row < boardSize; row++){
        const squares = [];
        for (let col = 0;col < boardSize; col++){
          const squareIndex = row * boardSize + col;
          squares.push(this.renderSquare(squareIndex));
        }
        board.push(<div key={row} className="board-row">{squares}</div>);
      }
      return <div>{board}</div>;
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
        }],
        stepNumber: 0,
        xIsNext: true,
        sortAscending: true,
      };
    }

  handleClick(i){
    // イミュータビリティにより、ゲーム履歴の巻き戻しができる
    // 変更の検出が楽になる
    //　pure componentを構築しやすくなる
    const history = this.state.history.slice(0,this.state.stepNumber + 1);
    const current = history[history.length-1]
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]){//決着がついたか、すでに埋まっている場合
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';//三項演算子
    this.setState({
      history : history.concat([{//元の配列をミューテートしない
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  };

  toggleSort(){
    this.setState({
      sortAscending: !this.state.sortAscending,
    });
  }
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winnerInfo= calculateWinner(current.squares);
      const winner = winnerInfo?.winner;
      const winningSquares = winnerInfo?.line || [];

      let moves = history.map((step,move) => {//stepが現在の要素、moveがインデックス
        const desc = move ?
        'Go to move #' + move :
        'Go to game start';

        //現在の手番の場合，
        if (move === this.state.stepNumber){
          return (
            <li key={move}>
              <span>You are at move #{move}</span>
            </li>
          );
        }
        return (
          <li key={move}>
            <button onClick={ () => this.jumpTo(move)}>
              {desc}
            </button>
          </li>
        );
      });

      if (!this.state.sortAscending){
        moves = moves.reverse();
      }

      const isDraw = !winner && current.squares.every(square => square !== null);
      const status = winner
        ? `Winner: ${winner}`
          :isDraw
          ? 'Draw'
              : `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;

      return (
        <div className="game">
          <div className="game-board">
            <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winningSquares}
            />
          </div>
          <div className="game-info">
            <div>{ status }</div>
            <button onClick={ () => this.toggleSort()}>sort</button>
            <ol>{ moves }</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
  function calculateWinner(squares) {
    const lines = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a,b,c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i]};
      }
    }
    return null;
  }
