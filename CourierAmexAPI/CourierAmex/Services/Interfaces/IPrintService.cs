using Neodynamic.SDK.Printing;

namespace CourierAmex.Services.Interfaces
{
    public interface IPrintService
    {
        ThermalLabel GeneratePackageLabel_4_6(string psNoCliente, string psNombre, String psTipoID, String psIdentificacion, string psPais, string psCiudad, string psDireccion1, string psDireccion2, string psZonaE, string psAreaE, string psEmpresa, string psPaquete, string psDescripcionPaquete, string psTotalEtiqueta, double pnPeso, string psDimensiones, double pnValor);
        ThermalLabel GenerateBasicThermalLabel();
        ThermalLabel GenerateAmexThermalLabel_4_3(string customerNumber, string name, string country, string zone, string stop, string package, string manifest, string packageDescription, string totalLabels, double weight, string dimensions, string gateway, string packagingType);

    }
}
