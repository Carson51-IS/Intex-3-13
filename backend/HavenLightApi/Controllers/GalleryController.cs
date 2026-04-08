using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GalleryController(HavenLightContext context, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await context.GalleryImages
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                i.GalleryImageId,
                i.ImageUrl,
                i.Caption,
                i.CreatedAt
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Upload([FromForm] IFormFile? file, [FromForm] string? caption)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Please choose an image file." });

        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };
        var ext = Path.GetExtension(file.FileName);
        if (!allowed.Contains(ext))
            return BadRequest(new { message = "Unsupported image type. Use jpg, png, webp, or gif." });

        var uploadsDir = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "gallery-images");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDir, fileName);
        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var entity = new GalleryImage
        {
            GalleryImageId = (await context.GalleryImages.MaxAsync(x => (int?)x.GalleryImageId) ?? 0) + 1,
            ImageUrl = $"/gallery-images/{fileName}",
            Caption = string.IsNullOrWhiteSpace(caption) ? null : caption.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        context.GalleryImages.Add(entity);
        await context.SaveChangesAsync();
        return Ok(new { message = "Image added to gallery.", entity.GalleryImageId, entity.ImageUrl, entity.Caption });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await context.GalleryImages.FirstOrDefaultAsync(x => x.GalleryImageId == id);
        if (entity == null) return NotFound();

        context.GalleryImages.Remove(entity);
        await context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(entity.ImageUrl) && entity.ImageUrl.StartsWith("/gallery-images/", StringComparison.OrdinalIgnoreCase))
        {
            var fileName = entity.ImageUrl.Replace("/gallery-images/", "", StringComparison.OrdinalIgnoreCase);
            var fullPath = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "gallery-images", fileName);
            if (System.IO.File.Exists(fullPath))
            {
                try { System.IO.File.Delete(fullPath); } catch { }
            }
        }

        return NoContent();
    }
}
