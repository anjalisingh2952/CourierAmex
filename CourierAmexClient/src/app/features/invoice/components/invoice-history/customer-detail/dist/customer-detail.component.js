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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CustomerDetailComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/features/invoice/models");
var models_2 = require("@app/models");
var rxjs_1 = require("rxjs");
var invoices_packages_component_1 = require("../invoices-packages/invoices-packages.component");
var CustomerDetailComponent = /** @class */ (function () {
    function CustomerDetailComponent(invoiceService, translate, modalService, changeDetectorRef, toastr, router) {
        var _this = this;
        this.invoiceService = invoiceService;
        this.translate = translate;
        this.modalService = modalService;
        this.changeDetectorRef = changeDetectorRef;
        this.toastr = toastr;
        this.router = router;
        this._entities = new rxjs_1.BehaviorSubject([]);
        this.entities$ = this._entities.asObservable();
        this._packagesData = new rxjs_1.BehaviorSubject([]);
        this._modalHeadData = new rxjs_1.BehaviorSubject(null);
        this.packagesData$ = this._packagesData.asObservable();
        this.modalHead$ = this._modalHeadData.asObservable();
        this.dataReceived = new rxjs_1.Subject();
        this.pagination = models_2.defaultPagination;
        this.selectedOptionsString = '';
        this.columns = [];
        this.rows = [];
        this.state = {
            page: 1,
            pageSize: 10,
            searchTerm: '',
            sortColumn: 'number',
            sortDirection: 'DESC'
        };
        this.invoice = __assign({}, models_1.InvoiceModel);
        this.filterData = {
            clientId: '',
            toDate: new Date().toISOString().split('T')[0],
            fromDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0],
            filters: ''
        };
        this.translations = {
            invoiceNumber: '',
            user: '',
            cashRegisterID: 0,
            client: '',
            date: '',
            taxableAmount: 0,
            exemptAmount: null,
            customsTax: null,
            salesTax: 0,
            subtotal: 0,
            discount: 0,
            total: 0,
            totalLocal: 0,
            balance: 0,
            localBalance: 0,
            paidAmount: 0,
            change: 0,
            paymentMethodID: 0,
            paymentType: null,
            status: 0,
            fullName: null,
            exchangeRatePurchase: 0,
            exchangeRateSale: 0,
            note: null,
            type: null,
            key: null,
            productID: 0,
            quantity: 0,
            price: 0,
            description: '',
            productType: null,
            isExempt: false,
            hasCustomsTax: false,
            documentNumber: '',
            creditNote: null,
            documentType: '',
            actoin: ''
        };
        this.pagination.s = this.state.sortColumn + " " + this.state.sortDirection;
        this.translate.get([
            'InvoiceHistory.DocumentType',
            'InvoiceHistory.Document',
            'InvoiceHistory.Date',
            'InvoiceHistory.Tax',
            'InvoiceHistory.TotalDollars',
            'InvoiceHistory.TotalLocal',
            'InvoiceHistory.Paid',
            'Labels.Actions'
        ])
            .subscribe(function (translations) {
            _this.translations.actoin = translations['Labels.Actions'];
            _this.translations.documentType = translations['InvoiceHistory.DocumentType'];
            _this.translations.documentNumber = translations['InvoiceHistory.Document'];
            _this.translations.date = translations['InvoiceHistory.Date'];
            _this.translations.salesTax = translations['InvoiceHistory.Tax'];
            _this.translations.total = translations['InvoiceHistory.TotalDollars'];
            _this.translations.totalLocal = translations['InvoiceHistory.TotalLocal'];
            _this.translations.paidAmount = translations['InvoiceHistory.Paid'];
        });
    }
    CustomerDetailComponent.prototype.ngAfterViewInit = function () {
        this.columns.push({ field: 'action', label: this.translations.actoin, sortable: false, cssClass: 'text-end', contentTemplate: this.actionTemplate });
        this.columns.push({ field: 'documentType', label: this.translations.documentType, sortable: true });
        this.columns.push({ field: 'documentNumber', label: this.translations.documentNumber.toString(), sortable: true });
        this.columns.push({ field: 'date', label: this.translations.date, type: "date", sortable: true });
        this.columns.push({ field: 'salesTax', label: this.translations.salesTax.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'total', label: this.translations.total.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'totalLocal', label: this.translations.totalLocal.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'paidAmount', label: this.translations.paidAmount.toString(), type: "2decimals", sortable: true });
        this.changeDetectorRef.detectChanges();
    };
    CustomerDetailComponent.prototype.ngOnChanges = function (changes) {
        var _a;
        if ((_a = changes['detail']) === null || _a === void 0 ? void 0 : _a.currentValue) {
            this.updateInvoiceDetails(changes['detail'].currentValue);
        }
    };
    CustomerDetailComponent.prototype.updateInvoiceDetails = function (detail) {
        var _a = detail.id, id = _a === void 0 ? 0 : _a, _b = detail.companyId, companyId = _b === void 0 ? 0 : _b, number = detail.number, _c = detail.code, code = _c === void 0 ? '' : _c, _d = detail.fullName, fullName = _d === void 0 ? '' : _d, _e = detail.companyName, companyName = _e === void 0 ? '' : _e, _f = detail.courierName, courierName = _f === void 0 ? '' : _f, _g = detail.trackingNumber, trackingNumber = _g === void 0 ? '' : _g, _h = detail.status, status = _h === void 0 ? 0 : _h, _j = detail.volumetricWeight, volumetricWeight = _j === void 0 ? 0 : _j, _k = detail.manifestId, manifestId = _k === void 0 ? 0 : _k, _l = detail.hasInvoice, hasInvoice = _l === void 0 ? false : _l, _m = detail.taxType, taxType = _m === void 0 ? 0 : _m;
        this.invoice = { id: id, companyId: companyId, number: number, code: code, fullName: fullName, companyName: companyName, courierName: courierName, trackingNumber: trackingNumber, status: status, volumetricWeight: volumetricWeight, manifestId: manifestId, hasInvoice: hasInvoice, taxType: taxType };
        if (code) {
            this.filterData.clientId = code;
        }
    };
    CustomerDetailComponent.prototype.fetchFilteredRecords = function () {
        var _this = this;
        debugger;
        var _a = this.filterData, fromDate = _a.fromDate, toDate = _a.toDate, clientId = _a.clientId, filters = _a.filters;
        this.invoiceService.CustomerDetailsByClientId(clientId, fromDate, toDate, filters).subscribe(function (response) {
            _this.invoices = response.data;
            _this._entities.next(response.data);
        }, function (error) { return console.error('Error fetching filtered records:', error); });
    };
    CustomerDetailComponent.prototype.updateSelectedOptions = function (event, option) {
        var checkbox = event.target;
        var options = new Set(this.selectedOptionsString.split(', '));
        if (checkbox.checked) {
            options.add(option);
        }
        else {
            options["delete"](option);
        }
        this.selectedOptionsString = Array.from(options).join(', ');
        this.filterData.filters = this.selectedOptionsString;
    };
    CustomerDetailComponent.prototype.filterRecords = function () {
        debugger;
        var _a = this.filterData, fromDate = _a.fromDate, toDate = _a.toDate, clientId = _a.clientId;
        if (!fromDate && !toDate && !clientId) {
            this.toastr.warning('Please select a date range and a client ID to filter records', 'Warning');
            return;
        }
        else {
            if (!fromDate) {
                this.toastr.warning('Please select a start date to filter records');
                return;
            }
            if (!toDate) {
                this.toastr.warning('Please select an end date to filter records', 'Warning');
                return;
            }
            if (!clientId) {
                this.toastr.warning('Please select a client ID to filter records', 'Warning');
                return;
            }
        }
        if (this.filterData.filters) {
            this.fetchFilteredRecords();
        }
        else {
            console.log('No filters applied.');
        }
    };
    CustomerDetailComponent.prototype.formatDate = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };
    CustomerDetailComponent.prototype.formatNumber = function (number) {
        return (number === null || number === void 0 ? void 0 : number.toFixed(2)) || '0.00';
    };
    CustomerDetailComponent.prototype.viewEntity = function (param) {
        var _this = this;
        var isPago = param.documentType === "PAGO";
        this._modalHeadData.next(isPago ? "PAGO" : "FACTURA");
        var fetchDetails$ = isPago
            ? this.invoiceService.GetPaymentDetails(this.invoice.companyId, Number(param.documentNumber))
            : this.invoiceService.GetPackagesByInvoice(Number(param.documentNumber));
        fetchDetails$.subscribe(function (response) {
            _this._packagesData.next(response.data);
            var modalRef = _this.modalService.open(invoices_packages_component_1.InvoicesPackagesComponent, {
                size: 'xl',
                backdrop: 'static',
                keyboard: false
            });
            modalRef.componentInstance.parent = _this;
        });
    };
    CustomerDetailComponent.prototype.generateInvoice = function () {
        if (!this.documentSelected) {
            this.toastr.warning('Please select a document first from Payment and Invoices list', 'Warning');
            return;
        }
        this.router.navigate(['/invoice/invoice-report', this.selectedId]);
    };
    CustomerDetailComponent.prototype.onCheckboxChange = function (selectedRow) {
        return __awaiter(this, void 0, Promise, function () {
            var entities, updatedEntities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, rxjs_1.firstValueFrom(this.entities$)];
                    case 1:
                        entities = _a.sent();
                        updatedEntities = entities.map(function (row) { return (__assign(__assign({}, row), { selected: row === selectedRow })); });
                        this.selectedId = Number(selectedRow.documentNumber);
                        this.documentSelected = true;
                        this._entities.next(updatedEntities);
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], CustomerDetailComponent.prototype, "actionTemplate");
    __decorate([
        core_1.Input()
    ], CustomerDetailComponent.prototype, "detail");
    CustomerDetailComponent = __decorate([
        core_1.Component({
            selector: 'app-customer-detail',
            templateUrl: './customer-detail.component.html'
        })
    ], CustomerDetailComponent);
    return CustomerDetailComponent;
}());
exports.CustomerDetailComponent = CustomerDetailComponent;
