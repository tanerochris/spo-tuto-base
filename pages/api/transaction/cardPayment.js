import Middleware from '../../../middlewares';
import Transaction from '../../../models/transaction/transaction.model';
import { ApiResponseError } from '../../../helpers/api-errors';
import { makePayment } from '../../../helpers/payment';

const PaymentCardHandler = async ({ req, res }) => {

    const count = await Transaction.count({});
    if (req.method === 'POST') {
        // check if user is logged in
        if (req.session && !req.session.user) {
          const errorResponse = ApiResponseError.getError({
            name: 'AuthorizationError',
            message: 'You must login.'
          });
          return res.json(errorResponse);
        }
        req.body.createdBy = req.session.user.id;
        const uemail = req.session.user.email;
        // encrypt data to be processed by flutter wave
        const date = req.body.expiry_date.replace(RegExp(' ','igm'),'').split('/');
        const payload =  Object.assign(req.body, {
          card_number: req.body.card_number.replace(RegExp(' ','igm'),''),
          expiry_month: date[0],
          expiry_year: date[1],
          amount: 2000,
          email: uemail,
          tx_ref: `${100000000 + count + 1}`
        });
        try {
          if (!req.body.authorization) {
            /*const plainPaymentPayload = JSON.stringify(body);
              const encryptedPaymentPayload = await encryptPaymentPayload(plainPaymentPayload);     */
            const payment = await makePayment(payload);
              // if payment auth required
            if (payment.status === 'success')
              return res.json(payment.meta.authorization);
            else {
              const errorResponse = ApiResponseError.getError('Cannot charge card.');
              return res.json(errorResponse); 
            }
          } else {
            const finalCharge = await makePayment(payload);
            if (finalCharge.status !== 'success') {
              const errorResponse = ApiResponseError.getError('Cannot charge card.');
              return res.json(errorResponse);
            }
            payload['flutter_wave_reference'] = finalCharge.data.flw_ref;
            const transaction = new Transaction(payload);
            try {
              // save project
              await transaction.save();
              return res.json(finalCharge);
            } catch (error) {
              // handle error
              const errorResponse = ApiResponseError.getError(error);
              return res.json(errorResponse);
            }
          }
        } catch (e) {
            console.log(e);
            const errorResponse = ApiResponseError.getError('Cannot charge card.');
            return res.json(errorResponse);
        }

      }
}
export default Middleware(PaymentCardHandler);
