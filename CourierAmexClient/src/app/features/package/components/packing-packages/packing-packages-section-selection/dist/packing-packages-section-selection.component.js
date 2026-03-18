"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PackingPackagesSectionSelectionComponent = void 0;
var core_1 = require("@angular/core");
var sweetalert2_1 = require("sweetalert2");
var PackingPackagesSectionSelectionComponent = /** @class */ (function () {
    function PackingPackagesSectionSelectionComponent(packageService, loadingService, router, cred, messages) {
        this.packageService = packageService;
        this.loadingService = loadingService;
        this.router = router;
        this.cred = cred;
        this.messages = messages;
        this.packageResponse = new core_1.EventEmitter();
        this.childGuideId = new core_1.EventEmitter();
        this.selectedCategory = new core_1.EventEmitter();
        this.onPalletChange = new core_1.EventEmitter();
        this.isPackagingStarted = new core_1.EventEmitter();
        this.ancho = 0;
        this.alto = 0;
        this.largo = 0;
        this.peso = 0;
        this.actualVolumeWeight = 0;
        this.categorySelect = '';
        this.componentType = '';
        this.packageListDetail = [];
        this.PackageDetail = {};
        this.request = {};
        this.isClicked = false;
    }
    PackingPackagesSectionSelectionComponent.prototype.ngOnInit = function () {
        if (this.router.url.includes('packing-packages-consolidated')) {
            this.isManifestConsolidatedType = true;
        }
        else if (this.router.url.includes('packing-packages-courier')) {
            this.componentType = 'Courier';
            this.packType = "AIPE";
        }
        else if (this.router.url.includes('packing-packages-aeropost')) {
            this.componentType = 'Aeropost';
            this.packType = "AIPE";
        }
    };
    PackingPackagesSectionSelectionComponent.prototype.ngOnChanges = function (changes) {
        var _a, _b;
        debugger;
        console.log(changes['closePackage']);
        if (((_a = changes['closePackage']) === null || _a === void 0 ? void 0 : _a.currentValue) === true || ((_b = changes['isPackageList']) === null || _b === void 0 ? void 0 : _b.currentValue) === true) {
            this.resetPackageData();
            this.isPackagingStarted.emit(false);
        }
    };
    PackingPackagesSectionSelectionComponent.prototype.resetPackageData = function () {
        debugger;
        this.isClicked = false;
        this.isPackageList = true;
        this.ancho = this.alto = this.largo = this.peso = this.actualVolumeWeight = 0;
    };
    PackingPackagesSectionSelectionComponent.prototype.calcularPesoVolumetrico = function () {
        this.actualVolumeWeight = (this.alto * this.ancho * this.largo) / 360;
        return this.actualVolumeWeight.toFixed(2);
    };
    PackingPackagesSectionSelectionComponent.prototype.startPackaging = function (packageType) {
        var _this = this;
        if (packageType) {
            if (!this.airGuideId) {
                sweetalert2_1["default"].fire('Warning', 'Please select child Guide.', 'warning');
                return;
            }
            this.reference = this.airGuideId.toString();
        }
        else if (packageType && this.pallet === undefined) {
            sweetalert2_1["default"].fire('Warning', 'Please provide Pallet.', 'warning');
            return;
        }
        else if (this.pallet === 0) {
            sweetalert2_1["default"].fire('Warning', 'Please enter a valid Pallet number.', 'warning');
            return;
        }
        if (this.isManifestConsolidatedType && this.categorySelect === '') {
            this.categorySelect = "C";
        }
        if (this.componentType === "Aeropost") {
            if (!this.manifestId) {
                sweetalert2_1["default"].fire('Warning', 'Please select Manifest first.', 'warning');
                return;
            }
            if (!this.reference) {
                this.packageService.GetNextReferenceAsync("AIPE", 6).subscribe(function (resp) {
                    _this.reference = resp.data;
                });
            }
            if (!this.categorySelect) {
                this.categorySelect = "C";
            }
        }
        else {
            if (!this.manifestId || !this.reference) {
                sweetalert2_1["default"].fire('Warning', 'Please provide both Manifest and Reference.', 'warning');
                return;
            }
        }
        this.loadingService.show();
        this.isPackagingStarted.emit(true);
        this.packageService.GetPackedPackagesForAirGuides(this.categorySelect, this.reference, this.manifestId, 1, this.pallet).subscribe({
            next: function (response) {
                if (response === null || response === void 0 ? void 0 : response.data) {
                    _this.isClicked = true;
                    _this.packageListDetail = response.data.packagedPackages || [];
                    _this.PackageDetail = response.data.packageDetails || {};
                    if (_this.packageListDetail.length === 0 && Object.keys(_this.PackageDetail).length === 0) {
                        _this.isClicked = true;
                        _this.isPackageList = true;
                        sweetalert2_1["default"].fire('Warning', 'No packages available.', 'warning');
                        _this.savePackageDetails();
                    }
                    else {
                        _this.isPackageList = false;
                    }
                    _this.updatePackageDetails(_this.PackageDetail);
                    _this.packageResponse.emit(_this.packageListDetail);
                }
            },
            error: function () {
                sweetalert2_1["default"].fire('Error', 'Error loading the packages. Please try again.', 'error');
                _this.loadingService.hide();
            },
            complete: function () { return _this.loadingService.hide(); }
        });
    };
    PackingPackagesSectionSelectionComponent.prototype.savePackageDetails = function () {
        var _a, _b;
        var totalSystemVolumeWeight = this.packageListDetail.reduce(function (acc, curr) { return acc + (curr.volumetricWeight || 0); }, 0);
        var totalSystemWeight = this.packageListDetail.reduce(function (acc, curr) { return acc + (curr.weight || 0); }, 0);
        this.request = {
            ManifestId: this.manifestId,
            Bag: this.reference,
            TaxType: 0,
            Width: this.ancho,
            Height: this.alto,
            Length: this.largo,
            ActualVolumeWeight: this.actualVolumeWeight,
            ActualWeight: this.peso,
            SystemVolumeWeight: totalSystemVolumeWeight,
            SystemWeight: totalSystemWeight,
            Packages: this.packageListDetail.length,
            PackagingType: (_a = this.packType) !== null && _a !== void 0 ? _a : "AIPE",
            Sequence: 0,
            Category: this.categorySelect,
            User: (_b = this.cred.credentials) === null || _b === void 0 ? void 0 : _b.user.name,
            IsConsolidated: this.isManifestConsolidatedType ? 1 : 2,
            Pallet: this.pallet
        };
        this.packageService.RegisterBagPackaging(this.request).subscribe({
            next: function () { return sweetalert2_1["default"].fire('Success', 'Package registered successfully', 'success'); },
            error: function () { return sweetalert2_1["default"].fire('Error', 'Error saving package details.', 'error'); }
        });
    };
    PackingPackagesSectionSelectionComponent.prototype.savePackageDetailsOnUpdate = function () {
        if (!this.isClicked && !this.isPackageList) {
            sweetalert2_1["default"].fire(this.messages.getTranslate('Warning'), 'No packages available.', 'warning');
            return;
        }
        this.savePackageDetails();
    };
    PackingPackagesSectionSelectionComponent.prototype.updatePackageDetails = function (detail) {
        if (!detail)
            return;
        this.ancho = detail.width || 0;
        this.alto = detail.height || 0;
        this.largo = detail.length || 0;
        this.peso = detail.actualWeight || 0;
        this.actualVolumeWeight = detail.actualVolumeWeight || 0;
    };
    PackingPackagesSectionSelectionComponent.prototype.onTypeChange = function (event) {
        var selectedValue = event.target.value;
        this.isIndividualRadio = selectedValue === '1';
        this.typeChanged = true;
        this.pallet = null;
    };
    PackingPackagesSectionSelectionComponent.prototype.changeCategory = function () {
        this.selectedCategory.emit(this.categorySelect);
    };
    PackingPackagesSectionSelectionComponent.prototype.setReference = function () {
        this.childGuideId.emit(this.reference);
    };
    PackingPackagesSectionSelectionComponent.prototype.onChangePallet = function () {
        this.onPalletChange.emit(this.pallet);
    };
    __decorate([
        core_1.Input()
    ], PackingPackagesSectionSelectionComponent.prototype, "manifestId");
    __decorate([
        core_1.Input()
    ], PackingPackagesSectionSelectionComponent.prototype, "reference");
    __decorate([
        core_1.Input()
    ], PackingPackagesSectionSelectionComponent.prototype, "airGuideId");
    __decorate([
        core_1.Input()
    ], PackingPackagesSectionSelectionComponent.prototype, "isPackageList");
    __decorate([
        core_1.Input()
    ], PackingPackagesSectionSelectionComponent.prototype, "closePackage");
    __decorate([
        core_1.Output()
    ], PackingPackagesSectionSelectionComponent.prototype, "packageResponse");
    __decorate([
        core_1.Output()
    ], PackingPackagesSectionSelectionComponent.prototype, "childGuideId");
    __decorate([
        core_1.Output()
    ], PackingPackagesSectionSelectionComponent.prototype, "selectedCategory");
    __decorate([
        core_1.Output()
    ], PackingPackagesSectionSelectionComponent.prototype, "onPalletChange");
    __decorate([
        core_1.Output()
    ], PackingPackagesSectionSelectionComponent.prototype, "isPackagingStarted");
    PackingPackagesSectionSelectionComponent = __decorate([
        core_1.Component({
            selector: 'app-packing-packages-section-selection',
            templateUrl: './packing-packages-section-selection.component.html'
        })
    ], PackingPackagesSectionSelectionComponent);
    return PackingPackagesSectionSelectionComponent;
}());
exports.PackingPackagesSectionSelectionComponent = PackingPackagesSectionSelectionComponent;
