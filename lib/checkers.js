'use strict';

class Checkers {
    constructor(gameId, player1){
       this.gameId = gameId;
       this.player1 = {
           id : player1.id,
           name: player1.name
       };
       this.player2 = {
           id : null,
           name: null
       };
       this.board = [[],[],[],[],[],[],[],[]];
       this.turn = '';
    }

    newGame(){
        this.board = [[],[],[],[],[],[],[],[]];
        for (let i=0;i<8;i++){
            for(let j=0;j<8;j++) {
                if((i+j)%2!==0){
                    if(i<3){
                        this.board[i][j] = 'p1';
                    }else {
                        if(i>4){
                            this.board[i][j] = 'p2';
                        }else {
                            this.board[i][j] = '';
                        }
                    }
                }else{
                    this.board[i][j] = null;
                }
            }
        }
    }

    get getBoard(){
        return this.board;
    }

    get getTurn(){
        return this.turn;
    }

    getRole(playerId){
        if(playerId === this.player1.id){
            return 'p1';
        }else{

        }
        switch (playerId){
            case this.player1.id:
                return 'p1';
                break;
            case this.player2.id:
                return 'p2';
                break;
            default:

                break;
        }

    }

}

module.exports = Checkers;