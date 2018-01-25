import { Component, OnInit } from '@angular/core';
import { config } from '../config';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslatorService} from '../translator';
import {AccountsService} from '../_services/accounts.service';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-t-start',
    templateUrl: './start.component.html',
    styleUrls: ['../app.component.css']
})
export class StartComponent implements OnInit {
    currencies: any;
    langs: any;
    selectedLang: string;
    just: string;
    selectedCurrency: string;
    eth: any;
    networks: {};
    accounts: any;
    aForm: any;
    wait: boolean;
    public addForm: FormGroup;
    constructor(
        public trans: TranslatorService,
        public aService: AccountsService,
        private fBuilder: FormBuilder) {
        this.currencies = config().currencies;
        this.langs = config().app.lang;
    }
    ngOnInit() {
        this.trans.set('EN');
        this.just = 'fill';
        this.selectedCurrency = 'ETH';
        this.accounts = [];
        this.currencies.forEach(
            el => this.accounts[el.symbol] = []
        );
        this.networks = {
            ETH: this.currencies.filter(e => e.symbol === 'ETH')[0].networks[0],
            BTC: this.currencies.filter(e => e.symbol === 'BTC')[0].networks[0],
            LTC: this.currencies.filter(e => e.symbol === 'LTC')[0].networks[0],
            BTG: this.currencies.filter(e => e.symbol === 'BTG')[0].networks[0],
            BCH: this.currencies.filter(e => e.symbol === 'BCH')[0].networks[0]
        };
        this.currencies.forEach(e => {
            this.networks[e.symbol] = e.networks[0];
        });
        this.addForm = this.fBuilder.group({
            new: false,
            passphrase: ['', [Validators.required, Validators.minLength(8),
                Validators.maxLength(256)]],
            cpass: ['', [Validators.required, Validators.minLength(8),
                Validators.maxLength(256)]],
            keyfile: ['', [Validators.required]],
        });
        this.initAForm();
        this.wait = false;
        this.tabInit();
    }
    sc($event: NgbTabChangeEvent) {
        this.selectedCurrency = $event.nextId;
        // this.networks = this.currencies.filter(e => { return e.symbol === this.selectedCurrency; })[0].networks;
    }
    setLang(lang: string) {
        console.dir(lang);
        this.trans.set(lang);
    }
    getAccounts(symbol: string, network: string): any {
        console.log(symbol + ' ' + network);
        if (symbol === 'all') { return this.aService.getAccounts();
        } else {
            return this.aService.getAccounts()
                .filter(el => el.symbol === symbol && el.network === network);
        }
    }
    getTxs(e: any, account: any) {
        e.preventDefault();
        this.aService.getAccountTransactions(account, txs => {
            console.dir(txs);
            console.dir(account);
        });
    }
    addAccount(accSymbol: string, network: string) {
        this.aForm.enable = true;
        // console.log(accSymbol);
        // console.dir(this.getAccounts(accSymbol, network));
    }
    openAccount(accSymbol: string) {
        console.log(accSymbol);
    }
    selectNetwork(network: string, symbol: string) {
        this.networks[symbol] = network;
    }
    generateAccount(currency: string, network: string) {
        console.dir('');
    }
    initAForm() {
    const self = this;
    self.aForm = {};
    self.aForm.step = 1;
    self.aForm.enable = false;
    self.aForm.next = true;
    self.aForm.validation = function(): boolean {
        console.log('Next' + self.aForm.step);
        switch (self.aForm.step) {
            case 1:
                self.aForm.error = null;
                self.aForm.next = true;
                return true;
            case 2:
                console.log('1' + self.aForm.next);
                if (self.addForm.get('passphrase').status === 'INVALID') {
                    self.aForm.error = self.trans.translate('err.passphrase_length');
                    self.aForm.next = false;
                    console.log('2' + self.aForm.next);
                    return false;
                } else if (self.addForm.get('new').value
                    && self.addForm.get('passphrase').value !== self.addForm.get('cpass').value) {
                    self.aForm.error = self.trans.translate('err.passphrase_cpass');
                    self.aForm.next = false;
                    console.log('3' + self.aForm.next);
                    return false;
                } else {
                    self.aForm.error = null;
                    self.aForm.next = true;
                    console.log('4' + self.aForm.next);
                    return true;
                }
            case 3:
                console.log('5' + self.aForm.next);
                if (!self.addForm.get('new').value &&
                    self.addForm.get('keyfile').status !== 'INVALID') {
                    console.dir(self.addForm.get('keyfile'));
                }
            default:
                return false;
        }
    };
    self.aForm.makeStep = function(e) {
        if (e.name === 'next') {
            self.aForm.step = self.aForm.step < 3 ? self.aForm.step + 1 : 3;
        } else {
            self.aForm.step = self.aForm.step > 1 ? self.aForm.step - 1 : 1;
        }
        self.aForm.validation();
         // 20400074498630 4-e
        console.log(self.aForm.step);
        console.log(self.addForm.get('passphrase').value);
        console.log(self.addForm.get('cpass').value);
        console.log(self.addForm.get('new').value);
        console.dir(self.addForm.get('keyfile'));
        console.dir(self.aForm.next);
        if (self.aForm.step === 3) {
            self.aForm.next = false;
            if (self.addForm.get('new').value) {
                console.log('Generate Account');
                self.aForm.createAccount();
            }
        }
    };
    self.aForm.open = function(files) {
        self.wait = true;
        const params = {
            passphrase: self.addForm.get('passphrase').value,
            symbol: self.selectedCurrency,
            network: self.networks[self.selectedCurrency],
            keyFile: files.target.files[0]
        };
        console.log('Open Account');
        console.dir(params);
        self.aService.openAccount(params, account => {
            self.wait = false;
            console.dir(account);
            self.accounts[params.symbol].push(account);
            console.log('Account response');
            self.aForm.close();
        });
        };
    self.aForm.createAccount = function() {
        self.wait = true;
        const params = {
            passphrase: self.addForm.get('passphrase').value,
            symbol: self.selectedCurrency,
            network: self.networks[self.selectedCurrency]
        };
        console.log('Generate');
        console.dir(params);
        self.aService.createAccount(params, account => {
            self.wait = false;
            self.accounts[params.symbol].push(account);
            console.dir(account);
            self.aForm.close();
        });
    };
    self.aForm.close = function() {
        self.initAForm();
        self.addForm.reset();
    };
}
    toDateString(date: Date): string {
        const days = (date.getDate().toString().length < 2) ? '0' + date.getDate()
                : date.getDate(),
            month = ((date.getMonth() + 1).toString().length < 2) ? '0' + (date.getMonth() + 1)
                : (date.getMonth() + 1);
        return days + '.' + month + '.' + date.getFullYear();
    }
    toTimeString(date: Date): string {
        const hours = (date.getHours().toString().length < 2) ? '0' + date.getHours()
            : date.getHours(),
            minutes = (date.getMinutes().toString().length < 2) ? '0' + date.getMinutes()
                : date.getMinutes(),
            seconds = (date.getSeconds().toString().length < 2) ? '0' + date.getSeconds()
                : date.getSeconds();
        return hours + ':' + minutes + ':' + seconds;
    }
    tabSelect(event) {
        const target = event.target.tagName === 'LI' ?
            event.target : event.target.parentElement,
            lis = document.querySelectorAll('#t-tabset LI');
        for (let k = 0; k < lis.length; k++) {
            lis.item(k).className = '';
        }
        target.className = 'active';
        /*target.style.animationName =
            target.style.animationName === 'left' ? 'right' : 'left';
        console.dir(event.target);
        target.style.animationDuration = '1s';
        target.style.animationTimingFunction = 'cubic-bezier(0.5, 0, 0, 1)';
        target.style.animationDirection = 'normal';
        target.style.animationIterationCount = '1';
        target.style.animationFillMode = 'forwards';*/
    }
    tabInit() {
        window.onresize = () => {
            const tabsetHeader = document.getElementById('t-tabset-header'),
                tabSet = document.getElementById('t-tabset'),
                tabItems = document.querySelectorAll('.t-tabset-item'),
                ffa = tabsetHeader.parentElement.getElementsByClassName('t-step');
             let tabsLen = 0;
            for (let i = 0; i < tabItems.length; i++) {
                tabsLen += tabItems[i].clientWidth;
            }
            console.log (tabsLen + ' ' + tabSet.offsetWidth);
            if (tabsLen > tabSet.offsetWidth) {
                tabSet.style.width = tabsLen + 'px';
                // const mar = tabSet.style.marginLeft.replace('px','');
                // tabSet.style.marginLeft = Number(mar) - 30 + 'px';
                console.log(tabSet.style.marginLeft);
                ffa.item(0).className = ffa.item(0).className.indexOf(' t-visible') ?
                    ffa.item(0).className + ' t-visible' :
                    ffa.item(0).className;
                ffa.item(1).className = ffa.item(1).className.indexOf(' t-visible') ?
                    ffa.item(1).className + ' t-visible' :
                    ffa.item(1).className;
            } else {
                tabSet.style.width = '100%';
                // const mar = tabSet.style.marginLeft.replace('px','');
                // tabSet.style.marginLeft = Number(mar) + 30 + 'px';
                ffa.item(0).className = ffa.item(0).className.indexOf(' t-visible') ?
                    ffa.item(0).className.replace(' t-visible', '') :
                    ffa.item(0).className;
                ffa.item(1).className = ffa.item(1).className.indexOf(' t-visible') ?
                    ffa.item(1).className.replace(' t-visible', '') :
                    ffa.item(1).className;
            }
        };
    }
}