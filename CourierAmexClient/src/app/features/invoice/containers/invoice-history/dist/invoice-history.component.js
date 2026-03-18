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
exports.__esModule = true;
exports.InvoiceHistoryComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/models");
var rxjs_1 = require("rxjs");
var sweetalert2_1 = require("sweetalert2");
var InvoiceHistoryComponent = /** @class */ (function () {
    function InvoiceHistoryComponent(loading, translate, commonService, messageService, changeDetectorRef, credentailsService, customerService, invoiceService) {
        var _this = this;
        this.loading = loading;
        this.translate = translate;
        this.commonService = commonService;
        this.messageService = messageService;
        this.changeDetectorRef = changeDetectorRef;
        this.credentailsService = credentailsService;
        this.customerService = customerService;
        this.invoiceService = invoiceService;
        this.pagination = models_1.defaultPagination;
        this.selectedCompany = undefined;
        this.selectedStatus = undefined;
        this._companies = new rxjs_1.BehaviorSubject([]);
        this.companies$ = this._companies.asObservable();
        this._packageStatus = new rxjs_1.BehaviorSubject([]);
        this.packageStatus$ = this._packageStatus.asObservable();
        this._entities = new rxjs_1.BehaviorSubject([]);
        this.entities$ = this._entities.asObservable();
        this.showCompanies = false;
        this.selectedCustomer = [];
        this.columns = [];
        this.rows = [];
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
    InvoiceHistoryComponent.prototype.ngOnInit = function () {
        this.loadAttributes();
        this.setDefaultCompany();
    };
    InvoiceHistoryComponent.prototype.ngAfterViewInit = function () {
        this.columns.push({ field: 'code', label: this.translations.code, sortable: true });
        this.columns.push({ field: 'fullName', label: this.translations.fullName, sortable: true });
        this.columns.push({ field: 'companyName', label: this.translations.companyName, sortable: true });
        this.columns.push({ field: 'action', label: this.translations.action, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
        this.changeDetectorRef.detectChanges();
    };
    InvoiceHistoryComponent.prototype.onStateChange = function (state) {
        this.state = __assign({}, state);
        this.pagination = __assign(__assign({}, this.pagination), { c: state.searchTerm, pi: state.page, ps: state.pageSize, s: state.sortColumn + " " + state.sortDirection });
        this.performSearch();
    };
    InvoiceHistoryComponent.prototype.selectCompany = function (entity) {
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
    InvoiceHistoryComponent.prototype.selectStatus = function (entity) {
        var _a, _b, _c;
        this.selectedStatus = entity;
        this.onStateChange({
            searchTerm: ((_a = this.state) === null || _a === void 0 ? void 0 : _a.searchTerm) || '',
            page: 1,
            pageSize: ((_b = this.state) === null || _b === void 0 ? void 0 : _b.pageSize) || models_1.defaultPagination.ps,
            sortColumn: (_c = this.state) === null || _c === void 0 ? void 0 : _c.sortColumn,
            sortDirection: this.state.sortDirection
        });
    };
    InvoiceHistoryComponent.prototype.performSearch = function () {
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
    InvoiceHistoryComponent.prototype.loadAttributes = function () {
        var _this = this;
        this.loading.show();
        this._companies.next([]);
        rxjs_1.forkJoin({
            companies: this.commonService.getCompanies$(),
            packageStatus: this.commonService.getPackageStatus$()
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
                if (res.packageStatus && res.packageStatus.length > 0) {
                    _this._packageStatus.next(res.packageStatus);
                    _this.selectStatus(res.packageStatus[0]);
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
    InvoiceHistoryComponent.prototype.setDefaultCompany = function () {
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
    InvoiceHistoryComponent.prototype.viewDetail = function (param) {
        var _this = this;
        var _a;
        debugger;
        param.companyId = (_a = this.selectedCompany) === null || _a === void 0 ? void 0 : _a.id;
        this.selectedCustomer = param;
        this.invoiceService.InvoicesPendingByCustomer(param.code).subscribe({
            next: function (response) {
                _this.InvoiceCraditsDetail = response.data;
            },
            error: function (err) {
                console.error('Error fetching invoices:', err);
            },
            complete: function () {
                console.log('Request completed successfully');
            }
        });
    };
    InvoiceHistoryComponent.prototype.updatePagination = function () {
        var entities = this._entities.value;
        this.pagination = __assign(__assign({}, this.pagination), { tr: entities === null || entities === void 0 ? void 0 : entities.length });
    };
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], InvoiceHistoryComponent.prototype, "actionTemplate");
    InvoiceHistoryComponent = __decorate([
        core_1.Component({
            selector: 'app-invoice-history',
            templateUrl: './invoice-history.component.html'
        })
    ], InvoiceHistoryComponent);
    return InvoiceHistoryComponent;
}());
exports.InvoiceHistoryComponent = InvoiceHistoryComponent;
