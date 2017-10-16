import React from 'react';
import io from "socket.io-client";

const socket = io('http://127.0.0.1:3000');

export function getBoard(args) {
    socket.emit('get board');
    socket.on("get board", data => args(null, data.board ));
}

export function getRole (args){
    socket.emit('get role');
    socket.on("get role", data => args(null, data.role ));
}

export function moveTo(args) {
    socket.emit('move to',);
    socket.on("move to", data => args(null, { role: data }));
}

export function getTurn(args) {
    socket.emit('get turn');
    socket.on("get turn", data => args(null, data.turn ));
}

export function checkMoveTo(board, from, to, role) {
    return (Math.abs(to.x-from.x)===1 && to.y-from.y===1  && board[to.x][to.y] === '' ||
        Math.abs(to.x-from.x)===2 && to.y-from.y===2 && board[(from.x>to.x ? to.x-1 : to.x+1)][from.y+1] !== role);
}