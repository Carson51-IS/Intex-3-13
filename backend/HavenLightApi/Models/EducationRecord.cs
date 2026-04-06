using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenLightApi.Models;

[Table("education_records")]
public class EducationRecord
{
    [Key]
    [Column("education_record_id")]
    public int EducationRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("program_name")]
    public string ProgramName { get; set; } = string.Empty;

    [Column("course_name")]
    public string CourseName { get; set; } = string.Empty;

    [Column("education_level")]
    public string EducationLevel { get; set; } = string.Empty;

    [Column("attendance_status")]
    public string AttendanceStatus { get; set; } = string.Empty;

    [Column("attendance_rate")]
    public decimal AttendanceRate { get; set; }

    [Column("progress_percent")]
    public decimal ProgressPercent { get; set; }

    [Column("completion_status")]
    public string CompletionStatus { get; set; } = string.Empty;

    [Column("gpa_like_score")]
    public decimal GpaLikeScore { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident Resident { get; set; } = null!;
}
