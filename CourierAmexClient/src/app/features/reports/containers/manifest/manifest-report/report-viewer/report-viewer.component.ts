import { Component, Input, OnInit } from '@angular/core';
import { LoadingService } from '@app/@core';
import { ManifestService } from '@app/features/manifest';
import { ManifestBillingInfo, ManifestGeneralInfo, manifestTableHeaders } from '@app/features/reports/models';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {
  @Input() entity!: ManifestGeneralInfo;
  @Input() entityList!: ManifestBillingInfo[];
  @Input() companyName!: string;
  @Input() reportName!: string;
  @Input() html!: string;
  @Input() manifestNumber!: string;
  @Input() companyId: number;

  headers: string[] = manifestTableHeaders;
  upperpart = this.entity;

  tabledata  =this.entityList;
  totalWeight=0;
  totalVolumeWeight=0
  totalCubicFeet=0

constructor(
    
    private loading: LoadingService,
   
    private manifestService: ManifestService
  ) { }


  ngOnInit() {
  }


  exportToExcel2() {
    console.log("exportToExcel=========<<<");
    this.manifestService.GetExcel_ManifestReport(this.manifestNumber, this.companyId ?? -1).subscribe(blob => {
      this.loading.hide();
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `ManifestReport_${this.manifestNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    })
  }

  async exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Shipment Manifest');
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
    worksheet.getCell('C3').value = this.entity?.manifestNumber;
    worksheet.getCell('E3').value = 'DATE:';
    worksheet.getCell('F3').value = new Date(this.entity?.date).toLocaleString();
    worksheet.getCell('F3').alignment = {vertical: 'middle' , wrapText: true};
    worksheet.getCell('A3').alignment = {vertical: 'middle' , wrapText: true};

    worksheet.getCell('A3').font = { bold: true , size: 14};
    worksheet.getCell('E3').font = { bold: true , size: 14};
    worksheet.getCell('F3').font = { bold: true, size: 14 };
    worksheet.getCell('C3').font = { bold: true, size: 14 };

    worksheet.getCell('A4').value = 'GENERAL ADDRESS:';
    worksheet.getCell('C4').value = this.entity?.address;
    worksheet.getCell('C4').alignment = { horizontal: 'left', vertical: 'middle' , wrapText: true};
    worksheet.getCell('A4').alignment = { horizontal: 'left', vertical: 'middle' , wrapText: true};
    worksheet.getCell('A4').font = { bold: true, size: 14 };
    worksheet.getCell('C4').font = { bold: true, size: 14 };

    worksheet.addRow([]); // Empty Row
      // Apply top border to each cell in A5:G5
      const columnsmain = ['A','B', 'C', 'D', 'E', 'F', 'G','H','I','J'];
      const columns = ['B', 'C', 'D', 'E', 'F', 'G','H','I','J'];
      columnsmain.forEach(col => {
          worksheet.getCell(`${col}5`).border = {
              top: { style: 'thin', color: { argb: '696969' } }, // Black top border
              left: { style: 'thin', color: { argb: 'FFFFFF' } }, // White left border
              right: { style: 'thin', color: { argb: 'FFFFFF' } }, // White right border
              bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
          };
      });
    // Table Data - Grouped by Child Guide
    let rowIndex = worksheet.lastRow ? worksheet.lastRow.number + 1 : 7;
    let groupedData = this.groupByChildGuide(this.entityList);
    for (const [childGuide, records] of Object.entries(groupedData)  as [string, any[]][]) {
      // Child Guide Header
      worksheet.mergeCells(`B${rowIndex}:J${rowIndex}`);
      worksheet.getCell(`B${rowIndex}`).value = `Guía Hija: ${childGuide}`;
      worksheet.getCell(`B${rowIndex}`).font = { bold: true, size: 12 };
      columns.forEach(col => {
        worksheet.getCell(`${col}${rowIndex}`).border = {
            top: { style: 'thin', color: { argb: 'FFFFFF' } }, // Black top border
            left: { style: 'thin', color: { argb: 'FFFFFF' } }, // White left border
            right: { style: 'thin', color: { argb: 'FFFFFF' } }, // White right border
            bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
        };
    });
      rowIndex++;

      // Column Headers
      worksheet.addRow(this.headers).font = { bold: true };
      columns.forEach(col => {
      worksheet.getCell(`${col}${rowIndex}`).border = {
        top: { style: 'thin', color: { argb: '696969' } }, // Black top border
        left: { style: 'thin', color: { argb: '696969' } }, // White left border
        right: { style: 'thin', color: { argb: '696969' } }, // White right border
        bottom: { style: 'thin', color: { argb: '696969' } } // White bottom border
    };
    });
      rowIndex++;

      //  Rows
      
      if (records.length > 0) {
      for (const record of records) {
        this.totalWeight+=record.weight
        this.totalVolumeWeight+=record.volumeWeight
        this.totalCubicFeet+=record.cubicFeet
        const newrow = worksheet.addRow([
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
        newrow.eachCell((cell: ExcelJS.Cell) => {
          cell.font = { bold: true , size: 9 };
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
      worksheet.getCell(`G${rowIndex + records.length}`).value = 'Peso Parcial:';
      worksheet.getCell(`G${rowIndex + records.length}`).font = { bold: true };
      worksheet.getCell(`G${rowIndex+ records.length}`).border = {
                top: { style: 'thin', color: { argb: 'FFFFFF' } }, // Black top border
                left: { style: 'thin', color: { argb: 'FFFFFF' } }, // White left border
                right: { style: 'thin', color: { argb: 'FFFFFF' } }, // White right border
                bottom: { style: 'thin', color: { argb: 'FFFFFF' } } // White bottom border
            };
            
      worksheet.getCell(`H${rowIndex + records.length}`).value = this.totalWeight;
      worksheet.getCell(`H${rowIndex + records.length}`).alignment ={ horizontal: 'left', vertical: 'middle' };
      worksheet.getCell(`H${rowIndex + records.length}`).font = { bold: true };
      worksheet.getCell(`I${rowIndex + records.length}`).value = this.totalVolumeWeight;
      worksheet.getCell(`I${rowIndex + records.length}`).alignment ={ horizontal: 'left', vertical: 'middle' };
      worksheet.getCell(`I${rowIndex + records.length}`).font = { bold: true };
      worksheet.getCell(`J${rowIndex + records.length}`).value = this.totalCubicFeet;
      worksheet.getCell(`J${rowIndex + records.length}`).alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getCell(`J${rowIndex + records.length}`).font = { bold: true };

      rowIndex += records.length + 2; // Move to the next group
    }

    // Final Summary Row
    worksheet.addRow([]);
   // worksheet.mergeCells(`E${rowIndex}:B${rowIndex}`);
    worksheet.getCell(`E${rowIndex}`).value = 'Paquetes:';
    worksheet.getCell(`E${rowIndex}`).font = { bold: true };
    worksheet.getCell(`F${rowIndex}`).value = 0
    worksheet.getCell(`F${rowIndex}`).font = { bold: true };
    worksheet.getCell(`G${rowIndex}`).value ='Peso Total:';
    worksheet.getCell(`G${rowIndex}`).font = { bold: true };
    worksheet.getCell(`H${rowIndex}`).value = this.totalWeight;
    worksheet.getCell(`H${rowIndex}`).alignment ={ horizontal: 'left', vertical: 'middle' };
    worksheet.getCell(`H${rowIndex}`).font = { bold: true };
    worksheet.getCell(`I${rowIndex}`).value = this.totalVolumeWeight;
    worksheet.getCell(`I${rowIndex}`).alignment ={ horizontal: 'left', vertical: 'middle' };
    worksheet.getCell(`I${rowIndex}`).font = { bold: true };
    worksheet.getCell(`J${rowIndex}`).value = this.totalCubicFeet;
    worksheet.getCell(`J${rowIndex}`).alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getCell(`J${rowIndex}`).font = { bold: true };


    ['A1','B1','C1','D1','E1','F1', 'A2','B2','C2','D2','E2','F2','A3','C3','D3','E3','F3','G3','A4','B4','C4','D4','E4','F4','B5'
      ].map(key => {
        worksheet.getCell(key).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' },
          bgColor: { argb: 'FFFFFF' }
        };
      });
      const startRow = 5; // Change this to the row number you want to start from

      worksheet.columns.forEach((column: any) => {
        let maxLength = 2; // Default minimum width

        column.eachCell({ includeEmpty: true }, (cell: any) => {
          // Only adjust width for rows starting from 'startRow'
          if (cell.row >= startRow) {
            const cellValue = cell.value ? cell.value.toString() : "";
            maxLength = Math.max(maxLength, cellValue.length);
          }
        });
        column.width = maxLength; // Adding padding for better visibility
      });
    // Save File
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), this.entity?.manifestNumber+'-ShipmentManifest.xlsx');
  }

  groupByChildGuide(data: any[]) {  
    if (!Array.isArray(data)) {
      console.error("Error: data is not an array", data);
      return {}; // Return an empty object to prevent errors
    }
  
    return data.reduce((acc, item) => {
      if (!acc[item.childGuide]) {
        acc[item.childGuide] = [];
      }
      acc[item.childGuide].push(item);
      return acc;
    }, {} as { [key: string]: any[] });
    
  }
}