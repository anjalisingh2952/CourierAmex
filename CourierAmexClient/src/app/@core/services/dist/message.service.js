"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MessageService = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var translateValues = [
    'Labels.Error',
    'Labels.InvalidLogin',
    'Labels.InternalError',
    'Labels.DeleteTitle',
    'Labels.DeleteMessage',
    'Labels.Confirm',
    'Labels.Cancel',
    'Labels.DeleteEntry',
    'Labels.DeleteSuccessfully',
    'Labels.SaveChanges',
    'Labels.SaveSuccessfully',
    'Labels.Information',
    'Labels.ForgotEmailSent',
    'Labels.InvalidEmail',
    'Labels.InvalidLogin',
    'Labels.PasswordChangeTitle',
    'Labels.PasswordChangeSuccessfully',
    'UserDetails.ResetPasswordSuccess',
    'UserDetails.UserWithNoEmail',
    'UserDetails.CreatePasswordSuccess',
    'ControlCodes.SaveChanges',
    'ClientCategoryDetails.WarningSelectProducts',
    'CustomerDetails.SelectShipType',
    'Labels.CountryErrorTitle',
    'Labels.CountryErrorText',
    'UserProfile.PasswordChangedTitle',
    'UserProfile.PasswordChanged',
    'UserProfile.InvalidInformation',
    'Manifests.OpenTitle',
    'Manifests.OpenMessage',
    'Manifests.OpenTitle',
    'Manifests.OpenSuccessfully',
    'Manifests.InvalidDelete',
    'Labels.TemporaryPasswordTitle',
    'Labels.TemporaryPassword',
    "Labels.CompanyNotSelectedError",
];
var MessageService = /** @class */ (function () {
    function MessageService(translate) {
        var _this = this;
        this.translate = translate;
        this.messages = {};
        this.destroy$ = new rxjs_1.Subject();
        this.translate.get(translateValues)
            .pipe(rxjs_1.takeUntil(this.destroy$))
            .subscribe(function (translations) {
            translateValues.forEach(function (t) {
                _this.messages[t] = translations[t];
            });
        });
    }
    MessageService.prototype.getTranslate = function (value) {
        var _a;
        debugger;
        return (_a = this.messages[value]) !== null && _a !== void 0 ? _a : '';
    };
    MessageService = __decorate([
        core_1.Injectable()
    ], MessageService);
    return MessageService;
}());
exports.MessageService = MessageService;
