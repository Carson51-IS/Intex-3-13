using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public DonationsController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Donation>>> GetAll(
        [FromQuery] int? supporterId,
        [FromQuery] string? donationType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Donations.Include(d => d.Supporter).AsQueryable();

        if (supporterId.HasValue)
            query = query.Where(d => d.SupporterId == supporterId.Value);
        if (!string.IsNullOrEmpty(donationType))
            query = query.Where(d => d.DonationType == donationType);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.DonationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Donation>> GetById(int id)
    {
        var donation = await _context.Donations
            .Include(d => d.Supporter)
            .Include(d => d.Allocations)
            .FirstOrDefaultAsync(d => d.DonationId == id);

        if (donation == null) return NotFound();
        return Ok(donation);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Donation>> Create([FromBody] Donation donation)
    {
        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = donation.DonationId }, donation);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] Donation donation)
    {
        if (id != donation.DonationId) return BadRequest();
        _context.Entry(donation).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null) return NotFound();
        _context.Donations.Remove(donation);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Returns donation history for the currently logged-in donor (matched by email)</summary>
    [HttpGet("my-history")]
    public async Task<IActionResult> GetMyHistory()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var supporter = await _context.Supporters
            .FirstOrDefaultAsync(s => s.Email == email);

        if (supporter == null)
            return Ok(new { supporter = (object?)null, donations = Array.Empty<object>() });

        var donations = await _context.Donations
            .Where(d => d.SupporterId == supporter.SupporterId)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(new { supporter, donations });
    }

    /// <summary>Submit a new donation as the logged-in donor</summary>
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] DonorSubmitDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest(new { message = "Donation amount must be greater than zero." });

        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var supporter = await _context.Supporters.FirstOrDefaultAsync(s => s.Email == email);

        if (supporter == null)
        {
            // Auto-create a supporter profile for this donor
            supporter = new Supporter
            {
                Email = email,
                DisplayName = dto.DisplayName ?? email,
                FirstName = dto.FirstName ?? string.Empty,
                LastName = dto.LastName ?? string.Empty,
                SupporterType = "Individual Donor",
                RelationshipType = "Donor",
                Region = string.Empty,
                Country = string.Empty,
                Phone = string.Empty,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                FirstDonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            };
            _context.Supporters.Add(supporter);
            await _context.SaveChangesAsync();
        }

        var donation = new Donation
        {
            SupporterId = supporter.SupporterId,
            DonationType = "Monetary",
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = dto.Amount,
            CurrencyCode = dto.CurrencyCode ?? "PHP",
            CampaignName = dto.CampaignName,
            ChannelSource = "Online Portal",
            IsRecurring = dto.IsRecurring,
            Notes = dto.Notes,
        };

        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Thank you for your donation!", donationId = donation.DonationId });
    }
}

public record DonorSubmitDto(
    decimal Amount,
    string? CurrencyCode,
    string? CampaignName,
    bool IsRecurring,
    string? Notes,
    string? DisplayName,
    string? FirstName,
    string? LastName
);
