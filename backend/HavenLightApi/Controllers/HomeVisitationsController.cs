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
    public async Task<ActionResult<HomeVisitation>> Create([FromBody] HomeVisitation visitation)
    {
        if (!await _context.Residents.AnyAsync(r => r.ResidentId == visitation.ResidentId))
            return BadRequest(new { message = "Resident not found." });

        _context.HomeVisitations.Add(visitation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = visitation.VisitationId }, visitation);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] HomeVisitation visitation)
    {
        if (id != visitation.VisitationId) return BadRequest();
        _context.Entry(visitation).State = EntityState.Modified;
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
