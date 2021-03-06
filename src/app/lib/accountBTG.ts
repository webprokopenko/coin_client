import {TransactionBTG} from './transaction';
import {Networks} from './networks';
import * as Bitgold from 'bgoldjs-lib';
import {Buffer} from 'buffer';
import * as crypto from 'crypto-browserify';
import * as Big from 'bignumber.js';
// import * as Address from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/address';
// import * as Networks from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/networks';
// import * as ECPair from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/ecpair';
// import * as bscript from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/script';
// import * as bcrypto from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/crypto';
// import * as TransactionBuilder from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/transaction_builder';
// import * as Transaction from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/transaction';
// import * as outputPubKeyHash from '/home/mykola/.bitcoingold/bitcoinjs-lib-3.3.2/src/templates/pubkeyhash/output';

const AccountBTG = function(currencyCode: string, network: string) {
    this.code = currencyCode;
    this.network = network;
    this.address = '';
    this.keys = {
        private: '',
        public: ''
    };
    this.keyObject = {};
    this.balance = 0;
    this.transactionsPage = 0;
    this.transactionCommonCount = 0;
    this.transactions = [TransactionBTG];
    this.open = false;
    this.refresh = false;
    this.decimals = 1e8;
};
/****************************************************************************************
 * @summary Generate account private & public keys, create public address & etc...
 * @passphrase - String, account owner secret phrase
 * @return - Promise result(
 *               resolve - true, success generation,
 *               reject - error object, unsuccess generation
 *                       )
 * */
AccountBTG.prototype.generateKeys = async function(passphrase: string) {
    const pKey = Bitgold.ECPair.makeRandom({
        network: Networks[this.code][this.network]
    });
    this.keys.private = pKey.toWIF();
    this.address = pKey.getAddress(Networks[this.code][this.network]);
    this.keyObject = this.saveToKeyObject(passphrase);
    return true;
};
/****************************************************************************************
 * @summary Recover account private key, create public address & etc... from keyObject
 * @passphrase - String, account owner secret phrase,
 * @keyObject - Object, keystore object
 * @return - Promise result(
 *               resolve - true, success recovering,
 *               reject - error object, unsuccess recovering
 *                       )
 * */
AccountBTG.prototype.recoveryFromKeyObject = async function(passphrase: string, keyObject: any) {
    let dKey, decifer: any = {};
    decifer = crypto.createDecipher(
        keyObject.calg,
        passphrase);
    dKey = decifer.update(keyObject['cifertext'], 'hex', 'utf8');
    dKey += decifer.final('utf8');
    this.keys.private = dKey;
    this.keyObject = keyObject;
    this.address = keyObject.address;
    return true;
};
/****************************************************************************************
 * @summary Save account to keyObject
 * @return - Promise result(
 *               resolve - keyObject - Object, keystore object,
 *               reject - error - Object, unsuccess recovering
 *                       )
 * */
AccountBTG.prototype.saveToKeyObject = function(passphrase: string) {
    const cifer = crypto.createCipher('aes256', passphrase);
    let cifertext = cifer.update(Buffer.from(this.keys.private),
        'utf8', 'hex');
    cifertext += cifer.final('hex');
    return {
        address: this.address,
        calg: 'aes256',
        cifertext: cifertext
    };
};
/****************************************************************************************
 * @summary Create raw transaction to braodcast and spend ethereum coins
 * @params - Object {
 *      nonce - number - common number of spent transactions,
 *      gasPrice - number - ethereum gas price,
 *      gasLimit - number - ethereum gas limit,
 *      receiver - string - recipient address,
 *      value - number - transaction value, units - ethereum, not wei
 * }
 * @return - Promise result(
 *               resolve - keyObject - Object, keystore object,
 *               reject - error - Object, unsuccess recovering
 *                       )
 * */
AccountBTG.prototype.createSendMoneyTransaction = async function(params) {
    const keyPair = Bitgold.ECPair.fromWIF(this.keys.private, Networks[this.code][this.network]);

    const pk = Bitgold.crypto.hash160(keyPair.getPublicKeyBuffer());
    const spk = Bitgold.script.pubKeyHash.output.encode(pk);

    const txb = new Bitgold.TransactionBuilder(Networks[this.code][this.network]);
    const inpAmount = [];
    const dec = new Big(this.decimals);
    const hashType = Bitgold.Transaction.SIGHASH_ALL | Bitgold.Transaction.SIGHASH_FORKID;
    params['utxo'].forEach((utx, i) => {
        inpAmount[i] = parseInt((new Big(utx.amount)).mul(dec).toString(), 10);
        txb.addInput(utx.txid, utx.vout, Bitgold.Transaction.DEFAULT_SEQUENCE, spk);
    });
    const spendAmmount = (new Big(params['amount'])).mul(dec);
    const rest = new Big(inpAmount.reduce((a, i) => (new Big(a)).plus(new Big(i))));
    txb.addOutput(params['receiver'], parseInt(spendAmmount.toString(), 10));
    txb.addOutput(params['change'], parseInt(rest.minus(spendAmmount).minus(new Big(10000)).toString(), 10));
    txb.enableBitcoinGold(true);
    txb.setVersion(2);
    inpAmount.forEach((am, k) => {
        txb.sign(k, keyPair, null, hashType, parseInt(am, 10));
    });
    const raw = txb.build().toHex();
    return raw;
};

export default AccountBTG;
