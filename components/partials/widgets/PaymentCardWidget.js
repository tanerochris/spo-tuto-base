import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { usePaymentInputs } from 'react-payment-inputs';
import axios from 'axios';
import PaymentIcon from "react-payment-icons-inline";

import images from 'react-payment-inputs/images';

const PaymentCardWidget = ({currency, quota}) => {
    const {
        getCardImageProps,
        getCardNumberProps,
        getExpiryDateProps, 
        getCVCProps
      } = usePaymentInputs();
    const [name, setName] = useState('');
    const [card_number, setCardNumber] = useState('');
    const [cvc, setCVC] = useState('');
    const [expiry_date, setExpiryDate] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [pin, setPin] = useState('');
    const [state, setState] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [zip, setZip] = useState('');
    const [amount, setAmount] = useState(500.0);
    const [authType, setAuthType] = useState('none');
    const [existPaymentRequest, setExistPaymentRequest] = useState(false);
    const pinRef = useRef(null);
    const addressRef = useRef(null);
    const additionalInputRef = useRef(null);
    const changeHandlers = new Map([
        ['name', setName],
        ['card_number', setCardNumber],
        ['expiry_date', setExpiryDate],
        ['amount', setAmount],
        ['cvc', setCVC],
        ['city', setCity],
        ['state', setState],
        ['pin', setPin],
        ['address', setAddress],
        ['country', setCountry],
        ['zip', setZip]
    ]);
    const router = useRouter();
    const handleInputChange = () => {    
        const handler = changeHandlers.get(document.activeElement.name);
        handler(document.activeElement.value);
    }
    const setErrorMessage = console.log;
    const createPaymentRequest = () => {
        if (amount < 500 ) {
            return setErrorMessage('Amount should be greater than');
        }
        const postData = {
            name,
            card_number,
            cvc,
            expiry_date,
            reason: 'Reward',
            type: 'card',
            currency,
            amount,
            state,
            city,
            address,
            country
        };
        return axios({
            method: 'POST',
            url: '/api/transaction/cardPayment',
            data: postData,
            validateStatus: () => true
        })
        .then((res) => {
             if (res.status === 200) {
                const authMode = res.data.mode;
                switch(authMode) {
                    case 'pin':
                        setAuthType('pin'); 
                        additionalInputRef.current.classList.remove('is-hidden'); // show additional input
                        pinRef.current.classList.remove('is-hidden'); // show pin input
                        addressRef.current.classList.add('is-hidden'); // hide address input
                        setExistPaymentRequest(true);
                        break;
                    case 'avs_noauth':
                        setAuthType('avs_noauth');
                        additionalInputRef.current.classList.remove('is-hidden'); // show additional input
                        addressRef.current.classList.remove('is-hidden'); // show address input
                        pinRef.current.classList.add('is-hidden'); // hide pin input
                        setExistPaymentRequest(true);
                        break;
                    case 'redirect':
                        location.assign(res.data.redirect);                                                
                        break;
                    default:
                }
            } else {
                setErrorMessage(res.data.message);
            }
        })
        .catch((error) => {
            setErrorMessage(error);
        });
    }
    const initiatePayment = (payload) => {
        let postData = {
            name,
            card_number,
            cvc,
            expiry_date,
            reason: 'Reward',
            type: 'card',
            currency,
            amount,
        }
        if (authType === 'pin')
            postData = Object.assign(postData, {authorization: {
                mode: 'pin',
                pin
            }});
        if (authType === 'avs_noauth')
            postData = Object.assign(postData, {authorization: {
                mode: 'avs_noauth',
                city, address, state, country, zipcode: zip
            }});
        return axios({
            method: 'POST',
            url: '/api/transaction/cardPayment',
            data: postData,
            validateStatus: () => true
        })
        .then((res) => {
             if (res.status === 200) {
                if (res.data.status === 'success') {
                    const authorization = res.data.meta.authorization;
                    const data = res.data.data;
                    if(authorization.mode === 'redirect')
                        return location.assign(authorization.redirect);
                    const {tx_ref, flw_ref} = data;
                    if(authorization.mode === 'otp') 
                        return router.push({
                                pathname: '/payment',
                                query: {tx_ref, flw_ref, auth_type: 'otp'},
                                asPath: '/payment/card/redirect-otp'
                            });
                } else setErrorMessage(res.data.message);
            } else setErrorMessage(res.data.message);
        })
        .catch((error) => {
            setErrorMessage(error);
        });
    }   
    return <div className="form payment-widget-container">
            <div className="payment-amount">
                <div className="amount">
                    <input className="input" placeholder="Enter amount" name="amount" type="number" min={500} onChange={handleInputChange} value={amount} />
                    <span className="currency">{currency}</span>
                </div>
                <div className="payment-methods-icon">
                    <PaymentIcon icon="visa" style={{ margin: 5, width: 50 }} />
                    <PaymentIcon icon="mastercard" style={{ margin: 5, width: 50 }} />
                </div>
            </div>
            <div className="columns">
                <div className="column payment-methods-content">
                    <div className="field">
                        <div className="control has-icons-left">
                            <input className="input" {...getCardNumberProps({ name: 'card_number', onChange: handleInputChange })} value={card_number} />
                            <span class="icon is-small is-left">
                                <svg {...getCardImageProps({ images })} />
                            </span>
                        </div>
                    </div>
                    <div className="field">
                        <input className="input" name="name" placeholder="Enter name" type="text" onChange={handleInputChange} value={name} />
                    </div>
                    <div className="field" style={{display: 'flex'}}>
                        <input className="input" name="expiry_date" style={{width: '70%'}} {...getExpiryDateProps({ name: 'expiry_date', onChange: handleInputChange })} value={expiry_date} />
                        <input className="input" name="cvc" style={{width: '28%'}}{...getCVCProps({ name: 'cvc', onChange: handleInputChange })} value={cvc} />
                    </div>
                </div>
                <div className="column payment-methods-content is-hidden" ref={additionalInputRef}>
                    <div className="field is-hidden has-text-centered" ref={pinRef}>
                        <span>You need to provide additional card details to complete this transaction.</span>
                        <input className="input" placeholder="PIN" name="pin" type="text" onChange={handleInputChange} value={pin} />
                    </div>
                    <div className="address is-hidden has-text-centered" ref={addressRef}>
                        <span>You need to provide additional card details to complete this transaction.</span>
                        <div className="field">
                            <input className="input" name="city" placeholder="City" type="text" onChange={handleInputChange} value={city} />
                        </div>
                        <div className="field">
                            <input className="input" name="address" placeholder="Address" type="text" onChange={handleInputChange} value={address} />
                        </div>
                        <div className="field">
                            <input className="input" placeholder="State" type="text" name="state" onChange={handleInputChange} value={state} />
                        </div>
                        <div className="field">
                            <input className="input" placeholder="Zip" type="text" name="zip" onChange={handleInputChange} value={zip} />
                        </div>
                        <div className="field">
                            <input className="input" placeholder="Country" type="text" name="country" onChange={handleInputChange} value={country} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="action field">
                <button className="button is-primary" onClick={existPaymentRequest ? initiatePayment : createPaymentRequest}>Pay</button>
<span className="percentage-text">{amount*quota}{currency} will be deducated from this payment for fees and transaction charges.</span>
            </div>    
        </div>
}
export default PaymentCardWidget;