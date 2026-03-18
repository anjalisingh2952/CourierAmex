import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
declare var epson: any;
@Injectable({
  providedIn: 'root'
})

export class PrinterService {
  private printerConnected$ = new BehaviorSubject<boolean>(false);
  private ePosDev: any;
  private printer: any;
  public weight$ = new BehaviorSubject<number | null>(null);

  constructor() {
    this.ePosDev = new epson.ePOSDevice();
  }

  connect(ip: string, port: string = '8008'): Promise<boolean> {
    return new Promise((resolve) => {
      this.ePosDev.connect(ip, port, (result: string) => {
        if (result === 'OK' || result === 'SSL_CONNECT_OK') {
          this.ePosDev.createDevice(
            'local_printer',
            this.ePosDev.DEVICE_TYPE_PRINTER,
            { crypto: false, buffer: false },
            (devobj: any, retcode: string) => {
              if (retcode === 'OK') {
                this.printer = devobj;
                this.printerConnected$.next(true);
                resolve(true);
              } else {
                console.error('CreateDevice Error:', retcode);
                this.printerConnected$.next(false);
                resolve(false);
              }
            }
          );
        } else {
          console.error('Connect Error:', result);
          resolve(false);
        }
      });
    });
  }

  getPrinterStatusObservable() {
    return this.printerConnected$.asObservable();
  }



  printReceipt(data: any, isOriginal: boolean = true) {
    const p = this.printer;
    if (!p) return;
    const totalLineWidth = 48;
    const details = data.details ?? [];
    const services = details.filter((s: any) => s.productType === 'Services');
    const otherCharges = details.filter((s: any) => s.productType === 'OtherCharges');
    const customs = details.filter((s: any) => s.productType === 'CustomsTax');
    const packages = data.packages ?? [];


    try {
      try {
        p.addTextFont(p.FONT_A);
        p.addTextAlign(p.ALIGN_CENTER);
        p.addTextStyle(false, false, true, p.COLOR_1);
        p.addText(`${data.company?.name ?? ''}\n`);
        p.addTextStyle(false, false, false, p.COLOR_1);
        p.addText(`${data.company?.address ?? ''}\n`);
        p.addText(`Tel: ${data.company?.phone ?? ''}\n`);
        p.addText(`Email: ${data.company?.email ?? ''}\n`);
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
      } catch (e) {
        console.error("Header print error:", e);
      }


      // Invoice Info
      const invoiceDate = data.invoice?.date ? new Date(data.invoice.date) : new Date();
      const invoiceTimeString = invoiceDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
      const [invoiceTime, ampm] = invoiceTimeString.split(' ');
      const formattedInvoiceDate = `${invoiceDate.toLocaleDateString('es-ES')} ${invoiceTime} ${ampm.toLowerCase()}`;
      const now = new Date();
      const receiptTimeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
      const [receiptTime, receiptAmpm] = receiptTimeString.split(' ');
      const formattedReceiptDate = `${now.toLocaleDateString('es-ES')} ${receiptTime} ${receiptAmpm.toLowerCase()}`;
      try {
        p.addTextAlign(p.ALIGN_LEFT);
        p.addTextStyle(false, false, false, p.COLOR_1);
        p.addTextAlign(p.ALIGN_CENTER);
        p.addText(`FACTURA NO. ${data.invoice?.invoiceNumber ?? ''}\n`);
        p.addTextAlign(p.ALIGN_LEFT);
        p.addTextStyle(false, false, false, p.COLOR_1);
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
        p.addText(`Fecha Factura:`.padEnd(20) + `${formattedInvoiceDate}\n`);
        // p.addText(`Fecha Recibo:`.padEnd(20) + `${formattedReceiptDate}\n`);
        p.addText(`Tipo de Cambio:`.padEnd(20) + `${data.invoice?.exchangeRatePurchase?.toFixed(2) ?? '0.00'}\n`);
        p.addText(`No Cliente:`.padEnd(20) + `${data.invoice?.client ?? ''}\n`);
        p.addText(`Cliente:`.padEnd(20) + `${data.invoice?.fullName ?? ''}\n`);
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
      } catch (e) {
        console.error("Invoice print error:", e);
      }

      // Packages
      const totalPeso = packages.reduce((sum: number, s: any) => sum + s.weight, 0);
      const totalVolume = packages.reduce((sum: number, pkg: any) => sum + pkg.height * pkg.width * pkg.long, 0);
      try {
        if (packages.length > 0) {
          p.addTextAlign(p.ALIGN_CENTER);
          p.addFeedLine(1);
          p.addTextStyle(false, false, true, p.COLOR_1);
          p.addText("DETALLE DE PAQUETES EN FACTURA\n");
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_LEFT);
          p.addHLine(0, 575, p.LINE_THIN);
          p.addText('-'.repeat(totalLineWidth) + '\n');
          p.addTextStyle(false, false, false, p.COLOR_1);
          var header = ['AnexTrack', 'Peso', 'Volum', 'Courier']
          const head = makePrintStringAmex(header[0], header[1], header[2], header[3])
          p.addText(head + "\n")
          for (const pkg of packages) {
            const volum = pkg.height * pkg.width * pkg.long;
            const line = makePrintStringAmex(pkg.number.toString(), pkg.weight, (volum.toFixed(2)).toString(), pkg.courier);
            p.addText(line + "\n");
          }
          p.addTextStyle(false, false, true, p.COLOR_1);
          const line = makePrintStringAmex("Total", totalPeso.toString(), (totalVolume).toString(), "");
          p.addText(line + "\n");
          p.addTextStyle(false, false, false, p.COLOR_1);
        }
      } catch (e) {
        console.error("Packages print error:", e);
      }

      // Services
      try {
        if (services.length > 0) {
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_CENTER);
          p.addTextStyle(false, false, true, p.COLOR_1);
          p.addText("SERVICIOS\n");
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_LEFT);
          p.addHLine(0, 575, p.LINE_THIN);
          p.addText('-'.repeat(totalLineWidth) + '\n');
          p.addTextStyle(false, false, false, p.COLOR_1);
          var header = ['Articulo', 'Cant', 'Precio', 'Total']
          const head = makePrintString(header[0], header[1], header[2], header[3])
          p.addText(head + "\n")
          for (const s of services) {
            const total = s.quantity * s.price;
            p.addText(makePrintString(s.description, s.quantity, ((s.price).toFixed(2)).toString(), ((total).toFixed(2)).toString()) + '\n');
          }
        }
      } catch (e) {
        console.error("Services print error:", e);
      }

      // Other Charges
      try {
        if (otherCharges.length > 0) {
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_CENTER);
          p.addTextStyle(false, false, true, p.COLOR_1);
          p.addText("OTROS CARGOS\n");
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_LEFT);
          p.addHLine(0, 575, p.LINE_THIN);
          p.addText('-'.repeat(totalLineWidth) + '\n');
          p.addTextStyle(false, false, false, p.COLOR_1);
          var header = ['Articulo', 'Cant', 'Precio', 'Total']
          const head = makePrintString(header[0], header[1], header[2], header[3])
          p.addText(head + "\n")

          for (const s of otherCharges) {
            const total = s.quantity * s.price;
            p.addText(makePrintString(s.description, s.quantity, ((s.price).toFixed(2)).toString(), ((total).toFixed(2)).toString()) + '\n');
          }
        }
      } catch (e) {
        console.error("Other charges print error:", e);
      }

      // Customs
      try {
        if (customs.length > 0) {
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_CENTER);
          p.addTextStyle(false, false, true, p.COLOR_1);
          p.addText("IMPUESTOS DE ADUANA\n");
          p.addFeedLine(1);
          p.addTextAlign(p.ALIGN_LEFT);
          p.addHLine(0, 575, p.LINE_THIN);
          p.addText('-'.repeat(totalLineWidth) + '\n');
          p.addTextStyle(false, false, false, p.COLOR_1);
          var header = ['Articulo', 'Cant', 'Precio', 'Total']
          const head = makePrintString(header[0], header[1], header[2], header[3])
          p.addText(head + "\n")

          for (const s of customs) {
            const total = s.quantity * s.price;
            var txt = makePrintString(s.description, s.quantity, ((s.price).toFixed(2)).toString(), ((total).toFixed(2)).toString());
            p.addText(txt + '\n');
          }
        }
      } catch (e) {
        console.error("Customs print error:", e);
      }

      // Additional Info for payment
      const baseLineWidth = 48;
      const baseLineWidthFont2 = 24;
      const formatNumber = (value: number): string =>
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      const getAdjustedLineWidth = (scaleX: number) => Math.floor(baseLineWidth / scaleX);
      const servicesTotal = services.reduce((sum: number, s: any) => sum + s.quantity * s.price, 0);
      const otherChargesTotal = otherCharges.reduce((sum: number, o: any) => sum + o.quantity * o.price, 0);
      const customsTotal = customs.reduce((sum: number, c: any) => sum + c.quantity * c.price, 0);
      const subtotal = servicesTotal + otherChargesTotal + customsTotal;

      try {
        const printLine = (label: string, value: number, scaleX: number) => {
          const lineWidth = getAdjustedLineWidth(scaleX);
          const formattedValue = formatNumber(value);
          const maxLabelLength = lineWidth - formattedValue.length;
          const trimmedLabel = label.length > maxLabelLength
            ? label.slice(0, maxLabelLength - 1) + '…'
            : label;
          var spaces = ' '.repeat(Math.max(1, lineWidth - trimmedLabel.length - formattedValue.length));
          if (label == "Total") {
            spaces = ' '.repeat(Math.max(1, lineWidth - trimmedLabel.length - formattedValue.length - 1));
            p.addText(`${trimmedLabel}${spaces}$${formattedValue}\n`);
          }
          else {
            p.addText(`${trimmedLabel}${spaces}${formattedValue}\n`);
          }
        };

        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
        p.addTextAlign(p.ALIGN_LEFT);
        p.addTextStyle(false, false, false, p.COLOR_1);
        printLine('SubTotal(Servicios)', subtotal, 1);
        printLine('I.V.A', servicesTotal, 1);
        printLine('Otros Cargos', otherChargesTotal, 1);
        printLine('Impuestos de Aduana', customsTotal, 1);
        p.addText('-'.repeat(baseLineWidth) + '\n');
        p.addTextSize(2, 1);
        printLine('Total', data.invoice?.total ?? 0, 2);
        printLine('Total Local', data.invoice?.totalLocal ?? 0, 2);
        printLine('Saldo', data.invoice?.balance ?? 0, 2);
        p.addTextSize(1, 1);
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
        p.addTextSize(2, 1);
        p.addFeedLine(1);
        p.addTextAlign(p.ALIGN_CENTER);
        p.addTextStyle(false, false, true, p.COLOR_1);
        p.addText("DETALLE DEL PAGO\n");
        p.addFeedLine(1);
        p.addText('-'.repeat(baseLineWidthFont2) + '\n');
        printLine('Pagado', data.invoice?.paidAmount ?? 0, 2);
        printLine('Cambio', data.invoice?.change ?? 0, 2);
        p.addTextSize(1, 1);

      } catch (e) {
        console.error("Totals print error:", e);
      }

      try {
        p.addTextStyle(false, false, false, p.COLOR_1);
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);

        p.addTextStyle(false, false, true, p.COLOR_1);
        printAlignedLine(p, 'FECHA RECIBO', formattedReceiptDate ?? '', totalLineWidth);
        printAlignedLine(p, 'MONEDA', data.invoice?.currency ?? '', totalLineWidth);
        printAlignedLine(p, 'FORMA DE PAGO', data.invoice?.paymentType ?? '', totalLineWidth);
        printAlignedLine(p, 'TIPO', data.invoice?.subPaymentType ?? '', totalLineWidth);
        printAlignedLine(p, 'REFERENCIA:', data.invoice?.reference ?? '', totalLineWidth);
        printAlignedLine(p, 'SALDO EN SU CUENTA:', `$${(data.balance ?? 0).toFixed(2)}`, totalLineWidth);
        p.addTextStyle(false, false, false, p.COLOR_1);
      } catch (e) {
        console.error("Payment print error:", e);
      }

      // Footer
      try {
        p.addTextStyle(false, false, false, p.COLOR_1);
        p.addFeedLine(1);
        printAlignedLine(p, 'NOMBRE DE USUARIO:', data.invoice?.user ?? '', totalLineWidth);
        printAlignedLine(p, `LES ATENDIO:`, `Caja No: ${data.invoice?.pointOfSale ?? ""}`, totalLineWidth);
        p.addText("Autorizado por resolucion 11-97 de la D.G.T.D.\n");
        p.addText("el 8 de septiembre de 1997\n");
        p.addFeedLine(1);
        if (isOriginal) {
          p.addText("RECIBIDO CONFORME\n");
        }
        p.addText('-'.repeat(totalLineWidth) + '\n');
        p.addFeedLine(1);
        p.addHLine(0, 575, p.LINE_THIN);
        p.addTextAlign(p.ALIGN_CENTER);
        p.addTextStyle(false, false, true, p.COLOR_2);
        p.addBarcode(data.invoice?.invoiceNumber ?? "000000", p.BARCODE_GS1_128, p.HRI_BELOW, p.FONT_A, 4, 64);
        p.addFeedLine(2);
      } catch (e) {
        console.error("Footer print error:", e);
      }

    } catch (err) {
      console.error("Unexpected printReceipt error:", err);
    } finally {
      try {
        p.addCut(p.CUT_FEED);
        p.send();
      } catch (sendError) {
        console.error("Printer send failed:", sendError);
      }
    }
  }
}

function truncateWithEllipsis(str: any, maxLength: number): string {
  const safeStr = (str ?? '').toString();
  if (safeStr.length <= maxLength) return safeStr.padEnd(maxLength);
  return safeStr.slice(0, Math.max(0, maxLength - 2)) + '..';
}

function makePrintStringAmex(
  strNumero: string,
  strPeso: string,
  strVolumen: string,
  strCourier: string,
  iLineChars: number = 48
): string {
  const widths = { numero: 10, peso: 6, volumen: 7, courier: 21 };
  const spacesBetweenColumns = 1;

  const totalWidthUsed = widths.numero + widths.peso + widths.volumen + widths.courier + (spacesBetweenColumns * 3);
  if (totalWidthUsed > iLineChars) {
    throw new Error(`Total width (${totalWidthUsed}) exceeds allowed line width (${iLineChars}).`);
  }

  const parts = [
    truncateWithEllipsis(strNumero, widths.numero).padEnd(widths.numero),
    truncateWithEllipsis(strPeso, widths.peso).padStart(widths.peso),
    truncateWithEllipsis(strVolumen, widths.volumen).padStart(widths.volumen),
    truncateWithEllipsis(strCourier, widths.courier).padEnd(widths.courier)
  ];

  let result = parts.join(' '.repeat(spacesBetweenColumns));

  if (result.length > iLineChars) {
    result = result.slice(0, iLineChars);
  } else if (result.length < iLineChars) {
    result = result.padEnd(iLineChars);
  }

  return result;
}

function makePrintString(
  description: string,
  quantity: string,
  price: string,
  total: string,
  iLineChars: number = 48
): string {
  const widths = { desc: 19, qty: 5, price: 10, total: 10 };
  const spacesBetweenColumns = 1;

  const totalWidthUsed = widths.desc + widths.qty + widths.price + widths.total + (spacesBetweenColumns * 3);
  if (totalWidthUsed > iLineChars) {
    throw new Error(`Total width (${totalWidthUsed}) exceeds allowed line width (${iLineChars}).`);
  }

  const desc = truncateWithEllipsis(description, widths.desc);
  const qty = truncateWithEllipsis(quantity, widths.qty);
  const prc = truncateWithEllipsis(price, widths.price);
  const tot = truncateWithEllipsis(total, widths.total);

  let result = `${desc}${' '.repeat(spacesBetweenColumns)}${qty}${' '.repeat(spacesBetweenColumns)}${prc}${' '.repeat(spacesBetweenColumns)}${tot}`;

  if (result.length > iLineChars) {
    result = result.slice(0, iLineChars);
  } else if (result.length < iLineChars) {
    result = result.padEnd(iLineChars);
  }

  return result;
}

function printAlignedLine(
  p: { addText: (text: string) => void },
  leftText: string,
  rightText: string,
  totalWidth: number = 48
) {
  const maxLeft = totalWidth - rightText.length - 1;
  const left = truncateWithEllipsis(leftText, maxLeft);

  const spaces = ' '.repeat(totalWidth - left.length - rightText.length);
  const line = `${left}${spaces}${rightText}`;

  let finalLine = line;
  if (line.length > totalWidth) {
    finalLine = line.slice(0, totalWidth);
  } else if (line.length < totalWidth) {
    finalLine = line.padEnd(totalWidth);
  }

  p.addText(finalLine + '\n');
}