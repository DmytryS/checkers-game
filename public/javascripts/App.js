'use strict';

import React from 'react';
import socketIOClient from "socket.io-client";

import Board from './components/board';
import { getBoard } from './components/Game';

const { BrowserRouter, Switch, Route } = require('react-router-dom');

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            board: false,
            role: false
        };
        // getBoard((err, board) =>
        //     this.setState({board}));
    }

    componentDidMount() {

    }
    render(){
        const { board } = this.state;
        console.log(board);
        return (
            <div>
                <Board/>
            </div>
        )
    }
};

module.exports = App;