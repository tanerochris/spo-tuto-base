import Middleware from '../../../middlewares';
import Transaction from '../../../models/transaction/transaction.model';
import { ApiResponseError } from '../../../helpers/api-errors';
import { completeCardPayment, verifyCardPayment } from '../../../helpers/payment';

const CompleteCardPaymentHandler = async ({ req, res }) => {

    if (req.method === 'POST') {
        // check if user is logged in
        if (req.session && !req.session.user) {
          const errorResponse = ApiResponseError.getError({
            name: 'AuthorizationError',
            message: 'You must login.'
          });
          return res.json(errorResponse);
        }
        try {
            const {otp, auth_type, flw_ref, tx_ref, id} = req.body;
            const transaction = await Transaction.count({status: 'pending', flutter_wave_reference: flw_ref});
            if (transaction) {
                if (!['otp', 'avs'].includes(auth_type))
                    throw new Error('Cannot complete payment.'); 
                if (auth_type === 'otp') {
                    const completedTransaction = await completeCardPayment({otp, flw_ref});
                    if (completedTransaction.status === 'success') {
                        const paid = await verifyCardPayment({
                            id: completedTransaction.data.id
                        });
                        console.log(paid);
                        if (paid.data.status !== 'successful')
                            throw new Error('Cannot complete payment.'); 
                    } else throw new Error('Cannot complete payment.');
                } 
                if (auth_type === 'avs') {
                    const paid = await verifyCardPayment({id});
                    console.log(paid);
                    if (paid.data.status !== 'successful')
                        throw new Error('Cannot complete payment.');
                }
                const transaction = await Transaction.findOne({status: 'pending', flutter_wave_reference: flw_ref});
                transaction.status = 'complete';
                await transaction.save();
                return res.json(transaction);
            } else throw new Error('Cannot complete payment.');
        } catch (error) {
            const errorResponse = ApiResponseError.getError("Cannot complete payment.");
            return res.json(errorResponse);
        }
    }
}
export default Middleware(CompleteCardPaymentHandler);
