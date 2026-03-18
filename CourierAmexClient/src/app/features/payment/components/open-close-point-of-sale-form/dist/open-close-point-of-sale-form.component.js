"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.OpenClosePointOfSaleFormComponent = void 0;
var core_1 = require("@angular/core");
var sale_summary_component_1 = require("../sale-summary/sale-summary.component");
var sweetalert2_1 = require("sweetalert2");
var JSPM = require("jsprintmanager");
var JsBarcode = require("jsbarcode");
var OpenClosePointOfSaleFormComponent = /** @class */ (function () {
    function OpenClosePointOfSaleFormComponent(modalService, renderer, loading, paymentService, http) {
        this.modalService = modalService;
        this.renderer = renderer;
        this.loading = loading;
        this.paymentService = paymentService;
        this.http = http;
        this.onSaleStart = new core_1.EventEmitter();
        this.reFreshPointOfSale = new core_1.EventEmitter();
        this.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        this.tcpAddress = '10.0.0.1';
        this.tcpPort = 8001;
        this.dataToSend = 'type here...';
        this.dataReceived = '';
        this.selectedDate = {};
        this.showPendingInvoices = false;
        this.isClosed = false;
        this.transactionType = "";
        this.isFormValid = false;
    }
    OpenClosePointOfSaleFormComponent.prototype.ngOnInit = function () {
        this.setDefaultDates();
        JSPM.JSPrintManager.auto_reconnect = true;
        JSPM.JSPrintManager.start();
    };
    OpenClosePointOfSaleFormComponent.prototype.openModal = function (template, item) {
        this.totalAmountDollar = 0;
        this.totalAmountLocal = 0;
        this.form = item;
        this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
    };
    OpenClosePointOfSaleFormComponent.prototype.openCashInOutModal = function (template, item) {
        this.totalAmountDollar = 0;
        this.totalAmountLocal = 0;
        this.form = item;
        this.modalRef = this.modalService.open(template, { centered: true, backdrop: 'static' });
    };
    OpenClosePointOfSaleFormComponent.prototype.closeModal = function () {
        if (this.modalRef) {
            this.modalRef.close();
        }
    };
    OpenClosePointOfSaleFormComponent.prototype.confirmOpenSale = function () {
        var _a, _b;
        if (this.isFormValid) {
            var obj = {
                totalAmountDollar: (_a = this.totalAmountDollar) !== null && _a !== void 0 ? _a : 0,
                totalAmountLocal: (_b = this.totalAmountLocal) !== null && _b !== void 0 ? _b : 0,
                pointOfSaleId: this.form.pointOfSaleId,
                companyId: this.form.companyId
            };
            this.onSaleStart.emit(obj);
            this.isClosed = true;
            this.closeModal();
            return;
        }
    };
    OpenClosePointOfSaleFormComponent.prototype.cashInOut = function (isCashIn) {
        var _a, _b;
        if (this.isFormValid) {
            var obj = {
                totalAmountDollar: isCashIn ? (_a = this.totalAmountDollar) !== null && _a !== void 0 ? _a : 0 : -this.totalAmountDollar,
                totalAmountLocal: isCashIn ? (_b = this.totalAmountLocal) !== null && _b !== void 0 ? _b : 0 : -this.totalAmountLocal,
                pointOfSaleId: this.form.pointOfSaleId,
                companyId: this.form.companyId,
                openingId: this.form.openingCode
            };
            this.onSaleStart.emit(obj);
            this.isClosed = true;
            this.closeModal();
            return;
        }
    };
    OpenClosePointOfSaleFormComponent.prototype.validateFields = function () {
        this.isFormValid = (this.totalAmountDollar !== null && this.totalAmountDollar > 0) ||
            (this.totalAmountLocal !== null && this.totalAmountLocal > 0);
    };
    OpenClosePointOfSaleFormComponent.prototype.isInvalid = function (field) {
        return field.invalid && field.touched;
    };
    OpenClosePointOfSaleFormComponent.prototype.openContinueModal = function (item) {
        this.selectedPointOfSale = item;
        this.showPendingInvoices = true;
    };
    OpenClosePointOfSaleFormComponent.prototype.closePendingInvoices = function () {
        this.showPendingInvoices = false;
    };
    OpenClosePointOfSaleFormComponent.prototype.closePointOfSale = function (item) {
        var _this = this;
        debugger;
        this.paymentService.getPointOfSaleDailySummary(item.companyId, item.openingCode).subscribe(function (data) {
            if (data) {
                var modelRef = _this.modalService.open(sale_summary_component_1.SaleSummaryComponent, {
                    size: 'xl', backdrop: 'static', keyboard: false, centered: true
                });
                modelRef.componentInstance.saleDetail = data;
                modelRef.componentInstance.pointOfSaleDetail = item;
                modelRef.componentInstance.onClosingOfPointOfSale.subscribe(function (result) {
                    if (result) {
                        debugger;
                        _this.reFreshPointOfSale.emit(result);
                    }
                });
            }
        });
    };
    OpenClosePointOfSaleFormComponent.prototype.setDefaultDates = function () {
        var _this = this;
        if (this.pointOfSaleList) {
            this.pointOfSaleList.forEach(function (item) {
                if (!_this.selectedDate[item.pointOfSaleId]) {
                    _this.selectedDate[item.pointOfSaleId] = new Date().toISOString().split('T')[0];
                }
            });
        }
    };
    OpenClosePointOfSaleFormComponent.prototype.discard = function () {
    };
    OpenClosePointOfSaleFormComponent.prototype.print = function () {
        debugger;
        if (!this.packageNumber || this.packageNumber === undefined) {
            sweetalert2_1["default"].fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Package Number is required.',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (!this.tlprint) {
            console.error('tlprint is undefined!');
            return;
        }
        var webPrintJobUrl = "https://localhost:5005/api/v1/Print/GetWebPrintJob?PackageNumber=" + encodeURIComponent(this.packageNumber);
        console.log(webPrintJobUrl);
        if (this.isChrome) {
            this.tlprint.nativeElement.href = "tlprint:" + webPrintJobUrl;
            var event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            this.tlprint.nativeElement.dispatchEvent(event);
        }
        else {
            if (this.tlprintFrame) {
                this.renderer.setAttribute(this.tlprintFrame.nativeElement, 'src', "tlprint:" + webPrintJobUrl);
            }
            else {
                console.error('tlprintFrame is undefined!');
            }
        }
        sweetalert2_1["default"].fire({
            icon: 'success',
            title: 'Success!',
            text: 'Print job sent successfully.',
            confirmButtonText: 'OK'
        });
    };
    OpenClosePointOfSaleFormComponent.prototype.printForEPSON = function () {
        debugger;
        if (!this.packageNumber || this.packageNumber === undefined) {
            sweetalert2_1["default"].fire({
                icon: 'warning',
                title: 'Warning!',
                text: 'Package Number is required.',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (!this.tlprint) {
            console.error('tlprint is undefined!');
            return;
        }
        // Use EPSON-specific API endpoint
        var webPrintJobUrl = "https://localhost:5005/api/v1/Print/GetWebPrintJobEPSON?PackageNumber=" + encodeURIComponent(this.packageNumber);
        console.log(webPrintJobUrl);
        if (this.isChrome) {
            this.tlprint.nativeElement.href = "tlprint:" + webPrintJobUrl;
            var event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
            this.tlprint.nativeElement.dispatchEvent(event);
        }
        else {
            if (this.tlprintFrame) {
                this.renderer.setAttribute(this.tlprintFrame.nativeElement, 'src', "tlprint:" + webPrintJobUrl);
            }
            else {
                console.error('tlprintFrame is undefined!');
            }
        }
        sweetalert2_1["default"].fire({
            icon: 'success',
            title: 'Success!',
            text: 'EPSON Print job sent successfully.',
            confirmButtonText: 'OK'
        });
    };
    ///////  Setup JSPrintManager
    OpenClosePointOfSaleFormComponent.prototype.generateBarcode = function () {
        var canvas = document.createElement("canvas");
        JsBarcode(canvas, "123456789", {
            format: "CODE128",
            displayValue: true
        });
        // Convert barcode to image
        return canvas.toDataURL("image/png");
    };
    OpenClosePointOfSaleFormComponent.prototype.printBarcode = function () {
        JSPM.JSPrintManager.getPrinters().then(function (printers) { return console.log(printers); });
        var cpj = new JSPM.ClientPrintJob();
        cpj.clientPrinter = new JSPM.InstalledPrinter("EPSON TM-m30II");
        var barcodeImage = this.generateBarcode();
        var printFile = new JSPM.PrintFile(barcodeImage, JSPM.FileSourceType.BLOB, "barcode.png", 1);
        cpj.files.push(printFile);
        cpj.sendToClient();
    };
    OpenClosePointOfSaleFormComponent.prototype.printBarcodeRaw = function () {
        JSPM.JSPrintManager.getPrinters().then(function (printers) { return console.log(printers); });
        debugger;
        var cpj = new JSPM.ClientPrintJob();
        cpj.clientPrinter = new JSPM.InstalledPrinter("EPSON TM-m30II");
        var escCommands = "\x1D\x6B\x04";
        escCommands += "123456789";
        escCommands += "\x00";
        var printFile = new JSPM.PrintFileTXT(escCommands, "barcode.txt");
        cpj.files.push(printFile);
        cpj.sendToClient();
    };
    OpenClosePointOfSaleFormComponent.prototype.printReceiptForEPSON = function () {
        debugger;
        if (!this.printer) {
            console.error('Printer not connected');
            return;
        }
        this.printer.addText('Hello, World!\n');
        this.printer.addBarcode('36373737', this.printer.BARCODE_CODE39, this.printer.HRI_BELOW, this.printer.FONT_A, 2, 32);
        this.printer.addHLine(0, 575, this.printer.LINE_MEDIUM);
        this.printer.addCut(this.printer.CUT_FEED);
        this.printer.addTextDouble(true, true);
        this.printer.addText('Hello, World!\n');
        this.printer.send();
    };
    OpenClosePointOfSaleFormComponent.prototype.handleDailySales = function (dailyData) {
        var _this = this;
        this.loading.show();
        if (!this.selectedDate[dailyData.pointOfSaleId]) {
            this.loading.hide();
            console.log(this.selectedDate);
            sweetalert2_1["default"].fire({
                icon: 'info',
                title: 'Date Required',
                text: 'Please select a date before proceeding.',
                confirmButtonText: 'OK'
            });
            return;
        }
        this.paymentService
            .GetPointOfSaleDailyExcelReport(dailyData.companyId, 0, dailyData.pointOfSaleId, this.selectedDate[dailyData.pointOfSaleId])
            .subscribe({
            next: function (blob) {
                if (!blob || blob.size === 0) {
                    sweetalert2_1["default"].fire({
                        icon: 'info',
                        title: 'No Data',
                        text: 'No data found for the selected date and company.',
                        confirmButtonText: 'OK'
                    });
                    _this.loading.hide();
                    return;
                }
                var a = document.createElement('a');
                var objectUrl = URL.createObjectURL(blob);
                a.href = objectUrl;
                a.download = 'PointOfSaleDailyReport.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(objectUrl);
                _this.loading.hide();
            },
            error: function (err) {
                console.error('Error fetching report:', err);
                var errorMessage = 'An error occurred while fetching the report.';
                if (err.status === 404) {
                    errorMessage = 'No data found.';
                }
                else if (err.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
                sweetalert2_1["default"].fire({
                    icon: 'info',
                    title: 'Warning',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
                _this.loading.hide();
            }
        });
    };
    __decorate([
        core_1.ViewChild('tlprint', { static: false })
    ], OpenClosePointOfSaleFormComponent.prototype, "tlprint");
    __decorate([
        core_1.ViewChild("actionTemplate")
    ], OpenClosePointOfSaleFormComponent.prototype, "actionTemplate");
    __decorate([
        core_1.ViewChild('tlprintFrame', { static: false })
    ], OpenClosePointOfSaleFormComponent.prototype, "tlprintFrame");
    __decorate([
        core_1.ViewChild('openModalRef')
    ], OpenClosePointOfSaleFormComponent.prototype, "openModalRef");
    __decorate([
        core_1.ViewChild('closePointOfSaleRef')
    ], OpenClosePointOfSaleFormComponent.prototype, "closePointOfSaleRef");
    OpenClosePointOfSaleFormComponent = __decorate([
        core_1.Component({
            selector: 'app-open-close-point-of-sale-form',
            templateUrl: './open-close-point-of-sale-form.component.html',
            inputs: ['pointOfSaleList'],
            outputs: ['onSaleStart', 'reFreshPointOfSale']
        })
    ], OpenClosePointOfSaleFormComponent);
    return OpenClosePointOfSaleFormComponent;
}());
exports.OpenClosePointOfSaleFormComponent = OpenClosePointOfSaleFormComponent;
