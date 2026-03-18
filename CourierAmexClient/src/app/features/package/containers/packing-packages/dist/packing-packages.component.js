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
exports.__esModule = true;
exports.PackingPackagesComponent = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var models_1 = require("@app/models");
var manifest_model_1 = require("@app/models/manifest.model");
var packing_packages_packages_list_component_1 = require("../../components/packing-packages/packing-packages-packages-list/packing-packages-packages-list.component");
var PackingPackagesComponent = /** @class */ (function () {
    function PackingPackagesComponent(modalService, router, route, loading, commonService, packageService, toastr, credentailsService, changeDetect) {
        var _this = this;
        this.modalService = modalService;
        this.router = router;
        this.route = route;
        this.loading = loading;
        this.commonService = commonService;
        this.packageService = packageService;
        this.toastr = toastr;
        this.credentailsService = credentailsService;
        this.changeDetect = changeDetect;
        this._entityState = new rxjs_1.BehaviorSubject(__assign(__assign({}, manifest_model_1.newManifestModel), { companyId: 0 }));
        this.pagination = models_1.defaultPagination;
        this.entity$ = rxjs_1.of(__assign({}, manifest_model_1.newManifestModel));
        this.manifestId = 0;
        this.packageType = "";
        this.isManifestConsolidatedType = false;
        this.packageList = [];
        var $selectedCompany = this._entityState.pipe(rxjs_1.map(function (state) { return ({ companyId: state.companyId }); }), rxjs_1.distinctUntilChanged(function (prev, curr) { return prev.companyId === curr.companyId; }));
        var $selectedManifest = this._entityState.pipe(rxjs_1.map(function (state) { return ({ id: state.id, companyId: state.companyId }); }), rxjs_1.distinctUntilChanged(function (prev, curr) { return prev.id === curr.id; }));
        if (this.router.url.includes('packing-packages-consolidated')) {
            this.packageType = "consolidated";
            this.isManifestConsolidatedType = true;
        }
        else if (this.router.url.includes('packing-packages-aeropost')) {
            this.packageType = "aeropost";
            this.selectedCategory = "C";
        }
        this.manifests$ = $selectedCompany.pipe(rxjs_1.filter(function (state) { return (state === null || state === void 0 ? void 0 : state.companyId) !== 0; }), rxjs_1.exhaustMap(function (state) {
            return _this.commonService
                .getManifestsByPackageType$(state.companyId.toString(), 1, 1, _this.isManifestConsolidatedType ? "Consolidado" : "Courier")
                .pipe(rxjs_1.map(function (response) { return response.data; }), rxjs_1.catchError(function () { return rxjs_1.of([]); }));
        }), rxjs_1.finalize(function () { return _this.loading.hide(); }));
        this.packages$ = $selectedManifest.pipe(rxjs_1.filter(function (state) { return state && state.id !== 0; }), rxjs_1.exhaustMap(function (state) {
            return _this.packageService.getPackageDetailByManifestId(state.id).pipe(rxjs_1.map(function (response) { return response.data; }), rxjs_1.catchError(function () { return rxjs_1.of([]); }), rxjs_1.finalize(function () { return _this.loading.hide(); }));
        }));
        var entity$ = this.route.queryParams.pipe(rxjs_1.tap(function () { return _this.loading.show(); }), rxjs_1.switchMap(function (state) { return _this.createOrUpdateEntity(state['id'] || 0)
            .pipe(rxjs_1.finalize(function () { return _this.loading.hide(); }), rxjs_1.catchError(function () { return rxjs_1.of(__assign({}, manifest_model_1.newManifestModel)); })); }));
        this.companies$ = this.commonService.getCompanies$();
        var merge$ = rxjs_1.merge(entity$, this._entityState.asObservable());
        this.entity$ = rxjs_1.combineLatest([merge$, this.companies$]).pipe(rxjs_1.map(function (_a) {
            var entity = _a[0];
            return entity;
        }));
    }
    PackingPackagesComponent.prototype.onCompanyChange = function (id) {
        this._entityState.next(__assign(__assign({}, this._entityState.value), { companyId: id }));
    };
    PackingPackagesComponent.prototype.onManifestChange = function (manifest) {
        debugger;
        this.manifestId = manifest === null || manifest === void 0 ? void 0 : manifest.id;
        this.manifestNumber = manifest === null || manifest === void 0 ? void 0 : manifest.manifestNumber;
        this._entityState.next(__assign(__assign({}, this._entityState.value), { id: manifest === null || manifest === void 0 ? void 0 : manifest.id }));
    };
    PackingPackagesComponent.prototype.onFetchModalData = function (event) {
        var _this = this;
        var manifestId = event.manifestId, companyId = event.companyId, isPending = event.isPending;
        if (!(manifestId)) {
            return;
        }
        if (!isPending) {
            this.packageService.getAirGuideListByManifestIdAndCompanyId(manifestId).subscribe(function (data) {
                console.log('Fetched data:', data);
                _this.modalListDetail = data;
                {
                    var modalRef = _this.modalService.open(packing_packages_packages_list_component_1.PackingPackagesPackagesListComponent, {
                        size: 'xl',
                        backdrop: 'static',
                        keyboard: false
                    });
                    modalRef.componentInstance.data = _this.modalListDetail.data;
                }
                ;
            });
        }
        else {
            this.packageService.GetPackagedPackagesForAirGuides(null, manifestId, 0).subscribe(function (data) {
                console.log('Fetched data:', data);
                _this.modalListDetail = data;
                {
                    var modalRef = _this.modalService.open(packing_packages_packages_list_component_1.PackingPackagesPackagesListComponent, {
                        size: 'xl',
                        backdrop: 'static',
                        keyboard: false
                    });
                    modalRef.componentInstance.packagedPackagesForAirGuides = _this.modalListDetail.data;
                }
                ;
            });
        }
    };
    PackingPackagesComponent.prototype.handlePackageResponse = function (response) {
        this.packageList = response;
    };
    PackingPackagesComponent.prototype.createOrUpdateEntity = function (id) {
        return rxjs_1.of(__assign(__assign({}, manifest_model_1.newManifestModel), { companyId: 0 }));
    };
    PackingPackagesComponent.prototype.onAirGuideChange = function (event) {
        this.airGuideId = event;
    };
    PackingPackagesComponent.prototype.handleChildGuideId = function (event) {
        this.airGuideId = event;
    };
    PackingPackagesComponent.prototype.packPackage = function (event) {
        var _this = this;
        var _a;
        if (this.airGuideId === '' || this.airGuideId === undefined) {
            this.toastr.warning('Please select child Guide.');
            return;
        }
        this.packageService.PackPackage(event, this.airGuideId, this.palet, this.manifestNumber, 1, (_a = this.credentailsService.credentials) === null || _a === void 0 ? void 0 : _a.user.name, this.packageType).pipe(rxjs_1.finalize(function () {
            _this.changeDetect.detectChanges();
            _this.loading.hide();
        })).subscribe({
            next: function (response) {
                if (response.data === 0) {
                    _this.refreshPackages();
                }
                else {
                    _this.handleResponse(response.data);
                }
            },
            error: function (err) {
                _this.toastr.error('Error packing the package. Please try again.');
            }
        });
    };
    PackingPackagesComponent.prototype.handleSelectedCategory = function (event) {
        this.selectedCategory = event;
    };
    PackingPackagesComponent.prototype.handlePalletChange = function (event) {
        this.palet = event;
    };
    PackingPackagesComponent.prototype.handleClosePacking = function (isClosed) {
        console.log("isClosed", isClosed);
        if (isClosed) {
            this.closePackage = false;
            this.closePackage = true;
            this.packageList = [];
            this.isPackageList = false;
            this.airGuideId = '',
                this.manifestNumber = '';
        }
    };
    PackingPackagesComponent.prototype.refreshPackages = function () {
        var _this = this;
        this.loading.show();
        this.packages$ = this.packageService.getPackageDetailByManifestId(this.manifestId).pipe(rxjs_1.map(function (response) { return response.data; }), rxjs_1.catchError(function () { return rxjs_1.of([]); }));
        if (this.packageType === "consolidated" && this.selectedCategory === undefined) {
            this.selectedCategory = "C";
        }
        this.packageService.GetPackedPackagesForAirGuides(this.selectedCategory, this.airGuideId, this.manifestId, 1, this.palet).subscribe({
            next: function (response) {
                if (response === null || response === void 0 ? void 0 : response.data) {
                    _this.packageList = response.data.packagedPackages || [];
                    _this.isPackageList = _this.packageList.length > 0 ? true : false;
                    _this.changeDetect.detectChanges();
                }
            },
            error: function () {
                _this.toastr.error('Error loading the packages. Please try again.');
                _this.loading.hide();
            },
            complete: function () { return _this.loading.hide(); }
        });
        this.toastr.success('Package packed successfully!');
        this.changeDetect.detectChanges();
    };
    PackingPackagesComponent.prototype.handlePackageList = function (event) {
        debugger;
        this.isPackageList = event;
    };
    PackingPackagesComponent.prototype.handlePackagingStarted = function (event) {
        this.isPackagingStarted = event;
        console.log(event);
    };
    PackingPackagesComponent.prototype.handleResponse = function (response) {
        if (response !== undefined && response !== null) {
            switch (response) {
                case -1:
                    this.toastr.warning("The package was not located.");
                    break;
                case -2:
                    this.toastr.warning("The type of bag does not match the classified one!");
                    break;
                case -3:
                    this.toastr.warning("The package is already packed!");
                    break;
                case -4:
                    this.toastr.warning("The package belongs to another manifest: " + this.manifestId + ", and to the guide: " + this.airGuideId);
                    break;
                case -5:
                    this.toastr.warning("Package not manifested! Please check!");
                    break;
                case -6:
                    this.toastr.warning("The package category does NOT match the bag category! Please check, as they must match!");
                    break;
                default:
                    this.toastr.warning("An unknown error occurred. Please try again.");
            }
        }
    };
    PackingPackagesComponent = __decorate([
        core_1.Component({
            selector: 'app-packing-packages',
            changeDetection: core_1.ChangeDetectionStrategy.OnPush,
            templateUrl: './packing-packages.component.html'
        })
    ], PackingPackagesComponent);
    return PackingPackagesComponent;
}());
exports.PackingPackagesComponent = PackingPackagesComponent;
