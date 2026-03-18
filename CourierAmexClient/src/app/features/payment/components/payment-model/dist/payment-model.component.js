"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PaymentModelComponent = void 0;
var core_1 = require("@angular/core");
var PaymentModelComponent = /** @class */ (function () {
    function PaymentModelComponent(activeModal, paymentService, credentialsService) {
        this.activeModal = activeModal;
        this.paymentService = paymentService;
        this.credentialsService = credentialsService;
        this.onFormSubmit = new core_1.EventEmitter();
        this.data = {};
        this.selectedCurrency = '0';
        this.errorMessage = '';
        this.paymentType = [];
        this.subPaymentType = [];
        this.isPayTypeCash = false;
        this.isRefrence = false;
    }
    PaymentModelComponent.prototype.ngOnInit = function () {
        var _a, _b;
        if (this.credentialsService.isGatewayUser()) {
            this.getPaymentType((_b = (_a = this.credentialsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId) !== null && _b !== void 0 ? _b : 0);
        }
        this.data.selectedPaymentId = 0;
    };
    PaymentModelComponent.prototype.ngOnChanges = function (changes) {
        var _a;
        if ((_a = changes['data']) === null || _a === void 0 ? void 0 : _a.currentValue) {
            console.log('Current Data:', changes['data'].currentValue);
        }
    };
    PaymentModelComponent.prototype.onCurrencyChange = function (value) {
        this.selectedCurrency = value;
        Object.assign(this.data, { payReceived: '', change: '', selectedSubPaymentId: 0 });
        this.errorMessage = '';
    };
    PaymentModelComponent.prototype.validateAmount = function () {
        var payReceived = Number(this.data.payReceived);
        var total = this.selectedCurrency === '1' ? this.data.totalDollar : this.data.totalLocal;
        var isPayModel = this.data.isPayModel;
        var isPartial = this.data.isPartialPayment;
        if (isPayModel && payReceived < total) {
            this.errorMessage = 'Please enter a value greater than or equal to the total';
            this.data.change = '';
            return;
        }
        if (!isPayModel && payReceived > total) {
            this.errorMessage = 'Please enter a value less than or equal to the total';
            return;
        }
        this.data.change = isPayModel && this.isPayTypeCash && !isPartial ? (payReceived - total) : '';
        this.errorMessage = '';
    };
    PaymentModelComponent.prototype.onSubmit = function () {
        this.validateAmount();
        if (!this.errorMessage) {
            this.onFormSubmit.emit(this.data);
            //console.log('Payment Data:', this.data);
        }
    };
    PaymentModelComponent.prototype.onCancel = function () {
        this.activeModal.dismiss();
    };
    PaymentModelComponent.prototype.getPaymentType = function (companyId) {
        var _this = this;
        this.paymentService.getPaymentType(companyId).subscribe(function (res) {
            _this.paymentType = res;
        });
    };
    PaymentModelComponent.prototype.getSubPaymentType = function () {
        var _this = this;
        var _a, _b;
        debugger;
        this.isPayTypeCash = this.data.selectedPaymentId == 1;
        this.isRefrence = ["4", "14", "2", "3"].includes(this.data.selectedPaymentId);
        this.paymentService.getSubPaymentTypeByPaymentId((_b = (_a = this.credentialsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId) !== null && _b !== void 0 ? _b : 0, this.data.selectedPaymentId, this.data.pointOfSaleId).subscribe(function (res) {
            _this.subPaymentType = res;
        });
    };
    PaymentModelComponent.prototype.onSubTypeChange = function () {
        var _this = this;
        var subPayment = this.subPaymentType.find(function (x) { return x.subPaymentId == _this.data.selectedSubPaymentId; });
        if (subPayment.currencyCode == "188") {
            this.selectedCurrency = '0';
        }
        else if (subPayment.currencyCode == "840") {
            this.selectedCurrency = '1';
        }
    };
    __decorate([
        core_1.Output()
    ], PaymentModelComponent.prototype, "onFormSubmit");
    __decorate([
        core_1.Input()
    ], PaymentModelComponent.prototype, "data");
    PaymentModelComponent = __decorate([
        core_1.Component({
            selector: 'app-payment-model',
            templateUrl: './payment-model.component.html'
        })
    ], PaymentModelComponent);
    return PaymentModelComponent;
}());
exports.PaymentModelComponent = PaymentModelComponent;
