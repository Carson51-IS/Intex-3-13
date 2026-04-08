using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenLightApi.Models;

[Table("case_conferences")]
public class CaseConference
{
    [Key]
    [Column("conference_id")]
    public int ConferenceId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("conference_date")]
    public DateOnly ConferenceDate { get; set; }

    [Column("conference_type")]
    public string ConferenceType { get; set; } = "Case Conference";

    [Column("status")]
    public string Status { get; set; } = "Planned";

    [Column("facilitator")]
    public string Facilitator { get; set; } = string.Empty;

    [Column("agenda")]
    public string Agenda { get; set; } = string.Empty;

    [Column("summary_notes")]
    public string? SummaryNotes { get; set; }

    [Column("follow_up_actions")]
    public string? FollowUpActions { get; set; }

    [Column("next_conference_date")]
    public DateOnly? NextConferenceDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident Resident { get; set; } = null!;
}

