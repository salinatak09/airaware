import "server-only";
import type {
  SafetyEvaluationInput,
  SafetyAdvisoryResult,
  SafetySeverityLevel,
  AffectedGroupsEvaluation,
  StructuredRecommendations,
  StructuredRestrictions,
  StructuredWarning,
  DataFreshnessEvaluation,
  MaskType,
} from "./types.ts";
import type { IndianNaqiCategory } from "../../../types/aqi.ts";
import { calculateComprehensiveIndianAqi, getIndianCategory } from "../../utils/aqi-calculator.ts";

export class AirQualitySafetyEngine {
  private static readonly DISCLAIMER =
    "AirAware safety advisories provide preventive environmental health guidance based on ambient air quality indices. This information is non-diagnostic and does not replace medical advice or clinical treatment plans. No indoor or outdoor environment is guaranteed to be completely free of airborne irritants.";

  // Stale threshold constants
  private static readonly FRESH_MAX_SECONDS = 30 * 60; // 30 minutes
  private static readonly ACCEPTABLE_MAX_SECONDS = 120 * 60; // 2 hours
  private static readonly STALE_MAX_SECONDS = 360 * 60; // 6 hours

  /**
   * Main evaluation entry point.
   * Deterministically analyzes ambient readings, pollutant concentrations,
   * household vulnerabilities, and data freshness.
   */
  public evaluateSafety(input: SafetyEvaluationInput): SafetyAdvisoryResult {
    // 1. Evaluate Data Freshness
    const freshness = this.evaluateDataFreshness(input.recordedAt);

    // 2. Resolve Effective Indian NAQI and Category
    const { effectiveAqi, effectiveCategory, isMissingData } = this.resolveAqiAndCategory(input);

    // 3. Determine Overall Severity
    const severity = this.determineSeverity(effectiveAqi, input);

    // 4. Identify Affected Groups
    const affectedGroups = this.evaluateAffectedGroups(effectiveAqi, input);

    // 5. Detect Pollutant-Specific & Severe Warnings
    const warnings = this.generateWarnings(effectiveAqi, effectiveCategory, input, freshness, isMissingData);

    // 6. Compute Deterministic Activity Restrictions
    const restrictions = this.determineRestrictions(effectiveAqi, effectiveCategory, input);

    // 7. Compile Structured Targeted Recommendations
    const recommendations = this.compileRecommendations(effectiveAqi, effectiveCategory, input, restrictions);

    // 8. Determine Overall Confidence Score
    const confidence = this.calculateConfidence(freshness, isMissingData, input);

    return {
      category: effectiveCategory,
      severity,
      affectedGroups,
      recommendations,
      restrictions,
      warnings,
      confidence,
      dataFreshness: freshness,
      disclaimer: AirQualitySafetyEngine.DISCLAIMER,
    };
  }

  /**
   * Evaluates freshness and validity of recording timestamp.
   */
  public evaluateDataFreshness(recordedAt?: string | Date): DataFreshnessEvaluation {
    const evaluatedAt = new Date().toISOString();

    if (!recordedAt) {
      return {
        status: "missing",
        ageSeconds: 999999,
        evaluatedAt,
        isStale: true,
        note: "Measurement timestamp was not provided. Air quality readings cannot be verified for real-time accuracy.",
      };
    }

    const recordedTimeMs = typeof recordedAt === "string" ? new Date(recordedAt).getTime() : recordedAt.getTime();
    if (isNaN(recordedTimeMs)) {
      return {
        status: "missing",
        ageSeconds: 999999,
        evaluatedAt,
        isStale: true,
        note: "Invalid timestamp format provided.",
      };
    }

    const nowMs = Date.now();
    const ageSeconds = Math.max(0, Math.floor((nowMs - recordedTimeMs) / 1000));
    const recordedAtIso = new Date(recordedTimeMs).toISOString();

    if (ageSeconds <= AirQualitySafetyEngine.FRESH_MAX_SECONDS) {
      const mins = Math.floor(ageSeconds / 60);
      return {
        status: "fresh",
        ageSeconds,
        recordedAt: recordedAtIso,
        evaluatedAt,
        isStale: false,
        note: mins < 1 ? "Readings are live and up-to-date." : `Readings recorded ${mins} minute${mins === 1 ? "" : "s"} ago.`,
      };
    }

    if (ageSeconds <= AirQualitySafetyEngine.ACCEPTABLE_MAX_SECONDS) {
      const mins = Math.floor(ageSeconds / 60);
      return {
        status: "acceptable",
        ageSeconds,
        recordedAt: recordedAtIso,
        evaluatedAt,
        isStale: false,
        note: `Readings recorded ${mins} minutes ago. Values remain reasonably representative of ambient conditions.`,
      };
    }

    const hours = (ageSeconds / 3600).toFixed(1);
    const isVeryStale = ageSeconds > AirQualitySafetyEngine.STALE_MAX_SECONDS;

    return {
      status: "stale",
      ageSeconds,
      recordedAt: recordedAtIso,
      evaluatedAt,
      isStale: true,
      note: isVeryStale
        ? `Readings are significantly outdated (${hours} hours old). Rapid atmospheric shifts may have altered current air quality.`
        : `Readings are over ${hours} hours old. Exercise added caution as atmospheric boundary layers may have changed.`,
    };
  }

  /**
   * Resolves effective Indian NAQI from explicit numerical AQI or computes from pollutant inputs.
   */
  private resolveAqiAndCategory(input: SafetyEvaluationInput): {
    effectiveAqi: number;
    effectiveCategory: IndianNaqiCategory;
    isMissingData: boolean;
  } {
    // If AQI is explicitly provided
    if (input.aqi !== undefined && input.aqi !== null && !isNaN(input.aqi)) {
      const cat = getIndianCategory(input.aqi);
      return {
        effectiveAqi: Math.max(0, Math.round(input.aqi)),
        effectiveCategory: cat.category,
        isMissingData: false,
      };
    }

    // If pollutants are provided, calculate official CPCB NAQI
    if (input.pollutants && Object.keys(input.pollutants).length > 0) {
      const { pm25, pm10, no2, so2, co, o3 } = input.pollutants;
      const hasAnyPollutant = [pm25, pm10, no2, so2, co, o3].some(
        (val) => val !== undefined && val !== null && !isNaN(val)
      );

      if (hasAnyPollutant) {
        const calc = calculateComprehensiveIndianAqi({
          pm25,
          pm10,
          no2,
          so2,
          coMgM3: co,
          o3,
        });
        return {
          effectiveAqi: calc.indianAqi,
          effectiveCategory: calc.category,
          isMissingData: false,
        };
      }
    }

    // Missing readings fallback: Cautious Moderate assumption
    return {
      effectiveAqi: 101, // Moderate default
      effectiveCategory: "moderate",
      isMissingData: true,
    };
  }

  /**
   * Determines deterministic severity level.
   */
  private determineSeverity(aqi: number, input: SafetyEvaluationInput): SafetySeverityLevel {
    const hasVulnerableMembers =
      input.householdProfile?.hasRespiratorySensitivity ||
      input.householdProfile?.hasCardiovascularSensitivity ||
      input.householdProfile?.hasChildren ||
      input.householdProfile?.hasElderly ||
      input.householdProfile?.isPregnant;

    if (aqi > 400) return "critical"; // Severe CPCB
    if (aqi > 300) return "severe";   // Very Poor CPCB
    if (aqi > 200) return "high";     // Poor CPCB
    if (aqi > 100) {
      // Moderate (101-200) is "moderate" for general population, but escalates to "high" for highly vulnerable households
      return hasVulnerableMembers ? "high" : "moderate";
    }
    if (aqi > 50) return "moderate";  // Satisfactory CPCB
    return "low";                     // Good CPCB
  }

  /**
   * Identifies affected population groups based on CPCB health criteria and household demographics.
   */
  private evaluateAffectedGroups(aqi: number, input: SafetyEvaluationInput): AffectedGroupsEvaluation {
    const profile = input.householdProfile;

    if (aqi <= 50) {
      return {
        generalPopulation: false,
        children: false,
        elderly: false,
        respiratorySensitive: false,
        cardiovascularSensitive: false,
        pregnancy: false,
        summary: "Minimal environmental health impact expected for all demographic groups.",
      };
    }

    if (aqi <= 100) {
      const isSensitive = Boolean(profile?.hasRespiratorySensitivity || profile?.hasChildren);
      return {
        generalPopulation: false,
        children: Boolean(profile?.hasChildren),
        elderly: Boolean(profile?.hasElderly),
        respiratorySensitive: true,
        cardiovascularSensitive: false,
        pregnancy: false,
        summary: isSensitive
          ? "Minor breathing discomfort may be experienced by unusually sensitive individuals and active children."
          : "Acceptable ambient conditions. Minor discomfort possible for unusually hypersensitive individuals.",
      };
    }

    if (aqi <= 200) {
      return {
        generalPopulation: false,
        children: true,
        elderly: true,
        respiratorySensitive: true,
        cardiovascularSensitive: true,
        pregnancy: Boolean(profile?.isPregnant),
        summary: "Breathing discomfort expected for individuals with asthma, COPD, and heart ailments, as well as active children and seniors.",
      };
    }

    if (aqi <= 300) {
      return {
        generalPopulation: true,
        children: true,
        elderly: true,
        respiratorySensitive: true,
        cardiovascularSensitive: true,
        pregnancy: true,
        summary: "Discomfort on prolonged exposure for the general population. Significant distress for children, seniors, and sensitive groups.",
      };
    }

    if (aqi <= 400) {
      return {
        generalPopulation: true,
        children: true,
        elderly: true,
        respiratorySensitive: true,
        cardiovascularSensitive: true,
        pregnancy: true,
        summary: "Respiratory illness risk on prolonged exposure. Severe aggravation of asthma and cardiovascular conditions across all age groups.",
      };
    }

    // Severe (>400)
    return {
      generalPopulation: true,
      children: true,
      elderly: true,
      respiratorySensitive: true,
      cardiovascularSensitive: true,
      pregnancy: true,
      summary: "Critical health alert: Severe pollution affects healthy individuals and critically impacts all vulnerable family members.",
    };
  }

  /**
   * Generates deterministic warnings based on AQI tiers, pollutant spikes, and stale/missing data.
   */
  private generateWarnings(
    aqi: number,
    category: IndianNaqiCategory,
    input: SafetyEvaluationInput,
    freshness: DataFreshnessEvaluation,
    isMissingData: boolean
  ): StructuredWarning[] {
    const warnings: StructuredWarning[] = [];

    // Missing Readings Warning
    if (isMissingData) {
      warnings.push({
        code: "DATA_READINGS_UNAVAILABLE",
        level: "warning",
        title: "Ambient Air Quality Data Unavailable",
        message: "Real-time pollutant monitoring is currently unavailable for this location. Precautionary moderate guidance is provided.",
      });
    }

    // Stale Readings Warning
    if (freshness.isStale && !isMissingData) {
      warnings.push({
        code: "STALE_DATA_READING",
        level: "advisory",
        title: "Delayed Measurement Warning",
        message: freshness.note,
      });
    }

    // Severe / Emergency Tier Warnings
    if (aqi > 400) {
      warnings.push({
        code: "SEVERE_HAZARD_EMERGENCY",
        level: "emergency",
        title: "Emergency Air Pollution Alert (NAQI > 400)",
        message: "Ambient air is in the Severe tier. Outdoor atmospheric particulate concentration represents an immediate public health hazard. Seal indoor living spaces and avoid all outdoor exposure.",
      });
    } else if (aqi > 300) {
      warnings.push({
        code: "VERY_POOR_SMOG_WARNING",
        level: "danger",
        title: "Very Poor Air Quality Warning (NAQI 301-400)",
        message: "Ambient particulate matter is significantly elevated. Prolonged inhalation induces acute respiratory fatigue and inflammation. Wear an N95 mask for any unavoidable outdoor transit.",
      });
    } else if (aqi > 200) {
      warnings.push({
        code: "POOR_AIR_ADVISORY",
        level: "warning",
        title: "Poor Air Quality Notice (NAQI 201-300)",
        message: "Elevated particulate pollution detected. Restrict high-intensity outdoor cardio and sport activities, especially for children.",
      });
    }

    // Pollutant-Specific Spike Warnings
    const p = input.pollutants;
    if (p) {
      // Acute PM2.5 Spike (> 120 µg/m³ is Very Poor threshold in CPCB)
      if (p.pm25 !== undefined && p.pm25 >= 120) {
        warnings.push({
          code: "ACUTE_PM25_SPIKE",
          level: p.pm25 >= 250 ? "emergency" : "danger",
          title: "Fine Particulate (PM2.5) Surge",
          message: `PM2.5 concentration is ${p.pm25} µg/m³ (exceeding CPCB 24-hr threshold of 60 µg/m³ by ${Math.round((p.pm25 / 60) * 100 - 100)}%). Fine particles bypass upper airways and penetrate deep lung tissue.`,
          sourcePollutant: "pm25",
        });
      }

      // NO2 Traffic Combustion Spike (> 80 µg/m³ is Moderate/Poor threshold)
      if (p.no2 !== undefined && p.no2 >= 80) {
        warnings.push({
          code: "ELEVATED_NO2_COMBUSTION",
          level: "advisory",
          title: "Elevated Nitrogen Dioxide (NO2)",
          message: `NO2 level is ${p.no2} µg/m³. Elevated vehicular and diesel combustion gases are present. Avoid heavily congested traffic corridors.`,
          sourcePollutant: "no2",
        });
      }

      // Carbon Monoxide Elevation (> 2.0 mg/m³)
      if (p.co !== undefined && p.co >= 2.0) {
        warnings.push({
          code: "ELEVATED_CARBON_MONOXIDE",
          level: "warning",
          title: "Elevated Carbon Monoxide (CO)",
          message: `Carbon monoxide level is ${p.co} mg/m³. Ensure kitchen and water heater exhaust vents are clear and avoid idling vehicles near residential entries.`,
          sourcePollutant: "co",
        });
      }

      // Ground-Level Ozone Spike (> 100 µg/m³)
      if (p.o3 !== undefined && p.o3 >= 100) {
        warnings.push({
          code: "OZONE_PHOTOCHEMICAL_SPIKE",
          level: "advisory",
          title: "Photochemical Ozone Elevation",
          message: `Ground-level ozone is ${p.o3} µg/m³. Photochemical reaction with sunlight increases lung sensitivity during sunny afternoon hours.`,
          sourcePollutant: "o3",
        });
      }
    }

    // Household Demographics Warnings
    if (input.householdProfile?.hasRespiratorySensitivity && aqi > 100) {
      warnings.push({
        code: "ASTHMA_RESPIRATORY_WATCH",
        level: aqi > 200 ? "danger" : "warning",
        title: "Respiratory Sensitivity Advisory",
        message: "Current ambient particulate levels can provoke bronchospasms, coughing, and wheezing. Keep prescribed rescue medications immediately accessible.",
      });
    }

    if (input.householdProfile?.hasChildren && aqi > 100) {
      warnings.push({
        code: "CHILD_PROTECTION_WATCH",
        level: aqi > 200 ? "danger" : "warning",
        title: "Pediatric Lung Protection Advisory",
        message: "Children have higher respiration rates and breathe more air relative to body mass. Restrict vigorous outdoor play and cancel outdoor school athletic events.",
      });
    }

    return warnings;
  }

  /**
   * Deterministically determines activity restrictions, mask mandates, and window policies.
   */
  private determineRestrictions(
    aqi: number,
    category: IndianNaqiCategory,
    input: SafetyEvaluationInput
  ): StructuredRestrictions {
    const hasVulnerable =
      input.householdProfile?.hasRespiratorySensitivity ||
      input.householdProfile?.hasCardiovascularSensitivity ||
      input.householdProfile?.hasChildren ||
      input.householdProfile?.hasElderly;

    let maskRequired = false;
    let maskTypeRecommended: MaskType = "None";
    let outdoorSportsRestricted = false;
    let windowVentilationAllowed = true;
    let curfewOrSchoolClosureAdvisory = false;
    const prohibitedActivities: string[] = [];

    if (aqi <= 50) {
      // Good
      maskRequired = false;
      maskTypeRecommended = "None";
      outdoorSportsRestricted = false;
      windowVentilationAllowed = true;
      curfewOrSchoolClosureAdvisory = false;
    } else if (aqi <= 100) {
      // Satisfactory
      maskRequired = false;
      maskTypeRecommended = hasVulnerable ? "Cloth/Surgical" : "None";
      outdoorSportsRestricted = false;
      windowVentilationAllowed = true;
      curfewOrSchoolClosureAdvisory = false;
    } else if (aqi <= 200) {
      // Moderate
      maskRequired = Boolean(hasVulnerable);
      maskTypeRecommended = hasVulnerable ? "KF94" : "Cloth/Surgical";
      outdoorSportsRestricted = Boolean(hasVulnerable);
      windowVentilationAllowed = true; // Still permitted during afternoon solar mixing window
      curfewOrSchoolClosureAdvisory = false;

      if (hasVulnerable) {
        prohibitedActivities.push("Prolonged high-intensity outdoor interval workouts for sensitive individuals");
      }
    } else if (aqi <= 300) {
      // Poor
      maskRequired = true;
      maskTypeRecommended = "N95";
      outdoorSportsRestricted = true;
      windowVentilationAllowed = false;
      curfewOrSchoolClosureAdvisory = false;

      prohibitedActivities.push("Outdoor jogging and cycling during morning/evening inversion hours");
      prohibitedActivities.push("Uncovered outdoor sports matches for primary school children");
    } else if (aqi <= 400) {
      // Very Poor
      maskRequired = true;
      maskTypeRecommended = "N95";
      outdoorSportsRestricted = true;
      windowVentilationAllowed = false;
      curfewOrSchoolClosureAdvisory = Boolean(input.householdProfile?.hasChildren);

      prohibitedActivities.push("All competitive outdoor sports and athletic field training");
      prohibitedActivities.push("Morning outdoor walks for elderly family members");
      prohibitedActivities.push("Outdoor dining and open-air recreational gatherings");
    } else {
      // Severe (>400)
      maskRequired = true;
      maskTypeRecommended = "N95";
      outdoorSportsRestricted = true;
      windowVentilationAllowed = false;
      curfewOrSchoolClosureAdvisory = true;

      prohibitedActivities.push("All non-essential outdoor transit and outdoor recreation");
      prohibitedActivities.push("In-person outdoor school physical education and morning assemblies");
      prohibitedActivities.push("Construction dust-generating activities near residential zones");
      prohibitedActivities.push("Two-wheeler and non-filtered open vehicle commutes");
    }

    return {
      maskRequired,
      maskTypeRecommended,
      outdoorSportsRestricted,
      windowVentilationAllowed,
      curfewOrSchoolClosureAdvisory,
      prohibitedActivities,
    };
  }

  /**
   * Compiles structured, non-diagnostic guidance across 6 lifestyle domains.
   */
  private compileRecommendations(
    aqi: number,
    category: IndianNaqiCategory,
    input: SafetyEvaluationInput,
    restrictions: StructuredRestrictions
  ): StructuredRecommendations {
    const profile = input.householdProfile;

    // 1. General Guidance
    const general: string[] = [];
    if (aqi <= 50) {
      general.push("Conditions are generally favorable for daily household and outdoor routines.");
      general.push("Keep windows open to refresh indoor air with natural cross-ventilation.");
    } else if (aqi <= 100) {
      general.push("Air quality is acceptable. Sensitive individuals should observe minor bodily reactions.");
      general.push("Track localized smoke or dust sources near your immediate block.");
    } else if (aqi <= 200) {
      general.push("Air quality is in the Moderate category. Sensitive groups should moderate prolonged exertion.");
      general.push("Stay adequately hydrated; fluid intake supports mucosal clearing of inhaled particles.");
    } else if (aqi <= 300) {
      general.push("Air quality is Poor. Most individuals will notice throat scratchiness on extended exposure.");
      general.push("Minimize avoidable outdoor errands; consolidate trips into the early afternoon.");
    } else if (aqi <= 400) {
      general.push("Air quality is Very Poor. Significant particulate burden present in the ambient atmosphere.");
      general.push("Shift personal and family gatherings indoors; seal exterior door thresholds.");
    } else {
      general.push("Severe pollution alert. Ambient conditions represent acute respiratory burden.");
      general.push("Remain indoors in sealed rooms with operational mechanical air cleaning.");
    }

    // Household sensitive member specific general additions
    if (profile?.hasRespiratorySensitivity && aqi > 50) {
      general.push("Keep prescribed rescue inhalers and respiratory medications easily accessible at all times.");
    }
    if (profile?.hasCardiovascularSensitivity && aqi > 100) {
      general.push("Cardiovascular-sensitive family members should minimize exertion and take frequent rest.");
    }
    if (profile?.isPregnant && aqi > 100) {
      general.push("Expectant mothers should minimize ambient particulate inhalation and remain in filtered indoor air.");
    }

    // 2. Outdoor Activity Guidance
    const outdoorActivity: string[] = [];
    if (aqi <= 50) {
      outdoorActivity.push("Enjoy outdoor parks, gardens, and playgrounds without restrictions.");
    } else if (aqi <= 100) {
      outdoorActivity.push("Outdoor activities are generally permitted; sensitive children should take brief rests.");
    } else if (aqi <= 200) {
      outdoorActivity.push("Schedule outdoor errands between 12:30 PM and 3:30 PM when solar heating aids particulate dispersion.");
      outdoorActivity.push("Avoid outdoor activities near arterial traffic routes during peak rush hours (8-10 AM, 6-9 PM).");
    } else if (aqi <= 300) {
      outdoorActivity.push("Wear a well-fitted N95 or KF94 mask whenever stepping outdoors.");
      outdoorActivity.push("Limit outdoor exposure to essential trips under 30 minutes where feasible.");
    } else if (aqi <= 400) {
      outdoorActivity.push("Strictly avoid outdoor leisure, morning walks, and open-air dining.");
      outdoorActivity.push("If outdoor transit is unavoidable, ensure an airtight seal on your N95/FFP2 mask.");
    } else {
      outdoorActivity.push("Avoid all outdoor physical exposure. Ground inversion traps dense particulate matter.");
    }

    // 3. Indoor Environment Guidance
    const indoorEnvironment: string[] = [];
    if (aqi <= 50) {
      indoorEnvironment.push("Natural diagonal cross-ventilation is recommended for 30-45 minutes.");
      indoorEnvironment.push("Air purifiers can operate on eco/standby mode.");
    } else if (aqi <= 100) {
      indoorEnvironment.push("Open windows during mid-day breezes; close before evening traffic peak.");
      indoorEnvironment.push("Operate bedroom air purifiers on low/auto mode before sleep.");
    } else if (aqi <= 200) {
      indoorEnvironment.push("Operate HEPA air purifiers on medium fan speed in primary living areas.");
      indoorEnvironment.push("Avoid indoor combustion sources: incense sticks (agarbatti), mosquito coils, and unvented frying.");
      indoorEnvironment.push("Use damp microfiber mopping instead of dry broom sweeping to avoid re-suspending settled dust.");
    } else if (aqi <= 300) {
      indoorEnvironment.push("Keep all exterior doors and windows tightly shut. Run HEPA purifiers continuously.");
      indoorEnvironment.push("Check air purifier filter indicator; inspect pre-filters for heavy dust buildup.");
      indoorEnvironment.push("Turn on kitchen exhaust range hoods whenever preparing food.");
    } else {
      indoorEnvironment.push("Operate HEPA air purifiers on high/turbo speed continuously.");
      indoorEnvironment.push("Create a designated 'clean room' with minimal window area and dedicated filtration.");
      indoorEnvironment.push("Seal door gaps with draft stoppers or damp towels to prevent smog infiltration.");
    }

    // 4. Exercise Guidance
    const exercise: string[] = [];
    if (aqi <= 50) {
      exercise.push("Ideal conditions for outdoor running, cycling, football, and vigorous cardiovascular training.");
    } else if (aqi <= 100) {
      exercise.push("Outdoor exercise is generally suitable. Individuals with asthma should keep rescue medication nearby.");
    } else if (aqi <= 200) {
      exercise.push("Shift intense cardio workouts (running, cycling) indoors or plan for the 1-3 PM clean air window.");
      exercise.push("Avoid strenuous outdoor early morning jogging when ground-level thermal inversions trap exhaust.");
    } else if (aqi <= 300) {
      exercise.push("Move all cardiovascular exercise indoors into air-purified rooms.");
      exercise.push("Replace heavy outdoor cardio with indoor yoga, bodyweight training, or low-impact stretching.");
    } else {
      exercise.push("Suspend all heavy cardiovascular exertion. Deep breathing multiplies particulate deposition in lung alveoli.");
      exercise.push("Confine physical activity to light indoor movement in purified rooms.");
    }

    // 5. School & Children Guidance
    const schoolAndChildren: string[] = [];
    if (aqi <= 50) {
      schoolAndChildren.push("Safe for full outdoor recess, physical education classes, and school sports days.");
    } else if (aqi <= 100) {
      schoolAndChildren.push("Normal school activities permitted. Teachers should monitor children with mild respiratory complaints.");
    } else if (aqi <= 200) {
      schoolAndChildren.push("Recommend conducting morning school assemblies indoors or in shaded auditoriums.");
      schoolAndChildren.push("Children with diagnosed asthma should have inhalers verified in the school clinic.");
      if (profile?.hasChildren) {
        schoolAndChildren.push("Equip your child with a child-sized KF94/N95 mask for school bus transit.");
      }
    } else if (aqi <= 300) {
      schoolAndChildren.push("School advisory: Suspend outdoor physical education and competitive outdoor sports.");
      schoolAndChildren.push("Ensure school bus windows remain closed during transit through congested corridors.");
      schoolAndChildren.push("Advise indoor creative recess activities (board games, drawing, reading).");
    } else if (aqi <= 400) {
      schoolAndChildren.push("Urgent school advisory: Cancel all outdoor sports and non-essential outdoor school events.");
      schoolAndChildren.push("Mandate N95/KF94 masks during school arrival and departure.");
    } else {
      schoolAndChildren.push("Severe pollution advisory: School authorities should consider temporary transition to online learning.");
      schoolAndChildren.push("Children must remain strictly indoors in air-filtered spaces.");
    }

    // 6. Commute Guidance
    const commute: string[] = [];
    if (aqi <= 50) {
      commute.push("All commute modes (walking, cycling, public transit) are suitable.");
    } else if (aqi <= 100) {
      commute.push("Normal commute routes suitable. Keep vehicle windows closed during heavy traffic bottlenecks.");
    } else if (aqi <= 200) {
      commute.push("Set car air conditioning to 'Internal Air Recirculation' mode to block tunnel exhaust intake.");
      commute.push("Two-wheeler riders should wear a snug mask and close helmet visors in dense traffic.");
    } else if (aqi <= 300) {
      commute.push("Wear an airtight N95/FFP2 mask during bus stops, auto-rickshaw rides, and pedestrian walking.");
      commute.push("Prefer enclosed metro transit or air-conditioned bus services over open three-wheelers.");
      commute.push("Keep vehicle AC on recirculation with a clean cabin air filter.");
    } else {
      commute.push("Minimize non-essential travel. Wear certified N95/FFP2 masks for all transit.");
      commute.push("Avoid two-wheeler and open-window travel through heavily congested highway corridors.");
    }

    return {
      general,
      outdoorActivity,
      indoorEnvironment,
      exercise,
      schoolAndChildren,
      commute,
    };
  }

  /**
   * Calculates deterministic confidence rating based on data freshness and completeness.
   */
  private calculateConfidence(
    freshness: DataFreshnessEvaluation,
    isMissingData: boolean,
    input: SafetyEvaluationInput
  ): "high" | "medium" | "low" {
    if (isMissingData) return "low";
    if (freshness.status === "stale" || freshness.status === "missing") {
      return freshness.ageSeconds > AirQualitySafetyEngine.STALE_MAX_SECONDS ? "low" : "medium";
    }

    // If both AQI and individual pollutants are provided with fresh timestamp
    const hasPollutants = Boolean(
      input.pollutants && Object.values(input.pollutants).some((v) => v !== undefined && v !== null)
    );

    if (freshness.status === "fresh" && hasPollutants) {
      return "high";
    }

    return "medium";
  }
}

export const airQualitySafetyEngine = new AirQualitySafetyEngine();
