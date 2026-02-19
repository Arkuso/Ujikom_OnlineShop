using System.Net;
using System.Text.Json;
using Backend.DTOs; // Menggunakan format respons standar Anda

namespace Backend.Middleware
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger;

        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                var response = context.Response;
                response.ContentType = "application/json";

                var responseModel = new ServiceResponse<string>
                {
                    Success = false,
                    Message = error.Message
                };

                switch (error)
                {
                    case KeyNotFoundException e:
                        // Error 404 (Data tidak ditemukan)
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        break;
                    case UnauthorizedAccessException e:
                        // Error 401 (Tidak ada akses)
                        response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        break;
                    case ArgumentException e:
                         // Error 400 (Input salah)
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        break;
                    default:
                        // Error 500 (Server Error)
                        _logger.LogError(error, "Terjadi kesalahan sistem.");
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        responseModel.Message = "Terjadi kesalahan internal server. Silakan coba lagi.";
                        break; 
                }

                var result = JsonSerializer.Serialize(responseModel);
                await response.WriteAsync(result);
            }
        }
    }
}
