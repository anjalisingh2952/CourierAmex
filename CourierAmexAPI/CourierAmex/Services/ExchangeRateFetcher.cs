namespace CourierAmex.Services
{
    using AutoMapper;
    using CourierAmex.Models;
    using CourierAmex.Storage;
    using CourierAmex.Storage.Domain;
    using CourierAmex.Storage.Repositories;
    using Microsoft.AspNetCore.Http;
    using System.Globalization;
    using System.Net.Http;
    using System.Text;
    using System.Threading.Tasks;
    using System.Xml;

    public class ExchangeRateFetcher : IExchangeRateFetcher
    {
        private readonly IConfiguration _config;
        private readonly string _endpoint;
        private readonly string _buyIndicatorCode;
        private readonly string _saleIndicatorCode;
        private readonly string _authEmail;
        private readonly string _authToken;
        private readonly ICurrencyRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ExchangeRateFetcher(IConfiguration config, IMapper mapper, ICurrencyRepository repository, IDalSession session)
        {
            _config = config;
            _endpoint = _config["ExchangeRateAPI:Endpoint"];
            _buyIndicatorCode = _config["ExchangeRateAPI:BuyIndicatorCode"];
            _saleIndicatorCode = _config["ExchangeRateAPI:SaleIndicatorCode"];
            _authEmail = _config["ExchangeRateAPI:Email"];
            _authToken = _config["ExchangeRateAPI:Token"];
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }



        public async Task<GenericResponse<decimal?>> GetUsdSaleRateAsync(DateTime start, DateTime end)
        {
            var result = new GenericResponse<decimal?>();
            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos");

            var collection = new List<KeyValuePair<string, string>>();

            var customCulture = (CultureInfo)CultureInfo.InvariantCulture.Clone();
            customCulture.DateTimeFormat.DateSeparator = "/";


            collection.Add(new("Indicador", $"{_saleIndicatorCode}"));
            collection.Add(new("FechaInicio", start.ToString("dd/MM/yyyy", customCulture)));
            collection.Add(new("FechaFinal", end.ToString("dd/MM/yyyy", customCulture)));
            collection.Add(new("Nombre", "INGC011_CAT_INDICADORECONOMIC"));
            collection.Add(new("SubNiveles", "N"));
            collection.Add(new("CorreoElectronico", $"{_authEmail}"));
            collection.Add(new("Token", $"{_authToken}"));

            var content = new FormUrlEncodedContent(collection);
            request.Content = content;

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseXml = await response.Content.ReadAsStringAsync();

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(responseXml);

            var valorNode = xmlDoc.SelectSingleNode("//INGC011_CAT_INDICADORECONOMIC/NUM_VALOR");
            if (valorNode != null && decimal.TryParse(valorNode.InnerText, out var value))
            {
                result.Data = value;
                result.Success = true;
            }
            else
            {
                // Use namespace manager to handle the xmlns attribute
                var nsMgr = new XmlNamespaceManager(xmlDoc.NameTable);
                nsMgr.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsMgr.AddNamespace("ns", "http://ws.sdde.bccr.fi.cr");

                // Select the result node
                var resultNode = xmlDoc.SelectSingleNode("//ns:ObtenerIndicadoresEconomicosXMLResult", nsMgr);
                if (resultNode != null)
                {
                    string message = resultNode.InnerText.Trim();
                    result.Message = message;
                    result.Success = false;
                }
                else
                {
                    result.Message = "Data not found.";
                    result.Success = false;
                }
            }

            return result;
        }

        public async Task<GenericResponse<decimal?>> GetUsdBuyRateAsync(DateTime start, DateTime end)
        {
            var result = new GenericResponse<decimal?>();
            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos");

            var collection = new List<KeyValuePair<string, string>>();

            var customCulture = (CultureInfo)CultureInfo.InvariantCulture.Clone();
            customCulture.DateTimeFormat.DateSeparator = "/";

            collection.Add(new("Indicador", $"{_buyIndicatorCode}"));
            collection.Add(new("FechaInicio", start.ToString("dd/MM/yyyy", customCulture)));
            collection.Add(new("FechaFinal", end.ToString("dd/MM/yyyy", customCulture)));
            collection.Add(new("Nombre", "INGC011_CAT_INDICADORECONOMIC"));
            collection.Add(new("SubNiveles", "N"));
            collection.Add(new("CorreoElectronico", $"{_authEmail}"));
            collection.Add(new("Token", $"{_authToken}"));

            var content = new FormUrlEncodedContent(collection);
            request.Content = content;

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseXml = await response.Content.ReadAsStringAsync();

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(responseXml);


            var valorNode = xmlDoc.SelectSingleNode("//INGC011_CAT_INDICADORECONOMIC/NUM_VALOR");
            if (valorNode != null && decimal.TryParse(valorNode.InnerText, out var value))
            {
                result.Data = value;
                result.Success = true;
            }
            else
            {
                // Use namespace manager to handle the xmlns attribute
                var nsMgr = new XmlNamespaceManager(xmlDoc.NameTable);
                nsMgr.AddNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
                nsMgr.AddNamespace("ns", "http://ws.sdde.bccr.fi.cr");

                // Select the result node
                var resultNode = xmlDoc.SelectSingleNode("//ns:ObtenerIndicadoresEconomicosXMLResult", nsMgr);
                if (resultNode != null)
                {
                    string message = resultNode.InnerText.Trim();
                    result.Message = message;
                    result.Success = false;
                }
                else
                {
                    result.Message = "Data not found.";
                    result.Success = false;
                }
            }


            return result;
        }

        public async Task<GenericResponse<int>> AddExchangeRateASync(ExchangeRateModel entities)
        {
            GenericResponse<int> result = new();

            try
            {
                result.Data = await _repository.AddExchangeRateASync(entities);
                result.Success = true;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<List<ExchangeRateHistoryResponse>>> GetExchangeRateHistoryAsync(int companyId,string? date)
        {
            GenericResponse<List<ExchangeRateHistoryResponse>> result = new();

            try
            {
                var entity = await _repository.GetExchangeRateHistoryAsync(companyId,date);
                if (entity != null)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<List<ExchangeRateHistoryResponse>>(entity); 
                }
                else
                {
                    result.Success = false;
                    result.Message = "Something went wrong!";
                }                
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
    }

}
