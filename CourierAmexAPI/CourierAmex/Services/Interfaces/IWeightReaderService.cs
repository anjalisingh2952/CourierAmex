namespace CourierAmex.Services.Interfaces
{
    public interface IWeightReaderService 
    {
        event Action<string> OnWeightRead;
        Task StartReadingAsync(CancellationToken cancellationToken);
        void Stop();
    }
}
