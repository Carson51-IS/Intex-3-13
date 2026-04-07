using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProcessRecordingsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public ProcessRecordingsController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcessRecording>>> GetAll(
        [FromQuery] int? residentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.ProcessRecordings.AsQueryable();

        if (residentId.HasValue)
            query = query.Where(r => r.ResidentId == residentId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.SessionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProcessRecording>> GetById(int id)
    {
        var recording = await _context.ProcessRecordings
            .Include(r => r.Resident)
            .FirstOrDefaultAsync(r => r.RecordingId == id);

        if (recording == null) return NotFound();
        return Ok(recording);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ProcessRecording>> Create([FromBody] ProcessRecording recording)
    {
        if (!await _context.Residents.AnyAsync(r => r.ResidentId == recording.ResidentId))
            return BadRequest(new { message = "Resident not found." });

        _context.ProcessRecordings.Add(recording);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = recording.RecordingId }, recording);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcessRecording recording)
    {
        if (id != recording.RecordingId) return BadRequest();
        _context.Entry(recording).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var recording = await _context.ProcessRecordings.FindAsync(id);
        if (recording == null) return NotFound();
        _context.ProcessRecordings.Remove(recording);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
