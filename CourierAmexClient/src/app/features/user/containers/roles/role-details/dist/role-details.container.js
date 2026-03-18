"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RoleDetailsContainer = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var sweetalert2_1 = require("sweetalert2");
var _shared_1 = require("@app/@shared");
var models_1 = require("@app/models");
var RoleDetailsContainer = /** @class */ (function () {
    function RoleDetailsContainer(router, route, loading, commonService, roleService, messages, credentailsService) {
        var _this = this;
        this.router = router;
        this.route = route;
        this.loading = loading;
        this.commonService = commonService;
        this.roleService = roleService;
        this.messages = messages;
        this.credentailsService = credentailsService;
        this.showCompanies = false;
        this.selectedCompany = undefined;
        this.destroy$ = new rxjs_1.Subject();
        this.companies$ = this.commonService.getCompanies$();
        this.route.queryParamMap
            .pipe(rxjs_1.takeUntil(this.destroy$))
            .subscribe(function (params) {
            var _a;
            if (params.has('id')) {
                _this.loadEntity((_a = params.get('id')) !== null && _a !== void 0 ? _a : '');
            }
            else {
                _this.loadAttributes();
            }
        });
    }
    RoleDetailsContainer.prototype.ngOnInit = function () {
        var _this = this;
        this.companies$
            .pipe(rxjs_1.filter(function (res) { return res && res.length > 0; }), rxjs_1.takeUntil(this.destroy$))
            .subscribe(function (companies) {
            _this.checkUser(companies);
        });
    };
    RoleDetailsContainer.prototype.ngOnDestroy = function () {
        this.destroy$.next();
        this.destroy$.complete();
    };
    RoleDetailsContainer.prototype.save = function (entity) {
        var _this = this;
        this.loading.show();
        var observer = {
            next: function (res) {
                if ((res === null || res === void 0 ? void 0 : res.success) && (res === null || res === void 0 ? void 0 : res.data)) {
                    sweetalert2_1["default"].fire(_this.messages.getTranslate('Labels.SaveChanges'), _this.messages.getTranslate('Labels.SaveSuccessfully'), 'success');
                    _this.router.navigate(['user', 'role-details'], { queryParams: { id: res.data.id, dt: _shared_1.getDateString() }, replaceUrl: true });
                }
                else {
                    sweetalert2_1["default"].fire(_this.messages.getTranslate('Labels.Error'), _this.messages.getTranslate('Labels.InternalError'), 'error');
                }
            },
            error: function (err) {
                console.error(err);
                sweetalert2_1["default"].fire(_this.messages.getTranslate('Labels.Error'), _this.messages.getTranslate('Labels.InternalError'), 'error');
            }
        };
        if (entity.id === '') {
            this.roleService.create$(entity)
                .pipe(rxjs_1.finalize(function () { return _this.loading.hide(); }))
                .subscribe(observer);
        }
        else {
            this.roleService.update$(entity)
                .pipe(rxjs_1.finalize(function () { return _this.loading.hide(); }))
                .subscribe(observer);
        }
    };
    RoleDetailsContainer.prototype.goBack = function () {
        this.router.navigate(['user', 'roles']);
    };
    RoleDetailsContainer.prototype.loadEntity = function (id) {
        var _this = this;
        if (id.length > 0) {
            this.loading.show();
            this.roleService.getById$(id)
                .pipe(rxjs_1.filter(function (res) { return !!res && !!res.success && !!res.data; }), rxjs_1.finalize(function () { return _this.loading.hide(); }))
                .subscribe({
                next: function (res) {
                    if (res.data) {
                        _this.role = res.data;
                    }
                },
                error: function (err) {
                    console.error(err);
                    sweetalert2_1["default"].fire(_this.messages.getTranslate('Labels.Error'), _this.messages.getTranslate('Labels.InternalError'), 'error');
                }
            });
        }
        else {
            sweetalert2_1["default"].fire(this.messages.getTranslate('Labels.Error'), this.messages.getTranslate('Labels.InternalError'), 'error');
            this.goBack();
        }
    };
    RoleDetailsContainer.prototype.loadAttributes = function () {
        var _this = this;
        this.loading.show();
        this.commonService.getPermissions$()
            .pipe(rxjs_1.filter(function (res) { return (res === null || res === void 0 ? void 0 : res.length) > 0; }), rxjs_1.finalize(function () { return _this.loading.hide(); }))
            .subscribe({
            next: function (res) {
                _this.role = {
                    id: '',
                    companyId: 0,
                    name: '',
                    status: _shared_1.DEFAULT_STATUS_ACTIVE,
                    rolePermissions: res
                };
            },
            error: function (err) {
                console.error(err);
            }
        });
    };
    RoleDetailsContainer.prototype.checkUser = function (companies) {
        var _a;
        var user = (_a = this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user;
        if ((user === null || user === void 0 ? void 0 : user.operationType) === models_1.OperationTypeEnum.Gateway) {
            var cia = companies.find(function (c) { return c.id === user.companyId; });
            if (cia) {
                this.selectedCompany = cia;
            }
        }
        else {
            this.showCompanies = true;
        }
    };
    RoleDetailsContainer = __decorate([
        core_1.Component({
            selector: 'settings-role-details',
            templateUrl: './role-details.container.html'
        })
    ], RoleDetailsContainer);
    return RoleDetailsContainer;
}());
exports.RoleDetailsContainer = RoleDetailsContainer;
