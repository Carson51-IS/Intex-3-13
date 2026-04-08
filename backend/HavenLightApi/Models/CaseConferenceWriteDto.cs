namespace HavenLightApi.Models;

/// <summary>
/// API body for creating/updating a case conference. Uses a class (not a positional record) so System.Text.Json binds reliably from the React payload.
/// </summary>
public class CaseConferenceWriteDto
{
    public int ResidentId { get; set; }
    public DateOnly ConferenceDate { get; set; }
    public string? ConferenceType { get; set; }
    public string? Status { get; set; }
    public string? Facilitator { get; set; }
    public string? Agenda { get; set; }
    public string? SummaryNotes { get; set; }
    public string? FollowUpActions { get; set; }
    public DateOnly? NextConferenceDate { get; set; }
}
