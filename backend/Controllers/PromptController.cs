using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromptController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public PromptController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost("prompt/{prompt}")]
        public async Task<IActionResult> GetPrompt(string prompt, [FromBody] ContextModel? context)
        {
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
            var httpResponse = await _httpClient.PostAsync("http://127.0.0.1:8000/improve-prompt", content);
            var responseStream = await httpResponse.Content.ReadAsStreamAsync();
            var result = await System.Text.Json.JsonSerializer.DeserializeAsync<System.Text.Json.JsonElement>(responseStream);
            return Ok(result);
        }
    }
}
