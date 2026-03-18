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
exports.PaymentModule = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var ngx_skeleton_loader_1 = require("ngx-skeleton-loader");
var _shared_1 = require("@app/@shared");
var containers = require("./containers");
var payment_routing_1 = require("./payment.routing");
var services = require("./services");
var customer_1 = require("../customer");
var pending_invoices_customer_component_1 = require("./components/pending-invoices-customer/pending-invoices-customer.component");
var invoice_module_1 = require("../invoice/invoice.module");
var pending_invoice_packages_component_1 = require("./components/pending-invoice-packages/pending-invoice-packages.component");
var PaymentModule = /** @class */ (function () {
    function PaymentModule() {
    }
    PaymentModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                _shared_1.SharedModule,
                ngx_skeleton_loader_1.NgxSkeletonLoaderModule,
                payment_routing_1.PaymentRoutingModule,
                invoice_module_1.InvoiceModule
            ],
            providers: __spreadArrays(services.PAYMENT_SERVICES, [
                customer_1.CustomerService,
            ]),
            declarations: __spreadArrays(containers.DELIVERY_PFOOF, containers.POINT_OF_SALE, [
                pending_invoices_customer_component_1.PendingInvoicesCustomerComponent,
                pending_invoice_packages_component_1.PendingInvoicePackagesComponent
            ])
        })
    ], PaymentModule);
    return PaymentModule;
}());
exports.PaymentModule = PaymentModule;
