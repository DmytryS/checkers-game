'use strict';

import React from 'react';

class Square  extends React.Component {
    render() {
        const { color } = this.props;
        const fill = color ? 'black' : 'white';
        const stroke = color ? 'white' : 'black';

        return (
            <div style={{
                backgroundColor: fill,
                color: stroke,
                width: '50px',
                height: '50px'
            }}>
                {this.props.children}
            </div>
        );
    }
};

// Square.propTypes = {
//     black: React.PropTypes.bool
// };

module.exports = Square;