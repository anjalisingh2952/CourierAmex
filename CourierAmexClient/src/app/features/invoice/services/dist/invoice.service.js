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
exports.InvoiceService = void 0;
var core_1 = require("@angular/core");
var _core_1 = require("@app/@core");
var rxjs_1 = require("rxjs");
var InvoiceService = /** @class */ (function (_super) {
    __extends(InvoiceService, _super);
    function InvoiceService(configService, http, loading) {
        var _this = _super.call(this, configService, http, 'Invoice') || this;
        _this.loading = loading;
        return _this;
    }
    InvoiceService.prototype.CustomerDetailsByClientId = function (clientId, fromDate, toDate, filters) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Invoice/CustomerDetailsByClientId?clientId=" + clientId + "&fromDate=" + fromDate + "&toDate=" + toDate + "&filters=" + filters);
    };
    InvoiceService.prototype.InvoicesPendingByCustomer = function (clientId) {
        var _this = this;
        var _a;
        this.loading.show();
        var url = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Invoice/InvoicesPendingByCustomer?clientId=" + clientId;
        return this.http.get(url).pipe(rxjs_1.finalize(function () { return _this.loading.hide(); }));
    };
    InvoiceService.prototype.GetPackagesByInvoice = function (invoiceNumber) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Invoice/GetPackagesByInvoice?invoiceNumber=" + invoiceNumber);
    };
    InvoiceService.prototype.GetPaymentDetails = function (companyId, paymentId) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Invoice/GetPaymentDetails?companyId=" + companyId + "&paymentId=" + paymentId);
    };
    InvoiceService.prototype.PrepareInvoice = function (invoiceId, downloadPDF) {
        var _a;
        return this.http.get(((_a = this.config) === null || _a === void 0 ? void 0 : _a.apiUrl) + "v1/Invoice/PrepareInvoice?invoiceId=" + invoiceId + "&downloadPDF=" + downloadPDF, {
            responseType: downloadPDF ? 'blob' : 'text'
        });
    };
    InvoiceService = __decorate([
        core_1.Injectable()
    ], InvoiceService);
    return InvoiceService;
}(_core_1.GenericService));
exports.InvoiceService = InvoiceService;
