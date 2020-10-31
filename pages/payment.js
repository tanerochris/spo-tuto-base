import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getSession } from '../helpers/session-helpers'
import AppHeader from '../components/partials/appHeader';

function isBrowser() {
  return typeof window !== 'undefined';
}
const Payment = ({ session }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [otp, setOTP] = useState('');
    const [statusText, setStatusText] = useState('Wait while we are processing your payment...');
    const router = useRouter();
    const otpRef = useRef(null);
    const processRef = useRef(null);
    const queryParams = router.query.response 
        ? JSON.parse(router.query.response) :
        router.query; 
    const handleChangeOTP = () => {
        setOTP(document.activeElement.value);
    }
    const completeCardPayment = () => {
        const optLength = otp ? otp.length : 0;
        const responseExist = router.query.response ? true : false;
        const auth_type = router.query.response ? 'avs' : 'otp';
        if (optLength > 3 || responseExist) {
            const paymentDataCard = Object.assign(queryParams, {otp, auth_type});
            return axios({
                method: 'POST',
                url: '/api/transaction/completeCardPayment',
                data: paymentDataCard,
                validateStatus: () => true
            })
            .then((res) => {
                 if (res.status === 200) {
                     console.log(res.data);
                    if (res.data.status === 'success') {
                       console.log(res.data);  
                    } else setErrorMessage(res.data.message);
                } else setErrorMessage(res.data.message);
            })
            .catch((error) => {
                setErrorMessage(error);
            });       
        }
    }
    useEffect(() => {  
        if (router.query.response) {
            processRef.current.classList.remove('is-hidden');
            otpRef.current.classList.add('is-hidden');
            completeCardPayment();
        } else {
            processRef.current.classList.add('is-hidden');
            otpRef.current.classList.remove('is-hidden');
        }
    }, [])
    return (
    <div>
      <AppHeader  session={session} />
        <main>
            <div style={{ display: errorMessage ? 'block': 'hidden'}}>
              <span>{errorMessage}</span>
            </div>
            <div className="payment-container bg-default" >
                <div className="card-otp" ref={otpRef}>
                    <div className="control">
                        <p>Check your email for OTP Code</p>
                        <label>
                            <input className="input" placeholder="Enter OTP" onChange={handleChangeOTP} />
                        </label>
                    </div>
                    <div className="has-text-centered container">
                        <button className="button is-primary" onClick={completeCardPayment}>Complete payment</button>
                    </div>
                </div>
                <div className="processing" ref={processRef}>
                    <p className=""><b>{statusText}</b></p>
                </div>

          </div>

        </main>
    </div>
  );
}

export async function getServerSideProps( { req, res }) {
    const sessionString = await getSession(req, res);
    const session = JSON.parse(sessionString);
    return {
        props: { session }
    }
}
export default Payment;