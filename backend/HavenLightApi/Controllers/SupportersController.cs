using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportersController : ControllerBase
{
    private readonly HavenLightContext _context;

    public SupportersController(HavenLightContext context)
    {
        _context = context;
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var v in values)
        {
            if (!string.IsNullOrWhiteSpace(v))
                return v.Trim();
        }

        return null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery(Name = "supporterName")] string? supporterName,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Supporters.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(s => s.SupporterType == type);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        // Read from query explicitly — avoids rare model-binding issues with short param names like "name".
        var nameFilter = FirstNonEmpty(supporterName, Request.Query["supporterName"].ToString(), Request.Query["name"].ToString(), Request.Query["search"].ToString());
        if (!string.IsNullOrWhiteSpace(nameFilter))
        {
            var term = nameFilter.Trim().ToLowerInvariant();
            query = query.Where(s =>
                s.DisplayName.ToLower().Contains(term)
                || (s.FirstName != null && s.FirstName.ToLower().Contains(term))
                || (s.LastName != null && s.LastName.ToLower().Contains(term))
                || (s.OrganizationName != null && s.OrganizationName.ToLower().Contains(term)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(s => s.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Supporter>> GetById(int id)
    {
        var supporter = await _context.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        if (supporter == null) return NotFound();
        return Ok(supporter);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Supporter>> Create([FromBody] SupporterWriteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DisplayName))
            return BadRequest(new { message = "Display name is required." });
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required." });

        var normalizedEmail = dto.Email.Trim();
        if (await _context.Supporters.AnyAsync(s => s.Email == normalizedEmail))
            return BadRequest(new { message = "A supporter with this email already exists." });

        var supporter = new Supporter
        {
            DisplayName = dto.DisplayName.Trim(),
            SupporterType = dto.SupporterType ?? "Individual Donor",
            RelationshipType = dto.RelationshipType ?? "Donor",
            Email = normalizedEmail,
            Phone = dto.Phone ?? string.Empty,
            Status = dto.Status ?? "Active",
            Country = dto.Country ?? string.Empty,
            Region = dto.Region ?? string.Empty,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            OrganizationName = dto.OrganizationName,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Supporters.Add(supporter);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = supporter.SupporterId }, supporter);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] SupporterWriteDto dto)
    {
        var supporter = await _context.Supporters.FindAsync(id);
        if (supporter == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.DisplayName))
            return BadRequest(new { message = "Display name is required." });
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required." });

        var normalizedEmail = dto.Email.Trim();
        if (await _context.Supporters.AnyAsync(s => s.Email == normalizedEmail && s.SupporterId != id))
            return BadRequest(new { message = "Another supporter already uses this email." });

        supporter.DisplayName = dto.DisplayName.Trim();
        supporter.SupporterType = dto.SupporterType ?? supporter.SupporterType;
        supporter.RelationshipType = dto.RelationshipType ?? supporter.RelationshipType;
        supporter.Email = normalizedEmail;
        supporter.Phone = dto.Phone ?? string.Empty;
        supporter.Status = dto.Status ?? supporter.Status;
        supporter.Country = dto.Country ?? string.Empty;
        supporter.Region = dto.Region ?? string.Empty;
        supporter.FirstName = dto.FirstName;
        supporter.LastName = dto.LastName;
        supporter.OrganizationName = dto.OrganizationName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var supporter = await _context.Supporters.FindAsync(id);
        if (supporter == null) return NotFound();
        _context.Supporters.Remove(supporter);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record SupporterWriteDto(
    string DisplayName,
    string? SupporterType,
    string? RelationshipType,
    string Email,
    string? Phone,
    string? Status,
    string? Country,
    string? Region,
    string? FirstName,
    string? LastName,
    string? OrganizationName
);
