import { useState, useEffect, useRef } from 'react';
import path from 'path';
import mongoose from 'mongoose';
import PropertiesReader from 'properties-reader';
import { getSession } from '../helpers/session-helpers';
import AppHeader from '../components/partials/appHeader';
import PaymentModal from '../components/partials/modals/paymentModal';

function isBrowser() {
    return typeof window !== 'undefined';
}
const  Transactions = ({session, currency, errorMessage, topUpQuota}) => {
    const [error, setErrorMessage] = useState('');
    const [runningBalance, setRunningBalance] = useState(0.0);
    const [totalBalance, setTotalBalance] = useState(0.0);
    const [transactions, setTransactions] = useState([]);
    const paymentModalRef = useRef(null);
    const openPaymentModal = () => {
        paymentModalRef.current.classList.add('is-active');
    }
    return <>
        <AppHeader session={session} errorMessage={error || errorMessage} />
        <main className="columns">
            <aside className="column is-hidden-mobile"></aside>
            <article className="column is-two-thirds bg-default transaction-container">
                <div className="transaction-header bg-primary">
                    <div className="header">
                        <h2 className="">Transactions</h2> <button className="button is-accent" onClick={openPaymentModal}>Top Up</button>
                    </div>
                    <div className="columns sub-header">
                        <div className="column balances">
                            <span class="total is-text-warning">Balance: {totalBalance} &nbsp;{currency}</span>
                            <span class="running">Running: {runningBalance} &nbsp;{currency}</span>
                        </div>
                        <div className="column filters is-hidden-mobile">
                        </div>
                    </div>
                </div>
                <div className="transaction-content">
                        <table class="table is-bordered">
                            <thead className="bg-primary">
                                <th>#Ref</th>
                                <th>Reason</th>
                                <th>Amt / {currency}</th>
                                <th>Balance / {currency}</th>
                                <th>Date</th>
                            </thead>
                            <tbody>
                                {
                                    transactions ? 
                                        transactions.map( (transaction, index) => 
                                            <tr key={index}>
                                                <td>{transaction.serial}</td>
                                                <td>{transaction.reason}</td>
                                                <td>{transaction.amount}</td>
                                                <td>{transaction.amount - topUpQuota*transaction.amount}</td>
                                                <td>{transaction.createdAt}</td>
                                            </tr>) : <tr>No transaction.</tr>
                                }
                            </tbody>
                        </table>
                        <PaymentModal ref={paymentModalRef} {...{currency, quota: topUpQuota}} />
                </div>
            </article>
            <aside className="column is-hidden-mobile"></aside>
        </main>
    </>
}
export async function getServerSideProps( { req, res }) {
    const sessionString = await getSession(req, res);
    const session = JSON.parse(sessionString);
    const properties = PropertiesReader(path.resolve('app.properties'));
    // amount charged for each transaction to the user, platform charges
    const paymentQuotaTopProp = 'payment.quota.topup';
    const paymentQuotaTop = properties.get(paymentQuotaTopProp);
    if (!isBrowser() && !session.user) {
        res.writeHead(302, { Location: '/login' });
        res.end();
    }
    const currency = session.user.currency || 'XAF';
    return {
        props: { 
            session,
            currency,
            topUpQuota: Number(paymentQuotaTop)
        }
    }
}

export default Transactions;