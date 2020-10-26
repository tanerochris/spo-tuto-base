import { useState } from 'react';
import axios from 'axios';
import FacebookLogin from 'react-facebook-login';
import { useRouter } from 'next/router';
import { getSession } from '../helpers/session-helpers';
import AppHeader from '../components/partials/appHeader';

const Login = ({ session }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const onLoginResponse = (response) => {
    if (!response.id) {
        setErrorMessage('Unable to Login with Facebook.');
        return false;
    }
    const postBody = { ...response, providerAccessToken: response.accessToken, provider: 'facebook'};
    return axios({
        method: 'POST',
        url: '/api/user/login',
        data: postBody,
        validateStatus: () => true
    })
    .then((res) => {
        if (res.status === 200) {
            router.push('/');
        } else {
            setErrorMessage(res.data.message);
        }
    })
    .catch((error) => {
        setErrorMessage(error.message);
    });
  };
  return (
    <>
        <AppHeader session={session} />
        <main>
            <div className="auth-container bg-secondary" >
                <div className="alert-error">
                    <span>{errorMessage}</span>
                </div>
                <div>
                    <FacebookLogin 
                    appId="635054340432342"
                    autoLoad={false} 
                    fields="name,email,picture"
                    textButton=" Login with Facebook"
                    callback={onLoginResponse}
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
    // get existing session
    const sessionString = await getSession(req, res);
    const session = JSON.parse(sessionString);
    /* test for existing session and redirect
     if user is already logged in */
    if (!isBrowser() && session.user) {
        res.writeHead(302, { Location: '/' });
        res.end();
    }
    return {
        props: { session }
    }
}
export default Login;