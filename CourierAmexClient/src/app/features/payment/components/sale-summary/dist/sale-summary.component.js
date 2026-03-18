"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SaleSummaryComponent = void 0;
var core_1 = require("@angular/core");
var SaleSummaryComponent = /** @class */ (function () {
    function SaleSummaryComponent(activeModal) {
        this.activeModal = activeModal;
    }
    SaleSummaryComponent.prototype.onCancel = function () {
        this.activeModal.dismiss();
    };
    SaleSummaryComponent = __decorate([
        core_1.Component({
            selector: 'app-sale-summary',
            templateUrl: './sale-summary.component.html'
        })
    ], SaleSummaryComponent);
    return SaleSummaryComponent;
}());
exports.SaleSummaryComponent = SaleSummaryComponent;
