using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromptController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _APIURL;

        public PromptController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _APIURL = configuration["ApiSettings:BaseUrl"] ?? string.Empty;
        }

        [HttpPost("prompt/{prompt}")]
        public async Task<IActionResult> GetPrompt(string prompt, [FromBody] ContextModel? context)
        {
            if (string.IsNullOrEmpty(_APIURL))
            {
                return StatusCode(500, "API URL is not configured.");
            }
            var requestBody = new
            {
                prompt = prompt,
                context = context
            };

            var json = System.Text.Json.JsonSerializer.Serialize(requestBody, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower
            });

            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var httpResponse = await _httpClient.PostAsync(_APIURL, content);
            var responseStream = await httpResponse.Content.ReadAsStreamAsync();
            var result = await System.Text.Json.JsonSerializer.DeserializeAsync<System.Text.Json.JsonElement>(responseStream);
            return Ok(result);
        }
    }
}
