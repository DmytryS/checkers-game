'use strict';

import React from 'react';

class Checker extends React.Component {
    render() {
        const { color } = this.props;
        return(
            <img src={(color ==='black' ? '../../images/black.png' : '../../images/white.png')}
                    width={'50px'}
                    height={'50px'}></img>
        )
    }
};

module.exports = Checker;