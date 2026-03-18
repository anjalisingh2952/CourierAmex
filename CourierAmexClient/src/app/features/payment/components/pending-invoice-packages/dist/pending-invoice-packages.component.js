"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PendingInvoicePackagesComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/models");
var PendingInvoicePackagesComponent = /** @class */ (function () {
    function PendingInvoicePackagesComponent(translate, changeDetectorRef, activeModal) {
        var _this = this;
        this.translate = translate;
        this.changeDetectorRef = changeDetectorRef;
        this.activeModal = activeModal;
        this.pagination = models_1.defaultPagination;
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
            PackageNumber: '',
            CourierName: '',
            Origin: '',
            Description: '',
            Weight: '',
            action: ''
        };
        this.translate.get([
            'PackageDetails.PackageNumber',
            'PackageCategory.CourierName',
            'Packages.Origin',
            'PackageDetails.Description',
            'PackageDetails.Weight',
            'Labels.Actions'
        ])
            .subscribe(function (translations) {
            _this.translations.PackageNumber = translations['PackageDetails.PackageNumber'];
            _this.translations.CourierName = translations['PackageCategory.CourierName'];
            _this.translations.Origin = translations['Packages.Origin'];
            _this.translations.Description = translations['PackageDetails.Description'];
            _this.translations.Weight = translations['PackageDetails.Weight'];
            _this.translations.action = translations['Labels.Actions'];
        });
    }
    PendingInvoicePackagesComponent.prototype.ngOnInit = function () {
    };
    PendingInvoicePackagesComponent.prototype.ngOnChanges = function (changes) {
        if (changes['packageListByInvoice']) {
            var prev = changes['packageListByInvoice'].previousValue;
            var curr = changes['packageListByInvoice'].currentValue;
            console.log("prev", prev);
            console.log("curr", curr);
        }
    };
    PendingInvoicePackagesComponent.prototype.ngAfterViewInit = function () {
        this.columns.push({ field: 'packageNumber', label: this.translations.PackageNumber, sortable: true });
        this.columns.push({ field: 'courierCode', label: this.translations.CourierName, sortable: true });
        this.columns.push({ field: 'origin', label: this.translations.Origin, sortable: true });
        this.columns.push({ field: 'description', label: this.translations.Description, sortable: true });
        this.columns.push({ field: 'width', label: this.translations.Weight, sortable: true });
        this.changeDetectorRef.detectChanges();
    };
    PendingInvoicePackagesComponent.prototype.onCheckboxChange = function (row) {
        console.log("row", row);
    };
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], PendingInvoicePackagesComponent.prototype, "actionTemplate");
    __decorate([
        core_1.Input()
    ], PendingInvoicePackagesComponent.prototype, "packageListByInvoice");
    PendingInvoicePackagesComponent = __decorate([
        core_1.Component({
            selector: 'app-pending-invoice-packages',
            templateUrl: './pending-invoice-packages.component.html'
        })
    ], PendingInvoicePackagesComponent);
    return PendingInvoicePackagesComponent;
}());
exports.PendingInvoicePackagesComponent = PendingInvoicePackagesComponent;
