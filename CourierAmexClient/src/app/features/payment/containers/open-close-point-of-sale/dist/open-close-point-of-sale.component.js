"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.OpenClosePointOfSaleComponent = void 0;
var core_1 = require("@angular/core");
var sweetalert2_1 = require("sweetalert2");
var OpenClosePointOfSaleComponent = /** @class */ (function () {
    function OpenClosePointOfSaleComponent(paymentService, credentailsService, commonService, loading) {
        var _this = this;
        this.paymentService = paymentService;
        this.credentailsService = credentailsService;
        this.commonService = commonService;
        this.loading = loading;
        this.commonService.getCompanies$().subscribe(function (cias) {
            if (cias && cias.length > 0) {
                var userCia = cias.find(function (c) { var _a; return c.id === ((_a = _this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId); });
                _this.companyList = cias;
                if (userCia) {
                    _this.companyList = userCia;
                    return;
                }
            }
        });
    }
    OpenClosePointOfSaleComponent.prototype.ngOnInit = function () {
        this.getPointOfSale();
        this.setDefaultCompany();
    };
    OpenClosePointOfSaleComponent.prototype.getPointOfSale = function () {
        var _this = this;
        var _a, _b, _c, _d;
        this.loading.show();
        var companyId = (_b = (_a = this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId) !== null && _b !== void 0 ? _b : 0;
        this.paymentService.getPointOfSale(companyId, (_d = (_c = this.credentailsService.credentials) === null || _c === void 0 ? void 0 : _c.user.username) !== null && _d !== void 0 ? _d : '', 1).subscribe({
            next: function (list) {
                _this.pointOfSaleList = list;
            },
            error: function (err) {
                console.log(err);
            },
            complete: function () {
                _this.loading.hide();
                console.log("Execution completed");
            }
        });
    };
    OpenClosePointOfSaleComponent.prototype.setDefaultCompany = function () {
        var _this = this;
        if (this.credentailsService.isGatewayUser()) {
            this.commonService.getCompanies$().subscribe(function (cias) {
                if (cias && cias.length > 0) {
                    var userCia = cias.find(function (c) { var _a; return c.id === ((_a = _this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId); });
                    if (userCia) {
                        return;
                    }
                }
            });
        }
    };
    OpenClosePointOfSaleComponent.prototype.onFormSubmit = function (event) {
        if (event) {
            console.log("event", event);
            this.openSale(event);
        }
    };
    OpenClosePointOfSaleComponent.prototype.openSale = function (pointOfSale) {
        var _this = this;
        var _a, _b, _c, _d;
        this.paymentService.startPointOfSale((_b = (_a = this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.companyId) !== null && _b !== void 0 ? _b : 0, (_d = (_c = this.credentailsService.credentials) === null || _c === void 0 ? void 0 : _c.user.username) !== null && _d !== void 0 ? _d : '', pointOfSale.pointOfSaleId, pointOfSale.totalAmountDollar, pointOfSale.totalAmountLocal).subscribe({
            next: function (response) {
                console.log(response);
                if (response === 1) {
                    sweetalert2_1["default"].fire({
                        icon: 'success',
                        title: 'Point of Sale Opened',
                        text: 'The point of sale has been opened successfully!'
                    });
                }
                _this.getPointOfSale();
            },
            error: function (err) {
                console.log(err);
            },
            complete: function () {
                console.log("Execution completed");
            }
        });
    };
    OpenClosePointOfSaleComponent = __decorate([
        core_1.Component({
            selector: 'app-open-close-point-of-sale',
            templateUrl: './open-close-point-of-sale.component.html'
        })
    ], OpenClosePointOfSaleComponent);
    return OpenClosePointOfSaleComponent;
}());
exports.OpenClosePointOfSaleComponent = OpenClosePointOfSaleComponent;
