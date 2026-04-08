using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Backend.Services
{
    public class XenditService : IXenditService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;

        public XenditService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _secretKey = configuration["Xendit:SecretKey"] ?? "";
        }

        public async Task<string?> CreateInvoiceAsync(Order order, string userEmail = "buyer@onlineshop.com")
        {
            if (string.IsNullOrEmpty(_secretKey) || _secretKey.Contains("YOUR_"))
            {
                Console.WriteLine("Xendit Error: SecretKey is not configured properly in appsettings.json.");
                return null;
            }

            var requestUri = "https://api.xendit.co/v2/invoices";
            
            var payload = new
            {
                external_id = $"ORDER-{order.Id}-{Guid.NewGuid().ToString().Substring(0, 5)}",
                amount = (long)order.TotalAmount,
                payer_email = userEmail,
                description = $"Payment for Order #{order.Id}",
                success_redirect_url = "http://localhost:3000/profile",
                failure_redirect_url = "http://localhost:3000/profile"
            };

            var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_secretKey}:"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
            
            var jsonPayload = JsonSerializer.Serialize(payload);
            request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                Console.WriteLine($"[Xendit] Creating invoice for Order {order.Id}, Amount: {order.TotalAmount}...");
                var response = await _httpClient.SendAsync(request);
                var responseString = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseString);
                    if (doc.RootElement.TryGetProperty("invoice_url", out var invoiceUrlProp))
                    {
                        var url = invoiceUrlProp.GetString();
                        Console.WriteLine($"[Xendit] Success! URL: {url}");
                        return url;
                    }
                }
                else
                {
                    Console.WriteLine($"[Xendit] API Error (Status {response.StatusCode}): {responseString}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Xendit] Exception: {ex.Message}");
            }

            return null;
        }
    }
}
