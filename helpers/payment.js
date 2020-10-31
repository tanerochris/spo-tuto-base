import path from 'path';
import PropertiesReader from 'properties-reader';
import forge from 'node-forge';
import Flutterwave from 'flutterwave-node-v3';

const properties = PropertiesReader(path.resolve('app.properties'));
const flwEncKeyProp = 'payment.flutterwave.encryptionKey';
const flwPubKeyProp = 'payment.flutterwave.publicKey';
const flwSecKeyProp = 'payment.flutterwave.secretKey';
const flwRedUrlProp = 'payment.flutterwave.redirectUrl';
const flwPubKey = process.env.FLW_PKEY || properties.get(flwPubKeyProp);
const flwSecKey = process.env.FLW_SKEY || properties.get(flwSecKeyProp);
const flwEncKey = process.env.FLW_EKEY || properties.get(flwEncKeyProp);
const flwRedUrl = properties.get(flwRedUrlProp);
const flw = new Flutterwave(flwPubKey, flwSecKey);

export const encryptPaymentPayload = async (payload) => {
    const key = forge.random.getBytesSync(16);
    const iv = forge.random.getBytesSync(8);
    const cipher = forge.cipher.createCipher(
        "3DES-ECB",
        forge.util.createBuffer(flwEncKey)
       );
    cipher.start({iv: ''});
    cipher.update(forge.util.createBuffer(payload, "utf-8"));
    cipher.finish();
    const encrypted = cipher.output;
    return forge.util.encode64(encrypted.getBytes());    
};

export const makePayment = async (payload) => {
    payload.enckey = flwEncKey;
    payload.redirect_url = flwRedUrl;
    const payment = await flw.Charge.card(payload);
    return payment;
}
export const completeCardPayment = async (payload) => {
    const completedPayment = flw.Charge.validate(payload);
    return completedPayment;
}
export const verifyCardPayment = async (payload) => {
    const payment = flw.Transaction.verify(payload);
    return payment;
}
