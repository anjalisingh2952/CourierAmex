using CourierAmex.Services.Interfaces;
using HidSharp;

namespace CourierAmex.Services
{
    public class WeightReaderService: IWeightReaderService
    {
        private HidDevice _device;
        private HidStream _stream;
        public event Action<string> OnWeightRead;

        public async Task StartReadingAsync(CancellationToken cancellationToken)
        {
            var deviceList = DeviceList.Local;
            _device = deviceList.GetHidDevices(0x0eb8, 0xf000).FirstOrDefault();

            if (_device == null) throw new Exception("Scale not found");

            _stream = _device.Open();
            var buffer = new byte[_device.MaxInputReportLength];

            while (!cancellationToken.IsCancellationRequested)
            {
                if (_stream.Read(buffer, 0, buffer.Length) > 0)
                {
                    var weight = ParseWeight(buffer);
                    OnWeightRead?.Invoke(weight);
                }
            }
        }

        private string ParseWeight(byte[] data)
        {
            if (data == null || data.Length < 6)
                return "0.00,0.00";

            byte scaleState = data[1];
            byte unitMode = data[2];
            int rawWeight = (data[5] << 8) | data[4];

            double weight;
            string unit;

            switch (unitMode)
            {
                case 2: 
                    weight = rawWeight;
                    unit = "g";
                    break;
                case 3: 
                    weight = rawWeight / 100.0;
                    unit = "kg";
                    break;
                case 11: 
                    weight = rawWeight / 10.0;
                    unit = "oz";
                    break;
                case 12:
                    weight = rawWeight / 100.0;
                    unit = "lb";
                    break;
                default:
                    return "0.00,0.00";
            }

            if (scaleState == 5) weight *= -1;

            double lbs, kg;

            switch (unit)
            {
                case "g":
                    kg = weight / 1000.0;
                    lbs = kg * 2.20462;
                    break;
                case "kg":
                    kg = weight;
                    lbs = kg * 2.20462;
                    break;
                case "oz":
                    lbs = weight / 16.0;
                    kg = lbs * 0.453592;
                    break;
                case "lb":
                    lbs = weight;
                    kg = lbs * 0.453592;
                    break;
                default:
                    return "0.00,0.00";
            }

            return $"{lbs:F2},{kg:F2}";
        }

        public void Stop()
        {
            _stream?.Close();
            _stream = null;
        }
    }
}
