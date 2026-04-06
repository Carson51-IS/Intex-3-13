using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenLightApi.Models;

[Table("health_wellbeing_records")]
public class HealthWellbeingRecord
{
    [Key]
    [Column("health_record_id")]
    public int HealthRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("weight_kg")]
    public decimal WeightKg { get; set; }

    [Column("height_cm")]
    public decimal HeightCm { get; set; }

    [Column("bmi")]
    public decimal Bmi { get; set; }

    [Column("nutrition_score")]
    public decimal NutritionScore { get; set; }

    [Column("sleep_score")]
    public decimal SleepScore { get; set; }

    [Column("energy_score")]
    public decimal EnergyScore { get; set; }

    [Column("general_health_score")]
    public decimal GeneralHealthScore { get; set; }

    [Column("medical_checkup_done")]
    public bool MedicalCheckupDone { get; set; }

    [Column("dental_checkup_done")]
    public bool DentalCheckupDone { get; set; }

    [Column("psychological_checkup_done")]
    public bool PsychologicalCheckupDone { get; set; }

    [Column("medical_notes_restricted")]
    public string? MedicalNotesRestricted { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident Resident { get; set; } = null!;
}
