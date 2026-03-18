"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ReportViewerComponent = void 0;
var core_1 = require("@angular/core");
var models_1 = require("@app/features/reports/models");
var ExcelJS = require("exceljs");
var file_saver_1 = require("file-saver");
var ReportViewerComponent = /** @class */ (function () {
    function ReportViewerComponent() {
        this.headers = models_1.manifestTableHeaders;
        this.upperpart = this.entity;
        this.tabledata = this.entityList;
        this.totalWeight = 0;
        this.totalVolumeWeight = 0;
        this.totalCubicFeet = 0;
    }
    ReportViewerComponent.prototype.ngOnInit = function () {
    };
    ReportViewerComponent.prototype.exportToExcel = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var workbook, worksheet, columnsmain, columns, rowIndex, groupedData, _i, _e, _f, childGuide, records, _g, records_1, record, newrow, startRow, buffer;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        worksheet = workbook.addWorksheet('Shipment Manifest');
                        worksheet.views = [{ showGridLines: false }];
                        //  Header Section
                        worksheet.mergeCells('A1:I1');
                        worksheet.mergeCells('A4:B4');
                        worksheet.mergeCells('A3:B3');
                        worksheet.mergeCells('C4:I4');
                        worksheet.mergeCells('F3:H3');
                        worksheet.getCell('A1').value = this.companyName;
                        worksheet.getCell('A1').font = { bold: true, size: 19 };
                        worksheet.mergeCells('A2:I2');
                        worksheet.getCell('A2').value = this.reportName;
                        worksheet.getCell('A2').font = { bold: true, size: 19 };
                        worksheet.getCell('A3').value = 'AWB#:';
                        worksheet.getCell('C3').value = (_a = this.entity) === null || _a === void 0 ? void 0 : _a.manifestNumber;
                        worksheet.getCell('E3').value = 'DATE:';
                        worksheet.getCell('F3').value = new Date((_b = this.entity) === null || _b === void 0 ? void 0 : _b.date).toLocaleString();
                        worksheet.getCell('F3').alignment = { vertical: 'middle', wrapText: true };
                        worksheet.getCell('A3').alignment = { vertical: 'middle', wrapText: true };
                        worksheet.getCell('A3').font = { bold: true, size: 14 };
                        worksheet.getCell('E3').font = { bold: true, size: 14 };
                        worksheet.getCell('F3').font = { bold: true, size: 14 };
                        worksheet.getCell('C3').font = { bold: true, size: 14 };
                        worksheet.getCell('A4').value = 'GENERAL ADDRESS:';
                        worksheet.getCell('C4').value = (_c = this.entity) === null || _c === void 0 ? void 0 : _c.address;
                        worksheet.getCell('C4').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                        worksheet.getCell('A4').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                        worksheet.getCell('A4').font = { bold: true, size: 14 };
                        worksheet.getCell('C4').font = { bold: true, size: 14 };
                        worksheet.addRow([]); // Empty Row
                        columnsmain = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                        columns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                        columnsmain.forEach(function (col) {
                            worksheet.getCell(col + "5").border = {
                                top: { style: 'thin', color: { argb: '696969' } },
                                left: { style: 'thin', color: { argb: 'FFFFFF' } },
                                right: { style: 'thin', color: { argb: 'FFFFFF' } },
                                bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
                            };
                        });
                        rowIndex = worksheet.lastRow ? worksheet.lastRow.number + 1 : 7;
                        groupedData = this.groupByChildGuide(this.entityList);
                        for (_i = 0, _e = Object.entries(groupedData); _i < _e.length; _i++) {
                            _f = _e[_i], childGuide = _f[0], records = _f[1];
                            // Child Guide Header
                            worksheet.mergeCells("B" + rowIndex + ":J" + rowIndex);
                            worksheet.getCell("B" + rowIndex).value = "Gu\u00EDa Hija: " + childGuide;
                            worksheet.getCell("B" + rowIndex).font = { bold: true, size: 12 };
                            columns.forEach(function (col) {
                                worksheet.getCell("" + col + rowIndex).border = {
                                    top: { style: 'thin', color: { argb: 'FFFFFF' } },
                                    left: { style: 'thin', color: { argb: 'FFFFFF' } },
                                    right: { style: 'thin', color: { argb: 'FFFFFF' } },
                                    bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
                                };
                            });
                            rowIndex++;
                            // Column Headers
                            worksheet.addRow(this.headers).font = { bold: true };
                            columns.forEach(function (col) {
                                worksheet.getCell("" + col + rowIndex).border = {
                                    top: { style: 'thin', color: { argb: '696969' } },
                                    left: { style: 'thin', color: { argb: '696969' } },
                                    right: { style: 'thin', color: { argb: '696969' } },
                                    bottom: { style: 'thin', color: { argb: '696969' } } // White bottom border
                                };
                            });
                            rowIndex++;
                            //  Rows
                            if (records.length > 0) {
                                for (_g = 0, records_1 = records; _g < records_1.length; _g++) {
                                    record = records_1[_g];
                                    this.totalWeight += record.weight;
                                    this.totalVolumeWeight += record.volumeWeight;
                                    this.totalCubicFeet += record.cubicFeet;
                                    newrow = worksheet.addRow([
                                        null,
                                        record.packageNumbers,
                                        record.customerName,
                                        record.courier,
                                        record.origin,
                                        record.courierNumber,
                                        record.description,
                                        record.weight,
                                        record.volumeWeight,
                                        record.cubicFeet
                                    ]);
                                    newrow.eachCell(function (cell) {
                                        cell.font = { bold: true, size: 9 };
                                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                                        cell.border = {
                                            top: { style: 'thin', color: { argb: '696969' } },
                                            left: { style: 'thin', color: { argb: '696969' } },
                                            right: { style: 'thin', color: { argb: '696969' } },
                                            bottom: { style: 'thin', color: { argb: '696969' } }
                                        };
                                    });
                                }
                            }
                            //  Peso Parcial Row
                            //worksheet.mergeCells(`G${rowIndex + records.length}:J${rowIndex + records.length}`);
                            worksheet.getCell("G" + (rowIndex + records.length)).value = 'Peso Parcial:';
                            worksheet.getCell("G" + (rowIndex + records.length)).font = { bold: true };
                            worksheet.getCell("G" + (rowIndex + records.length)).border = {
                                top: { style: 'thin', color: { argb: 'FFFFFF' } },
                                left: { style: 'thin', color: { argb: 'FFFFFF' } },
                                right: { style: 'thin', color: { argb: 'FFFFFF' } },
                                bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
                            };
                            worksheet.getCell("H" + (rowIndex + records.length)).value = this.totalWeight;
                            worksheet.getCell("H" + (rowIndex + records.length)).alignment = { horizontal: 'left', vertical: 'middle' };
                            worksheet.getCell("H" + (rowIndex + records.length)).font = { bold: true };
                            worksheet.getCell("I" + (rowIndex + records.length)).value = this.totalVolumeWeight;
                            worksheet.getCell("I" + (rowIndex + records.length)).alignment = { horizontal: 'left', vertical: 'middle' };
                            worksheet.getCell("I" + (rowIndex + records.length)).font = { bold: true };
                            worksheet.getCell("J" + (rowIndex + records.length)).value = this.totalCubicFeet;
                            worksheet.getCell("J" + (rowIndex + records.length)).alignment = { horizontal: 'left', vertical: 'middle' };
                            worksheet.getCell("J" + (rowIndex + records.length)).font = { bold: true };
                            rowIndex += records.length + 2; // Move to the next group
                        }
                        // Final Summary Row
                        worksheet.addRow([]);
                        // worksheet.mergeCells(`E${rowIndex}:B${rowIndex}`);
                        worksheet.getCell("E" + rowIndex).value = 'Paquetes:';
                        worksheet.getCell("E" + rowIndex).font = { bold: true };
                        worksheet.getCell("F" + rowIndex).value = 0;
                        worksheet.getCell("F" + rowIndex).font = { bold: true };
                        worksheet.getCell("G" + rowIndex).value = 'Peso Total:';
                        worksheet.getCell("G" + rowIndex).font = { bold: true };
                        worksheet.getCell("H" + rowIndex).value = this.totalWeight;
                        worksheet.getCell("H" + rowIndex).alignment = { horizontal: 'left', vertical: 'middle' };
                        worksheet.getCell("H" + rowIndex).font = { bold: true };
                        worksheet.getCell("I" + rowIndex).value = this.totalVolumeWeight;
                        worksheet.getCell("I" + rowIndex).alignment = { horizontal: 'left', vertical: 'middle' };
                        worksheet.getCell("I" + rowIndex).font = { bold: true };
                        worksheet.getCell("J" + rowIndex).value = this.totalCubicFeet;
                        worksheet.getCell("J" + rowIndex).alignment = { horizontal: 'left', vertical: 'middle' };
                        worksheet.getCell("J" + rowIndex).font = { bold: true };
                        ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'A3', 'C3', 'D3', 'E3', 'F3', 'G3', 'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'B5'
                        ].map(function (key) {
                            worksheet.getCell(key).fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFFFF' },
                                bgColor: { argb: 'FFFFFF' }
                            };
                        });
                        startRow = 5;
                        worksheet.columns.forEach(function (column) {
                            var maxLength = 2; // Default minimum width
                            column.eachCell({ includeEmpty: true }, function (cell) {
                                // Only adjust width for rows starting from 'startRow'
                                if (cell.row >= startRow) {
                                    var cellValue = cell.value ? cell.value.toString() : "";
                                    maxLength = Math.max(maxLength, cellValue.length);
                                }
                            });
                            column.width = maxLength; // Adding padding for better visibility
                        });
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 1:
                        buffer = _h.sent();
                        file_saver_1.saveAs(new Blob([buffer]), ((_d = this.entity) === null || _d === void 0 ? void 0 : _d.manifestNumber) + '-ShipmentManifest.xlsx');
                        return [2 /*return*/];
                }
            });
        });
    };
    ReportViewerComponent.prototype.groupByChildGuide = function (data) {
        if (!Array.isArray(data)) {
            console.error("Error: data is not an array", data);
            return {}; // Return an empty object to prevent errors
        }
        return data.reduce(function (acc, item) {
            if (!acc[item.childGuide]) {
                acc[item.childGuide] = [];
            }
            acc[item.childGuide].push(item);
            return acc;
        }, {});
    };
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "entity");
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "entityList");
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "companyName");
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "reportName");
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "html");
    __decorate([
        core_1.Input()
    ], ReportViewerComponent.prototype, "manifestNumber");
    ReportViewerComponent = __decorate([
        core_1.Component({
            selector: 'app-report-viewer',
            templateUrl: './report-viewer.component.html',
            styleUrls: ['./report-viewer.component.scss']
        })
    ], ReportViewerComponent);
    return ReportViewerComponent;
}());
exports.ReportViewerComponent = ReportViewerComponent;
