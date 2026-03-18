"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PendingInvoicesCustomerComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/models");
var rxjs_1 = require("rxjs");
var sweetalert2_1 = require("sweetalert2");
var payment_model_component_1 = require("../payment-model/payment-model.component");
var PendingInvoicesCustomerComponent = /** @class */ (function () {
    function PendingInvoicesCustomerComponent(loading, translate, commonService, messageService, changeDetectorRef, credentailsService, customerService, invoiceService, activeModal, modalService, paymentService) {
        var _this = this;
        this.loading = loading;
        this.translate = translate;
        this.commonService = commonService;
        this.messageService = messageService;
        this.changeDetectorRef = changeDetectorRef;
        this.credentailsService = credentailsService;
        this.customerService = customerService;
        this.invoiceService = invoiceService;
        this.activeModal = activeModal;
        this.modalService = modalService;
        this.paymentService = paymentService;
        this.closePage = new core_1.EventEmitter();
        this.pagination = models_1.defaultPagination;
        this.selectedCompany = undefined;
        this._companies = new rxjs_1.BehaviorSubject([]);
        this.companies$ = this._companies.asObservable();
        this._entities = new rxjs_1.BehaviorSubject([]);
        this.entities$ = this._entities.asObservable();
        this.showCompanies = false;
        this.columns = [];
        this.rows = [];
        this.selectedStatusList = [];
        this.isInvalidPayment = false;
        this.packageListByInvoice = [];
        this.invoicePendingPayment = true;
        this.fullName = '';
        this.totalDollar = 0;
        this.totalLocal = 0;
        this.customerCode = '';
        this.state = {
            page: 1,
            pageSize: 10,
            searchTerm: '',
            sortColumn: 'number',
            sortDirection: 'DESC'
        };
        this.translations = {
            companyName: '',
            code: '',
            fullName: '',
            action: ''
        };
        this.showCompanies = !this.credentailsService.isGatewayUser();
        this.pagination.s = this.state.sortColumn + " " + this.state.sortDirection;
        this.translate.get([
            'InvoiceHistory.CustomerCode',
            'InvoiceHistory.CustomerName',
            'InvoiceHistory.Company',
            'Labels.Actions'
        ])
            .subscribe(function (translations) {
            _this.translations.code = translations['InvoiceHistory.CustomerCode'];
            _this.translations.fullName = translations['InvoiceHistory.CustomerName'];
            _this.translations.companyName = translations['InvoiceHistory.Company'];
            _this.translations.action = translations['Labels.Actions'];
        });
    }
    PendingInvoicesCustomerComponent.prototype.ngOnInit = function () {
        this.loadAttributes();
        this.setDefaultCompany();
    };
    PendingInvoicesCustomerComponent.prototype.ngAfterViewInit = function () {
        this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
        this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
        this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
        this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
        this.changeDetectorRef.detectChanges();
    };
    PendingInvoicesCustomerComponent.prototype.onStateChange = function (state) {
        this.state = __assign({}, state);
        this.pagination = __assign(__assign({}, this.pagination), { c: state.searchTerm, pi: state.page, ps: state.pageSize, s: state.sortColumn + " " + state.sortDirection });
        this.performSearch();
    };
    PendingInvoicesCustomerComponent.prototype.selectCompany = function (entity) {
        var _a, _b, _c;
        this.selectedCompany = entity;
        this.onStateChange({
            searchTerm: ((_a = this.state) === null || _a === void 0 ? void 0 : _a.searchTerm) || '',
            page: 1,
            pageSize: ((_b = this.state) === null || _b === void 0 ? void 0 : _b.pageSize) || models_1.defaultPagination.ps,
            sortColumn: (_c = this.state) === null || _c === void 0 ? void 0 : _c.sortColumn,
            sortDirection: this.state.sortDirection
        });
    };
    PendingInvoicesCustomerComponent.prototype.performSearch = function () {
        var _this = this;
        this.loading.show();
        this.pagination.tr = 0;
        this.pagination.ti = 0;
        var companyId = this.selectedCompany !== undefined ? this.selectedCompany.id : 0;
        this.customerService.getPagedByCompany$(this.pagination, companyId)
            .pipe(rxjs_1.filter(function (res) { var _a; return (res === null || res === void 0 ? void 0 : res.success) && ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.length) > 0; }), rxjs_1.finalize(function () {
            _this.updatePagination();
            _this.loading.hide();
        }))
            .subscribe({
            next: function (res) {
                _this._entities.next(res.data);
                _this.pagination.ti = res === null || res === void 0 ? void 0 : res.totalRows;
            },
            error: function (error) {
                console.error(error);
                sweetalert2_1["default"].fire(_this.messageService.getTranslate('Labels.Error'), _this.messageService.getTranslate('Labels.InternalError'), 'error');
            }
        });
    };
    PendingInvoicesCustomerComponent.prototype.loadAttributes = function () {
        var _this = this;
        this.loading.show();
        this._companies.next([]);
        rxjs_1.forkJoin({
            companies: this.commonService.getCompanies$()
        })
            .subscribe({
            next: function (res) {
                var _a;
                if (res.companies && res.companies.length > 0) {
                    _this._companies.next((_a = res.companies) !== null && _a !== void 0 ? _a : []);
                    _this.selectCompany(res.companies[0]);
                    _this._companies.pipe(rxjs_1.take(1)).subscribe(function () {
                        _this.setDefaultCompany();
                    });
                }
                _this.loading.hide();
            },
            error: function (error) {
                console.error(error);
                _this.loading.hide();
                sweetalert2_1["default"].fire(_this.messageService.getTranslate('Labels.Error'), _this.messageService.getTranslate('Labels.InternalError'), 'error');
            }
        });
    };
    PendingInvoicesCustomerComponent.prototype.setDefaultCompany = function () {
        var _this = this;
        if (this.credentailsService.isGatewayUser()) {
            var cias = this._companies.value;
            if (cias && cias.length > 0) {
                var userCia = cias.find(function (c) { var _a; return c.id === ((_a = _this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId); });
                if (userCia) {
                    this.selectCompany(userCia);
                    return;
                }
            }
        }
        setTimeout(function () {
            _this.performSearch();
        }, 100);
    };
    PendingInvoicesCustomerComponent.prototype.viewDetail = function (param) {
        var _this = this;
        var _a;
        this.selectedRow = param;
        param.companyId = (_a = this.selectedCompany) === null || _a === void 0 ? void 0 : _a.id;
        console.log(param);
        this.fullName = param.fullName;
        this.customerCode = param.code;
        this.invoiceService.InvoicesPendingByCustomer(param.code).subscribe({
            next: function (response) { return _this.InvoiceCraditsDetail = response.data; },
            error: function (err) { return console.error('Error fetching invoices:', err); }
        });
    };
    PendingInvoicesCustomerComponent.prototype.updatePagination = function () {
        var _a;
        this.pagination = __assign(__assign({}, this.pagination), { tr: ((_a = this._entities.value) === null || _a === void 0 ? void 0 : _a.length) || 0 });
    };
    PendingInvoicesCustomerComponent.prototype.closeScreen = function () {
        this.closePage.emit();
    };
    PendingInvoicesCustomerComponent.prototype.invoicePendingPaymentDetail = function (event) {
        var unChecked = event.unChecked, balance = event.balance, localBalance = event.localBalance, status = event.status, invoiceNumber = event.invoiceNumber;
        var statusArray = status.toString().split(',').map(function (s) { return s.trim(); });
        if (unChecked) {
            this.removeInvoice(invoiceNumber, balance, localBalance, statusArray);
            this.selectedInvoiceList = this.selectedInvoiceList
                .split(',')
                .filter(function (inv) { return inv !== invoiceNumber; })
                .join(',');
        }
        else {
            this.addInvoice(event, balance, localBalance, statusArray);
            var invoices = this.selectedInvoiceList ? this.selectedInvoiceList.split(',') : [];
            if (!invoices.includes(invoiceNumber)) {
                invoices.push(invoiceNumber);
            }
            this.selectedInvoiceList = invoices.join(',');
        }
        this.isInvalidPayment = this.selectedStatusList.includes('0') && this.selectedStatusList.includes('3');
    };
    PendingInvoicesCustomerComponent.prototype.addInvoice = function (event, balance, localBalance, statusArray) {
        this.getPackageByInvoice(event);
        this.totalDollar += balance;
        this.totalLocal += localBalance;
        this.selectedStatusList = __spreadArrays(new Set(__spreadArrays(this.selectedStatusList, statusArray)));
    };
    PendingInvoicesCustomerComponent.prototype.removeInvoice = function (invoiceNumber, balance, localBalance, statusArray) {
        this.packageListByInvoice = this.packageListByInvoice.filter(function (item) { return item.invoiceNumber !== invoiceNumber; });
        this.totalDollar -= balance;
        this.totalLocal -= localBalance;
        this.selectedStatusList = this.selectedStatusList.filter(function (status) { return !statusArray.includes(status); });
        this.isValidPartialPayment();
    };
    PendingInvoicesCustomerComponent.prototype.getPackageByInvoice = function (invoice) {
        var _this = this;
        this.loading.show();
        this.invoiceService.GetPackagesByInvoice(invoice.invoiceNumber).subscribe({
            next: function (response) {
                _this.loading.hide();
                if (response.success) {
                    _this.packageListByInvoice = __spreadArrays(_this.packageListByInvoice, response.data);
                    _this.isValidPartialPayment();
                }
            },
            error: function (err) {
                console.error('Error fetching invoices:', err);
                _this.loading.hide();
            }
        });
    };
    PendingInvoicesCustomerComponent.prototype.openPaymentModal = function (isPartialPayment, isPayModel) {
        var _this = this;
        if (!this.selectedStatusList.length) {
            sweetalert2_1["default"].fire("Warning", "Please select an invoice to make payment.", "warning");
            return;
        }
        if (isPartialPayment && this.partialPaymentInValid) {
            sweetalert2_1["default"].fire("Warning", "Please select a single invoice to make partial payment.", "warning");
            return;
        }
        if (this.isInvalidPayment) {
            sweetalert2_1["default"].fire("Warning", "Cannot make payment. Please select a valid invoice.", "warning");
            return;
        }
        var modalRef = this.modalService.open(payment_model_component_1.PaymentModelComponent, {
            size: 'lg', backdrop: 'static', keyboard: false, centered: true
        });
        modalRef.componentInstance.data = {
            isPartialPayment: isPartialPayment,
            isPayModel: isPayModel,
            totalDollar: this.totalDollar,
            totalLocal: this.totalLocal,
            customerCode: this.customerCode,
            pointOfSaleId: this.selectedPointOfSale.pointOfSaleId
        };
        modalRef.componentInstance.onFormSubmit.subscribe(function (paymentData) {
            console.log('Received payment data from modal:', paymentData);
            _this.submitForToPaynment(paymentData);
        });
    };
    PendingInvoicesCustomerComponent.prototype.submitForToPaynment = function (paymentData) {
        var _a, _b, _c, _d;
        var obj = {
            customerId: this.selectedRow.id,
            invoiceCSV: this.selectedInvoiceList,
            localAmount: this.totalLocal,
            dollarAmount: this.totalDollar,
            paidAmount: this.partialPaymentInValid ? this.totalDollar : 0,
            changeAmount: 0,
            currencyCode: 188,
            paymentType: "CASH",
            subPaymentTypeId: 1,
            reference: "This is reference for Payment",
            pointOfSaleId: this.selectedPointOfSale.pointOfSaleId,
            companyId: (_a = this.selectedCompany) === null || _a === void 0 ? void 0 : _a.id,
            partialPayment: false,
            creditPayment: false,
            user: (_b = this.credentailsService.credentials) === null || _b === void 0 ? void 0 : _b.user.username
        };
        if (Array.isArray(obj.invoiceCSV)) {
            obj.invoiceCSV = obj.invoiceCSV.join(",");
        }
        this.paymentService.paymentForInvoice(obj.customerId, obj.invoiceCSV, obj.localAmount, obj.dollarAmount, obj.paidAmount, obj.changeAmount, obj.currencyCode, obj.paymentType, obj.subPaymentTypeId, obj.reference, obj.pointOfSaleId, (_c = obj.companyId) !== null && _c !== void 0 ? _c : 0, obj.partialPayment, obj.creditPayment, (_d = obj.user) !== null && _d !== void 0 ? _d : "").subscribe({
            next: function () {
                console.log("Payment Done");
            },
            error: function (err) {
                console.error("Payment Failed:", err);
            }
        });
    };
    PendingInvoicesCustomerComponent.prototype.Payment = function () {
        this.openPaymentModal(false, true);
    };
    PendingInvoicesCustomerComponent.prototype.partialPayment = function () {
        this.openPaymentModal(true, false);
    };
    PendingInvoicesCustomerComponent.prototype.isValidPartialPayment = function () {
        var _a;
        this.partialPaymentInValid = new Set((_a = this.packageListByInvoice) === null || _a === void 0 ? void 0 : _a.map(function (x) { return x.invoiceNumber; })).size > 1;
    };
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], PendingInvoicesCustomerComponent.prototype, "actionTemplate");
    __decorate([
        core_1.Output()
    ], PendingInvoicesCustomerComponent.prototype, "closePage");
    __decorate([
        core_1.Input()
    ], PendingInvoicesCustomerComponent.prototype, "selectedPointOfSale");
    PendingInvoicesCustomerComponent = __decorate([
        core_1.Component({
            selector: 'app-pending-invoices-customer',
            templateUrl: './pending-invoices-customer.component.html'
        })
    ], PendingInvoicesCustomerComponent);
    return PendingInvoicesCustomerComponent;
}());
exports.PendingInvoicesCustomerComponent = PendingInvoicesCustomerComponent;
