namespace HavenLightApi.Models;

/// <summary>
/// API input for creating a process recording — avoids binding the tracked <see cref="ProcessRecording.Resident"/> navigation
/// (which can cause model validation / deserialization issues on POST).
/// </summary>
public class ProcessRecordingCreateDto
{
    public int ResidentId { get; set; }
    public DateOnly SessionDate { get; set; }
    public string SocialWorker { get; set; } = string.Empty;
    public string SessionType { get; set; } = string.Empty;
    public int SessionDurationMinutes { get; set; }
    public string EmotionalStateObserved { get; set; } = string.Empty;
    public string EmotionalStateEnd { get; set; } = string.Empty;
    public string SessionNarrative { get; set; } = string.Empty;
    public string InterventionsApplied { get; set; } = string.Empty;
    public string FollowUpActions { get; set; } = string.Empty;
    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
    public string? NotesRestricted { get; set; }
}
