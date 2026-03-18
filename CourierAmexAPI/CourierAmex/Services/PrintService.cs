using System.Globalization;
using CourierAmex.Services.Interfaces;
using Neodynamic.SDK.Printing;

namespace CourierAmex.Services
{
    public class PrintService : IPrintService
    {
        public ThermalLabel GeneratePackageLabel_4_6(string psNoCliente, string psNombre, String psTipoID, String psIdentificacion, string psPais, string psCiudad, string psDireccion1, string psDireccion2, string psZonaE, string psAreaE, string psEmpresa, string psPaquete, string psDescripcionPaquete, string psTotalEtiqueta, double pnPeso, string psDimensiones, double pnValor)
        //(string psNoCliente, string psNombre, string psTelefonoCliente, string psPaquete, string psEmpresaEncomienda, string psTelefonoEmpresa, string psDireccionEmpresa, string psTotalEtiqueta, string psDestino, string psTelefonoDestino)
        {

            //Define a ThermalLabel object and set unit to inch and label size
            ThermalLabel tLabel = new ThermalLabel(UnitType.Inch, 4, 6.5);
            tLabel.GapLength = 0.2;
            double lnPosicionY = 0;

            string lsEmpresaExpedidora = "DIRECT SHIPPING INC 4634 NW 47TH AVE MIAMI FLORIDA 33166 USA";
            string lsEmpresaEntrega = "AMERICAN EXPORT IMPORT AND PURCHASING S.A 3101434453";

            //get ThermalLabel SDk install dir and get the sample images
            //string imgFolder = Microsoft.Win32.Registry.LocalMachine.OpenSubKey("Software\\Neodynamic\\SDK\\ThermalLabel SDK 5.0 for .NET\\InstallDir").GetValue(null).ToString() + "\\Samples\\Images\\";

            //Define an ImageItem for AdventureWorks logo
            ImageItem awLogo = new ImageItem(2.5, 0);
            //awLogo.SourceFile = imgFolder + "adventureworks.jpg";
            //awLogo.SourceFile = imgFolder + "escudo_avion2.jpg";

            //awLogo.SourceFile = "C:/Program Files/Neodynamic/ThermalLabel SDK/v5.0/Samples/Images/" + "escudo_avion2.jpg";


            //Cambio a solicitud de Pablo
            //awLogo.SourceFile = "./resources/escudo_avion.jpg";
            awLogo.Width = 1.41;
            awLogo.LockAspectRatio = LockAspectRatio.WidthBased;
            awLogo.MonochromeSettings.DitherMethod = DitherMethod.Threshold;
            awLogo.MonochromeSettings.Threshold = 80;

            //Define a TextItem for 'Trial'
            TextItem txtTrial = new TextItem(0, lnPosicionY, 3.9, 0.25, "TRIAL");
            //font settings
            txtTrial.Font.Name = "Arial";
            txtTrial.Font.Unit = FontUnit.Point;
            txtTrial.Font.Size = 8;
            //white text on black background
            txtTrial.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            lnPosicionY += 0.25;

            //Define a TextItem for 'AE'
            TextItem txtPaquete = new TextItem(0, lnPosicionY, 3.9, 0.4, "American Export");
            //font settings
            txtPaquete.Font.Name = "Arial";
            txtPaquete.Font.Unit = FontUnit.Point;
            txtPaquete.Font.Size = 20;
            txtPaquete.Font.Bold = true;
            txtPaquete.TextAlignment = TextAlignment.Center;
            //white text on black background
            txtPaquete.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtPaquete.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtPaquete.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            lnPosicionY += 0.4;

            // ________________________________________________________________________________________

            // ________________________________________________________________________________________

            //Define a TextItem for 'Cliente'
            TextItem txtCliente = new TextItem(0, lnPosicionY, 3.9, 0.3, psNoCliente);
            //font settings
            txtCliente.Font.Name = "Arial";
            txtCliente.Font.Unit = FontUnit.Point;
            txtCliente.Font.Size = 16;
            txtCliente.Font.Bold = true;
            txtCliente.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtCliente.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtCliente.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtCliente.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            //set border
            txtCliente.BorderThickness = new FrameThickness(0.02, 0.02, 0.02, 0);

            lnPosicionY += 0.3;

            //Define a TextItem for 'Nombre'
            TextItem txtNombre = new TextItem(0, lnPosicionY, 3.9, 0.3, psNombre.Substring(0, (39 - (39 - psNombre.Length))));
            //font settings
            txtNombre.Font.Name = "Arial";
            txtNombre.Font.Unit = FontUnit.Point;
            txtNombre.Font.Size = 12;
            txtNombre.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtNombre.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtNombre.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtNombre.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            //set border
            txtNombre.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.3;

            //Define a TextItem for 'Personeria'
            //TextItem txtID = new TextItem(0, lnPosicionY, 3.9, 0.30, psTipoID + "     " + psIdentificacion);
            TextItem txtID = new TextItem(0, lnPosicionY, 3.9, 0.40, lsEmpresaExpedidora);

            //font settings
            txtID.Font.Name = "Arial Narrow";
            txtID.Font.Unit = FontUnit.Point;
            txtID.Font.Size = 10;
            txtID.TextAlignment = TextAlignment.Left;
            txtID.Font.Bold = false;
            //white text on black background
            txtID.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtID.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtID.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtID.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.4;

            TextItem txtEntrega = new TextItem(0, lnPosicionY, 3.9, 0.40, lsEmpresaEntrega);

            //font settings
            txtEntrega.Font.Name = "Arial Narrow";
            txtEntrega.Font.Unit = FontUnit.Point;
            txtEntrega.Font.Size = 10;
            txtEntrega.TextAlignment = TextAlignment.Left;
            txtEntrega.Font.Bold = false;
            //white text on black background
            txtEntrega.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtEntrega.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtEntrega.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtEntrega.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.4;

            //Define a TextItem for 'Empresa'
            TextItem txtEmpresa = new TextItem(0, lnPosicionY, 3.9, 0.20, psEmpresa);
            //font settings
            txtEmpresa.Font.Name = "Arial";
            txtEmpresa.Font.Unit = FontUnit.Point;
            txtEmpresa.Font.Size = 12;
            txtEmpresa.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtEmpresa.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtEmpresa.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtEmpresa.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtEmpresa.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.2;

            //Define a TextItem for 'Ciudad'
            TextItem txtPais = new TextItem(0, lnPosicionY, 3.9, 0.20, psPais + "  " + psCiudad);
            //font settings
            txtPais.Font.Name = "Arial";
            txtPais.Font.Unit = FontUnit.Point;
            txtPais.Font.Size = 12;
            txtPais.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtPais.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtPais.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtPais.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtPais.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.2;

            //Define a TextItem for 'Direccion'
            TextItem txtDireccion1 = new TextItem(0, lnPosicionY, 3.9, 0.20, psDireccion1);
            //font settings
            txtDireccion1.Font.Name = "Arial";
            txtDireccion1.Font.Unit = FontUnit.Point;
            txtDireccion1.Font.Size = 10;
            txtDireccion1.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtDireccion1.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtDireccion1.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtDireccion1.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtDireccion1.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.2;


            //Define a TextItem for 'Direccion'
            TextItem txtDireccion2 = new TextItem(0, lnPosicionY, 3.9, 0.20, psDireccion2);
            //font settings
            txtDireccion2.Font.Name = "Arial";
            txtDireccion2.Font.Unit = FontUnit.Point;
            txtDireccion2.Font.Size = 10;
            txtDireccion2.TextAlignment = TextAlignment.Left;
            //white text on black background
            txtDireccion2.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtDireccion2.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtDireccion2.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtDireccion2.BorderThickness = new FrameThickness(0.02, 0, 0.02, 0);

            lnPosicionY += 0.2;

            // ________________________________________________________________________________________

            //Define a BarcodeItem for a random 'Serial Number'
            //string serialNum = Guid.NewGuid().ToString().ToUpper().Substring(0, 8);
            string serialNum = psPaquete;
            BarcodeItem serialBarcode = new BarcodeItem(0, lnPosicionY, 3.9, 0.6, BarcodeSymbology.UccEan128, serialNum);
            //Set bars height to .3inch
            serialBarcode.BarHeight = 0.45;
            //Set bars width to 0.02inch
            serialBarcode.BarWidth = 0.03;
            //disable checksum
            serialBarcode.AddChecksum = false;
            //hide human readable text
            serialBarcode.DisplayCode = false;
            //set border
            serialBarcode.BorderThickness = new FrameThickness(0.02, 0.02, 0.02, 0);
            //align barcode
            serialBarcode.BarcodeAlignment = BarcodeAlignment.MiddleCenter;

            lnPosicionY += 0.6;
            //Define a TextItem for 'Serial Num'
            TextItem txtSN;
            txtSN = new TextItem(0, lnPosicionY, 3.9, 0.7, serialNum);

            //font settings
            txtSN.Font.Name = "Arial Narrow";
            txtSN.Font.Bold = true;
            txtSN.Font.Unit = FontUnit.Point;

            txtSN.Font.Size = 30;
            //padding
            txtSN.TextPadding = new FrameThickness(0.03);
            //set border
            txtSN.BorderThickness = new FrameThickness(0.02);
            txtSN.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.7;

            //Define a TextItem for 'Descripcion'
            TextItem txtDescripcion;
            txtDescripcion = new TextItem(0, lnPosicionY, 3.9, 0.3, psDescripcionPaquete);

            //font settings
            txtDescripcion.Font.Name = "Arial Narrow";
            txtDescripcion.Font.Bold = true;
            txtDescripcion.Font.Unit = FontUnit.Point;

            txtDescripcion.Font.Size = 14;
            //padding
            txtDescripcion.TextPadding = new FrameThickness(0.03);
            //set border
            txtDescripcion.BorderThickness = new FrameThickness(0.02);
            txtDescripcion.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.3;


            //Define a TextItem for 'Pesos'
            TextItem txtPesos;
            txtPesos = new TextItem(0, lnPosicionY, 3.9, 0.3, "Peso: " + pnPeso.ToString() + "   Peso V: " + psDimensiones);

            //font settings
            txtPesos.Font.Name = "Arial Narrow";
            txtPesos.Font.Bold = true;
            txtPesos.Font.Unit = FontUnit.Point;

            txtPesos.Font.Size = 14;
            //padding
            txtPesos.TextPadding = new FrameThickness(0.03);
            //set border
            txtPesos.BorderThickness = new FrameThickness(0.02);
            txtPesos.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.3;

            //Define a TextItem for 'Valor'
            TextItem txtValor;
            txtValor = new TextItem(0, lnPosicionY, 3.9, 0.3, "Valor: " + pnValor.ToString("N", CultureInfo.InvariantCulture));

            //font settings
            txtValor.Font.Name = "Arial Narrow";
            txtValor.Font.Bold = true;
            txtValor.Font.Unit = FontUnit.Point;

            txtValor.Font.Size = 14;
            //padding
            txtValor.TextPadding = new FrameThickness(0.03);
            //set border
            txtValor.BorderThickness = new FrameThickness(0.02);
            txtValor.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.3;

            //Define a TextItem for 'Fecha Hora' 
            string formatoFecha = "d-MMM-yyyy   HH:mm";//"MMM ddd d yyyy HH:mm";
            TextItem txtFecha = new TextItem(0.1, lnPosicionY, 3.8, 0.3, "Fecha: " + DateTime.Now.ToString(formatoFecha));
            //font settings
            txtFecha.Font.Name = "Arial";
            txtFecha.Font.Unit = FontUnit.Point;
            txtFecha.Font.Size = 12;
            //white text on black background
            txtFecha.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtFecha.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtFecha.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtFecha.TextAlignment = TextAlignment.Center;

            if (psTotalEtiqueta != "")
                lnPosicionY += 0.3;
            //Define a TextItem for 'Total' 
            TextItem txtTotal = new TextItem(0.1, lnPosicionY, 3.8, 0.3, "Paquete " + psTotalEtiqueta);
            //font settings
            txtTotal.Font.Name = "Arial";
            txtTotal.Font.Unit = FontUnit.Point;
            txtTotal.Font.Size = 12;
            //white text on black background
            txtTotal.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtTotal.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTotal.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtTotal.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.3;
            //Define a TextItem for 'Total' 
            TextItem txtZona = new TextItem(0.1, lnPosicionY, 3.8, 0.3, "Zona: " + psZonaE);
            //font settings
            txtZona.Font.Name = "Arial";
            txtZona.Font.Unit = FontUnit.Point;
            txtZona.Font.Size = 12;
            //white text on black background
            txtZona.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtZona.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtZona.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtZona.TextAlignment = TextAlignment.Center;

            lnPosicionY += 0.3;
            //Define a TextItem for 'Total' 
            TextItem txtParada = new TextItem(0.1, lnPosicionY, 3.8, 0.3, " Parada: " + psAreaE);
            //font settings
            txtParada.Font.Name = "Arial";
            txtParada.Font.Unit = FontUnit.Point;
            txtParada.Font.Size = 12;
            //white text on black background
            txtParada.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtParada.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtParada.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);
            txtParada.TextAlignment = TextAlignment.Center;


            lnPosicionY += 0.3;
            //Define a LineShapeItem
            LineShapeItem line = new LineShapeItem(0, lnPosicionY, 3.9, 0.03);
            line.Orientation = LineOrientation.Horizontal;
            line.StrokeThickness = 0.03;

            tLabel.Items.Add(txtTrial);
            tLabel.Items.Add(txtPaquete);

            tLabel.Items.Add(txtCliente);
            tLabel.Items.Add(txtNombre);
            tLabel.Items.Add(txtID);

            tLabel.Items.Add(txtEntrega);

            tLabel.Items.Add(txtEmpresa);
            tLabel.Items.Add(txtPais);
            tLabel.Items.Add(txtDireccion1);
            tLabel.Items.Add(txtDireccion2);

            tLabel.Items.Add(serialBarcode);
            tLabel.Items.Add(txtSN);
            tLabel.Items.Add(txtDescripcion);
            tLabel.Items.Add(txtPesos);
            tLabel.Items.Add(txtValor);

            tLabel.Items.Add(txtZona);
            tLabel.Items.Add(txtParada);

            tLabel.Items.Add(txtFecha);
            if (psTotalEtiqueta != "" && psTotalEtiqueta != "NA")
                tLabel.Items.Add(txtTotal);

            tLabel.Items.Add(line);

            return tLabel;
        }


        public ThermalLabel GenerateBasicThermalLabel()
        {
            ThermalLabel tLabel = new ThermalLabel(Neodynamic.SDK.Printing.UnitType.Inch, 4, 6);
            tLabel.GapLength = 0.2;


            // Section 1: Transport Company Information with Border
            RectangleShapeItem transportBorder = new RectangleShapeItem(0, 0, 4, 0.7);
            transportBorder.StrokeThickness = 0.02;
            transportBorder.StrokeColor = Neodynamic.SDK.Printing.Color.Black;

            TextItem transportCompany = new TextItem(0.1, 0.1, 3.8, 0.5, "TRANSPORTES GUANACASTE");
            transportCompany.Font.Size = 12;
            transportCompany.TextAlignment = TextAlignment.Center;
            transportCompany.BorderThickness = new FrameThickness(0.02);


            // Section 2: Destination with Border
            RectangleShapeItem destinationBorder = new RectangleShapeItem(0, 0.7, 4, 0.7);
            destinationBorder.StrokeThickness = 0.02;
            destinationBorder.StrokeColor = Neodynamic.SDK.Printing.Color.Black;

            TextItem destinoTitle = new TextItem(0.1, 0.75, 3.8, 0.3, "DESTINO:");
            destinoTitle.Font.Bold = true;

            TextItem destination = new TextItem(0.1, 1, 3.8, 0.4, "PLAYAS DEL COCO,\nGUANACASTE");
            destination.Font.Size = 12;
            destination.TextAlignment = TextAlignment.Center;

            // Section 3: Receiver Information with Border
            RectangleShapeItem receiverBorder = new RectangleShapeItem(0, 1.4, 4, 1);
            receiverBorder.StrokeThickness = 0.02;
            receiverBorder.StrokeColor = Neodynamic.SDK.Printing.Color.Black;

            TextItem recibeTitle = new TextItem(0.1, 1.45, 3.8, 0.3, "RECIBE:");
            recibeTitle.Font.Bold = true;
            recibeTitle.TextAlignment = TextAlignment.Center;

            TextItem clientDetails = new TextItem(0.1, 1.75, 3.8, 0.3, "#Cliente: CR64694");
            clientDetails.Font.Size = 12;
            clientDetails.Font.Bold = true;
            clientDetails.TextAlignment = TextAlignment.Center;

            TextItem clientDetailsName = new TextItem(0.1, 2.05, 3.8, 0.3, "TAMACHAS S A");
            clientDetailsName.Font.Size = 12;
            clientDetailsName.TextAlignment = TextAlignment.Center;

            TextItem contactNumber = new TextItem(0.1, 2.35, 3.8, 0.3, "8316165");
            contactNumber.TextAlignment = TextAlignment.Center;

            // Section 4: Barcode with Border
            RectangleShapeItem barcodeBorder = new RectangleShapeItem(0, 2.8, 4, 1.2);
            barcodeBorder.StrokeThickness = 0.02;
            barcodeBorder.StrokeColor = Neodynamic.SDK.Printing.Color.Black;

            BarcodeItem barcode = new BarcodeItem(0.5, 2.85, 3, 1, BarcodeSymbology.Code128, "3059422");
            barcode.BarHeight = 0.75;
            barcode.BarcodeAlignment = BarcodeAlignment.MiddleCenter;
            barcode.TextAlignment = BarcodeTextAlignment.BelowCenter;
            barcode.BarWidth = 0.0104;

            // Date/Time Section with Border
            RectangleShapeItem dateTimeBorder = new RectangleShapeItem(0, 4, 4, 0.5);
            dateTimeBorder.StrokeThickness = 0.02;
            dateTimeBorder.StrokeColor = Neodynamic.SDK.Printing.Color.Black;

            TextItem labelDateTime = new TextItem(0.1, 4.05, 3.8, 0.3, "Date: " + DateTime.Now.ToShortDateString());
            labelDateTime.TextAlignment = TextAlignment.Center;
            labelDateTime.Font.Size = 12;

            // Adding Items to the Label
            //tLabel.Items.Add(transportBorder);
            tLabel.Items.Add(transportCompany);

            //tLabel.Items.Add(destinationBorder);
            tLabel.Items.Add(destinoTitle);
            tLabel.Items.Add(destination);

            //tLabel.Items.Add(receiverBorder);
            tLabel.Items.Add(recibeTitle);
            tLabel.Items.Add(clientDetails);
            tLabel.Items.Add(clientDetailsName);
            tLabel.Items.Add(contactNumber);

            //tLabel.Items.Add(barcodeBorder);
            tLabel.Items.Add(barcode);

            //tLabel.Items.Add(dateTimeBorder);
            tLabel.Items.Add(labelDateTime);

            return tLabel;
        }

        public ThermalLabel GenerateAmexThermalLabel_4_3(string customerNumber, string name, string country, string zone, string stop, string package, string manifest, string packageDescription, string totalLabels, double weight, string dimensions, string gateway, string packagingType)
        {
            //Define a ThermalLabel object and set unit to inch and label size
            ThermalLabel tLabel = new ThermalLabel(UnitType.Inch, 4, 3);
            tLabel.GapLength = 0.2;

            packageDescription = " ";

            //get ThermalLabel SDk install dir and get the sample images
            //string imgFolder = Microsoft.Win32.Registry.LocalMachine.OpenSubKey("Software\\Neodynamic\\SDK\\ThermalLabel SDK 5.0 for .NET\\InstallDir").GetValue(null).ToString() + "\\Samples\\Images\\";


            //Define a TextItem for 'Trial'
            TextItem txtTrial1 = new TextItem(0, 0, 1.25, 0.2, "TRIAL");
            //font settings
            txtTrial1.Font.Name = "Arial";
            txtTrial1.Font.Unit = FontUnit.Point;
            txtTrial1.Font.Size = 12;
            //white text on black background
            txtTrial1.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial1.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial1.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Trial'
            TextItem txtTrial2 = new TextItem(0, 0.20, 0.1, 0.10, "T");
            //font settings
            txtTrial2.Font.Name = "Arial";
            txtTrial2.Font.Unit = FontUnit.Point;
            txtTrial2.Font.Size = 12;
            //white text on black background
            txtTrial2.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial2.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial2.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Trial'
            TextItem txtTrial3 = new TextItem(1.25, 0.20, 0.1, 0.10, "T");
            //font settings
            txtTrial3.Font.Name = "Arial";
            txtTrial3.Font.Unit = FontUnit.Point;
            txtTrial3.Font.Size = 12;
            //white text on black background
            txtTrial3.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial3.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial3.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            TextItem txtTrial4 = new TextItem(0.10, 0.30, 1.25, 0.10, "TRIAL");
            //font settings
            txtTrial4.Font.Name = "Arial";
            txtTrial4.Font.Unit = FontUnit.Point;
            txtTrial4.Font.Size = 12;
            //white text on black background
            txtTrial4.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial4.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial4.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);



            //Define an ImageItem for AdventureWorks logo
            ImageItem awLogo = new ImageItem(2.5, 0);

            //awLogo.SourceFile = "C:/Users/emartinez/Documents/Proyectos/American/Fuentes/PROSistema/PROSistema.Presentation/Resources/escudo_avion.jpg";

            // Cambio a Solicitud de Pablo
            //awLogo.SourceFile = "./resources/escudo_avion.jpg";
            awLogo.Width = 1.41;
            awLogo.LockAspectRatio = LockAspectRatio.WidthBased;
            awLogo.MonochromeSettings.DitherMethod = DitherMethod.Threshold;
            awLogo.MonochromeSettings.Threshold = 80;

            //Define a TextItem for 'Trial'
            TextItem txtTrial = new TextItem(0, 0, 2.49, 0.35, "TRIAL");
            //font settings
            txtTrial.Font.Name = "Arial";
            txtTrial.Font.Unit = FontUnit.Point;
            txtTrial.Font.Size = 12;
            //white text on black background
            txtTrial.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtTrial.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtTrial.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            TextItem txtTipoEmpaque = new TextItem(3.4, 0, 0.50, 0.50, packagingType);
            //font settings
            txtTipoEmpaque.Font.Name = "Arial";
            txtTipoEmpaque.Font.Unit = FontUnit.Point;
            txtTipoEmpaque.Font.Size = 28;
            txtTipoEmpaque.Font.Bold = true;
            txtTipoEmpaque.TextAlignment = TextAlignment.Center;
            //white text on black background
            txtTipoEmpaque.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtTipoEmpaque.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            txtTipoEmpaque.BorderThickness = new FrameThickness(0.02);
            //padding
            //txtTipoEmpaque.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'AE'
            TextItem txtAE = new TextItem(2, 0, 1.8, 0.3, "American Export  ");
            //font settings
            txtAE.Font.Name = "Arial";
            txtAE.Font.Unit = FontUnit.Point;
            txtAE.Font.Size = 12;
            txtAE.TextAlignment = TextAlignment.Right;
            //white text on black background
            txtAE.BackColor = Neodynamic.SDK.Printing.Color.Black;
            txtAE.ForeColor = Neodynamic.SDK.Printing.Color.White;
            //padding
            txtAE.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Cliente'
            TextItem txtCliente = new TextItem(0, 0.3, 2.49, 0.25, "#Cliente: " + customerNumber);
            //font settings
            txtCliente.Font.Name = "Arial";
            txtCliente.Font.Unit = FontUnit.Point;
            txtCliente.Font.Size = 12;
            //white text on black background
            txtCliente.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtCliente.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtCliente.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Nombre'
            TextItem txtNombre = new TextItem(0, 0.50, 3.9, 0.20, "Nombre: " + name);
            //font settings
            txtNombre.Font.Name = "Arial";
            txtNombre.Font.Unit = FontUnit.Point;
            txtNombre.Font.Size = 12;
            //white text on black background
            txtNombre.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtNombre.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtNombre.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Country' 
            TextItem txtCountry = new TextItem(0.1, 0.70, 1.8, 0.20, "Pais: " + country);
            //font settings
            txtCountry.Font.Name = "Arial";
            txtCountry.Font.Unit = FontUnit.Point;
            txtCountry.Font.Size = 11;
            //white text on black background
            txtCountry.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtCountry.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtCountry.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);


            //Define a TextItem for 'Peso' 
            TextItem txtPeso;
            txtPeso = new TextItem(2.2, 0.70, 1.7, 0.20, "Peso: " + weight.ToString());
            //font settings
            txtPeso.Font.Name = "Arial";
            txtPeso.Font.Unit = FontUnit.Point;
            txtPeso.Font.Size = 10;
            //white text on black background
            txtPeso.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtPeso.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtPeso.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a TextItem for 'Zona' 
            TextItem txtZona = new TextItem(0.1, 0.90, 3.8, 0.20, "Zona: " + zone);
            //font settings
            txtZona.Font.Name = "Arial";
            txtZona.Font.Unit = FontUnit.Point;
            txtZona.Font.Size = 11;
            //white text on black background
            txtZona.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtZona.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtZona.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);


            //Define a TextItem for 'PesoV' 
            TextItem txtPesoV;
            txtPesoV = new TextItem(2.2, 0.90, 1.7, 0.20, "Peso V: " + dimensions);
            //font settings
            txtPesoV.Font.Name = "Arial";
            txtPesoV.Font.Unit = FontUnit.Point;
            txtPesoV.Font.Size = 10;
            //white text on black background
            txtPesoV.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtPesoV.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtPesoV.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);


            //Define a TextItem for 'Parada' 
            TextItem txtParada = new TextItem(0.1, 1.10, 3.8, 0.20, "Parada: " + stop);
            //font settings
            txtParada.Font.Name = "Arial";
            txtParada.Font.Unit = FontUnit.Point;
            txtParada.Font.Size = 11;
            //white text on black background
            txtParada.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtParada.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtParada.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);


            //Define a BarcodeItem for a random 'Serial Number'
            //string serialNum = Guid.NewGuid().ToString().ToUpper().Substring(0, 8);
            string serialNum = package;
            BarcodeItem serialBarcode = new BarcodeItem(0, 1.35, 3.9, 0.6, BarcodeSymbology.UccEan128, serialNum);
            //Set bars height to .3inch
            serialBarcode.BarHeight = 0.45;
            //Set bars width to 0.02inch
            serialBarcode.BarWidth = 0.03;
            //disable checksum
            serialBarcode.AddChecksum = false;
            //hide human readable text
            serialBarcode.DisplayCode = false;
            //set border
            serialBarcode.BorderThickness = new FrameThickness(0.02, 0.02, 0.02, 0);
            //align barcode
            serialBarcode.BarcodeAlignment = BarcodeAlignment.MiddleCenter;



            //Define a TextItem for 'Serial Num'
            //TextItem txtSN = new TextItem(0, 2.05 - serialBarcode.BorderThickness.Bottom, 1.5, 0.7, serialNum);
            TextItem txtSN;

            //if (psGateway != "") // Imprime el gateway donde se está imprimiendo el paquete + numero de paquete
            //    txtSN = new TextItem(0, 1.97 - serialBarcode.BorderThickness.Bottom, 1.5, 0.7, psGateway + "      " + serialNum);
            //else // Imprime solo el numero de paquete
            txtSN = new TextItem(0, 1.97 - serialBarcode.BorderThickness.Bottom, 1.5, 0.7, serialNum);

            //font settings
            txtSN.Font.Name = "Arial Narrow";
            txtSN.Font.Bold = true;
            txtSN.Font.Unit = FontUnit.Point;

            //            if (psGateway != "") // Imprime el gateway donde se está imprimiendo el paquete + numero de paquete
            //               txtSN.Font.Size = 20;
            //            else // Imprime solo el numero de paquete
            txtSN.Font.Size = 30;
            //padding
            txtSN.TextPadding = new FrameThickness(0.03);
            //set border
            txtSN.BorderThickness = new FrameThickness(0.02);
            txtSN.TextAlignment = TextAlignment.Center;

            //Define a TextItem for legend
            //TextItem txtLegend = new TextItem(txtSN.X + txtSN.Width - txtSN.BorderThickness.Right, txtSN.Y, 3.8 - txtSN.Width + txtSN.BorderThickness.Right, txtSN.Height, "This bike is ridden by race winners! Brought to you by Adventure Works Cycles professional race team.");
            TextItem txtLegend;
            if (packagingType == "2")
                txtLegend = new TextItem(txtSN.X + txtSN.Width - txtSN.BorderThickness.Right, txtSN.Y, 3.9 - txtSN.Width + txtSN.BorderThickness.Right, txtSN.Height, "CATEGORIA D");
            else if (totalLabels == "NA")
                txtLegend = new TextItem(txtSN.X + txtSN.Width - txtSN.BorderThickness.Right, txtSN.Y, 3.9 - txtSN.Width + txtSN.BorderThickness.Right, txtSN.Height, packageDescription);
            else
                txtLegend = new TextItem(txtSN.X + txtSN.Width - txtSN.BorderThickness.Right, txtSN.Y, 3.9 - txtSN.Width + txtSN.BorderThickness.Right, txtSN.Height, "Paquete " + totalLabels + "\n" + packageDescription);

            //font settings
            txtLegend.Font.Name = "Arial";
            txtLegend.Font.Unit = FontUnit.Point;
            txtLegend.Font.Size = 12;
            //padding
            txtLegend.TextPadding = new FrameThickness(0.03, 0, 0, 0);
            //set border
            txtLegend.BorderThickness = new FrameThickness(0.02);

            //Define a TextItem for 'Fecha Hora' 
            string formatoFecha = "d-MMM-yyyy   HH:mm";//"MMM ddd d yyyy HH:mm";
            TextItem txtFecha = new TextItem(0.1, 2.65, 3.8, 0.20, DateTime.Now.ToString(formatoFecha));
            //font settings
            txtFecha.Font.Name = "Arial";
            txtFecha.Font.Unit = FontUnit.Point;
            txtFecha.Font.Size = 9;
            //white text on black background
            txtFecha.BackColor = Neodynamic.SDK.Printing.Color.White;
            txtFecha.ForeColor = Neodynamic.SDK.Printing.Color.Black;
            //padding
            txtFecha.TextPadding = new FrameThickness(0.075, 0.03, 0, 0);

            //Define a LineShapeItem
            LineShapeItem line = new LineShapeItem(0, 2.8, 3.9, 0.03);
            line.Orientation = LineOrientation.Horizontal;
            line.StrokeThickness = 0.03;

            //Add items to ThermalLabel object...
            //            tLabel.Items.Add(awLogo);
            //            tLabel.Items.Add(txtAW);

            // Cambio a Solicitud de Pablo
            //tLabel.Items.Add(awLogo);
            //tLabel.Items.Add(txtTrial);

            if (packagingType == "1" || packagingType == "2" || packagingType == "C")
                tLabel.Items.Add(txtTipoEmpaque);

            tLabel.Items.Add(txtTrial1);
            tLabel.Items.Add(txtTrial2);
            //tLabel.Items.Add(txtTrial3);
            //tLabel.Items.Add(txtTrial4);

            tLabel.Items.Add(txtCliente);
            tLabel.Items.Add(txtNombre);
            tLabel.Items.Add(txtCountry);

            tLabel.Items.Add(txtPeso);

            tLabel.Items.Add(txtZona);

            tLabel.Items.Add(txtPesoV);
            tLabel.Items.Add(txtParada);
            tLabel.Items.Add(serialBarcode);
            tLabel.Items.Add(txtSN);
            tLabel.Items.Add(txtLegend);
            tLabel.Items.Add(txtFecha);
            tLabel.Items.Add(line);

            return tLabel;

        }

    }
}
