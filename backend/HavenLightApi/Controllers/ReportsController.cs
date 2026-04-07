using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public ReportsController(HavenLightContext context)
    {
        _context = context;
    }

    /// <summary>Monthly donation totals for the past 12 months</summary>
    [HttpGet("donation-trends")]
    public async Task<IActionResult> GetDonationTrends()
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).AddDays(1 - DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).Day);

        var raw = await _context.Donations
            .Where(d => d.DonationDate >= cutoff && d.Amount.HasValue)
            .Select(d => new { d.DonationDate, d.Amount })
            .ToListAsync();

        var grouped = raw
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                total = g.Sum(x => x.Amount ?? 0),
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        return Ok(grouped);
    }

    /// <summary>Donation breakdown by type</summary>
    [HttpGet("donation-by-type")]
    public async Task<IActionResult> GetDonationByType()
    {
        var result = await _context.Donations
            .GroupBy(d => d.DonationType)
            .Select(g => new { type = g.Key, count = g.Count(), total = g.Sum(x => x.Amount ?? 0) })
            .OrderByDescending(x => x.total)
            .ToListAsync();

        return Ok(result);
    }

    /// <summary>Safehouse performance: occupancy vs capacity and resident outcomes</summary>
    [HttpGet("safehouse-performance")]
    public async Task<IActionResult> GetSafehousePerformance()
    {
        var safehouses = await _context.Safehouses
            .Select(s => new
            {
                s.SafehouseId,
                s.Name,
                s.SafehouseCode,
                s.Status,
                s.CapacityGirls,
                s.CurrentOccupancy,
                activeResidents = s.Residents.Count(r => r.CaseStatus == "Active"),
                closedResidents = s.Residents.Count(r => r.CaseStatus == "Closed"),
                reintegratedResidents = s.Residents.Count(r => r.ReintegrationStatus == "Completed")
            })
            .OrderBy(s => s.Name)
            .ToListAsync();

        return Ok(safehouses);
    }

    /// <summary>Resident case category breakdown</summary>
    [HttpGet("case-categories")]
    public async Task<IActionResult> GetCaseCategories()
    {
        var result = await _context.Residents
            .GroupBy(r => r.CaseCategory)
            .Select(g => new { category = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(result);
    }

    /// <summary>Reintegration status summary</summary>
    [HttpGet("reintegration-stats")]
    public async Task<IActionResult> GetReintegrationStats()
    {
        var byStatus = await _context.Residents
            .Where(r => r.ReintegrationStatus != null)
            .GroupBy(r => r.ReintegrationStatus)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToListAsync();

        var byType = await _context.Residents
            .Where(r => r.ReintegrationType != null)
            .GroupBy(r => r.ReintegrationType)
            .Select(g => new { type = g.Key, count = g.Count() })
            .ToListAsync();

        return Ok(new { byStatus, byType });
    }

    /// <summary>Monthly resident admissions for the past 12 months</summary>
    [HttpGet("admission-trends")]
    public async Task<IActionResult> GetAdmissionTrends()
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).AddDays(1 - DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).Day);

        var raw = await _context.Residents
            .Where(r => r.DateOfAdmission >= cutoff)
            .Select(r => new { r.DateOfAdmission })
            .ToListAsync();

        var grouped = raw
            .GroupBy(r => new { r.DateOfAdmission.Year, r.DateOfAdmission.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        return Ok(grouped);
    }

    /// <summary>Supporter type distribution</summary>
    [HttpGet("supporter-distribution")]
    public async Task<IActionResult> GetSupporterDistribution()
    {
        var result = await _context.Supporters
            .GroupBy(s => s.SupporterType)
            .Select(g => new { type = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(result);
    }
}
