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
public class SafehousesController : ControllerBase
{
    private readonly HavenLightContext _context;

    public SafehousesController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Safehouse>>> GetAll()
    {
        return Ok(await _context.Safehouses.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Safehouse>> GetById(int id)
    {
        var safehouse = await _context.Safehouses.FindAsync(id);
        if (safehouse == null) return NotFound();
        return Ok(safehouse);
    }

    [HttpPost]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<ActionResult<Safehouse>> Create([FromBody] Safehouse safehouse)
    {
        _context.Safehouses.Add(safehouse);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = safehouse.SafehouseId }, safehouse);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<IActionResult> Update(int id, [FromBody] Safehouse safehouse)
    {
        if (id != safehouse.SafehouseId) return BadRequest();
        _context.Entry(safehouse).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = AuthPolicies.ManageCatalog)]
    public async Task<IActionResult> Delete(int id)
    {
        var safehouse = await _context.Safehouses.FindAsync(id);
        if (safehouse == null) return NotFound();
        _context.Safehouses.Remove(safehouse);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
