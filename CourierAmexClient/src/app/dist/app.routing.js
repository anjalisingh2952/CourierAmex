"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppRoutingModule = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var routes = [
    {
        path: '',
        children: [
            {
                path: 'auth',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/auth/auth.module'); }).then(function (m) { return m.AuthModule; });
                }
            },
            {
                path: 'company',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/company/company.module'); }).then(function (m) { return m.CompanyModule; });
                }
            },
            {
                path: 'customer',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/customer/customer.module'); }).then(function (m) { return m.CustomerModule; });
                }
            },
            {
                path: 'error',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/error/error.module'); }).then(function (m) { return m.ErrorModule; });
                }
            },
            {
                path: 'general',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/general/general.module'); }).then(function (m) { return m.GeneralModule; });
                }
            },
            {
                path: 'home',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/home/home.module'); }).then(function (m) { return m.HomeModule; });
                }
            },
            {
                path: 'manifest',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/manifest/manifest.module'); }).then(function (m) { return m.ManifestModule; });
                }
            },
            {
                path: 'invoice',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/invoice/invoice.module'); }).then(function (m) { return m.InvoiceModule; });
                }
            },
            {
                path: 'package',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/package/package.module'); }).then(function (m) { return m.PackageModule; });
                }
            },
            {
                path: 'user',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/user/user.module'); }).then(function (m) { return m.UserModule; });
                }
            },
            {
                path: '', pathMatch: 'full', redirectTo: '/home/dashboard'
            },
            {
                path: '**',
                pathMatch: 'full',
                loadChildren: function () {
                    return Promise.resolve().then(function () { return require('./features/error/error.module'); }).then(function (m) { return m.ErrorModule; });
                }
            }
        ]
    }
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
