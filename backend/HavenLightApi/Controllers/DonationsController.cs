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
    public async Task<IActionResult> GetAll(
        [FromQuery] int? supporterId,
        [FromQuery] string? donationType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Donations.AsQueryable();

        if (supporterId.HasValue)
            query = query.Where(d => d.SupporterId == supporterId.Value);
        if (!string.IsNullOrEmpty(donationType))
            query = query.Where(d => d.DonationType == donationType);

        var total = await query.CountAsync();
        // Project to avoid JSON cycles (Donation ↔ Supporter ↔ Donations).
        var items = await query
            .OrderByDescending(d => d.DonationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.DonationId,
                d.SupporterId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.CurrencyCode,
                d.CampaignName,
                d.ChannelSource,
                d.IsRecurring,
                d.EstimatedValue,
                d.ImpactUnit,
                d.Notes,
                allocations = d.Allocations
                    .OrderByDescending(a => a.AllocationDate)
                    .Select(a => new
                    {
                        a.AllocationId,
                        a.SafehouseId,
                        safehouseName = a.Safehouse.Name,
                        a.ProgramArea,
                        a.AmountAllocated,
                        a.AllocationDate,
                        a.AllocationNotes
                    })
                    .ToList(),
                supporter = new { displayName = d.Supporter.DisplayName }
            })
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

    [HttpPost("record")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RecordContribution([FromBody] AdminRecordContributionDto dto)
    {
        var donationType = (dto.DonationType ?? string.Empty).Trim();
        var allowedTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Monetary",
            "InKind",
            "Time",
            "Skills",
            "SocialMedia",
        };
        if (!allowedTypes.Contains(donationType))
            return BadRequest(new { message = "Unsupported donation type." });

        var supporterExists = await _context.Supporters.AnyAsync(s => s.SupporterId == dto.SupporterId);
        if (!supporterExists)
            return BadRequest(new { message = "Supporter not found." });

        if (string.Equals(donationType, "Monetary", StringComparison.OrdinalIgnoreCase))
        {
            if (!dto.Amount.HasValue || dto.Amount.Value <= 0)
                return BadRequest(new { message = "Monetary contributions require amount > 0." });
        }

        if (dto.Amount.HasValue && dto.Amount.Value < 0)
            return BadRequest(new { message = "Amount cannot be negative." });
        if (dto.EstimatedValue.HasValue && dto.EstimatedValue.Value < 0)
            return BadRequest(new { message = "Estimated value cannot be negative." });

        var donation = new Donation
        {
            DonationId = (await _context.Donations.MaxAsync(d => (int?)d.DonationId) ?? 0) + 1,
            SupporterId = dto.SupporterId,
            DonationType = donationType,
            DonationDate = dto.DonationDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = dto.Amount,
            EstimatedValue = dto.EstimatedValue,
            ImpactUnit = string.IsNullOrWhiteSpace(dto.ImpactUnit) ? null : dto.ImpactUnit.Trim(),
            CurrencyCode = string.IsNullOrWhiteSpace(dto.CurrencyCode) ? "PHP" : dto.CurrencyCode.Trim().ToUpperInvariant(),
            CampaignName = string.IsNullOrWhiteSpace(dto.CampaignName) ? null : dto.CampaignName.Trim(),
            ChannelSource = string.IsNullOrWhiteSpace(dto.ChannelSource) ? "Admin Portal" : dto.ChannelSource.Trim(),
            IsRecurring = dto.IsRecurring,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
        };

        _context.Donations.Add(donation);

        if (dto.Allocations is { Count: > 0 })
        {
            var safehouseIds = dto.Allocations.Select(a => a.SafehouseId).Distinct().ToArray();
            var existingSafehouseIds = await _context.Safehouses
                .Where(s => safehouseIds.Contains(s.SafehouseId))
                .Select(s => s.SafehouseId)
                .ToListAsync();
            if (existingSafehouseIds.Count != safehouseIds.Length)
                return BadRequest(new { message = "One or more allocations reference an invalid safehouse." });

            var nextAllocationId = (await _context.DonationAllocations.MaxAsync(a => (int?)a.AllocationId) ?? 0) + 1;
            foreach (var alloc in dto.Allocations)
            {
                if (alloc.AmountAllocated <= 0)
                    return BadRequest(new { message = "Allocation amount must be greater than zero." });
                if (string.IsNullOrWhiteSpace(alloc.ProgramArea))
                    return BadRequest(new { message = "Program area is required for allocations." });

                _context.DonationAllocations.Add(new DonationAllocation
                {
                    AllocationId = nextAllocationId++,
                    DonationId = donation.DonationId,
                    SafehouseId = alloc.SafehouseId,
                    ProgramArea = alloc.ProgramArea.Trim(),
                    AmountAllocated = alloc.AmountAllocated,
                    AllocationDate = alloc.AllocationDate ?? donation.DonationDate,
                    AllocationNotes = string.IsNullOrWhiteSpace(alloc.AllocationNotes) ? null : alloc.AllocationNotes.Trim(),
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Contribution recorded.", donationId = donation.DonationId });
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
            .Where(s => s.Email == email)
            .Select(s => new
            {
                s.SupporterId,
                s.DisplayName,
                s.Email,
                s.SupporterType,
                s.FirstDonationDate,
            })
            .FirstOrDefaultAsync();

        if (supporter == null)
            return Ok(new { supporter = (object?)null, donations = Array.Empty<object>() });

        var donations = await _context.Donations
            .Where(d => d.SupporterId == supporter.SupporterId)
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new
            {
                d.DonationId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.CurrencyCode,
                d.CampaignName,
                d.ChannelSource,
                d.IsRecurring,
                d.Notes,
            })
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
            // Seeded datasets can leave identity counters behind; assign next id defensively in local/dev.
            DonationId = (await _context.Donations.MaxAsync(d => (int?)d.DonationId) ?? 0) + 1,
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

public record AdminRecordContributionDto(
    int SupporterId,
    string DonationType,
    DateOnly? DonationDate,
    decimal? Amount,
    decimal? EstimatedValue,
    string? ImpactUnit,
    string? CurrencyCode,
    string? CampaignName,
    string? ChannelSource,
    bool IsRecurring,
    string? Notes,
    List<AdminAllocationDto>? Allocations
);

public record AdminAllocationDto(
    int SafehouseId,
    string ProgramArea,
    decimal AmountAllocated,
    DateOnly? AllocationDate,
    string? AllocationNotes
);
