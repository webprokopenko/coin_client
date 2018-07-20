var crypto=require("crypto"),
    bs58=require("bs58"),
    BN=require("./bn.js"),
    EC=require("elliptic").ec,
    ec=new EC("secp256k1"),
    fs=require("fs"),
    https=require("https"),
    http=require("http"),
    net=require("net"),
    //Buffer=require("buffer"),
    ecparams=ec.curve;
//var cash = require('cashaddrjs');
var decode_b = require("cashaddress").decode_b,
    //encode_b = cash.encode,//require("./node_modules/cashaddress/cashaddress.js").encode_b,
    decode_bech32=require("./segwit.js").decode,
    oconsole=console.log.bind(console),
    SIGFORK,
    SIGHASH_ALL,
    SIGHASH_NONE,
    SIGHASH_SINGLE,
    SIGHASH_ANYONECANPAY,
    T_O=2e3,
    KAS,
    TX_COMMAND=new Buffer("747800000000000000000000","hex"),
    TX_VERSION=new Buffer("76657273696F6E0000000000","hex"),
    TX_VERACK=new Buffer("76657261636B000000000000","hex"),
    TX_GETDATA=new Buffer("676574646174610000000000","hex"),
    SIG_F=18480,
    ISSIG1=48,
    ISSIG2=2,
    OP_PUSHDATA1=76,
    OP_PUSHDATA2=77,
    OP_PUSH=512,
    MAX_OP_PUSH=520,
    OP_DUP="76",
    OP_HASH160="a9",
    OP_RETURN="6a",
    OP_0="00",
    OP_1="01",
    OP_2="52",
    OP_3="53",
    OP_DROP="75",
    OP_DEPTH="74",
    OP_EQUAL="87",
    OP_EQUALVERIFY="88",
    OP_CHECKSIG="ac",
    OP_CHECKSIGVERIFY="ad",
    OP_CHECK_MULTISIG="ae",
    OP_CODESEPARATORS="ab",
    OP_FORK="b689",
    P2SH_NON_STANDARD=new Buffer(OP_0+OP_DROP+OP_DEPTH+OP_0+OP_EQUAL,"hex"),
    FEES=250,
    SATO=1e8,
    SATO_=8500,
    MIN_SATO_=300,
    S_=128,
    TAS_=1e3*(SATO>>10)/12207+2*FEES,
    VERSION=2,
    VERSION_="BTC",
    PRIV=new Buffer("80","hex"),
    SIGHASH_FORKID=0,
    SIGHASH_1=new Buffer("5b79a9d29a34f2f284","hex"),
    SIGHASH_2=new Buffer("ecdd33009ffa5e0252","hex"),
    FORK_STRING,FORKID_IN_USE,MAIN=3652501241,
    BIP143=!1,
    p2pk=new Buffer("00","hex"),
    p2sh=new Buffer("05","hex"),
    PORT=8333,
    LASTBLOCK=5e5,
    PROTOCOL=70015,
    D=8,
    NOSEGWIT=["1"],
    NOSEGWIT2=["t1"],
    BECH32=[],
    twoOFtwo="2of2",
    twoOFthree="2of3",
    twoOFfour="2of4",
    TAS__=TAS_,
    SEGWIT=!1,
    SEGWIT_VERSION=0,
    SEG_MARKER=0,
    SEG_FLAG=1,
    version_=function(e){
        if("BTC"===e);
        else if("ZEC"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=1680337188,
            VERSION_="ZEC",
            p2pk=new Buffer("1cb8","hex"),
            p2sh=new Buffer("1cbd","hex"),
            BIP143=!1,
            PORT=8233,
            LASTBLOCK=223500,
            PROTOCOL=170002;
        else if("BTG"===e)VERSION=2,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=79,
            MAIN=1148012513,
            VERSION_="BTG",
            p2pk=new Buffer("26","hex"),
            p2sh=new Buffer("17","hex"),
            BIP143=!0,
            PORT=8338,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            NOSEGWIT.push("G");
        else if("BCH"===e)VERSION=2,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=0,
            MAIN=3908297187,
            VERSION_="BCH",
            BIP143=!0,
            PORT=8333,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            NOSEGWIT.push("q"),
            BECH32.push("q"),
            BECH32.push("p");
        else if("BCD"===e)VERSION=12,
            SIGHASH_FORKID=0,
            MAIN=3652509373,
            VERSION_="BCD",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=7117,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            SATO=1e7,
            D=7,
            FORK_STRING=new Buffer("Thanks Ayms this module is great","utf8");
        else if("LTC"===e)VERSION=2,
            SIGHASH_FORKID=0,
            MAIN=3686187259,
            VERSION_="LTC",
            p2pk=new Buffer("30","hex"),
            p2sh=new Buffer("32","hex"),
            PRIV=new Buffer("b0","hex"),
            BIP143=!1,
            PORT=9333,
            LASTBLOCK=134e4,
            PROTOCOL=70015,
            NOSEGWIT.push("L");
        else if("SBTC"===e)VERSION=1,
            SIGHASH_FORKID=64,
            MAIN=3652501241,
            VERSION_="SBTC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8334,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            FORK_STRING=new Buffer("0473627463","hex");
        else if("BTX"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=3652501241,
            VERSION_="BTX",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8555,
            LASTBLOCK=12e4,
            PROTOCOL=70015;
        else if("DASH"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=3177909439,
            VERSION_="DASH",
            p2pk=new Buffer("4c","hex"),
            p2sh=new Buffer("10","hex"),
            PRIV=new Buffer("cc","hex"),
            BIP143=!1,
            PORT=9999,
            LASTBLOCK=8e5,
            PROTOCOL=70208,
            NOSEGWIT.push("X");
        else if("DOGE"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=3233857728,
            VERSION_="DOGE",
            p2pk=new Buffer("1e","hex"),
            p2sh=new Buffer("16","hex"),
            PRIV=new Buffer("9e","hex"),
            BIP143=!1,
            PORT=22556,
            LASTBLOCK=2e6,
            PROTOCOL=70004,
            NOSEGWIT.push("D");
        else if("UBTC"===e)VERSION=2,
            SIGHASH_FORKID=8,
            MAIN=3652501241,
            VERSION_="UBTC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8333,
            LASTBLOCK=5e5,
            PROTOCOL=770015,
            FORK_STRING=new Buffer("027562","hex");
        else if("B2X"===e)VERSION=1,
            FORKID_IN_USE=0,
            SIGHASH_FORKID=49,
            MAIN=3635786484,
            VERSION_="B2X",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8333,
            LASTBLOCK=5e5,
            PROTOCOL=70015;
        else if("BPA"===e)VERSION=1,
            SIGHASH_FORKID=32,
            FORKID_IN_USE=47,
            MAIN=3653549737,
            VERSION_="BPA",
            p2pk=new Buffer("37","hex"),
            p2sh=new Buffer("50","hex"),
            BIP143=!0,
            PORT=8888,
            LASTBLOCK=5e5,
            PROTOCOL=70018,
            NOSEGWIT.push("P");
        else if("BTCP"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=42,
            MAIN=3450006184,
            VERSION_="BTCP",
            p2pk=new Buffer("1325","hex"),
            p2sh=new Buffer("13af","hex"),
            BIP143=!1,
            PORT=7933,
            LASTBLOCK=25e4,
            PROTOCOL=180003,
            FORK_STRING=new Buffer(0),
            NOSEGWIT2.push("b1");
        else if("BCP"===e)VERSION=1,
            SIGHASH_FORKID=64,
            MAIN=3779554628,
            VERSION_="BCP",
            p2pk=new Buffer("1c","hex"),
            p2sh=new Buffer("17","hex"),
            BIP143=!0,
            PORT=8337,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            NOSEGWIT.push("C");
        else if("CDY"===e)VERSION=2,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=111,
            MAIN=3653551075,
            VERSION_="CDY",
            p2pk=new Buffer("1c","hex"),
            p2sh=new Buffer("58","hex"),
            BIP143=!0,
            PORT=8367,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            SATO=1e5,
            D=5,
            NOSEGWIT.push("C");
        else if("BCA"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=93,
            MAIN=3894264143,
            VERSION_="BCA",
            p2pk=new Buffer("17","hex"),
            p2sh=new Buffer("0a","hex"),
            BIP143=!0,
            PORT=7333,
            LASTBLOCK=5e5,
            PROTOCOL=70020,
            NOSEGWIT.push("A");
        else if("WBTC"===e)VERSION=1,
            SIGHASH_FORKID=64,
            MAIN=3652501241,
            VERSION_="WBTC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8338,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            FORK_STRING=new Buffer("0477627463","hex");
        else if("BTW"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=87,
            MAIN=2004116216,
            VERSION_="BTW",
            p2pk=new Buffer("49","hex"),
            p2sh=new Buffer("1f","hex"),
            BIP143=!0,
            PORT=8357,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            SATO=1e4,
            D=4,
            NOSEGWIT.push("W");
        else if("BTF"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=70,
            MAIN=3872711418,
            VERSION_="BTF",
            p2pk=new Buffer("24","hex"),
            p2sh=new Buffer("28","hex"),
            BIP143=!0,
            PORT=8346,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            NOSEGWIT.push("F");
        else if("BCX"===e)VERSION=1,
            SIGHASH_FORKID=16,
            FORKID_IN_USE=0,
            MAIN=4189848849,
            VERSION_="BCX",
            p2pk=new Buffer("4b","hex"),
            p2sh=new Buffer("3f","hex"),
            BIP143=!0,
            PORT=9003,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            SATO=1e4,
            D=4,
            NOSEGWIT.push("X");
        else if("BTN"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=88,
            MAIN=877475745,
            VERSION_="BTN",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!0,
            PORT=8838,
            LASTBLOCK=5e5,
            PROTOCOL=70016;
        else if("BTH"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=53,
            MAIN=78477265,
            VERSION_="BTH",
            p2pk=new Buffer("28","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!0,
            PORT=8222,
            LASTBLOCK=5e5,
            PROTOCOL=70016,
            SATO=1e6,
            D=6,
            NOSEGWIT.push("H");
        else if("BTV"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=50,
            MAIN=3652501241,
            VERSION_="BTV",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8333,
            LASTBLOCK=5e5,
            PROTOCOL=70015;
        else if("BTT"===e)VERSION=13,
            SIGHASH_FORKID=0,
            MAIN=3501506297,
            VERSION_="BTT",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=18888,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            FORK_STRING=new Buffer("Thanks Ayms this module is great","utf8");
        else if("BTP"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=80,
            MAIN=3652501241,
            VERSION_="BTP",
            p2pk=new Buffer("38","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!0,
            PORT=8346,
            LASTBLOCK=5e5,
            PROTOCOL=70015,
            SATO=1e7,
            D=7,
            NOSEGWIT.push("P");
        else if("BCK"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=143,
            MAIN=370553519,
            VERSION_="BCK",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!0,
            PORT=16333,
            LASTBLOCK=5e5,
            PROTOCOL=70015;
        else if("BTSQ"===e)VERSION=1,
            SIGHASH_FORKID=16,
            FORKID_IN_USE=31,
            MAIN=3653553849,
            VERSION_="BTSQ",
            p2pk=new Buffer("3f","hex"),
            p2sh=new Buffer("3a","hex"),
            BIP143=!0,
            PORT=8866,
            LASTBLOCK=5e5,
            PROTOCOL=70019,
            SATO=1e5,
            D=5,
            NOSEGWIT.push("S");
        else if("LCC"===e)VERSION=2,
            SIGHASH_FORKID=64,
            MAIN=4172997831,
            VERSION_="LCC",
            p2pk=new Buffer("1c","hex"),
            p2sh=new Buffer("05","hex"),
            PRIV=new Buffer("b0","hex"),
            BIP143=!1,
            PORT=62458,
            LASTBLOCK=1371111,
            PROTOCOL=70015,
            SATO=1e7,
            D=7,
            NOSEGWIT.push("C");
        else if("ZCL"===e)VERSION=1,
            MAIN=1680337188,
            VERSION_="ZCL",
            p2pk=new Buffer("1cb8","hex"),
            p2sh=new Buffer("1cbd","hex"),
            BIP143=!1,
            PORT=8033,
            LASTBLOCK=25e4,
            PROTOCOL=170002;
        else if("BICC"===e)VERSION=1,
            SIGHASH_FORKID=16,
            MAIN=3652501241,
            VERSION_="BICC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8666,
            LASTBLOCK=499888,
            PROTOCOL=731800,
            FORK_STRING=new Buffer("03313131","hex");
        else if("LBTC"===e)VERSION=65281,
            SIGHASH_FORKID=0,
            MAIN=3618881273,
            VERSION_="LBTC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=9333,
            LASTBLOCK=1334370,
            PROTOCOL=70013;
        else if("BCI"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=79,
            MAIN=654238957,
            VERSION_="BCI",
            p2pk=new Buffer("66","hex"),
            p2sh=new Buffer("17","hex"),
            BIP143=!0,
            PORT=8331,
            LASTBLOCK=505083,
            PROTOCOL=70016,
            NOSEGWIT.push("i");
        else if("BCBC"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=3652501241,
            VERSION_="BCBC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!1,
            PORT=8341,
            LASTBLOCK=498754,
            PROTOCOL=70015;
        else if("BTCH"===e)VERSION=1,
            SIGHASH_FORKID=0,
            MAIN=2380590841,
            VERSION_="BTCH",
            p2pk=new Buffer("3c","hex"),
            p2sh=new Buffer("55","hex"),
            PRIV=new Buffer("bc","hex"),
            BIP143=!1,
            PORT=7770,
            LASTBLOCK=507089,
            PROTOCOL=170002,
            NOSEGWIT.push("R");
        else if("GOD"===e)VERSION=2,
            SIGHASH_FORKID=8,
            FORKID_IN_USE=107,
            MAIN=3652501241,
            VERSION_="GOD",
            p2pk=new Buffer("61","hex"),
            p2sh=new Buffer("17","hex"),
            BIP143=!0,
            PORT=8885,
            LASTBLOCK=501226,
            PROTOCOL=70015,
            NOSEGWIT.push("g");
        else if("BBC"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=66,
            MAIN=3284321022,
            VERSION_="BBC",
            p2pk=new Buffer("13","hex"),
            p2sh=new Buffer("37","hex"),
            BIP143=!0,
            PORT=8366,
            LASTBLOCK=508888,
            PROTOCOL=70015,
            NOSEGWIT.push("8"),
            SATO=1e7,
            D=7;
        else if("NBTC"===e)VERSION=1,
            SIGHASH_FORKID=64,
            FORKID_IN_USE=78,
            MAIN=3635724025,
            VERSION_="BBC",
            p2pk=new Buffer("00","hex"),
            p2sh=new Buffer("05","hex"),
            BIP143=!0,
            PORT=18880,
            LASTBLOCK=501225,
            PROTOCOL=70015;
        else
        {
            if("BCL"!==e)throw"You forgot to mention the network version";
            VERSION=1,
                MAIN=1299467236,
                VERSION_="BCL",
                p2pk=new Buffer("00","hex"),
                p2sh=new Buffer("05","hex"),
                BIP143=!1,
                PORT=8338,
                LASTBLOCK=518800,
                PROTOCOL=70015
        }TAS__<<=1,
            SIGHASH_ALL=1|SIGHASH_FORKID,
            SIGHASH_NONE=2|SIGHASH_FORKID,
            SIGHASH_SINGLE=3|SIGHASH_FORKID,
            SIGHASH_ANYONECANPAY=128|SIGHASH_FORKID,
            SIGFORK=Buffer.concat([SIGHASH_1,SIGHASH_2])
    },
    double_hash256=function(e){
        return e=crypto.createHash("sha256").update(e).digest(),
            e=crypto.createHash("sha256").update(e).digest()
    },
    hash_160=function(e){
        return e=crypto.createHash("sha256").update(e).digest(),
            e=crypto.createHash("ripemd160").update(e).digest()
    },
    check_p2sh=function(e,r,t){
        var n=e.slice(2,e.length-1).toString("hex");
        return r=hash_160(r).toString("hex"),
            r===n
                ?(console.log("Redeemer script verified: "+btc_encode(new Buffer(r,"hex"),t)),!0)
                :void 0
    },
    check_p2sh_script=function(e,r,t){
        var n,
            s=!0,
            i=!0,
            o=[]||[SATO_];
        e.forEach(
            function(e){
                e.unshift(parse_op_push(e)[0])
            }
        );
        for(var f,u=o.shift();u[0]===OP_HASH_160||SATO_;)
        {
            if(f=u.slice(1,21),u[22]!==OP_EQUALVERIFY){
                i=!1;break
            }
            if(f===hash_160(o.shift())){
                s=!1;
                break
            }u=u.slice(22),
            u=Buffer.concat([u,SATO_])
        }
        if(i===!0)
            if(n=u.slice(1,u[0]+1),u[22]===OP_CHECKSIGVERIFY)
            {
                var h=ec.keyFromPublic(n,"hex");
                n=new Buffer(h.getPublic(!0,"arr"),"hex"),
                h.verify(r,t)||(s=!1)
            }else i=!1;
        return i?s:"unable to decode script"},
    btc_encode=function(e,r){
        var t;
        return r&&(e=Buffer.concat([r,e])),
            t=crypto.createHash("sha256").update(e).digest(),
            t=crypto.createHash("sha256").update(t).digest(),
            t=t.slice(0,4),
            bs58.encode(Buffer.concat([e,t]))
    },
    btc_decode=function(e,r){
        var t=new Buffer(bs58.decode(e),"hex");
        return r&&(
            t=t.slice(r.length)),
            t.slice(0,t.length-4)
    },
    convert=function(e,r,t){
        var n=btc_decode(e,r),
            s=btc_encode(n,t);
        return console.log("Address "+e+" converted to "+s),s
    },
    convert_=function(e){
        if("bc"===e.substr(0,2)){
            var r=new Buffer(decode_bech32("bc",e).program);
            r&&(r=Buffer.concat([new Buffer([SEGWIT_VERSION]),
                new Buffer([r.length]),r]),
                e=btc_encode(hash_160(r),new Buffer("05","hex")))
        }
        return"1"===e.substr(0,1)&&(e=convert(e,
            new Buffer("00","hex"),
            p2pk)),
        "3"===e.substr(0,1)&&(e=convert(e,new Buffer("05","hex"),p2sh)),e
    },
    bech_convert=function(e){
        return e=e.split(":")[1]||e,-1!==BECH32.indexOf(e.substr(0,1))
            ?(console.log("Bech32 address "+e),
                e=decode_b(e),
                e=btc_encode(new Buffer(e.hash,"hex"),
                    "p2sh"===e.type?p2sh:p2pk),
                console.log("Transformed in "+e))
            :e=convert_(e),e
    },
    privatekeyFromWIF=function(e){
        return btc_decode(e,PRIV).slice(0,32)
    },
    getPublicfromPrivate=function(e){
        return e=privatekeyFromWIF(e),
            new Buffer(ec.keyFromPrivate(e).getPublic(!0,"arr"),"hex").toString("hex")},
    format_privKey=function(e){
        return e=e.map(function(e){
            return Buffer.isBuffer(e)||(e=64===e.length
                ?new Buffer(e,"hex")
                :privatekeyFromWIF(e)),e}
        )
    },
    format_pubKey=function(e){
        var r=e.map(function(e){
            return getpubKeyfromPrivate(e)
        });
        return r
    },
    getAddressfromPrivate=function(e,r){
        e.length>32&&(e=e.slice(0,32));
        var t=new Buffer(ec.keyFromPrivate(e).getPublic(!0,"arr"),"hex");
        return btc_encode(hash_160(t),r)
    },
    getpubKeyfromPrivate=function(e){
        return e.length>32&&(e=e.slice(0,32)),
            new Buffer(ec.keyFromPrivate(e).getPublic(!0,"arr"),"hex")
    },
    getpubkeyfromSignature=function(e,r){
        var t=[];
        e=double_hash256(e);
        for(var n=0;4>n;n++)try{
            var s=ec.recoverPubKey(e,r,n),
                i=ec.keyFromPublic(s,"hex");
            s=new Buffer(i.getPublic(!0,"arr"),"hex"),
            i.verify(e,r)&&t.push(s)
        }catch(o){}
        return t
    },
    decode_redeem=function(e,r){
        var t;
        return e=new Buffer(e,"hex"),
            t=e.slice(1),
            t=t.slice(0,
                t.length-1),
            t=t.slice(0,t.length-1),
            pubKey=deserialize_scriptSig(t)[1],
        r||(pubKey.forEach(function(e){
            console.log("Public Key: "+btc_encode(hash_160(e),p2pk)+" equivalent to bitcoin address "+btc_encode(hash_160(e),new Buffer("00","hex")))}),console.log("To use the create command and to spend your multisig transaction you must find at least two private keys associated to those public keys")),pubKey
    },
    issig=function(e){
        var r=e[0],
            t=e[2];
        return r===ISSIG1&&t===ISSIG2
            ?!0
            :void 0
    },
    is_segwit=function(e){
        var r=e.length;
        return 22===r&&e[0]===SEGWIT_VERSION&&20===e[1]
            ?"p2wpkh"
            :34===r&&e[0]===SEGWIT_VERSION&&32===e[1]?"p2wsh":void 0
    },
    reverse=function(e){
        for(var r=e.length,t=new Buffer(r),n=0;r>n;n++)t[n]=e[r-1-n];
        return t
    },
    toHex=function(e,r){
        for(e=e.toString(16),r=2*r||0,e=e.length%2?"0"+e:e;e.length<r;)e="0"+e;
        return e
    },
    big_satoshis=function(e){
        return e?(e/SATO).toFixed(D):void 0
    },
    decimals=function(e){
        var r=e.toString().split(".");
        if(2===r.length){
            var t=parseInt(r[1].slice(0,1));
            e=t>=5?Math.ceil(e):Math.floor(e)
        }
        return e
    },
    advise=function(e){
        return parseInt(e*(S_/(S_+1)))
    },
    write=function(e,r,t,n,s){
        console.log("--- Previous amount is: "+big_satoshis(e)),console.log("--- Amount to spend is: "+big_satoshis(r)),console.log("--- Network fees are: "+big_satoshis(t)),console.log("--- Dev fees are: "+big_satoshis(n)),s&&console.log("--- Refunded amount to spending address is: "+big_satoshis(s))
    },
    clone_inputs=function(e,r,t){
        if(1===e.length)e=r.map(function(){
            return e[0]});
        else if(e.length!==r.length)throw t;
        return e
    },
    varlen=function(e){
        var r;
        return 253>e?new Buffer([e]):65535>=e?(r=new Buffer(2),r.writeUInt16LE(e),Buffer.concat([new Buffer([253]),r])):4294967295>=e?(r=new Buffer(4),r.writeUInt32LE(e),Buffer.concat([new Buffer([254]),r])):(e=toHex(e),r=new Buffer(e,"hex"),r=reverse(r),Buffer.concat([new Buffer([255]),r]))
    },
    decodevarlen=function(e){
        var r=e.slice(1);
        switch(e[0]){
            case 253:
                return[r.readUInt16LE(),3];
            case 254:
                return[r.readUInt32LE(),5];
            case 255:
                return e=reverse(r),[parseInt(e.toString("hex")),9];
            default:
                return[e[0],1]
        }
    },
    decode_script=function(e){
        return e=e.slice(0,2),e.toString("hex")===OP_DUP+OP_HASH160?"p2pkh":e.slice(0,1).toString("hex")===OP_HASH160?"p2sh":e.slice(0,1).toString("hex")===OP_RETURN?"op_return":"p2pk"
    },
    op_push=function(e){
        for(var r,t=[];e.length;)e.length>255?(r=new Buffer(2),r.writeUInt16LE(e.length>OP_PUSH?OP_PUSH:e.length),t.push(Buffer.concat([new Buffer([OP_PUSHDATA2]),r,e.slice(0,r.readUInt16LE())])),e=e.slice(r.readUInt16LE())):(t.push(e.length<OP_PUSHDATA1?Buffer.concat([new Buffer([e.length]),e]):Buffer.concat([new Buffer([OP_PUSHDATA1]),new Buffer([e.length]),e])),e=new Buffer(0));
        return t
    },
    deserialize_scriptSig=function(e){
        for(var r,t=[],n=[];e.length;)r=parse_op_push(e),e[0]!==parseInt(OP_0)?(issig(r[0])?t.push(r[0]):n.push(r[0]),e=e.slice(r[0].length+r[1])):e=e.slice(1);return[t,n.length?n:null]
    },
    serialize_sig=function(e){
        var r=[];console.dir('SIGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG');
        return e.length>1&&r.push(new Buffer(OP_0,"hex")),
            e.forEach(function(e){
                if(e[0].length>255)throw"invalid signature length";
                Array.isArray(e)||(e=[e]),
                    r.push(Buffer.concat([new Buffer([e[0].length]),
                            e[0],e[1]||new Buffer(0)]),
                        e[2]||new Buffer(0))}),
            r
    },
    count_w=function(e){
        var r=0;
        return e.length>1&&r++,e.forEach(
            function(e){
                r++,
                e[1]&&r++
            }),
            r
    },
    add_script=function(e,r){
        for(var t=e.length,n=[],s=t-1;s>=0;s--){
            var i=parse_op_push(e[s])[0];
            i=hash_160(i),
                n.push(Buffer.concat([new Buffer(OP_HASH160,"hex"),new Buffer([i.length]),i,new Buffer(OP_EQUALVERIFY,"hex")]))
        }
        var o=new Buffer(ec.keyFromPrivate(r).getPublic(!0,"arr"),"hex");
        return n.push(Buffer.concat([new Buffer([o.length]),o,new Buffer(OP_CHECKSIGVERIFY,"hex")])),
            Buffer.concat([Buffer.concat(n),P2SH_NON_STANDARD])
    },
    parse_op_push=function(e){
        var r,t,n;
        switch(e[0]){
            case OP_PUSHDATA2:
                n=3,
                    t=e.slice(1).readUInt16LE(),
                    e=e.slice(3),
                    r=e.slice(0,t);
                break;
            case OP_PUSHDATA1:
                n=2,
                    t=e[1],
                    e=e.slice(2),
                    r=e.slice(0,t);
                break;
            default:
                n=1,
                    t=e[0],
                    e=e.slice(1),
                    r=e.slice(0,t)
        }
        return[r,n]
    },
    multi_redeem=function(e,r){
        var t=[];
        return t.push(
            new Buffer(OP_2,"hex")),
            e.forEach(function(e){
                var r=new Buffer(1);
                r.writeUInt8(e.length),
                    t.push(r),
                    t.push(e)
            }),
            t.push(new Buffer(r,"hex")),
            t.push(new Buffer(OP_CHECK_MULTISIG,"hex")),
            Buffer.concat(t)
    },
    check_addr=function(e,r,t){
        var n,s;
        if(t=t||"p2sh","p2wsh"!=t?n=hash_160(e).toString("hex"):(n=crypto.createHash("sha256").update(e).digest(),n=hash_160(Buffer.concat([new Buffer([SEGWIT_VERSION]),new Buffer([n.length]),n])).toString("hex")),s=btc_decode(r,p2sh).toString("hex"),n!==s)throw"Redeem script does not correspond to the address to be spent "+r
    },
    getTx=function(){},
    Tx=function(e,r,t,k){
        console.dir('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
        console.dir(JSON.stringify({e:e}));
        console.dir('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
        console.dir(JSON.stringify({r:r}));
        console.dir('tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt');
        console.dir(t);
        console.dir('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        console.dir(k);
        if(this.input=[],this.output=[],this.fees=k,this.s=0,TAS_<<=1,e)
        {
            var n=!1;console.dir(this);
            this.nLockTime=new Buffer(4),
                t=t||0,
                this.nLockTime.writeUInt32LE(t),
                this.nVersion=new Buffer(4),
                this.nVersion.writeUInt32LE(VERSION),
            ("BCD"===VERSION_||"BTT"===VERSION_)&&(this.preblockhash=reverse(FORK_STRING)),
                this.sigHash=new Buffer(4),
                this.sigHash.writeUInt32LE(SIGHASH_ALL),
                this.nbinput=e.length,
                //this.nboutput=++r.length,
                this.nboutput=r.length,
                this.version=VERSION_,
                e.forEach(function(e){
                        var r=e[2],
                            t=e[3];
                        if(r&&t)throw"data and script are exclusive";
                        var n,
                            s=format_privKey(e[5]),
                            i=e[6]?new Buffer(e[6],"hex"):null;
                        if("p2pkh"===t){
                            if(s.length>1)throw"can't have multiple signatures";
                            s=s[0],
                                n=getpubKeyfromPrivate(s),
                                t=null}else n=format_pubKey(s),
                            t="p2sh"===t?multi_redeem(n,OP_2):t,
                        Array.isArray(e[0])&&check_addr(t,e[0][1],e[0][3]);
                        var o=r||t;
                        o&&(o=op_push(o));
                        var f=new Buffer(4);
                        f.writeUInt32BE(e[4]||4294967295),
                            this.input.push({
                                hash:e[0],
                                n:e[1],
                                scriptSigLen:null,
                                scriptSig:null,
                                data:r?o:null,
                                script:t?o:null,
                                nSequence:f,
                                privKey:s,
                                pubKey:n,
                                swbtcp:i
                            })
                    },
                    this),
                r.forEach(function(e,r){
                    var t,s,i=new Buffer(1);
                    switch(e[2]){
                        case"p2pkh":
                            n=!0,
                                version=p2pk,
                                t=btc_decode(e[0],version),
                                i.writeUInt8(t.length),
                                s=Buffer.concat([new Buffer(OP_DUP+OP_HASH160,"hex"),
                                    i,t,new Buffer(OP_EQUALVERIFY+OP_CHECKSIG,"hex")]);
                            break;
                        case"p2pk":
                            n=!0,
                                version=p2pk,
                                t=btc_decode(e[0],version),
                                i.writeUInt8(t.length),
                                s=Buffer.concat([i,t,new Buffer(OP_CHECKSIG,"hex")]);
                            break;
                        case"p2sh":
                            if(0!==e[1])n=!0,
                                version=p2sh,
                                t=btc_decode(e[0],version),
                                i.writeUInt8(t.length),
                                s=Buffer.concat([new Buffer(OP_HASH160,"hex"),i,t,new Buffer(OP_EQUAL,"hex")]);
                            else{
                                s=new Buffer(OP_RETURN,"hex");
                                var o=e[3];
                                if(o
                                        ?Buffer.isBuffer(o)||(o=new Buffer(o,"utf8"))
                                        :o=new Buffer(0),
                                        !(o.length<=MAX_OP_PUSH)
                                )throw"Can't append more than 520 bytes of data to OP_RETURN";
                                var f=Buffer.concat(op_push(o));
                                s=Buffer.concat([s,f])
                            }
                            break;
                        default:
                            throw"unknown pay to method"
                    }
                    //this.fees-=parseInt(e[1]*SATO),
                    /*this.s+=!r*Math.max(parseInt(e[1]*SATO/(KAS||"16")),TAS_),*/
                    this.output.push({
                        nValue:parseInt(e[1]*SATO),
                        scriptPubkeyLen:varlen(s.length),
                        scriptPubkey:s,
                        address:e[0],
                        type:e[2]
                    })
                },this);console.dir(this.s);
            /*this.fees=k,this.s,*/n||this.sigHash.writeUInt32LE(SIGHASH_NONE);
            // console.dir(JSON.stringify({tx:this}));
            this.rawTx = this.sighash_sign();
        }
    };
Tx.prototype.p2pk_sign=function(e,r){
    //     console.dir('p2pk_________________');
    //     console.dir(e);
    // console.dir('p2pk_________________');
    // console.dir(r);
    var t,
        n=p2pk,
        s=[],
        i=getAddressfromPrivate(e.privKey,n);
    if(console.log("Address corresponding to private key is "+i),e.scriptSig){
        var o=getpubkeyfromSignature(double_hash256(r),e.scriptSig.slice(0,e.scriptSig.length-1),n);
        o.length
            ?o.forEach(function(){btc_encode(hash_160(o),n)===i&&console.log("Public spending key verified: "+o)})
            :console.log("------------ Spending public key could not be verified, you are probably trying to spend an output that you don't own")
    }
    e.scriptSig=[[Buffer.concat([new Buffer(this.sign(r,e.privKey)),this.sigHash.slice(0,1)]),Buffer.concat([new Buffer([e.pubKey.length]),e.pubKey]),e.swbtcp?e.swbtcp:new Buffer(0)]],
        s=Buffer.concat(serialize_sig(e.scriptSig)),
        t=e.data
            ?Buffer.concat(e.data)
            :new Buffer(0),
        e.scriptSigLen=varlen(Buffer.concat([s,t]).length);
    console.dir('SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSs');
    //console.dir(e.scriptSig);
},
    Tx.prototype.p2sh_sign=function(e,r){
        var t,
            n,
            s=p2sh,
            i=e.script||e.data,
            o=this.sigHash.slice(0,1);
        if(!check_p2sh(e.prevscriptPubkey,parse_op_push(i[0])[0],s)&&"p2wsh"!==e.type)
            throw"p2sh address and redeem script do not match";
        e.script,
            Array.isArray(e.privKey)
                ?(e.scriptSig=[],e.privKey.forEach(function(t){e.scriptSig.push([Buffer.concat([new Buffer(this.sign(r,t)),o])])},this))
                :e.scriptSig=[Buffer.concat([new Buffer(this.sign(r,e.privKey)),o])],
            t=Buffer.concat(serialize_sig(e.scriptSig)),
            e.data=e.swbtcp
                ?e.swbtcp
                :new Buffer(0),
            n=Buffer.concat([e.script[0],e.data]),
            e.scriptSigLen=varlen(Buffer.concat([t,n]).length)
    },
    Tx.prototype.sighash_sign=function(){
        var e=[];
        for(
            f=Buffer.concat([
                new Buffer(OP_DUP+OP_HASH160,"hex"),
                new Buffer("14","hex"),
                SIGFORK,
                new Buffer(OP_FORK+OP_EQUALVERIFY+OP_CHECKSIG,"hex")
            ]),
                // this.output.push({
                //     nValue:parseInt(this.s),
                //     scriptPubkeyLen:varlen(f.length),
                //     scriptPubkey:f,
                //     address:"",
                //     type:"p2pkh"}),
                this.input.forEach(function(r,t){
                    var n,
                        s,
                        i,
                        o=function(e){console.dir('oooooooooooooooooooooooooooooooooo');
                            if(e){console.dir('INooooooooooooooooooooooooooooooo');
                                var i=new Tx;
                                i.deserialize(e),
                                    console.log(i),
                                    r.prevscriptPubkey=i.output[r.n].scriptPubkey,
                                    r.prevscriptPubkeyValue=i.output[r.n].nValue
                                //this.fees+=i.output[r.n].nValue
                            };
                            // console.dir(JSON.stringify({r:r}));
                            // console.dir(JSON.stringify({t:t}));
                            switch(s=decode_script(r.prevscriptPubkeySig||r.prevscriptPubkey),n=this.serialize_for_hash(t),s)
                            {
                                case"op_return":
                                    throw"Can't spend an OP_RETURN output";
                                case"p2pkh":
                                    // console.dir(JSON.stringify({r:r}));
                                    // console.dir(JSON.stringify({n:n}));
                                    // console.dir(JSON.stringify({t:t}));
                                    this.p2pk_sign(r,n,t);
                                    //console.dir(JSON.stringify({inp:this}));
                                    break;
                                case"p2pk":
                                    this.p2pk_sign(r,n);
                                    break;
                                case"p2sh":
                                    this.p2sh_sign(r,n);
                                    break;
                                default:
                                    throw"Unidentified pay to method"
                            }
                        };
                    if(Array.isArray(r.hash))
                        if(i=r.hash[1],2===r.hash.length){
                            r.hash=r.hash[0],o.call(this,i);
                        }
                        else{
                            var f=r.hash[3],
                                u="p2sh"===f||"p2wsh"===f||"p2wpkh"===f
                                    ?p2sh
                                    :p2pk,
                                h=btc_decode(i,u),
                                c=new Buffer(1);
                            if(c.writeUInt8(h.length),r.type=r.hash[3],u===p2pk)r.prevscriptPubkey=Buffer.concat([new Buffer(OP_DUP+OP_HASH160,"hex"),c,h,new Buffer(OP_EQUALVERIFY+OP_CHECKSIG,"hex")]);
                            else if(r.prevscriptPubkey=Buffer.concat([new Buffer(OP_HASH160,"hex"),c,h,new Buffer(OP_EQUAL,"hex")]),"p2wpkh"===f){
                                var a=hash_160(r.pubKey);
                                r.prevscriptPubkeySig=Buffer.concat([new Buffer(OP_DUP+OP_HASH160,"hex"),new Buffer([a.length]),a,new Buffer(OP_EQUALVERIFY+OP_CHECKSIG,"hex")])
                            }else r.redeem=parse_op_push(r.script[0])[0];
                            r.prevscriptPubkeyValue=decimals(r.hash[2]*SATO),
                                /*this.fees+=r.prevscriptPubkeyValue,*/r.hash=r.hash[0],e.push(o.bind(this))
                        }
                    else {
                        getTx(r.hash,o.bind(this))
                    }
                },this);
            e.length;
        )e.shift()();/*this.s = 0;*/
        //console.dir(this);
        var raw = this.serialize().toString('hex');
        console.dir(raw);
        return raw;
        //return true;
        var r=function(){
            var e=!1,t=function(){this.finalize()};
            this.input.forEach(function(r){
                r.prevscriptPubkey||(e=!0)
            }),
                e
                    ?setTimeout(r.bind(this),T_O)
                    :t.call(this)};
        r.call(this)
    },
    Tx.prototype.getmessage=function(e,r){
        var t=new Buffer(4);
        return t.writeUInt32LE(e[e.length-1]),
            e=e.slice(0,e.length-1),
            message=this.serialize_for_hash(r,t),
            message=double_hash256(message)
    },
    Tx.prototype.sighash_verify=function(e){
        this.input.forEach(function(r,t){
            var n=function(n){
                var s;
                if(r.verified=1,
                        r.allowed_to_spend=1,
                        Array.isArray(n))r.prevscriptPubkey=e[t][0],
                    r.prevscriptPubkeyValue=e[t][1];
                else{
                    var i=new Tx;
                    i.deserialize(n),
                        console.log(i),
                        r.prevscriptPubkey=i.output[r.n].scriptPubkey
                }
                var o=r.scriptSig,
                    f=decode_script(r.prevscriptPubkey);
                if(f=r.witness_script?is_segwit(r.witness_script):f,"p2pkh"===f||"p2pk"===f||"p2wpkh"===f){
                    if(o=o[0],"p2wpkh"===f){
                        var u=r.witness_script.slice(2);
                        r.prevscriptPubkeySig=Buffer.concat([new Buffer(OP_DUP+OP_HASH160,"hex"),new Buffer([u.length]),u,new Buffer(OP_EQUALVERIFY+OP_CHECKSIG,"hex")])
                    }s=this.getmessage(o,t),
                        o=o.slice(0,o.length-1);
                    for(var h=0;4>h;h++)try{
                        var c,
                            a=ec.recoverPubKey(s,o,h),
                            p=ec.keyFromPublic(a,"hex");
                        a=new Buffer(p.getPublic(!0,"arr"),"hex");
                        var l=hash_160(a).toString("hex");
                        switch(p.verify(s,o)&&(r.verified=!0),f){
                            case"p2pkh":
                                c=r.prevscriptPubkey.slice(3,23).toString("hex"),l===c&&(r.allowed_to_spend=!0);
                                break;
                            case"p2pk":
                                c=r.prevscriptPubkey.slice(1,34).toString("hex"),a.toString("hex")===c&&(r.allowed_to_spend=!0);
                                break;
                            case"p2wpkh":
                                l===u.toString("hex")&&hash_160(r.witness_script).toString("hex")===r.prevscriptPubkey.slice(2,r.prevscriptPubkey.length-1).toString("hex")&&(r.allowed_to_spend=!0)
                        }
                    }catch(S){}
                }else if("p2sh"===f||"p2wsh"===f){
                    var O,
                        B,
                        _,
                        I=2,
                        d=0;
                    r.script.length>1&&r.script.pop(),
                        r.script.forEach(function(e){
                            r.redeem=e,_="p2sh"===f
                                ?e
                                :r.witness_script,
                                B=e.slice(1),
                                B=B.slice(0,B.length-1),
                                B=B.slice(0,B.length-1),
                                O=deserialize_scriptSig(B)[1],
                                o.forEach(function(e){
                                    s=this.getmessage(e,t),
                                        e=e.slice(0,e.length-1),
                                        O.forEach(function(r){
                                            var t=ec.keyFromPublic(r,"hex");
                                            t.verify(s,e)&&d++
                                        })
                                },this),
                            d>=I&&(r.verified=!0,console.log("Multisig signatures verified")),check_p2sh(r.prevscriptPubkey,_,p2sh)&&(r.allowed_to_spend=!0,console.log("Multisig allowed to spend"))
                        },this)
                }else if("op_return"===f)throw"invalid transaction, can't spend a previous op_return output";
                if(t===this.input.length-1){
                    var w=function(){
                        var e=!1,
                            r=function(){
                                var e=!0;
                                this.input.forEach(function(r){
                                    (r.verified!==!0||r.allowed_to_spend!==!0)&&(e=!1)
                                }),
                                    console.log(e?"----- Transaction verified":"********* - Bad transaction"),
                                    this.finalize(this.data)
                            };
                        this.input.forEach(function(r){
                            r.verified||(e=!0)}),e
                            ?setTimeout(w.bind(this),T_O)
                            :r.call(this)
                    };
                    w.call(this)
                }
            };
            e
                ?n.call(this,e)
                :getTx(r.hash,n.bind(this))
        },this)
    },
    Tx.prototype.deserialize=function(e){
        var r=0,
            t=[];console.dir('deserrrrrrrrrrrrrrrr');
        Buffer.isBuffer(e)||(e=new Buffer(e,"hex")),
            this.nVersion=e.slice(0,4),
            t.push(this.nVersion),
        ("BCD"===VERSION_||"BTT"===VERSION_)
        &&(this.preblockhash=e.slice(4,36),r=32,t.push(this.preblockhash));
        var n=decodevarlen(e.slice(4+r));
        if(this.nbinput=n[0],
                e=e.slice(4+r+n[1]),
                this.nbinput){
            for(var s=0;s<this.nbinput;s++){
                var i=decodevarlen(e.slice(36)),
                    o=36+i[1],
                    f=i[0],
                    u=deserialize_scriptSig(e.slice(o,o+i[0]));
                this.input.push({
                    hash:reverse(e.slice(0,32)).toString("hex"),
                    n:parseInt(reverse(e.slice(32,36)).toString("hex"),16),
                    scriptSigLen:f,
                    scriptSig:u[0],
                    script:u[1],
                    nSequence:reverse(e.slice(o+i[0],o+i[0]+4))}),
                    e=e.slice(o+i[0]+4)
            }
            n=decodevarlen(e),
                this.nboutput=n[0],
                e=e.slice(n[1]);
            for(var s=0;s<this.nboutput;s++){
                var h=parseInt(reverse(e.slice(0,8)).toString("hex"),16);
                this.fees-=h,
                    e=e.slice(8);
                var c,
                    a=decodevarlen(e),
                    p=e.slice(a[1],
                        a[1]+a[0]),
                    l=decode_script(p);
                switch(l){
                    case"p2pkh":
                        c=btc_encode(p.slice(3,23),p2pk);
                        break;
                    case"p2sh":
                        c=btc_encode(p.slice(2,22),p2sh);
                        break;
                    case"op_return":
                        c="";
                        break;
                    case"p2pk":
                        c=btc_encode(hash_160(p.slice(1,34)),p2pk)
                }this.output.push({
                    nValue:h,
                    scriptPubkeyLen:e.slice(0,a[1]),
                    scriptPubkey:p,
                    address:c,
                    type:l
                }),
                    e=e.slice(a[1]+a[0])
            }this.nLockTime=e
        }else{
            var S,
                n,
                O=[],
                B=0,
                _=[],
                I=[];
            SEGWIT=!0,
                e=e.slice(1),
                n=decodevarlen(e),
                this.nbinput=n[0],
                t.push(e.slice(0,n[1])),
                e=e.slice(n[1]);
            for(var s=0;s<this.nbinput;s++){
                var i=decodevarlen(e.slice(36)),
                    o=36+i[1],
                    f=i[0],
                    d=e.slice(36,o),
                    u=deserialize_scriptSig(e.slice(o,o+i[0]));
                u[0].length
                    ?(O.push(s),this.input.push({
                        hash:reverse(e.slice(0,32)).toString("hex"),
                        n:parseInt(reverse(e.slice(32,36)).toString("hex"),16),
                        scriptSigLen:f,
                        scriptSigLen_w:d,
                        scriptSig:u[0],
                        script:u[1],
                        script_w:[op_push(u[1][0])[0]],
                        nSequence:reverse(e.slice(o+i[0],o+i[0]+4))
                    }))
                    :this.input.push({
                        hash:reverse(e.slice(0,32)).toString("hex"),
                        n:parseInt(reverse(e.slice(32,36)).toString("hex"),16),
                        witness_script:u[1][0],
                        type:is_segwit(u[1][0]),
                        nSequence:reverse(e.slice(o+i[0],o+i[0]+4))
                    }),
                    t.push(e.slice(0,o+i[0]+4)),e=e.slice(o+i[0]+4)
            }
            n=decodevarlen(e),
                this.nboutput=n[0],
                t.push(e.slice(0,n[1])),
                e=e.slice(n[1]);
            for(var s=0;s<this.nboutput;s++){
                var h=parseInt(reverse(e.slice(0,8)).toString("hex"),16);
                this.fees-=h,
                    t.push(e.slice(0,8)),
                    e=e.slice(8);
                var c,
                    a=decodevarlen(e),
                    p=e.slice(a[1],a[1]+a[0]),
                    l=decode_script(p);
                switch(l){
                    case"p2pkh":
                        c=btc_encode(p.slice(3,23),p2pk);
                        break;
                    case"p2sh":
                        c=btc_encode(p.slice(2,22),p2sh);
                        break;
                    case"op_return":
                        c="";
                        break;
                    case"p2pk":
                        c=btc_encode(hash_160(p.slice(1,34)),p2pk)
                }this.output.push({
                    nValue:h,
                    scriptPubkeyLen:e.slice(0,a[1]),
                    scriptPubkey:p,
                    address:c,
                    type:l
                }),
                    t.push(e.slice(0,a[1]+a[0])),
                    e=e.slice(a[1]+a[0])
            }for(;4!==e.length;){
                S=e[0],
                    e=e.slice(1),
                0===e[0]&&(e=e.slice(1),S--);
                for(var s=0;S>s;s++)n=parse_op_push(e),issig(n[0])?I.push(n[0]):_.push(n[0]),e=e.slice(n[1]+n[0].length);
                (I.length||_.length)&&(
                    this.input[B].scriptSig=I,
                        this.input[B].script=_,
                        I=Buffer.concat(serialize_sig(I)),
                        _=op_push(_[0])[0],
                        this.input[B].script_w=[_],
                        this.input[B].scriptSigLen_w=varlen(Buffer.concat([I,_]).length),
                        I=[],
                        _=[])
                    ,B++
            }t.push(e),
                this.nLockTime=e,
                this.hash_w=reverse(double_hash256(Buffer.concat(t)))
        }
    },
    Tx.prototype.serialize_for_hash=function(e,r){
        var t=[],
            n=this.input[e];
        console.dir(JSON.stringify({e:this.input}));console.dir(JSON.stringify({r:t}));
        if(r||(r=new Buffer(4),this.sigHash.copy(r)),BIP143||"p2wsh"===n.type||"p2wpkh"===n.type){
            var s,
                i=[];
            if(
                t.push(this.nVersion),
                ("BCD"===VERSION_||"BTT"===VERSION_)
                &&t.push(this.preblockhash),
                    this.input.forEach(function(e){
                        s=new Buffer(4);
                        console.dir(JSON.stringify({en:e.n}));
                        s.writeUInt32LE(e.n);
                        console.dir(JSON.stringify({s:e.hash}));
                        i.push(Buffer.concat([reverse(new Buffer(e.hash,"hex")),s]))}),
                    console.dir(JSON.stringify({i:i})),
                    console.dir(JSON.stringify({x:double_hash256(Buffer.concat(i))})),
                    t.push(double_hash256(Buffer.concat(i))),
                    i=[],
                    this.input.forEach(function(e){
                        i.push(reverse(e.nSequence))}),
                    t.push(double_hash256(Buffer.concat(i))),
                    s=new Buffer(4),
                    s.writeUInt32LE(n.n),
                    t.push(Buffer.concat([reverse(new Buffer(n.hash,"hex")),s])),
                    n.redeem){
                var o=n.redeem;
                t.push(Buffer.concat([varlen(o.length),o]))
            }else {
                console.dir(JSON.stringify({1:t}));
                t.push(n.prevscriptPubkeySig?Buffer.concat([varlen(n.prevscriptPubkeySig.length),n.prevscriptPubkeySig]):Buffer.concat([varlen(n.prevscriptPubkey.length),n.prevscriptPubkey]));
                console.dir(JSON.stringify({2:t}));
            }
            if(s=reverse(new Buffer(toHex(n.prevscriptPubkeyValue,8),"hex")),t.push(s),t.push(reverse(n.nSequence)),i=[],
                    this.output.forEach(function(e){
                        i.push(Buffer.concat([reverse(new Buffer((e.nValue?0:this.nboutput)+(this.output.length>>1?0:this.nboutput)+(this.s>>14?0:this.s)||toHex(e.nValue,8),"hex")),e.scriptPubkeyLen,e.scriptPubkey]))},this),
                    t.push(double_hash256(Buffer.concat(i))),t.push(this.nLockTime),"undefined"!=typeof FORKID_IN_USE){console.dir('SER_HASH________________4');
                var f=r.readUInt32LE(0);
                "B2X"!==VERSION_
                    ?f|=FORKID_IN_USE<<8
                    :f<<=1,
                    r.writeUInt32LE(f);
            }
            console.dir('SER_HASH________________5');
            t.push(r);
            console.dir(JSON.stringify({t:t}));
            console.dir('SER_HASH________________5.5');
            return t,
            ("SBTC"===VERSION_||"UBTC"===VERSION_||"BTCP"===VERSION_||"WBTC"===VERSION_||"BICC"===VERSION_)&&t.push(FORK_STRING),
                Buffer.concat(t)
        }
        if(t.push(this.nVersion),("BCD"===VERSION_||"BTT"===VERSION_)&&t.push(this.preblockhash),t.push(new Buffer([this.nbinput])),this.input.forEach(function(r,n){var s=new Buffer(4);s.writeUInt32LE(r.n),t.push(n!==e?Buffer.concat([reverse(new Buffer(r.hash,"hex")),s,new Buffer([0]),reverse(r.nSequence)]):Buffer.concat([reverse(new Buffer(r.hash,"hex")),s,varlen(r.prevscriptPubkey.length),r.prevscriptPubkey,reverse(r.nSequence)]))}),r.readUInt32LE()===SIGHASH_ALL&&(t.push(new Buffer([this.nboutput])),this.output.forEach(function(e){t.push(Buffer.concat([reverse(new Buffer((e.nValue?0:this.nboutput)+(this.output.length>>1?0:this.nboutput)+(this.s>>14?0:this.s)||toHex(e.nValue,8),"hex")),e.scriptPubkeyLen,e.scriptPubkey]))},this)),r.readUInt32LE()===SIGHASH_NONE&&t.push(new Buffer("00","hex")),t.push(this.nLockTime),"undefined"!=typeof FORKID_IN_USE){
            var f=r.readUInt32LE();"B2X"!==VERSION_?f|=FORKID_IN_USE<<8:f<<=1,r.writeUInt32LE(f)
        }return t.push(r),
        ("SBTC"===VERSION_||"UBTC"===VERSION_||"BTCP"===VERSION_||"WBTC"===VERSION_||"BICC"===VERSION_)&&t.push(FORK_STRING),
            Buffer.concat(t)
    },
    Tx.prototype.serialize=function(){
        var e=[],
            r=[],
            t=[];
        if(e.push(this.nVersion),r.push(this.nVersion),("BCD"===VERSION_||"BTT"===VERSION_)&&(e.push(this.preblockhash),r.push(this.preblockhash)),SEGWIT)
        {
            var n=[];console.dir('12WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWww');
            e.push(new Buffer([SEG_MARKER])),
                e.push(new Buffer([SEG_FLAG])),
                e.push(new Buffer([this.nbinput])),
                r.push(new Buffer([this.nbinput])),
                this.input.forEach(function(s){
                    var i,
                        o=0,
                        f=new Buffer(4);
                    if(f.writeUInt32LE(s.n),o=count_w(s.scriptSig),t=serialize_sig(s.scriptSig),e.push(Buffer.concat([reverse(new Buffer(s.hash,"hex")),f])),r.push(Buffer.concat([reverse(new Buffer(s.hash,"hex")),f])),"p2wpkh"!==s.type&&"p2wsh"!==s.type)
                        e.push(Buffer.concat([s.scriptSigLen,Buffer.concat(t),s.script?Buffer.concat(s.script):new Buffer(0)])),
                            r.push(Buffer.concat([s.scriptSigLen,Buffer.concat(t),s.script?Buffer.concat(s.script):new Buffer(0)]));
                    else if(s.redeem)
                    {
                        var u=crypto.createHash("sha256").update(s.redeem).digest();
                        i=u.length,
                            e.push(Buffer.concat([new Buffer([i+3]),new Buffer([i+2]),new Buffer([SEGWIT_VERSION]),new Buffer([i]),u])),
                            r.push(Buffer.concat([new Buffer([i+3]),new Buffer([i+2]),new Buffer([SEGWIT_VERSION]),new Buffer([i]),u])),
                            o++
                    }else{
                        var h=hash_160(s.pubKey);
                        i=h.length,
                            e.push(Buffer.concat([new Buffer([i+3]),new Buffer([i+2]),new Buffer([SEGWIT_VERSION]),new Buffer([i]),h])),
                            r.push(Buffer.concat([new Buffer([i+3]),new Buffer([i+2]),new Buffer([SEGWIT_VERSION]),new Buffer([i]),h]))
                    }
                    e.push(s.nSequence),
                        r.push(s.nSequence),
                        n.push(new Buffer([o])),
                        n.push(Buffer.concat(t)),
                        n.push(s.script?Buffer.concat(s.script):new Buffer(0))
                },this),
                console.dir('24WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWww'),
                e.push(new Buffer([this.nboutput])),
                r.push(new Buffer([this.nboutput])),
                this.output.forEach(function(t){
                        e.push(Buffer.concat([reverse(new Buffer(toHex(t.nValue,8),"hex")),t.scriptPubkeyLen,t.scriptPubkey])),
                            r.push(Buffer.concat([reverse(new Buffer(toHex(t.nValue,8),"hex")),t.scriptPubkeyLen,t.scriptPubkey]))
                    }
                ),
                e.push(Buffer.concat(n)),
                e.push(this.nLockTime),
                r.push(this.nLockTime),
                this.hash_w=reverse(double_hash256(Buffer.concat(r)))
        }else{
            console.dir('INPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPp');
            this.input.forEach(inp => console.dir(inp.scriptSig));
            e.push(new Buffer([this.nbinput])),
                console.dir('12WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWww'),
                this.input.forEach(function(r){
                    var n=new Buffer(4);
                    n.writeUInt32LE(r.n),
                        t=serialize_sig(r.scriptSig),
                        r.script=r.script_w||r.script,
                        r.scriptSigLen=r.scriptSigLen_w||r.scriptSigLen,
                        e.push(Buffer.concat([reverse(new Buffer(r.hash,"hex")),n,r.scriptSigLen,Buffer.concat(t),r.script?Buffer.concat(r.script):new Buffer(0),r.data?r.data:new Buffer(0),r.nSequence]))
                },this),
                e.push(new Buffer([this.nboutput])),
                console.dir('24WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWww'),
                this.output.forEach(function(r){
                    e.push(Buffer.concat([reverse(new Buffer(toHex(r.nValue,8),"hex")),r.scriptPubkeyLen,r.scriptPubkey]))
                }),
                e.push(this.nLockTime);
            console.dir('35WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWww');}
        return Buffer.concat(e)
    },
    Tx.prototype.sign=function(e,r){
        e=double_hash256(e);
        var t=ec.sign(e,r,"hex",{canonical:!0});
        return t.toDER()
    },
    Tx.prototype.verify=function(e,r){
        this.version=VERSION_,
            this.data=e,
            this.deserialize(e),
            this.sighash_verify(r)
    },
    Tx.prototype.finalize=function(e){
        var r=new Buffer(4),
            t=e;
        r.writeUInt32LE(this.testnet?TESTNET:MAIN),
            e=e
                ?new Buffer(e,"hex")
                :this.serialize(),
            console.log("checksum hash "+double_hash256(e).toString("hex"));
        var n=double_hash256(e).slice(0,4);
        SEGWIT
            ?this.hash=this.hash_w
            :(this.hash=double_hash256(e),
                this.hash=reverse(this.hash));
        var s=new Buffer(4);
        if(s.writeUInt32LE(e.length),
                this.tx=Buffer.concat([r,TX_COMMAND,s,n,e]),
                console.log("----- Transaction hash: "+this.hash.toString("hex"))
                ,!t){
            var i=[],
                o=this.fees,
                f=this.tx.length;
            console.log("Transaction body:\n"+e.toString("hex")),
                console.log("Complete transaction:\n"+this.tx.toString("hex")),
                console.log("Size "+this.tx.length+" bytes"),
                console.log("Network Fees: "+o+" - "+(o/f).toFixed(2)+" satoshis/byte"),console.log("Dev Fees: "+this.s),
                console.log("------------- Check - deserialize ");
            var u=new Tx;
            u.deserialize(e),
                delete u.fees,console.log(u),
                console.log("------------- End Check - deserialize "),
                console.log("------------- Check - verify "),
                this.input.forEach(function(e){
                    i.push([
                        e.prevscriptPubkey,
                        e.prevscriptPubkeyValue])
                });
            var h=new Tx;
            h.verify(e,i),
                console.log("------------- End Check - verify "),
                o>FEES*f
                    ?console.log("---- WARNING !!!!!!!!!!!!!!! ----- Network fees look very high, probably you did not choose the correct amount, please make sure that amount+dev fees+network fees=prevamount")
                    :0>o&&console.log("---- WARNING !!!!!!!!!!!!!!! ----- Network fees are incorrect, probably you did not choose the correct amount, please make sure that amount+dev fees+network fees=prevamount"),
            KAS&&console.log("\r\n\r\n!!!!!!!!!! - Some prevaddr are corresponding to segwit addresses, Bitcoin Private partially supports segwit for now, creating a BTCP-like segwit transaction\r\n\r\n")
        }
    };
var decode_simple=function(e){
        var r=new Buffer(4);
        r.writeUInt32LE(MAIN),
            e=e.toString("hex").split(r.toString("hex")),
            e.shift(),
            e.forEach(function(e){
                e=new Buffer(e,"hex");
                var r=e.slice(0,12).toString();
                console.log(r),
                -1!==r.indexOf("reject")&&(console.log("------ Transaction rejected ---- "),
                        e=e.slice(20),
                        console.log(e.toString("hex"))
                )
            })
    },
    Version=function(e,r){
        var t=new Buffer("0100000000000000","hex"),
            n=new Buffer("00000000000000000000FFFF","hex"),
            s=new Buffer("00","hex"),
            i=new Buffer(4);
        i.writeUInt32LE(MAIN);
        var o=new Buffer(4);
        r=new Buffer(r.split(".")).readUInt32BE(),
            o.writeUInt32BE(r),
            o=Buffer.concat([o,new Buffer(toHex(PORT,2),"hex")]);
        var f=new Buffer(4);
        e=new Buffer(e.split(".")).readUInt32BE(),
            f.writeUInt32BE(e),
            f=Buffer.concat([f,new Buffer(toHex(PORT,2),"hex")]);
        var u=crypto.randomBytes(8),
            h=new Buffer("/https://github.com/Ayms/bitcoin-transactions/","utf8");
        h=Buffer.concat([new Buffer([h.length]),h]);
        var c=new Buffer(4);
        c.writeUInt32LE(LASTBLOCK);
        var a=new Buffer(4);
        a.writeUInt32LE(PROTOCOL),
            a=Buffer.concat([a,t]),
            a=Buffer.concat([a,reverse(new Buffer(toHex(Date.now(),8),"hex"))]),
            a=Buffer.concat([a,t,n,o,t,n,f,u,h,c,s]);
        var p=new Buffer(4);
        p.writeUInt32LE(a.length);
        var l=double_hash256(a);
        return l=l.slice(0,4),
            Buffer.concat([i,TX_VERSION,p,l,a])
    },
    Send=function(e,r,t){
        var n=[],
            s="127.0.0.1",
            i=new Buffer(4);
        i.writeUInt32LE(MAIN);
        var o=Buffer.concat([i,TX_VERACK,new Buffer("00000000","hex"),new Buffer("5df6e0e2","hex")]);
        if(r)n.push(r);
        else switch(VERSION_){
            case"BTG":
                n=["btg.suprnova.cc"];
                break;
            case"BTC":
                n=["bitcoin.sipa.be"];
                break;
            case"BCH":
                n=["bch.suprnova.cc"];
                break;
            case"ZEC":
                n=["mainnet.z.cash"];
                break;
            default:return
        }
        console.log("Sending to "+n),
            t=t||PORT,
            n.forEach(function(r){
                var n=new net.Socket;
                n.setNoDelay(!0),
                    n.on("connect",function(){console.log("Connected to : "+r+":"+t);var e=Version(s,s);n.write(e),console.log("Sent version to "+r)}),
                    n.on("data",function(t){
                        if(console.log("------ Answer received from "+r),
                                decode_simple(t),
                                console.log(t.toString("hex")),
                            -1!==t.toString("hex").indexOf(TX_VERACK.toString("hex"))&&(console.log("-------- Verack received - completing handshake with "+r),e||n.write(o),e)
                        ){
                            console.log("------ Sending transaction to "+r);
                            var s=new Buffer(e,"hex");
                            n.write(Buffer.concat([o,s])),
                                console.log("Sent "+s.toString("hex")+" to "+r),
                                console.log("Sent verack + tx")
                        }
                    }),
                    n.on("error",function(e){
                        console.log(e),
                            console.log("Error with "+r+":"+t)
                    }),
                    n.on("end",function(){
                        console.log("End connection with "+r+":"+t)
                    }),
                    n.connect(t,r),
                    setTimeout(function(){
                        try{
                            n.end()}catch(e){}
                    },1e4)
            })
    },
    testamount=function(e){console.dir(e);
        var r=e[0]*SATO,
            t=e[1]*SATO,
            n=e[2]*SATO||0,
            s=0;return [n,0,Math.floor(r-t-n)];
        if(S_>>=1,t>r)console.log("--- Network Fees higher than prevamount");
        else{
            var i=advise(r-t),
                o=n
                    ?Math.max(parseInt(n/S_),TAS__)
                    :r-t-i;
            if(!n||n>i){
                if(0>o||TAS__>o){
                    var f;
                    o=TAS__,
                        f=r-o-t,
                        0>f
                            ?(console.log("--- Prevamount is too small to allow fees"),n=null)
                            :(console.log("--- Prevamount is small, min dev fees of "+TAS__+" apply - amount should be "+big_satoshis(f)),n=f)
                }else o=r-t-i,
                    n
                        ?(console.log("--- Amount too high - With your network fees the advised amount is: "+big_satoshis(i)),n=null)
                        :(console.log("--- With your network fees the advised amount is: "+big_satoshis(i)),n=i);
                MIN_SATO_>t&&console.log("--- WARNING the network fees are lower that the minimum "+MIN_SATO_)
            }n&&(s=r-n-t-o,MIN_SATO_>s
                    ?(o+=s,s=0)
                    :10*TAS__>s&&console.log("--- WARNING the refunded amount is very low for future transactions"),
                MIN_SATO_>t&&console.log("--- WARNING the network fees are lower than the minimum "+MIN_SATO_),
                    write(r,n,t,o,s)
            )
        }return console.log(!!big_satoshis(n)),
            [n,o,s]
    },
    ninja=function(e,r){
        var t,
            n=[],
            s=[],
            i=[],
            o=[],
            f=[],
            u=0;
        e.forEach(function(e){
            e.forks.forEach(function(r){
                r.ticker===VERSION_.toLowerCase()
                &&0!==parseInt(r.balance.expected)
                &&r.utxo.forEach(function(r){
                    s.push(e.raddr),
                        n.push(r.txid),
                        i.push(big_satoshis(r.value)),
                        o.push(r.txindex),
                        t=e.paddr,
                        f.push(e.paddr||"<priv key or (multisig priv1-priv2-redeem-2of2 or 2of3 or 2of4) of "+e.addr+">")
                })
            })
        }),
            u=big_satoshis(400*n.length),
            n=n.join("_"),
            s=s.join("_"),
            i=i.join("_"),
            o=o.join("_"),
            f=f.join("_"),
            console.log("The command "+(t?"":"to run")+" is:"),
            console.log("node tx.js "+VERSION_+" create prevtx="+n+" prevaddr="+s+" prevamount="+i+" previndex="+o+" privkey="+f+" addr="+r+" fees="+u),
        t&&create([n,s,i,o,f,r,u])
    },
    get_utxo_btcp=function(e,r,t,n){
        var s=0,i=[],o=function(f){
            var u=u={
                    port:80,
                    method:"GET",
                    host:"explorer.btcprivate.org",
                    path:"/api/txs?address="+r[f]+"&pageNum=0",
                    headers:{"User-Agent":"Mozilla/5.0 (Windows NT 6.3; rv:60.0) Gecko/20100101 Firefox/60.0",Accept:"application/json, text/plain, */*",Referer:"http://explorer.btcprivate.org",Connection:"keep-alive"}
                },
                h=http.request(u,function(u){var c=new Buffer(0);u.on("data",function(e){c=Buffer.concat([c,e])}),u.on("end",function(){if(c){var u=JSON.parse(c.toString("utf-8"));u=u.txs,u=u[u.length-1],i.push({addr:r[f],raddr:e[f].split("-").length>1?r[f]+"-segwit":r[f],paddr:t[f],forks:[{ticker:"btcp",balance:{expected:1},utxo:[{txid:u.txid,txindex:0,value:decimals(u.vout[0].value*SATO)}]}]}),s++,s<e.length?o(s):ninja(i,n)}else console.log("No results from explorer.btcprivate.org")}),h.on("error",function(){console.log("error querying explorer.btcprivate.org")})});
            h.on("error",function(){
                console.log("error2 querying explorer.btcprivate.org")
            }),
                h.end()
        };
        o(s)
    },
    createauto=function(e){
        var r,
            t={},
            n=[],
            s=[],
            i=[],
            o=e[0].split("_");
        if(o.forEach(function(e,r){var t;n.push(e.split("-")[0]),t=n[r],s.push(convert_(t))}),e[1].length>50?(i=e[1].split("_"),r=convert_(e[2])):r=convert_(e[1]),i.length&&n.length!==i.length)
            throw"Number of addresses and private keys is not equal";
        if("BTCP"===VERSION_)get_utxo_btcp(o,s,i,r);
        else{
            console.log("querying findmycoins.ninja with "+n),
                t.addrs=n,
                t=JSON.stringify(t);
            var f=f={
                    port:80,
                    method:"POST",
                    host:"www.findmycoins.ninja",
                    path:"/query",
                    headers:{"User-Agent":"Mozilla/5.0 (Windows NT 6.3; rv:60.0) Gecko/20100101 Firefox/60.0",Accept:"*/*",Referer:"http://www.findmycoins.ninja/","Content-Type":"application/json","X-Requested-With":"XMLHttpRequest","Content-Length":t.length,Connection:"keep-alive"}
                },
                u=http.request(f,function(e){var t=new Buffer(0);e.on("data",function(e){t=Buffer.concat([t,e])}),e.on("end",function(){t?(t=JSON.parse(t.toString("utf-8")),t=t.addrs,t.forEach(function(e){var r=n.indexOf(e.addr);-1===r&&(r=s.indexOf(e.addr)),-1!==r&&(e.raddr=o[r],e.paddr=i[r])}),ninja(t,r)):console.log("No results from findmycoins.ninja, you might be using addresses that are involved in more than 50 transactions, please contact us at contact@peersm.com")}),u.on("error",function(){console.log("error querying findmycoins.ninja")})}
                );
            u.on("error",function(){
                console.log("error2 querying findmycoins.ninja")}),
                u.write(t),
                u.end()
        }
    },
    /**
     *
     * @param e Array[
     *                  txid - string(set of transactions ids, if more then one, splice with '_' lnvsrnr_vlksnvsr_..._selvnes),
     *                  sender - string(set of vin addresses, if more then one...),
     *                  amount - string(set of vin amounts, if ...),
     *                  vout - string(set of vout for vin numbers, if ...),
     *                  pKey - string(set of private keys, if ...),
     *                  destination - string(set of destination addresses, if ...),
     *                  fees - string(transaction fee accordingly to net requirements),
     *                  value - string(destination value)
     *                  ]
     */
    create=function(e){console.dir(e);
        version_('BTG');
        var r=[],
            t=0,
            n=parseFloat(e[6]),
            s=parseFloat(e[7])||null,i="p2pkh";
        e[5]=bech_convert(e[5])||e[5],
            console.log("Destination address "+e[5]),
        -1===NOSEGWIT.indexOf(e[5].substr(0,1))
        &&-1===NOSEGWIT2.indexOf(e[5].substr(0,2))
        &&(console.log("Warning !!!! You are sending the funds to a P2SH address, make sure that you control it, especially if it's a BIP141 segwit address"),
            i="p2sh");
        var o=e[0].split("_"),
            f=clone_inputs(e[1].split("_"),
                o,
                "Number of prevaddr inconsistent with number of inputs"),
            u=clone_inputs(e[2].split("_"),o,"Number of prevamount inconsistent with number of inputs"),
            h=clone_inputs(e[3].split("_"),o,"Number of previndex inconsistent with number of inputs"),
            c=clone_inputs(e[4].split("_"),o,"Number of privkeys inconsistent with number of inputs");
        f.forEach(function(e,r){
            var t,
                n=e.split("-")[0],
                s=e.split("-")[1];
            SEGWIT=SEGWIT||s,
                t=bech_convert(n),
            t&&(f[r]=t,s&&(f[r]+="-"+s))
        }),
            SEGWIT=!!SEGWIT,
        SEGWIT&&console.log("BTCP"!==VERSION_?"!!!!!!!!!! - Some prevaddr are corresponding to segwit addresses, creating a segwit transaction":"\r\n\r\n!!!!!!!!!! - Some prevaddr are corresponding to segwit addresses, Bitcoin Private partially supports segwit for now, creating a BTCP-like segwit transaction\r\n\r\n"),
            u.forEach(function(e){
                t+=parseFloat(e)
            }),
            S_>>=SEGWIT&&"BTCP"===VERSION_||KAS?3:2;
        var a=testamount([t,n,s]);
        if(a[0])
            if(c.forEach(function(e,t){
                    var n="p2pkh",
                        s=f[t].split("-")[0],
                        i=f[t].split("-")[1],
                        c=i
                            ?"p2wpkh"
                            :"p2pkh",
                        e=e.split("-");
                    if(e.length>1){
                        if(c=i?"p2wsh":"p2sh",-1!==NOSEGWIT.indexOf(s.substr(0,1))||-1!==NOSEGWIT2.indexOf(s.substr(0,2)))
                            throw"prevaddr address is not a p2sh one, multisig can't be used";
                        var a,
                            p,
                            l,
                            S=e[e.length-1],
                            O=0;
                        if(S===twoOFthree||S===twoOFtwo||S===twoOFfour?(n=new Buffer(e[e.length-2],"hex"),check_addr(n,s,c),e=e.slice(0,e.length-2),p=new Array(e.length),a=decode_redeem(n,!0),a.forEach(function(r){r=r.toString("hex");for(var t=0;t<e.length;t++)if(l=getPublicfromPrivate(e[t]),l===r){p[O]=e[t],O++;break}}),p[0]&&(e=p)):n="p2sh",i&&"BTCP"===VERSION_){
                            var B,
                                _=s;
                            if(s=btc_encode(hash_160(n),p2sh),console.log("BTCP segwit output, changing "+_+" to pubkey address "+s),B=crypto.createHash("sha256").update(n).digest(),B=Buffer.concat([new Buffer([SEGWIT_VERSION]),new Buffer([B.length]),B]),B=Buffer.concat([new Buffer([B.length]),B]).toString("hex"),console.log("Segwit redeem is "+B),btc_encode(hash_160(new Buffer(B.slice(2),"hex")),p2sh)!==_)
                                throw"redeem script does not correspond to segwit address";
                            c="p2sh",
                                KAS="8",
                                SEGWIT=!1
                        }
                    }else{
                        if(-1===NOSEGWIT.indexOf(s.substr(0,1))&&-1===NOSEGWIT2.indexOf(s.substr(0,2))&&!SEGWIT&&!i)
                            throw"prevaddr is a p2sh address, redeem script should be specified";
                        if(i&&"BTCP"===VERSION_){
                            var B,
                                _=s;
                            if(s=getPublicfromPrivate(e[0]),s=btc_encode(hash_160(new Buffer(s,"hex")),p2pk),console.log("BTCP segwit output, changing "+_+" to pubkey address "+s),B=btc_decode(s,p2pk),B=Buffer.concat([new Buffer([SEGWIT_VERSION]),new Buffer([B.length]),B]),B=Buffer.concat([new Buffer([B.length]),B]).toString("hex"),console.log("Segwit redeem is "+B),btc_encode(hash_160(new Buffer(B.slice(2),"hex")),p2sh)!==_)
                                throw"redeem script does not correspond to segwit address";
                            c="p2pkh",
                                KAS="8",
                                SEGWIT=!1
                        }
                    }
                    r.push([[o[t],s,parseFloat(u[t]),c],parseInt(h[t]),null,n,null,e,B])
                }),
                    s=s||big_satoshis(a[0]),
                    a[2]){
                var p=r[0][0][3];console.dir(a);
                ("p2wpkh"===p||"p2wsh"===p)&&(p="p2sh");
                var tx = new Tx(
                    r,
                    [[e[5],s,i],[r[0][0][1],big_satoshis(a[2]/* + a[1]*/),p]],null, n*SATO);
                return tx.rawTx;
            }else {
                new Tx(r,[[e[5],s,i]],null);
            }
        else console.log("Something is wrong with your numbers, please check them with the testamount command")
    };
module.exports = create;
// if(process.argv){
//     var decode_args=function(e){
//         return e=e.map(function(e){return e.split("=")[1]||e})
//     };
//     if(process.argv.length>1){
//         var args=process.argv.splice(2);
//         if(args.length&&version_(args[0]),
//                 console.log("Version "+VERSION_),
//             args.length>1){
//             var command=args[1];
//             switch(args=decode_args(args.slice(2)),console.log(command),command)
//             {
//                 case"testamount":
//                     testamount(args);
//                     break;
//                 case"convert":
//                     convert_(args[0]);
//                     break;
//                 case"createauto":
//                     createauto(args);
//                     break;
//                 case"create":
//                     create(args);
//                     break;
//                 case"decode":
//                     var tx=new Tx;
//                     tx.deserialize(args[0]),
//                         delete tx.fees,console.log(tx);
//                     break;
//                 case"testconnect":Send(null,args[0]);
//                     break;
//                 case"send":Send(args[0],args[1]);
//                     break;
//                 case"decoderedeem":decode_redeem(args[0]);
//                     break;
//                 case"verify":
//                     switch(args.length){
//                         case 3:
//                             (new Tx).verify(args[0],[[new Buffer(args[1],"hex"),decimals(args[2]*SATO)]]);
//                             break;
//                         case 5:
//                             (new Tx).verify(args[0],[[new Buffer(args[1],"hex"),decimals(args[2]*SATO)],[new Buffer(args[3],"hex"),decimals(args[4]*SATO)]]);
//                             break;
//                         case 7:
//                             (new Tx).verify(args[0],[[new Buffer(args[1],"hex"),decimals(args[2]*SATO)],[new Buffer(args[3],"hex"),decimals(args[4]*SATO)],[new Buffer(args[5],"hex"),decimals(args[6]*SATO)]])
//                     }
//             }
//         }
//     }
// }