using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CourierAmex.Services.Interfaces;
using System.Collections.Concurrent;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class ScaleController : ControllerBase
    {
        private readonly IWeightReaderService _reader;
        private static readonly ConcurrentDictionary<string, CancellationTokenSource> _activeStreams = new();

        public ScaleController(IWeightReaderService reader)
        {
            _reader = reader;
        }

        [HttpGet("stream")]
        [AllowAnonymous]
        public async Task StreamWeight()
        {
            Response.Headers.Add("Content-Type", "text/event-stream");

            var connectionId = Guid.NewGuid().ToString();
            var cts = new CancellationTokenSource();
            _activeStreams.TryAdd(connectionId, cts);

            async Task Handler(string data)
            {
                if (!cts.IsCancellationRequested)
                {
                    try
                    {
                        await Response.WriteAsync($"data: {data}\n\n");
                        await Response.Body.FlushAsync();
                    }
                    catch
                    {
                        cts.Cancel();
                    }
                }
            }

            Action<string> handlerWrapper = (data) => Handler(data).Wait();

            _reader.OnWeightRead += handlerWrapper;

            try
            {
                await _reader.StartReadingAsync(cts.Token);
            }
            catch (OperationCanceledException)
            {
            }
            finally
            {
                _reader.OnWeightRead -= handlerWrapper;
                _activeStreams.TryRemove(connectionId, out _);
                cts.Dispose();
            }
        }


        [HttpPost("stop")]
        public IActionResult Stop()
        {
            foreach (var kvp in _activeStreams)
            {
                kvp.Value.Cancel();
            }

            return Ok("All active streams stopped.");
        }
    }
}
