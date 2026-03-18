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
exports.InvoicesCraditsListComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/models");
var rxjs_1 = require("rxjs");
var InvoicesCraditsListComponent = /** @class */ (function () {
    function InvoicesCraditsListComponent(translate, changeDetectorRef) {
        var _this = this;
        this.translate = translate;
        this.changeDetectorRef = changeDetectorRef;
        this.invoicePendingPaymentDetail = new core_1.EventEmitter();
        this.invoiceCraditsDetail = [];
        this.invoicePendingPayment = false;
        this.invoices = [];
        this.entities = [];
        this.columns = [];
        this.rows = [];
        this.pagination = models_1.defaultPagination;
        this.state = {
            page: 1,
            pageSize: 10,
            searchTerm: '',
            sortColumn: 'number',
            sortDirection: 'DESC'
        };
        this.translations = {
            invoiceNumber: "",
            user: "",
            cashRegisterID: 0,
            client: "",
            date: "",
            taxableAmount: 0,
            exemptAmount: 0,
            customsTax: 0,
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
            paymentType: "",
            status: 0,
            fullName: "",
            exchangeRatePurchase: 0,
            exchangeRateSale: 0,
            note: "",
            type: "",
            key: "",
            productID: 0,
            quantity: 0,
            price: 0,
            description: "",
            productType: "",
            isExempt: false,
            hasCustomsTax: false,
            documentNumber: "",
            creditNote: "",
            documentType: "",
            id: 0,
            action: ""
        };
        this.selectedId = 0;
        this.documentSelected = false;
        this._entities = new rxjs_1.BehaviorSubject([]);
        this.pagination.s = this.state.sortColumn + " " + this.state.sortDirection;
        var translationKeys = [
            'InvoiceHistory.Date',
            'InvoiceHistory.Invoice',
            'InvoiceHistory.Tax',
            'InvoiceHistory.TotalDollars',
            'InvoiceHistory.TotalLocal',
            'InvoiceHistory.Status',
            'InvoiceHistory.BalanceInDollars',
            'InvoiceHistory.BalanceInLocal'
        ];
        if (this.invoicePendingPayment) {
            translationKeys.unshift('Labels.Actions');
        }
        this.translate.get(translationKeys).subscribe(function (translations) {
            if (_this.invoicePendingPayment) {
                _this.translations.action = translations['Labels.Actions'];
            }
            _this.translations.date = translations['InvoiceHistory.Date'];
            _this.translations.invoiceNumber = translations['InvoiceHistory.Invoice'];
            _this.translations.taxableAmount = translations['InvoiceHistory.Tax'];
            _this.translations.total = translations['InvoiceHistory.TotalDollars'];
            _this.translations.totalLocal = translations['InvoiceHistory.TotalLocal'];
            _this.translations.status = translations['InvoiceHistory.Status'];
            _this.translations.balance = translations['InvoiceHistory.BalanceInDollars'];
            _this.translations.localBalance = translations['InvoiceHistory.BalanceInLocal'];
        });
    }
    InvoicesCraditsListComponent.prototype.ngAfterViewInit = function () {
        if (this.invoicePendingPayment) {
            this.columns.push({ field: 'action', label: this.translations.action, sortable: false, contentTemplate: this.actionTemplate });
        }
        this.columns.push({ field: 'invoiceNumber', label: this.translations.invoiceNumber, sortable: true });
        this.columns.push({ field: 'date', label: this.translations.date, type: "date", sortable: true });
        this.columns.push({ field: 'taxableAmount', label: this.translations.taxableAmount.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'total', label: this.translations.total.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'totalLocal', label: this.translations.totalLocal.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'status', label: this.translations.status.toString(), sortable: true, contentTemplate: this.statusTemplate });
        this.columns.push({ field: 'balance', label: this.translations.balance.toString(), type: "2decimals", sortable: true });
        this.columns.push({ field: 'localBalance', label: this.translations.localBalance.toString(), type: "2decimals", sortable: true });
        this.changeDetectorRef.detectChanges();
    };
    InvoicesCraditsListComponent.prototype.ngOnChanges = function (changes) {
        var _a;
        if ((_a = changes['invoiceCraditsDetail']) === null || _a === void 0 ? void 0 : _a.currentValue) {
            this.updateInvoiceCraditDetails(changes['invoiceCraditsDetail'].currentValue);
        }
    };
    InvoicesCraditsListComponent.prototype.updateInvoiceCraditDetails = function (newDetails) {
        this.entities = newDetails || [];
        this.invoices = newDetails || [];
    };
    InvoicesCraditsListComponent.prototype.onCheckboxChange = function (selectedRow) {
        return __awaiter(this, void 0, Promise, function () {
            var entities, updatedEntities;
            return __generator(this, function (_a) {
                entities = this.invoiceCraditsDetail;
                updatedEntities = entities.map(function (row) { return (__assign(__assign({}, row), { selected: row === selectedRow ? !row.selected : row.selected })); });
                this.selectedId = Number(selectedRow.documentNumber);
                this.documentSelected = updatedEntities.some(function (row) { return row.selected; });
                this._entities.next(updatedEntities);
                if (selectedRow.selected) {
                    this.invoicePendingPaymentDetail.emit(__assign(__assign({}, selectedRow), { unChecked: false }));
                }
                else {
                    this.invoicePendingPaymentDetail.emit(__assign(__assign({}, selectedRow), { unChecked: true }));
                }
                return [2 /*return*/];
            });
        });
    };
    InvoicesCraditsListComponent.prototype.viewEntity = function (entity) {
        console.log("entity", entity);
    };
    __decorate([
        core_1.Output()
    ], InvoicesCraditsListComponent.prototype, "invoicePendingPaymentDetail");
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], InvoicesCraditsListComponent.prototype, "actionTemplate");
    __decorate([
        core_1.ViewChild("statusTemplate")
    ], InvoicesCraditsListComponent.prototype, "statusTemplate");
    __decorate([
        core_1.Input()
    ], InvoicesCraditsListComponent.prototype, "invoiceCraditsDetail");
    __decorate([
        core_1.Input()
    ], InvoicesCraditsListComponent.prototype, "invoicePendingPayment");
    InvoicesCraditsListComponent = __decorate([
        core_1.Component({
            selector: 'app-invoices-cradits-list',
            templateUrl: './invoices-cradits-list.component.html'
        })
    ], InvoicesCraditsListComponent);
    return InvoicesCraditsListComponent;
}());
exports.InvoicesCraditsListComponent = InvoicesCraditsListComponent;
