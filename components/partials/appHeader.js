import { useRouter } from 'next/router';
import Error from './error';

const AppHeader = ({ session, errorMessage}) =>  {
  return (
    <>
      <Error message={ errorMessage || ''} />
      <header className="header columns">
        <div className="column">
        </div>
        <div className="column is-four-fifths">
          <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="container">
              <div className="navbar-brand">
                <a className="navbar-item" href="https://bulma.io">
                  <img width={20} height={20} src="/assets/svg/home.svg" alt="home icon" />
                </a>
                <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </a>
              </div>
              <div id="navbar" className="navbar-menu">
                <ul className="navbar-start">
                  <li className="navbar-item"><a href="/">Home</a></li>
                  <li className="navbar-item"><a className="button is-accent is-outlined" href="/campaign/create">Start campaign</a></li>
                  <li className="navbar-item"><a href="campaign/search">Explore campaigns</a></li>
                </ul>
                <ul className="navbar-end">
                  <li className="navbar-item">
                    <div>
                      <input className="input" type="text" placeholder="Search" />
                    </div>
                  </li>
                  {
                    session.user ? 
                    <>
                      <li className="navbar-item"><a  className="button is-accent" href="/transactions">Transactions</a></li>
                      <li className="navbar-item"> {session?.user?.firstName}</li>
                    </> :
                    <>
                      <li className="navbar-item"><a  className="button is-accent" href="/login">Login</a></li>
                      <li className="navbar-item"><a  className="" href="/signup">Register</a></li>  
                    </>
                  }
                  
                </ul>            
              </div>
            </div>
          </nav>
        </div>
        <div className="column">
            
        </div>
      </header>
    </>
  );
};

export default AppHeader;