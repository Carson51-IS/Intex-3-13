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
        var latestAdmission = await _context.Residents.MaxAsync(r => (DateOnly?)r.DateOfAdmission);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        // Guard against future-dated records skewing the "last 12 months" window.
        var anchor = latestAdmission.HasValue && latestAdmission.Value <= today
            ? latestAdmission.Value
            : today;
        var anchorMonthStart = new DateOnly(anchor.Year, anchor.Month, 1);
        var cutoff = anchorMonthStart.AddMonths(-11);

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

    /// <summary>Monthly average education progress for the past 12 months.</summary>
    [HttpGet("education-progress-trends")]
    public async Task<IActionResult> GetEducationProgressTrends()
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).AddDays(1 - DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).Day);

        var raw = await _context.EducationRecords
            .Where(r => r.RecordDate >= cutoff)
            .Select(r => new { r.RecordDate, r.ProgressPercent })
            .ToListAsync();

        var grouped = raw
            .GroupBy(r => new { r.RecordDate.Year, r.RecordDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                avgProgress = Math.Round(g.Average(x => (double)x.ProgressPercent), 2),
                sampleSize = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        return Ok(grouped);
    }

    /// <summary>Monthly average general health score for the past 12 months.</summary>
    [HttpGet("health-improvement-trends")]
    public async Task<IActionResult> GetHealthImprovementTrends()
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).AddDays(1 - DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-11)).Day);

        var raw = await _context.HealthWellbeingRecords
            .Where(r => r.RecordDate >= cutoff)
            .Select(r => new { r.RecordDate, r.GeneralHealthScore })
            .ToListAsync();

        var grouped = raw
            .GroupBy(r => new { r.RecordDate.Year, r.RecordDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                avgHealth = Math.Round(g.Average(x => (double)x.GeneralHealthScore), 2),
                sampleSize = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        return Ok(grouped);
    }

    /// <summary>AAR-style service and outcomes summary (Caring / Healing / Teaching).</summary>
    [HttpGet("aar-summary")]
    public async Task<IActionResult> GetAarSummary()
    {
        var activeResidents = await _context.Residents.CountAsync(r => r.CaseStatus == "Active");

        var caringServices = await _context.HomeVisitations.CountAsync();
        var healingServices = await _context.ProcessRecordings.CountAsync();
        var teachingServices = await _context.EducationRecords.CountAsync();

        var avgEducationProgress = await _context.EducationRecords
            .Select(r => (double?)r.ProgressPercent)
            .AverageAsync() ?? 0;
        var avgHealthScore = await _context.HealthWellbeingRecords
            .Select(r => (double?)r.GeneralHealthScore)
            .AverageAsync() ?? 0;
        var reintegratedResidents = await _context.Residents.CountAsync(r => r.ReintegrationStatus == "Completed");

        return Ok(new
        {
            caring = new
            {
                servicesProvided = caringServices,
                beneficiaryCount = activeResidents
            },
            healing = new
            {
                servicesProvided = healingServices,
                beneficiaryCount = activeResidents,
                avgHealthScore = Math.Round(avgHealthScore, 2)
            },
            teaching = new
            {
                servicesProvided = teachingServices,
                beneficiaryCount = activeResidents,
                avgEducationProgress = Math.Round(avgEducationProgress, 2)
            },
            outcomes = new
            {
                reintegrationCompleted = reintegratedResidents,
            }
        });
    }
}
