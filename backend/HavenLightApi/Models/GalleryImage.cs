using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HavenLightApi.Models;

[Table("gallery_images")]
public class GalleryImage
{
    [Key]
    [Column("gallery_image_id")]
    public int GalleryImageId { get; set; }

    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("caption")]
    public string? Caption { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
