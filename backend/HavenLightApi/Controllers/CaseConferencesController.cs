using HavenLightApi.Data;
using HavenLightApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CaseConferencesController(HavenLightContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? residentId,
        [FromQuery] string? status,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = context.CaseConferences
            .Include(c => c.Resident)
            .AsQueryable();

        if (residentId.HasValue) query = query.Where(c => c.ResidentId == residentId.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(c => c.Status == status);
        if (fromDate.HasValue) query = query.Where(c => c.ConferenceDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(c => c.ConferenceDate <= toDate.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(c => c.ConferenceDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.ConferenceId,
                c.ResidentId,
                residentCode = c.Resident.InternalCode,
                c.ConferenceDate,
                c.ConferenceType,
                c.Status,
                c.Facilitator,
                c.Agenda,
                c.SummaryNotes,
                c.FollowUpActions,
                c.NextConferenceDate,
            })
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CaseConferenceDto dto)
    {
        if (!await context.Residents.AnyAsync(r => r.ResidentId == dto.ResidentId))
            return BadRequest(new { message = "Resident not found." });
        if (string.IsNullOrWhiteSpace(dto.Facilitator))
            return BadRequest(new { message = "Facilitator is required." });
        if (string.IsNullOrWhiteSpace(dto.Agenda))
            return BadRequest(new { message = "Agenda is required." });

        var conf = new CaseConference
        {
            ResidentId = dto.ResidentId,
            ConferenceDate = dto.ConferenceDate,
            ConferenceType = string.IsNullOrWhiteSpace(dto.ConferenceType) ? "Case Conference" : dto.ConferenceType.Trim(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Planned" : dto.Status.Trim(),
            Facilitator = dto.Facilitator.Trim(),
            Agenda = dto.Agenda.Trim(),
            SummaryNotes = dto.SummaryNotes?.Trim(),
            FollowUpActions = dto.FollowUpActions?.Trim(),
            NextConferenceDate = dto.NextConferenceDate,
            CreatedAt = DateTime.UtcNow
        };

        context.CaseConferences.Add(conf);
        await context.SaveChangesAsync();
        return Ok(new { conferenceId = conf.ConferenceId });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] CaseConferenceDto dto)
    {
        var conf = await context.CaseConferences.FindAsync(id);
        if (conf is null) return NotFound();

        conf.ConferenceDate = dto.ConferenceDate;
        conf.ConferenceType = string.IsNullOrWhiteSpace(dto.ConferenceType) ? conf.ConferenceType : dto.ConferenceType.Trim();
        conf.Status = string.IsNullOrWhiteSpace(dto.Status) ? conf.Status : dto.Status.Trim();
        conf.Facilitator = string.IsNullOrWhiteSpace(dto.Facilitator) ? conf.Facilitator : dto.Facilitator.Trim();
        conf.Agenda = string.IsNullOrWhiteSpace(dto.Agenda) ? conf.Agenda : dto.Agenda.Trim();
        conf.SummaryNotes = dto.SummaryNotes?.Trim();
        conf.FollowUpActions = dto.FollowUpActions?.Trim();
        conf.NextConferenceDate = dto.NextConferenceDate;

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var conf = await context.CaseConferences.FindAsync(id);
        if (conf is null) return NotFound();
        context.CaseConferences.Remove(conf);
        await context.SaveChangesAsync();
        return NoContent();
    }
}

public record CaseConferenceDto(
    int ResidentId,
    DateOnly ConferenceDate,
    string? ConferenceType,
    string? Status,
    string? Facilitator,
    string? Agenda,
    string? SummaryNotes,
    string? FollowUpActions,
    DateOnly? NextConferenceDate
);

