using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly HavenLightContext _context;

    public DashboardController(HavenLightContext context)
    {
        _context = context;
    }

    /// <summary>Public-facing aggregated impact data (no auth required)</summary>
    [HttpGet("public-impact")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicImpact()
    {
        var activeResidents = await _context.Residents.CountAsync(r => r.CaseStatus == "Active");
        var totalSafehouses = await _context.Safehouses.CountAsync(s => s.Status == "Active");
        var totalSupporters = await _context.Supporters.CountAsync(s => s.Status == "Active");
        var latestSnapshot = await _context.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            activeResidents,
            totalSafehouses,
            totalSupporters,
            latestSnapshot
        });
    }

    /// <summary>Admin overview metrics (auth required)</summary>
    [HttpGet("admin-summary")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAdminSummary()
    {
        var activeResidents = await _context.Residents.CountAsync(r => r.CaseStatus == "Active");
        var recentDonationsTotal = await _context.Donations
            .Where(d => d.DonationDate >= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)))
            .SumAsync(d => d.Amount ?? 0);
        var incidentsThisMonth = await _context.IncidentReports
            .CountAsync(i => i.IncidentDate >= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)));

        var riskBreakdown = await _context.Residents
            .Where(r => r.CaseStatus == "Active")
            .GroupBy(r => r.CurrentRiskLevel)
            .Select(g => new { riskLevel = g.Key, count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            activeResidents,
            recentDonationsTotal,
            incidentsThisMonth,
            riskBreakdown
        });
    }
}
