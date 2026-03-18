"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PaymentService = void 0;
var http_1 = require("@angular/common/http");
var core_1 = require("@angular/core");
var _core_1 = require("@app/@core");
var PaymentService = /** @class */ (function (_super) {
    __extends(PaymentService, _super);
    function PaymentService(configService, http) {
        return _super.call(this, configService, http, 'Payment') || this;
    }
    PaymentService.prototype.DetailsForDeliveryProof = function (packageNumber) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/PrepareDeliveryProof?packageNumber=" + packageNumber);
    };
    PaymentService.prototype.sendEmail = function (htmlTemplate, email) {
        var _a;
        var payload = { htmlTemplate: htmlTemplate, email: email };
        return this.http.post(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/SendEmail", payload);
    };
    PaymentService.prototype.getPointOfSale = function (companyId, user, state) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/GetPointOfSale?CompanyId=" + companyId + "&User=" + user + "&State=" + state);
    };
    PaymentService.prototype.startPointOfSale = function (companyId, user, pointOfSaleId, inDollars, inLocal) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/StartPointOfSale?CompanyId=" + companyId + "&User=" + user + "&pointOfSaleId=" + pointOfSaleId + "&inDollars=" + inDollars + "&inLocal=" + inLocal);
    };
    PaymentService.prototype.getPaymentType = function (companyId) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/GetPaymentType?CompanyId=" + companyId);
    };
    PaymentService.prototype.getSubPaymentTypeByPaymentId = function (companyId, paymentId, pointOfSaleId) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/GetSubPaymentTypeByPaymentId?companyId=" + companyId + "&paymentId=" + paymentId + "&pointOfSaleId=" + pointOfSaleId);
    };
    PaymentService.prototype.paymentForInvoice = function (customerId, invoiceCSV, localAmount, dollarAmount, paidAmount, changeAmount, currencyCode, paymentType, subPaymentTypeId, reference, pointOfSaleId, companyId, partialPayment, creditPayment, user) {
        var _a;
        var params = new http_1.HttpParams()
            .set('customerId', customerId.toString())
            .set('invoiceCSV', invoiceCSV)
            .set('localAmount', localAmount.toString())
            .set('dollarAmount', dollarAmount.toString())
            .set('paidAmount', paidAmount.toString())
            .set('changeAmount', changeAmount.toString())
            .set('currencyCode', currencyCode.toString())
            .set('paymentType', paymentType)
            .set('subPaymentTypeId', subPaymentTypeId.toString())
            .set('reference', reference)
            .set('pointOfSaleId', pointOfSaleId.toString())
            .set('companyId', companyId.toString())
            .set('partialPayment', partialPayment.toString())
            .set('creditPayment', creditPayment.toString())
            .set('user', user);
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Payment/PaymentForInvoices", { params: params });
    };
    PaymentService = __decorate([
        core_1.Injectable()
    ], PaymentService);
    return PaymentService;
}(_core_1.GenericService));
exports.PaymentService = PaymentService;
