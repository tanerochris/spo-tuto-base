import PropTypes from 'prop-types';

const Error = ({ message }) => {
    return (
        <div className="errorMessage"
            style={{
                position: 'absolute',
                width: '100%',
                height: message ? 'auto': '0',
                border: message ? 'solid black' : 'none',
                zIndex: 1000,
                background: 'red' }}>
            <p>{message}</p>
        </div>
    );
}

Error.propTypes = {
    message: PropTypes.string,
}
export default Error;