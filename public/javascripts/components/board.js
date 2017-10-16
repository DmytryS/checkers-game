'use strict';

import React from 'react';

import Square from './square';
import Checker from './checker';
import * as Game from './Game';

class Board extends React.Component{

    constructor(){
        super();
        this.state = {
            board: [[],[],[],[],[],[],[],[]],
            role: false,
            turn: false,
            selectedFrom: {x:false, y:false}
        };
        Game.getBoard((err, board) =>
            this.setState({board}));
        Game.getRole((err, role) =>
            this.setState({role}));
    }

    hadleSquareClick(x, y){
        Game.getTurn((err, turn) =>
            this.setState({turn}));
        if(this.state.turn === this.state.role){
            if(this.state.board[x][y] === this.state.role && !this.state.selectedFrom.x && !this.state.selectedFrom.y){
                this.setState({selectedFrom:{x:x,y:y}});
            }else{
                if(Game.checkMoveTo(this.state.board,this.state.selectedFrom,{x:x,y:y},this.state.role)){
                    Game.moveTo({
                        from:this.state.selectedFrom,
                        to:{x:x,y:y}
                    });

                    let board = this.state.board;
                    if(Math.abs(this.state.selectedFrom.x-x)===2){

                        board[(this.state.selectedFrom.x>x ? x-1 : x+1)][this.state.selectedFrom.y+1] = '';
                    }
                    board[x][y]=this.state.role;
                    board[this.state.selectedFrom.x][this.state.selectedFrom.y] = '';
                    this.setState({
                        board: board,
                        selectedFrom:{x:false,y:false}
                    });
                    console.log(this.state.board);

                }else{
                    this.setState({selectedFrom:{x:false,y:false}});
                }
            }
        }
    }

    renderSquare(i) {
        const x = Math.floor(i / 8);
        const y = i % 8;
        const color = (x + y) % 2 === 1;

        const board = this.state.board;
        const playerColor =  (board[x][y] === 'p1' ? 'black' : 'white');
        const piece = (board[x][y] !== null && board[x][y] !== '') ? <Checker color={playerColor}/> : null;

        return (
            <div key={i}
                 style={{
                     width: '50px',
                     height: '50px',
                     float: 'left'
                 }}
                 onClick={() => this.hadleSquareClick(x, y)}>
                <Square color={color}>
                    {piece}
                </Square>
            </div>
        );
    }

    render() {
        const squares = [];
        for (let i = 0; i < 64; i++) {
            squares.push(this.renderSquare(i));
        }

        return (
            <div style={{
                width: '400px',
                height: '400px'
            }}>
                {squares}
            </div>
        );
    }
};

// Board.propTypes = {
//         knightPosition: PropTypes.arrayOf(
//             PropTypes.number.isRequired
//         ).isRequired
// };

module.exports = Board;