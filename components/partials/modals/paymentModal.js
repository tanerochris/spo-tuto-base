import React, {useEffect, useRef} from 'react';
import PaymentCardWidget from '../widgets/PaymentCardWidget';
const PaymentModal = React.forwardRef((props, ref) => {
    const close = () => ref.current.classList.remove('is-active'); 
    return (
        <>
            <div class="modal payment-modal" ref={ref}>
                <div class="modal-background"></div>
                <div class="modal-content bg-default">
                    <PaymentCardWidget modal={ref} {...props} />
                </div>
                <button class="modal-close is-large"  aria-label="close" onClick={close} ></button>
            </div>
        </>
     )
})
export default PaymentModal;

