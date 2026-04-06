using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HavenLightApi.Data;
using HavenLightApi.Models;

namespace HavenLightApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly HavenLightContext _context;

    public DonationsController(HavenLightContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Donation>>> GetAll(
        [FromQuery] int? supporterId,
        [FromQuery] string? donationType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Donations.Include(d => d.Supporter).AsQueryable();

        if (supporterId.HasValue)
            query = query.Where(d => d.SupporterId == supporterId.Value);
        if (!string.IsNullOrEmpty(donationType))
            query = query.Where(d => d.DonationType == donationType);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.DonationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Donation>> GetById(int id)
    {
        var donation = await _context.Donations
            .Include(d => d.Supporter)
            .Include(d => d.Allocations)
            .FirstOrDefaultAsync(d => d.DonationId == id);

        if (donation == null) return NotFound();
        return Ok(donation);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Donation>> Create([FromBody] Donation donation)
    {
        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = donation.DonationId }, donation);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] Donation donation)
    {
        if (id != donation.DonationId) return BadRequest();
        _context.Entry(donation).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null) return NotFound();
        _context.Donations.Remove(donation);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
