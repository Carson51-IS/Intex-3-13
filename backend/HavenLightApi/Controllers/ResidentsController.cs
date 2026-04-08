using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResidentsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public ResidentsController(HavenLightContext context)
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
    public async Task<ActionResult<IEnumerable<Resident>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? safehouseId,
        [FromQuery] string? riskLevel,
        [FromQuery] string? category,
        [FromQuery] string? caseNo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Residents.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.CaseStatus == status);
        if (safehouseId.HasValue)
            query = query.Where(r => r.SafehouseId == safehouseId.Value);
        if (!string.IsNullOrEmpty(riskLevel))
            query = query.Where(r => r.CurrentRiskLevel == riskLevel);
        if (!string.IsNullOrEmpty(category))
            query = query.Where(r => r.CaseCategory == category);
        var caseFilter = FirstNonEmpty(caseNo, Request.Query["caseNo"].ToString(), Request.Query["caseSearch"].ToString());
        if (!string.IsNullOrWhiteSpace(caseFilter))
        {
            var term = caseFilter.Trim().ToLowerInvariant();
            query = query.Where(r =>
                r.CaseControlNo.ToLower().Contains(term)
                || r.InternalCode.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(r => r.ResidentId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Resident>> GetById(int id)
    {
        var resident = await _context.Residents
            .Include(r => r.Safehouse)
            .FirstOrDefaultAsync(r => r.ResidentId == id);

        if (resident == null)
            return NotFound();

        return Ok(resident);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Resident>> Create([FromBody] ResidentCreateDto dto)
    {
        if (!await _context.Safehouses.AnyAsync(s => s.SafehouseId == dto.SafehouseId))
            return BadRequest(new { message = "Invalid or unknown safehouse." });
        if (string.IsNullOrWhiteSpace(dto.CaseControlNo) || string.IsNullOrWhiteSpace(dto.InternalCode))
            return BadRequest(new { message = "Case control number and internal code are required." });
        if (string.IsNullOrWhiteSpace(dto.AssignedSocialWorker))
            return BadRequest(new { message = "Assigned social worker is required." });

        var resident = new Resident
        {
            // Seeded datasets can leave identity counters behind; assign next id defensively in local/dev.
            ResidentId = (await _context.Residents.MaxAsync(r => (int?)r.ResidentId) ?? 0) + 1,
            CaseControlNo = dto.CaseControlNo.Trim(),
            InternalCode = dto.InternalCode.Trim(),
            SafehouseId = dto.SafehouseId,
            CaseStatus = dto.CaseStatus,
            Sex = dto.Sex,
            DateOfBirth = dto.DateOfBirth,
            BirthStatus = dto.BirthStatus,
            PlaceOfBirth = dto.PlaceOfBirth,
            Religion = dto.Religion,
            CaseCategory = dto.CaseCategory,
            SubCatOrphaned = dto.SubCatOrphaned,
            SubCatTrafficked = dto.SubCatTrafficked,
            SubCatChildLabor = dto.SubCatChildLabor,
            SubCatPhysicalAbuse = dto.SubCatPhysicalAbuse,
            SubCatSexualAbuse = dto.SubCatSexualAbuse,
            SubCatOsaec = dto.SubCatOsaec,
            SubCatCicl = dto.SubCatCicl,
            SubCatAtRisk = dto.SubCatAtRisk,
            SubCatStreetChild = dto.SubCatStreetChild,
            SubCatChildWithHiv = dto.SubCatChildWithHiv,
            IsPwd = dto.IsPwd,
            PwdType = dto.PwdType,
            HasSpecialNeeds = dto.HasSpecialNeeds,
            SpecialNeedsDiagnosis = dto.SpecialNeedsDiagnosis,
            FamilyIs4Ps = dto.FamilyIs4Ps,
            FamilySoloParent = dto.FamilySoloParent,
            FamilyIndigenous = dto.FamilyIndigenous,
            FamilyParentPwd = dto.FamilyParentPwd,
            FamilyInformalSettler = dto.FamilyInformalSettler,
            DateOfAdmission = dto.DateOfAdmission,
            AgeUponAdmission = dto.AgeUponAdmission,
            PresentAge = dto.PresentAge,
            LengthOfStay = dto.LengthOfStay,
            ReferralSource = dto.ReferralSource,
            ReferringAgencyPerson = dto.ReferringAgencyPerson,
            AssignedSocialWorker = dto.AssignedSocialWorker.Trim(),
            InitialCaseAssessment = dto.InitialCaseAssessment,
            ReintegrationType = dto.ReintegrationType,
            ReintegrationStatus = dto.ReintegrationStatus,
            InitialRiskLevel = dto.InitialRiskLevel,
            CurrentRiskLevel = dto.CurrentRiskLevel,
            DateEnrolled = dto.DateEnrolled,
            DateClosed = dto.DateClosed,
            NotesRestricted = dto.NotesRestricted,
            CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
        };

        _context.Residents.Add(resident);
        await _context.SaveChangesAsync();

        var created = await _context.Residents
            .AsNoTracking()
            .Include(r => r.Safehouse)
            .FirstAsync(r => r.ResidentId == resident.ResidentId);

        return CreatedAtAction(nameof(GetById), new { id = created.ResidentId }, created);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] Resident resident)
    {
        if (id != resident.ResidentId)
            return BadRequest();

        _context.Entry(resident).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Updates common case fields without requiring the full resident payload.</summary>
    [HttpPut("{id}/core")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateCore(int id, [FromBody] ResidentCoreUpdateDto dto)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == id);
        if (resident is null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.CaseControlNo) || string.IsNullOrWhiteSpace(dto.InternalCode))
            return BadRequest(new { message = "Case control number and internal code are required." });
        if (string.IsNullOrWhiteSpace(dto.AssignedSocialWorker))
            return BadRequest(new { message = "Assigned social worker is required." });

        resident.CaseControlNo = dto.CaseControlNo.Trim();
        resident.InternalCode = dto.InternalCode.Trim();
        resident.CaseStatus = dto.CaseStatus;
        resident.CaseCategory = dto.CaseCategory;
        resident.AssignedSocialWorker = dto.AssignedSocialWorker.Trim();
        resident.ReferralSource = dto.ReferralSource;
        resident.InitialRiskLevel = dto.InitialRiskLevel;
        resident.CurrentRiskLevel = dto.CurrentRiskLevel;
        resident.ReintegrationStatus = string.IsNullOrWhiteSpace(dto.ReintegrationStatus) ? null : dto.ReintegrationStatus.Trim();
        resident.InitialCaseAssessment = string.IsNullOrWhiteSpace(dto.InitialCaseAssessment) ? null : dto.InitialCaseAssessment.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var resident = await _context.Residents.FindAsync(id);
        if (resident == null)
            return NotFound();

        _context.Residents.Remove(resident);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record ResidentCoreUpdateDto(
    string CaseControlNo,
    string InternalCode,
    string CaseStatus,
    string CaseCategory,
    string AssignedSocialWorker,
    string ReferralSource,
    string InitialRiskLevel,
    string CurrentRiskLevel,
    string? ReintegrationStatus,
    string? InitialCaseAssessment
);
