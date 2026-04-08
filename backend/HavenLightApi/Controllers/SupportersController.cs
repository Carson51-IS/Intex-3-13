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
            .Select(s => new
            {
                s.SupporterId,
                s.DisplayName,
                s.SupporterType,
                s.RelationshipType,
                s.Email,
                s.Phone,
                s.Status,
                s.Country,
                s.Region,
                s.FirstDonationDate,
                s.CreatedAt,
                lastDonationDate = _context.Donations
                    .Where(d => d.SupporterId == s.SupporterId)
                    .Select(d => (DateOnly?)d.DonationDate)
                    .OrderByDescending(d => d)
                    .FirstOrDefault(),
                lastDonationAmount = _context.Donations
                    .Where(d => d.SupporterId == s.SupporterId)
                    .OrderByDescending(d => d.DonationDate)
                    .ThenByDescending(d => d.DonationId)
                    .Select(d => d.Amount ?? d.EstimatedValue)
                    .FirstOrDefault(),
                totalDonated = _context.Donations
                    .Where(d => d.SupporterId == s.SupporterId)
                    .Select(d => d.Amount ?? d.EstimatedValue ?? 0m)
                    .Sum(),
            })
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Supporter>> GetById(int id)
    {
        var supporter = await _context.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        if (supporter == null) return NotFound();
        return Ok(supporter);
    }

    [HttpGet("lapsing-candidates")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetLapsingCandidates([FromQuery] int days = 90)
    {
        if (days < 1) days = 90;
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

        var items = await _context.Supporters
            .Where(s => s.Status == "Active" && s.LapsingCampaignSentAt == null)
            .Select(s => new
            {
                s.SupporterId,
                s.DisplayName,
                s.Email,
                lastDonationDate = _context.Donations
                    .Where(d => d.SupporterId == s.SupporterId)
                    .Select(d => (DateOnly?)d.DonationDate)
                    .OrderByDescending(d => d)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var lapsing = items
            .Where(x => !x.lastDonationDate.HasValue || x.lastDonationDate.Value <= cutoff)
            .OrderBy(x => x.lastDonationDate)
            .ThenBy(x => x.DisplayName)
            .ToList();

        return Ok(new { count = lapsing.Count, days, donors = lapsing });
    }

    [HttpPost("lapsing-campaign/mock-send")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> MockSendLapsingCampaign([FromBody] LapsingCampaignSendDto dto)
    {
        if (dto.DonorIds == null || dto.DonorIds.Count == 0)
            return BadRequest(new { message = "No donor recipients selected." });
        if (string.IsNullOrWhiteSpace(dto.Subject))
            return BadRequest(new { message = "Email subject is required." });
        if (string.IsNullOrWhiteSpace(dto.Body))
            return BadRequest(new { message = "Email body is required." });

        var recipientCount = await _context.Supporters
            .Where(s => dto.DonorIds.Contains(s.SupporterId))
            .CountAsync();

        var targets = await _context.Supporters
            .Where(s => dto.DonorIds.Contains(s.SupporterId))
            .ToListAsync();
        foreach (var s in targets)
            s.LapsingCampaignSentAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Mock send successful. Email queued to {recipientCount} donor(s).",
            sentCount = recipientCount,
            imageUrl = dto.ImageUrl
        });
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
    [Authorize]
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

public record LapsingCampaignSendDto(
    List<int> DonorIds,
    string Subject,
    string Body,
    string? ImageUrl
);
