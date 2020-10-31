import { useState } from 'react';
import axios from 'axios';
import FacebookLogin from 'react-facebook-login';
import { useRouter } from 'next/router';
import { getSession } from '../helpers/session-helpers';
import AppHeader from '../components/partials/appHeader';

const Signup = (props) => {
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const onSignUpResponse = (response) => {   
        console.log(response);     
        if (!response.id) {
            setErrorMessage('Unable to sign up with Facebook.');
            return false;
        }
        const postBody = { ...response, providerAccessToken: response.accessToken, provider: 'facebook'};
        return axios({
            method: 'POST',
            url: '/api/user/signup',
            data: postBody,
            validateStatus: () => true
        })
        .then((res) => {
            if (res.status === 200) {
                router.push('/login');
            } else {
                setErrorMessage('An error occured. Please try');
            }
        })
        .catch((error) => {
            setErrorMessage(error.message);
        });
    };
    return (
        <>
            <AppHeader session={props.session}/>
            <main>
                <div className="auth-container bg-secondary" >
                    <div className="alert-error">
                        <span>{errorMessage}</span>
                    </div>
                    <div>
                        <FacebookLogin  
                            appId="635054340432342"
                            autoLoad={false}
                            textButton=" Register with Facebook" 
                            fields="name,email,picture"
                            callback={onSignUpResponse}
                            cssClass="social-button fb-button"
                            icon="fab fa-facebook-square" />
                    </div>
                </div>
            </main>
        </>
    );
  }

function isBrowser() {
    return typeof window !== 'undefined';
}

export async function getServerSideProps( { req, res }) {
    // get exisiting session
    const sessionString = await getSession(req, res);
    const session = JSON.parse(sessionString);
    
    /* test for existing login session and redirect
     if user is already logged in */
    if (!isBrowser() && session.user) {
      res.writeHead(302, { Location: '/' });
      res.end();
    }
    return { props: { session }}
}
export default Signup;