"use strict";
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
exports.InvoiceModule = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var invoice_history_component_1 = require("./containers/invoice-history/invoice-history.component");
var _shared_1 = require("@app/@shared");
var ngx_skeleton_loader_1 = require("ngx-skeleton-loader");
var services = require("./services");
var invoice_routing_1 = require("./invoice.routing");
var customer_detail_component_1 = require("./components/invoice-history/customer-detail/customer-detail.component");
var services_1 = require("../package/services");
var invoices_cradits_list_component_1 = require("./components/invoice-history/invoices-cradits-list/invoices-cradits-list.component");
var invoices_packages_component_1 = require("./components/invoice-history/invoices-packages/invoices-packages.component");
var customer_1 = require("../customer");
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var invoices_report_generate_component_1 = require("./containers/invoices-report-generate/invoices-report-generate.component");
var InvoiceModule = /** @class */ (function () {
    function InvoiceModule() {
    }
    InvoiceModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                _shared_1.SharedModule,
                invoice_routing_1.InvoiceRoutingModule,
                ngx_skeleton_loader_1.NgxSkeletonLoaderModule
            ],
            declarations: [
                invoice_history_component_1.InvoiceHistoryComponent,
                customer_detail_component_1.CustomerDetailComponent,
                invoices_cradits_list_component_1.InvoicesCraditsListComponent,
                invoices_packages_component_1.InvoicesPackagesComponent,
                invoices_report_generate_component_1.InvoicesReportGenerateComponent
            ],
            providers: __spreadArrays(services.INVOICE_SERVICES, [
                services_1.PackageService,
                customer_1.CustomerService,
                ng_bootstrap_1.NgbActiveModal,
                customer_detail_component_1.CustomerDetailComponent
            ]),
            exports: [invoices_cradits_list_component_1.InvoicesCraditsListComponent]
        })
    ], InvoiceModule);
    return InvoiceModule;
}());
exports.InvoiceModule = InvoiceModule;
