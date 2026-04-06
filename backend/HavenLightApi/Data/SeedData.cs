using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using HavenLightApi.Models;

namespace HavenLightApi.Data;

public static class SeedData
{
    public static async Task InitializeAsync(HavenLightContext context, string csvFolder)
    {
        if (context.Safehouses.Any())
            return;

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null,
            BadDataFound = null,
        };

        await SeedSafehouses(context, csvFolder, config);
        await SeedPartners(context, csvFolder, config);
        await SeedPartnerAssignments(context, csvFolder, config);
        await SeedSupporters(context, csvFolder, config);
        await SeedSocialMediaPosts(context, csvFolder, config);
        await SeedDonations(context, csvFolder, config);
        await SeedInKindDonationItems(context, csvFolder, config);
        await SeedDonationAllocations(context, csvFolder, config);
        await SeedResidents(context, csvFolder, config);
        await SeedProcessRecordings(context, csvFolder, config);
        await SeedHomeVisitations(context, csvFolder, config);
        await SeedEducationRecords(context, csvFolder, config);
        await SeedHealthWellbeingRecords(context, csvFolder, config);
        await SeedInterventionPlans(context, csvFolder, config);
        await SeedIncidentReports(context, csvFolder, config);
        await SeedSafehouseMonthlyMetrics(context, csvFolder, config);
        await SeedPublicImpactSnapshots(context, csvFolder, config);
    }

    private static async Task SeedCsv<T>(HavenLightContext context, string csvFolder, string fileName, CsvConfiguration config) where T : class
    {
        var path = Path.Combine(csvFolder, fileName);
        if (!File.Exists(path)) return;

        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, config);
        var records = csv.GetRecords<T>().ToList();
        context.Set<T>().AddRange(records);
        await context.SaveChangesAsync();
    }

    private static async Task SeedSafehouses(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "safehouses.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<SafehouseCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.Safehouses.Add(new Safehouse
            {
                SafehouseId = r.safehouse_id,
                SafehouseCode = r.safehouse_code ?? "",
                Name = r.name ?? "",
                Region = r.region ?? "",
                City = r.city ?? "",
                Province = r.province ?? "",
                Country = r.country ?? "",
                OpenDate = ParseDate(r.open_date),
                Status = r.status ?? "",
                CapacityGirls = r.capacity_girls,
                CapacityStaff = r.capacity_staff,
                CurrentOccupancy = r.current_occupancy,
                Notes = r.notes,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedPartners(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "partners.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<PartnerCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.Partners.Add(new Partner
            {
                PartnerId = r.partner_id,
                PartnerName = r.partner_name ?? "",
                PartnerType = r.partner_type ?? "",
                RoleType = r.role_type ?? "",
                ContactName = r.contact_name ?? "",
                Email = r.email ?? "",
                Phone = r.phone ?? "",
                Region = r.region ?? "",
                Status = r.status ?? "",
                StartDate = ParseDate(r.start_date),
                EndDate = ParseDateNullable(r.end_date),
                Notes = r.notes,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedPartnerAssignments(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "partner_assignments.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<PartnerAssignmentCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.PartnerAssignments.Add(new PartnerAssignment
            {
                AssignmentId = r.assignment_id,
                PartnerId = r.partner_id,
                SafehouseId = ParseIntNullable(r.safehouse_id),
                ProgramArea = r.program_area ?? "",
                AssignmentStart = ParseDate(r.assignment_start),
                AssignmentEnd = ParseDateNullable(r.assignment_end),
                ResponsibilityNotes = r.responsibility_notes,
                IsPrimary = ParseBool(r.is_primary),
                Status = r.status ?? "",
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedSupporters(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "supporters.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<SupporterCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.Supporters.Add(new Supporter
            {
                SupporterId = r.supporter_id,
                SupporterType = r.supporter_type ?? "",
                DisplayName = r.display_name ?? "",
                OrganizationName = r.organization_name,
                FirstName = r.first_name,
                LastName = r.last_name,
                RelationshipType = r.relationship_type ?? "",
                Region = r.region ?? "",
                Country = r.country ?? "",
                Email = r.email ?? "",
                Phone = r.phone ?? "",
                Status = r.status ?? "",
                CreatedAt = ParseDateTime(r.created_at),
                FirstDonationDate = ParseDateNullable(r.first_donation_date),
                AcquisitionChannel = r.acquisition_channel,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedSocialMediaPosts(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "social_media_posts.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<SocialMediaPostCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.SocialMediaPosts.Add(new SocialMediaPost
            {
                PostId = r.post_id,
                Platform = r.platform ?? "",
                PlatformPostId = r.platform_post_id ?? "",
                PostUrl = r.post_url ?? "",
                CreatedAt = ParseDateTime(r.created_at),
                DayOfWeek = r.day_of_week ?? "",
                PostHour = r.post_hour,
                PostType = r.post_type ?? "",
                MediaType = r.media_type ?? "",
                Caption = r.caption ?? "",
                Hashtags = r.hashtags,
                NumHashtags = r.num_hashtags,
                MentionsCount = r.mentions_count,
                HasCallToAction = ParseBool(r.has_call_to_action),
                CallToActionType = r.call_to_action_type,
                ContentTopic = r.content_topic ?? "",
                SentimentTone = r.sentiment_tone ?? "",
                CaptionLength = r.caption_length,
                FeaturesResidentStory = ParseBool(r.features_resident_story),
                CampaignName = r.campaign_name,
                IsBoosted = ParseBool(r.is_boosted),
                BoostBudgetPhp = ParseDecimalNullable(r.boost_budget_php),
                Impressions = r.impressions,
                Reach = r.reach,
                Likes = r.likes,
                Comments = r.comments,
                Shares = r.shares,
                Saves = r.saves,
                ClickThroughs = r.click_throughs,
                VideoViews = ParseIntNullable(r.video_views),
                EngagementRate = ParseDecimal(r.engagement_rate),
                ProfileVisits = r.profile_visits,
                DonationReferrals = r.donation_referrals,
                EstimatedDonationValuePhp = ParseDecimal(r.estimated_donation_value_php),
                FollowerCountAtPost = r.follower_count_at_post,
                WatchTimeSeconds = ParseIntNullable(r.watch_time_seconds),
                AvgViewDurationSeconds = ParseIntNullable(r.avg_view_duration_seconds),
                SubscriberCountAtPost = ParseIntNullable(r.subscriber_count_at_post),
                Forwards = ParseIntNullable(r.forwards),
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedDonations(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "donations.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<DonationCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.Donations.Add(new Donation
            {
                DonationId = r.donation_id,
                SupporterId = r.supporter_id,
                DonationType = r.donation_type ?? "",
                DonationDate = ParseDate(r.donation_date),
                IsRecurring = ParseBool(r.is_recurring),
                CampaignName = r.campaign_name,
                ChannelSource = r.channel_source ?? "",
                CurrencyCode = r.currency_code,
                Amount = ParseDecimalNullable(r.amount),
                EstimatedValue = ParseDecimalNullable(r.estimated_value),
                ImpactUnit = r.impact_unit,
                Notes = r.notes,
                ReferralPostId = ParseIntNullable(r.referral_post_id),
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedInKindDonationItems(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "in_kind_donation_items.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<InKindDonationItemCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.InKindDonationItems.Add(new InKindDonationItem
            {
                ItemId = r.item_id,
                DonationId = r.donation_id,
                ItemName = r.item_name ?? "",
                ItemCategory = r.item_category ?? "",
                Quantity = r.quantity,
                UnitOfMeasure = r.unit_of_measure ?? "",
                EstimatedUnitValue = ParseDecimal(r.estimated_unit_value),
                IntendedUse = r.intended_use ?? "",
                ReceivedCondition = r.received_condition ?? "",
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedDonationAllocations(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "donation_allocations.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<DonationAllocationCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.DonationAllocations.Add(new DonationAllocation
            {
                AllocationId = r.allocation_id,
                DonationId = r.donation_id,
                SafehouseId = r.safehouse_id,
                ProgramArea = r.program_area ?? "",
                AmountAllocated = ParseDecimal(r.amount_allocated),
                AllocationDate = ParseDate(r.allocation_date),
                AllocationNotes = r.allocation_notes,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedResidents(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "residents.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<ResidentCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.Residents.Add(new Resident
            {
                ResidentId = r.resident_id,
                CaseControlNo = r.case_control_no ?? "",
                InternalCode = r.internal_code ?? "",
                SafehouseId = r.safehouse_id,
                CaseStatus = r.case_status ?? "",
                Sex = r.sex ?? "F",
                DateOfBirth = ParseDate(r.date_of_birth),
                BirthStatus = r.birth_status ?? "",
                PlaceOfBirth = r.place_of_birth ?? "",
                Religion = r.religion ?? "",
                CaseCategory = r.case_category ?? "",
                SubCatOrphaned = ParseBool(r.sub_cat_orphaned),
                SubCatTrafficked = ParseBool(r.sub_cat_trafficked),
                SubCatChildLabor = ParseBool(r.sub_cat_child_labor),
                SubCatPhysicalAbuse = ParseBool(r.sub_cat_physical_abuse),
                SubCatSexualAbuse = ParseBool(r.sub_cat_sexual_abuse),
                SubCatOsaec = ParseBool(r.sub_cat_osaec),
                SubCatCicl = ParseBool(r.sub_cat_cicl),
                SubCatAtRisk = ParseBool(r.sub_cat_at_risk),
                SubCatStreetChild = ParseBool(r.sub_cat_street_child),
                SubCatChildWithHiv = ParseBool(r.sub_cat_child_with_hiv),
                IsPwd = ParseBool(r.is_pwd),
                PwdType = r.pwd_type,
                HasSpecialNeeds = ParseBool(r.has_special_needs),
                SpecialNeedsDiagnosis = r.special_needs_diagnosis,
                FamilyIs4Ps = ParseBool(r.family_is_4ps),
                FamilySoloParent = ParseBool(r.family_solo_parent),
                FamilyIndigenous = ParseBool(r.family_indigenous),
                FamilyParentPwd = ParseBool(r.family_parent_pwd),
                FamilyInformalSettler = ParseBool(r.family_informal_settler),
                DateOfAdmission = ParseDate(r.date_of_admission),
                AgeUponAdmission = r.age_upon_admission,
                PresentAge = r.present_age,
                LengthOfStay = r.length_of_stay,
                ReferralSource = r.referral_source ?? "",
                ReferringAgencyPerson = r.referring_agency_person,
                DateColbRegistered = ParseDateNullable(r.date_colb_registered),
                DateColbObtained = ParseDateNullable(r.date_colb_obtained),
                AssignedSocialWorker = r.assigned_social_worker ?? "",
                InitialCaseAssessment = r.initial_case_assessment,
                DateCaseStudyPrepared = ParseDateNullable(r.date_case_study_prepared),
                ReintegrationType = r.reintegration_type,
                ReintegrationStatus = r.reintegration_status,
                InitialRiskLevel = r.initial_risk_level ?? "",
                CurrentRiskLevel = r.current_risk_level ?? "",
                DateEnrolled = ParseDate(r.date_enrolled),
                DateClosed = ParseDateNullable(r.date_closed),
                CreatedAt = ParseDateTime(r.created_at),
                NotesRestricted = r.notes_restricted,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedProcessRecordings(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "process_recordings.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<ProcessRecordingCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.ProcessRecordings.Add(new ProcessRecording
            {
                RecordingId = r.recording_id,
                ResidentId = r.resident_id,
                SessionDate = ParseDate(r.session_date),
                SocialWorker = r.social_worker ?? "",
                SessionType = r.session_type ?? "",
                SessionDurationMinutes = r.session_duration_minutes,
                EmotionalStateObserved = r.emotional_state_observed ?? "",
                EmotionalStateEnd = r.emotional_state_end ?? "",
                SessionNarrative = r.session_narrative ?? "",
                InterventionsApplied = r.interventions_applied ?? "",
                FollowUpActions = r.follow_up_actions ?? "",
                ProgressNoted = ParseBool(r.progress_noted),
                ConcernsFlagged = ParseBool(r.concerns_flagged),
                ReferralMade = ParseBool(r.referral_made),
                NotesRestricted = r.notes_restricted,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedHomeVisitations(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "home_visitations.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<HomeVisitationCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.HomeVisitations.Add(new HomeVisitation
            {
                VisitationId = r.visitation_id,
                ResidentId = r.resident_id,
                VisitDate = ParseDate(r.visit_date),
                SocialWorker = r.social_worker ?? "",
                VisitType = r.visit_type ?? "",
                LocationVisited = r.location_visited ?? "",
                FamilyMembersPresent = r.family_members_present,
                Purpose = r.purpose ?? "",
                Observations = r.observations ?? "",
                FamilyCooperationLevel = r.family_cooperation_level ?? "",
                SafetyConcernsNoted = ParseBool(r.safety_concerns_noted),
                FollowUpNeeded = ParseBool(r.follow_up_needed),
                FollowUpNotes = r.follow_up_notes,
                VisitOutcome = r.visit_outcome ?? "",
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedEducationRecords(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "education_records.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<EducationRecordCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.EducationRecords.Add(new EducationRecord
            {
                EducationRecordId = r.education_record_id,
                ResidentId = r.resident_id,
                RecordDate = ParseDate(r.record_date),
                ProgramName = r.program_name ?? "",
                CourseName = r.course_name ?? "",
                EducationLevel = r.education_level ?? "",
                AttendanceStatus = r.attendance_status ?? "",
                AttendanceRate = ParseDecimal(r.attendance_rate),
                ProgressPercent = ParseDecimal(r.progress_percent),
                CompletionStatus = r.completion_status ?? "",
                GpaLikeScore = ParseDecimal(r.gpa_like_score),
                Notes = r.notes,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedHealthWellbeingRecords(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "health_wellbeing_records.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<HealthWellbeingRecordCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.HealthWellbeingRecords.Add(new HealthWellbeingRecord
            {
                HealthRecordId = r.health_record_id,
                ResidentId = r.resident_id,
                RecordDate = ParseDate(r.record_date),
                WeightKg = ParseDecimal(r.weight_kg),
                HeightCm = ParseDecimal(r.height_cm),
                Bmi = ParseDecimal(r.bmi),
                NutritionScore = ParseDecimal(r.nutrition_score),
                SleepScore = ParseDecimal(r.sleep_score),
                EnergyScore = ParseDecimal(r.energy_score),
                GeneralHealthScore = ParseDecimal(r.general_health_score),
                MedicalCheckupDone = ParseBool(r.medical_checkup_done),
                DentalCheckupDone = ParseBool(r.dental_checkup_done),
                PsychologicalCheckupDone = ParseBool(r.psychological_checkup_done),
                MedicalNotesRestricted = r.medical_notes_restricted,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedInterventionPlans(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "intervention_plans.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<InterventionPlanCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.InterventionPlans.Add(new InterventionPlan
            {
                PlanId = r.plan_id,
                ResidentId = r.resident_id,
                PlanCategory = r.plan_category ?? "",
                PlanDescription = r.plan_description ?? "",
                ServicesProvided = r.services_provided ?? "",
                TargetValue = ParseDecimalNullable(r.target_value),
                TargetDate = ParseDate(r.target_date),
                Status = r.status ?? "",
                CaseConferenceDate = ParseDateNullable(r.case_conference_date),
                CreatedAt = ParseDateTime(r.created_at),
                UpdatedAt = ParseDateTime(r.updated_at),
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedIncidentReports(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "incident_reports.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<IncidentReportCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.IncidentReports.Add(new IncidentReport
            {
                IncidentId = r.incident_id,
                ResidentId = r.resident_id,
                SafehouseId = r.safehouse_id,
                IncidentDate = ParseDate(r.incident_date),
                IncidentType = r.incident_type ?? "",
                Severity = r.severity ?? "",
                Description = r.description ?? "",
                ResponseTaken = r.response_taken ?? "",
                Resolved = ParseBool(r.resolved),
                ResolutionDate = ParseDateNullable(r.resolution_date),
                ReportedBy = r.reported_by ?? "",
                FollowUpRequired = ParseBool(r.follow_up_required),
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedSafehouseMonthlyMetrics(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "safehouse_monthly_metrics.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<SafehouseMonthlyMetricCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.SafehouseMonthlyMetrics.Add(new SafehouseMonthlyMetric
            {
                MetricId = r.metric_id,
                SafehouseId = r.safehouse_id,
                MonthStart = ParseDate(r.month_start),
                MonthEnd = ParseDate(r.month_end),
                ActiveResidents = r.active_residents,
                AvgEducationProgress = ParseDecimal(r.avg_education_progress),
                AvgHealthScore = ParseDecimal(r.avg_health_score),
                ProcessRecordingCount = r.process_recording_count,
                HomeVisitationCount = r.home_visitation_count,
                IncidentCount = r.incident_count,
                Notes = r.notes,
            });
        }
        await ctx.SaveChangesAsync();
    }

    private static async Task SeedPublicImpactSnapshots(HavenLightContext ctx, string folder, CsvConfiguration cfg)
    {
        var path = Path.Combine(folder, "public_impact_snapshots.csv");
        if (!File.Exists(path)) return;
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, cfg);
        var records = csv.GetRecords<PublicImpactSnapshotCsvRow>().ToList();
        foreach (var r in records)
        {
            ctx.PublicImpactSnapshots.Add(new PublicImpactSnapshot
            {
                SnapshotId = r.snapshot_id,
                SnapshotDate = ParseDate(r.snapshot_date),
                Headline = r.headline ?? "",
                SummaryText = r.summary_text ?? "",
                MetricPayloadJson = r.metric_payload_json ?? "",
                IsPublished = ParseBool(r.is_published),
                PublishedAt = ParseDateNullable(r.published_at),
            });
        }
        await ctx.SaveChangesAsync();
    }

    // --- Helper parsing methods ---

    private static DateOnly ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return DateOnly.MinValue;
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
            return DateOnly.FromDateTime(dt);
        return DateOnly.MinValue;
    }

    private static DateOnly? ParseDateNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
            return DateOnly.FromDateTime(dt);
        return null;
    }

    private static DateTime ParseDateTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return DateTime.MinValue;
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
            return dt;
        return DateTime.MinValue;
    }

    private static bool ParseBool(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        return value.Equals("True", StringComparison.OrdinalIgnoreCase)
            || value.Equals("true", StringComparison.OrdinalIgnoreCase)
            || value == "1";
    }

    private static decimal ParseDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;
        if (decimal.TryParse(value, CultureInfo.InvariantCulture, out var d)) return d;
        return 0;
    }

    private static decimal? ParseDecimalNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (decimal.TryParse(value, CultureInfo.InvariantCulture, out var d)) return d;
        return null;
    }

    private static int? ParseIntNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (int.TryParse(value, out var i)) return i;
        return null;
    }

    // --- CSV row DTOs (flat string properties for flexible parsing) ---

    private record SafehouseCsvRow
    {
        public int safehouse_id { get; set; }
        public string? safehouse_code { get; set; }
        public string? name { get; set; }
        public string? region { get; set; }
        public string? city { get; set; }
        public string? province { get; set; }
        public string? country { get; set; }
        public string? open_date { get; set; }
        public string? status { get; set; }
        public int capacity_girls { get; set; }
        public int capacity_staff { get; set; }
        public int current_occupancy { get; set; }
        public string? notes { get; set; }
    }

    private record PartnerCsvRow
    {
        public int partner_id { get; set; }
        public string? partner_name { get; set; }
        public string? partner_type { get; set; }
        public string? role_type { get; set; }
        public string? contact_name { get; set; }
        public string? email { get; set; }
        public string? phone { get; set; }
        public string? region { get; set; }
        public string? status { get; set; }
        public string? start_date { get; set; }
        public string? end_date { get; set; }
        public string? notes { get; set; }
    }

    private record PartnerAssignmentCsvRow
    {
        public int assignment_id { get; set; }
        public int partner_id { get; set; }
        public string? safehouse_id { get; set; }
        public string? program_area { get; set; }
        public string? assignment_start { get; set; }
        public string? assignment_end { get; set; }
        public string? responsibility_notes { get; set; }
        public string? is_primary { get; set; }
        public string? status { get; set; }
    }

    private record SupporterCsvRow
    {
        public int supporter_id { get; set; }
        public string? supporter_type { get; set; }
        public string? display_name { get; set; }
        public string? organization_name { get; set; }
        public string? first_name { get; set; }
        public string? last_name { get; set; }
        public string? relationship_type { get; set; }
        public string? region { get; set; }
        public string? country { get; set; }
        public string? email { get; set; }
        public string? phone { get; set; }
        public string? status { get; set; }
        public string? created_at { get; set; }
        public string? first_donation_date { get; set; }
        public string? acquisition_channel { get; set; }
    }

    private record DonationCsvRow
    {
        public int donation_id { get; set; }
        public int supporter_id { get; set; }
        public string? donation_type { get; set; }
        public string? donation_date { get; set; }
        public string? is_recurring { get; set; }
        public string? campaign_name { get; set; }
        public string? channel_source { get; set; }
        public string? currency_code { get; set; }
        public string? amount { get; set; }
        public string? estimated_value { get; set; }
        public string? impact_unit { get; set; }
        public string? notes { get; set; }
        public string? referral_post_id { get; set; }
    }

    private record InKindDonationItemCsvRow
    {
        public int item_id { get; set; }
        public int donation_id { get; set; }
        public string? item_name { get; set; }
        public string? item_category { get; set; }
        public int quantity { get; set; }
        public string? unit_of_measure { get; set; }
        public string? estimated_unit_value { get; set; }
        public string? intended_use { get; set; }
        public string? received_condition { get; set; }
    }

    private record DonationAllocationCsvRow
    {
        public int allocation_id { get; set; }
        public int donation_id { get; set; }
        public int safehouse_id { get; set; }
        public string? program_area { get; set; }
        public string? amount_allocated { get; set; }
        public string? allocation_date { get; set; }
        public string? allocation_notes { get; set; }
    }

    private record ResidentCsvRow
    {
        public int resident_id { get; set; }
        public string? case_control_no { get; set; }
        public string? internal_code { get; set; }
        public int safehouse_id { get; set; }
        public string? case_status { get; set; }
        public string? sex { get; set; }
        public string? date_of_birth { get; set; }
        public string? birth_status { get; set; }
        public string? place_of_birth { get; set; }
        public string? religion { get; set; }
        public string? case_category { get; set; }
        public string? sub_cat_orphaned { get; set; }
        public string? sub_cat_trafficked { get; set; }
        public string? sub_cat_child_labor { get; set; }
        public string? sub_cat_physical_abuse { get; set; }
        public string? sub_cat_sexual_abuse { get; set; }
        public string? sub_cat_osaec { get; set; }
        public string? sub_cat_cicl { get; set; }
        public string? sub_cat_at_risk { get; set; }
        public string? sub_cat_street_child { get; set; }
        public string? sub_cat_child_with_hiv { get; set; }
        public string? is_pwd { get; set; }
        public string? pwd_type { get; set; }
        public string? has_special_needs { get; set; }
        public string? special_needs_diagnosis { get; set; }
        public string? family_is_4ps { get; set; }
        public string? family_solo_parent { get; set; }
        public string? family_indigenous { get; set; }
        public string? family_parent_pwd { get; set; }
        public string? family_informal_settler { get; set; }
        public string? date_of_admission { get; set; }
        public string? age_upon_admission { get; set; }
        public string? present_age { get; set; }
        public string? length_of_stay { get; set; }
        public string? referral_source { get; set; }
        public string? referring_agency_person { get; set; }
        public string? date_colb_registered { get; set; }
        public string? date_colb_obtained { get; set; }
        public string? assigned_social_worker { get; set; }
        public string? initial_case_assessment { get; set; }
        public string? date_case_study_prepared { get; set; }
        public string? reintegration_type { get; set; }
        public string? reintegration_status { get; set; }
        public string? initial_risk_level { get; set; }
        public string? current_risk_level { get; set; }
        public string? date_enrolled { get; set; }
        public string? date_closed { get; set; }
        public string? created_at { get; set; }
        public string? notes_restricted { get; set; }
    }

    private record ProcessRecordingCsvRow
    {
        public int recording_id { get; set; }
        public int resident_id { get; set; }
        public string? session_date { get; set; }
        public string? social_worker { get; set; }
        public string? session_type { get; set; }
        public int session_duration_minutes { get; set; }
        public string? emotional_state_observed { get; set; }
        public string? emotional_state_end { get; set; }
        public string? session_narrative { get; set; }
        public string? interventions_applied { get; set; }
        public string? follow_up_actions { get; set; }
        public string? progress_noted { get; set; }
        public string? concerns_flagged { get; set; }
        public string? referral_made { get; set; }
        public string? notes_restricted { get; set; }
    }

    private record HomeVisitationCsvRow
    {
        public int visitation_id { get; set; }
        public int resident_id { get; set; }
        public string? visit_date { get; set; }
        public string? social_worker { get; set; }
        public string? visit_type { get; set; }
        public string? location_visited { get; set; }
        public string? family_members_present { get; set; }
        public string? purpose { get; set; }
        public string? observations { get; set; }
        public string? family_cooperation_level { get; set; }
        public string? safety_concerns_noted { get; set; }
        public string? follow_up_needed { get; set; }
        public string? follow_up_notes { get; set; }
        public string? visit_outcome { get; set; }
    }

    private record EducationRecordCsvRow
    {
        public int education_record_id { get; set; }
        public int resident_id { get; set; }
        public string? record_date { get; set; }
        public string? program_name { get; set; }
        public string? course_name { get; set; }
        public string? education_level { get; set; }
        public string? attendance_status { get; set; }
        public string? attendance_rate { get; set; }
        public string? progress_percent { get; set; }
        public string? completion_status { get; set; }
        public string? gpa_like_score { get; set; }
        public string? notes { get; set; }
    }

    private record HealthWellbeingRecordCsvRow
    {
        public int health_record_id { get; set; }
        public int resident_id { get; set; }
        public string? record_date { get; set; }
        public string? weight_kg { get; set; }
        public string? height_cm { get; set; }
        public string? bmi { get; set; }
        public string? nutrition_score { get; set; }
        public string? sleep_score { get; set; }
        public string? energy_score { get; set; }
        public string? general_health_score { get; set; }
        public string? medical_checkup_done { get; set; }
        public string? dental_checkup_done { get; set; }
        public string? psychological_checkup_done { get; set; }
        public string? medical_notes_restricted { get; set; }
    }

    private record InterventionPlanCsvRow
    {
        public int plan_id { get; set; }
        public int resident_id { get; set; }
        public string? plan_category { get; set; }
        public string? plan_description { get; set; }
        public string? services_provided { get; set; }
        public string? target_value { get; set; }
        public string? target_date { get; set; }
        public string? status { get; set; }
        public string? case_conference_date { get; set; }
        public string? created_at { get; set; }
        public string? updated_at { get; set; }
    }

    private record IncidentReportCsvRow
    {
        public int incident_id { get; set; }
        public int resident_id { get; set; }
        public int safehouse_id { get; set; }
        public string? incident_date { get; set; }
        public string? incident_type { get; set; }
        public string? severity { get; set; }
        public string? description { get; set; }
        public string? response_taken { get; set; }
        public string? resolved { get; set; }
        public string? resolution_date { get; set; }
        public string? reported_by { get; set; }
        public string? follow_up_required { get; set; }
    }

    private record SocialMediaPostCsvRow
    {
        public int post_id { get; set; }
        public string? platform { get; set; }
        public string? platform_post_id { get; set; }
        public string? post_url { get; set; }
        public string? created_at { get; set; }
        public string? day_of_week { get; set; }
        public int post_hour { get; set; }
        public string? post_type { get; set; }
        public string? media_type { get; set; }
        public string? caption { get; set; }
        public string? hashtags { get; set; }
        public int num_hashtags { get; set; }
        public int mentions_count { get; set; }
        public string? has_call_to_action { get; set; }
        public string? call_to_action_type { get; set; }
        public string? content_topic { get; set; }
        public string? sentiment_tone { get; set; }
        public int caption_length { get; set; }
        public string? features_resident_story { get; set; }
        public string? campaign_name { get; set; }
        public string? is_boosted { get; set; }
        public string? boost_budget_php { get; set; }
        public int impressions { get; set; }
        public int reach { get; set; }
        public int likes { get; set; }
        public int comments { get; set; }
        public int shares { get; set; }
        public int saves { get; set; }
        public int click_throughs { get; set; }
        public string? video_views { get; set; }
        public string? engagement_rate { get; set; }
        public int profile_visits { get; set; }
        public int donation_referrals { get; set; }
        public string? estimated_donation_value_php { get; set; }
        public int follower_count_at_post { get; set; }
        public string? watch_time_seconds { get; set; }
        public string? avg_view_duration_seconds { get; set; }
        public string? subscriber_count_at_post { get; set; }
        public string? forwards { get; set; }
    }

    private record SafehouseMonthlyMetricCsvRow
    {
        public int metric_id { get; set; }
        public int safehouse_id { get; set; }
        public string? month_start { get; set; }
        public string? month_end { get; set; }
        public int active_residents { get; set; }
        public string? avg_education_progress { get; set; }
        public string? avg_health_score { get; set; }
        public int process_recording_count { get; set; }
        public int home_visitation_count { get; set; }
        public int incident_count { get; set; }
        public string? notes { get; set; }
    }

    private record PublicImpactSnapshotCsvRow
    {
        public int snapshot_id { get; set; }
        public string? snapshot_date { get; set; }
        public string? headline { get; set; }
        public string? summary_text { get; set; }
        public string? metric_payload_json { get; set; }
        public string? is_published { get; set; }
        public string? published_at { get; set; }
    }
}
