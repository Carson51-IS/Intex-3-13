using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HomeVisitationsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public HomeVisitationsController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomeVisitation>>> GetAll(
        [FromQuery] int? residentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.HomeVisitations.AsQueryable();

        if (residentId.HasValue)
            query = query.Where(v => v.ResidentId == residentId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(v => v.VisitDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HomeVisitation>> GetById(int id)
    {
        var visitation = await _context.HomeVisitations
            .Include(v => v.Resident)
            .FirstOrDefaultAsync(v => v.VisitationId == id);

        if (visitation == null) return NotFound();
        return Ok(visitation);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<HomeVisitation>> Create([FromBody] HomeVisitationCreateDto dto)
    {
        if (!await _context.Residents.AnyAsync(r => r.ResidentId == dto.ResidentId))
            return BadRequest(new { message = "Resident not found." });
        if (string.IsNullOrWhiteSpace(dto.SocialWorker))
            return BadRequest(new { message = "Social worker is required." });
        if (string.IsNullOrWhiteSpace(dto.LocationVisited))
            return BadRequest(new { message = "Location visited is required." });
        if (string.IsNullOrWhiteSpace(dto.Purpose))
            return BadRequest(new { message = "Purpose is required." });

        var nextId = (await _context.HomeVisitations.MaxAsync(v => (int?)v.VisitationId) ?? 0) + 1;

        var visitation = new HomeVisitation
        {
            VisitationId = nextId,
            ResidentId = dto.ResidentId,
            VisitDate = dto.VisitDate,
            SocialWorker = dto.SocialWorker.Trim(),
            VisitType = string.IsNullOrWhiteSpace(dto.VisitType) ? "Routine Follow-Up" : dto.VisitType.Trim(),
            LocationVisited = dto.LocationVisited.Trim(),
            FamilyMembersPresent = string.IsNullOrWhiteSpace(dto.FamilyMembersPresent) ? null : dto.FamilyMembersPresent.Trim(),
            Purpose = dto.Purpose.Trim(),
            Observations = (dto.Observations ?? string.Empty).Trim(),
            FamilyCooperationLevel = string.IsNullOrWhiteSpace(dto.FamilyCooperationLevel)
                ? "Cooperative"
                : dto.FamilyCooperationLevel.Trim(),
            SafetyConcernsNoted = dto.SafetyConcernsNoted,
            FollowUpNeeded = dto.FollowUpNeeded,
            FollowUpNotes = string.IsNullOrWhiteSpace(dto.FollowUpNotes) ? null : dto.FollowUpNotes.Trim(),
            VisitOutcome = (dto.VisitOutcome ?? string.Empty).Trim(),
        };

        _context.HomeVisitations.Add(visitation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = visitation.VisitationId }, visitation);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] HomeVisitationCreateDto dto)
    {
        var visitation = await _context.HomeVisitations.FindAsync(id);
        if (visitation is null) return NotFound();

        visitation.VisitDate = dto.VisitDate;
        visitation.SocialWorker = string.IsNullOrWhiteSpace(dto.SocialWorker) ? visitation.SocialWorker : dto.SocialWorker.Trim();
        visitation.VisitType = string.IsNullOrWhiteSpace(dto.VisitType) ? visitation.VisitType : dto.VisitType.Trim();
        visitation.LocationVisited = string.IsNullOrWhiteSpace(dto.LocationVisited) ? visitation.LocationVisited : dto.LocationVisited.Trim();
        visitation.FamilyMembersPresent = string.IsNullOrWhiteSpace(dto.FamilyMembersPresent) ? null : dto.FamilyMembersPresent.Trim();
        visitation.Purpose = string.IsNullOrWhiteSpace(dto.Purpose) ? visitation.Purpose : dto.Purpose.Trim();
        visitation.Observations = (dto.Observations ?? string.Empty).Trim();
        visitation.FamilyCooperationLevel = string.IsNullOrWhiteSpace(dto.FamilyCooperationLevel)
            ? visitation.FamilyCooperationLevel
            : dto.FamilyCooperationLevel.Trim();
        visitation.SafetyConcernsNoted = dto.SafetyConcernsNoted;
        visitation.FollowUpNeeded = dto.FollowUpNeeded;
        visitation.FollowUpNotes = string.IsNullOrWhiteSpace(dto.FollowUpNotes) ? null : dto.FollowUpNotes.Trim();
        visitation.VisitOutcome = (dto.VisitOutcome ?? string.Empty).Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var visitation = await _context.HomeVisitations.FindAsync(id);
        if (visitation == null) return NotFound();
        _context.HomeVisitations.Remove(visitation);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
