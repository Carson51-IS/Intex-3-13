using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Auth;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportersController : ControllerBase
{
    private readonly HavenLightContext _context;

    public SupportersController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Supporters.AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(s => s.SupporterType == type);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(s => s.DisplayName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Supporter>> GetById(int id)
    {
        var supporter = await _context.Supporters
            .Include(s => s.Donations)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        if (supporter == null) return NotFound();
        return Ok(supporter);
    }

    [HttpPost]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<ActionResult<Supporter>> Create([FromBody] Supporter supporter)
    {
        _context.Supporters.Add(supporter);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = supporter.SupporterId }, supporter);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<IActionResult> Update(int id, [FromBody] Supporter supporter)
    {
        if (id != supporter.SupporterId) return BadRequest();
        _context.Entry(supporter).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<IActionResult> Delete(int id)
    {
        var supporter = await _context.Supporters.FindAsync(id);
        if (supporter == null) return NotFound();
        _context.Supporters.Remove(supporter);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
