import AppHeader from '../components/partials/appHeader';
import { getSession } from '../helpers/session-helpers';

export default function Home({session}) {
  return (
    <>
      <AppHeader session={session}/>
      <main>
        <div className="columns">
          <div className="column">
          </div>
          <div className="column is-four-fifths">
             Welcome to the base SPO application. We shall be building from here.
          </div>
          <div className="column"></div>
         </div>
      </main>
    </>
  )
}

export async function getServerSideProps ({ req, res}) {
  const sessionString = await getSession(req, res);
  const session = JSON.parse(sessionString);
  return {
      props: {
          session
      }
  }
};
