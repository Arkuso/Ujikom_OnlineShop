using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebhooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _callbackToken;

        public WebhooksController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _callbackToken = configuration["Xendit:CallbackToken"] ?? "";
        }

        [HttpPost("xendit")]
        public async Task<IActionResult> XenditCallback([FromBody] JsonElement payload)
        {
            // Verify Callback Token
            Request.Headers.TryGetValue("x-callback-token", out var receivedToken);
            if (string.IsNullOrEmpty(_callbackToken) || receivedToken != _callbackToken)
            {
                return Unauthorized("Invalid Callback Token");
            }

            try
            {
                var externalId = payload.GetProperty("external_id").GetString();
                var status = payload.GetProperty("status").GetString();
                var invoiceId = payload.GetProperty("id").GetString();

                if (string.IsNullOrEmpty(externalId)) return BadRequest();

                // Format externalId kita: ORDER-{id}-{guid}
                var parts = externalId.Split('-');
                if (parts.Length < 2 || parts[0] != "ORDER") return BadRequest();

                if (int.TryParse(parts[1], out int orderId))
                {
                    var payment = await _context.Payments
                        .Include(p => p.Order)
                        .FirstOrDefaultAsync(p => p.OrderId == orderId);

                    if (payment == null) return NotFound("Payment not found for this order");

                    // Idempotency: Jika sudah dibayar, abaikan webhook duplikat
                    if (payment.Status == "PAID" || payment.Status == "SETTLED")
                    {
                        return Ok("Webhook already processed (Idempotent response)");
                    }

                    payment.XenditInvoiceId = invoiceId ?? payment.XenditInvoiceId;
                    payment.Status = status ?? payment.Status;
                    payment.UpdatedAt = DateTime.UtcNow;

                    if (payment.Status == "PAID" || payment.Status == "SETTLED")
                    {
                        payment.Order.Status = "Paid";
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Webhook Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}
