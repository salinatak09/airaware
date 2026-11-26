import "server-only";
import mongoose from "mongoose";
import { connectToDatabase } from "../db/index.ts";
import {
  HouseholdProfile,
  AQIReading,
  GamificationProfile,
  UserAction,
  type IHouseholdProfileDocument,
} from "../../models/index.ts";
import { safetyEngine } from "./safety/index.ts";

export interface IndoorRoomSensor {
  roomId: string;
  name: string;
  pm25: number;
  co2: number;
  humidity: number;
  temperature: number;
  purifierActive: boolean;
  purifierSpeed: "low" | "medium" | "high" | "turbo" | "off";
  filterLifeRemainingPercent: number;
  isSimulated: boolean;
}

export interface IndoorChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "habits" | "cooking" | "cleaning" | "ventilation" | "sanctuary";
  impact: "high" | "medium";
  completed: boolean;
}

export interface HomeHealthMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  duration: string;
  category: string;
  completed: boolean;
  completedAt?: string;
}

export interface IndoorAirOverview {
  hasHardwareSensor: boolean;
  statusType: "modeled_estimate" | "hardware_measured";
  measurementNotice: string;
  sanctuaryScore: number; // 0 - 100
  sanctuaryRating: "Excellent" | "Good" | "Moderate" | "Vulnerable";
  outdoorAqi: number;
  outdoorCategory: string;
  estimatedIndoorPm25: {
    min: number;
    max: number;
    unit: string;
    explanation: string;
  };
  estimatedInfiltrationRatePercent: number;
  ventilationStatus: {
    state: "keep_closed" | "ventilate_recommended" | "caution";
    title: string;
    description: string;
    bestDiurnalWindow: string;
    reason: string;
  };
  cleanerRoomGuidance: {
    designatedRoom: string;
    steps: { title: string; instruction: string }[];
  };
  pollutionSources: {
    name: string;
    severity: "critical" | "high" | "medium";
    pm25Contribution: string;
    riskDetails: string;
    saferAlternative: string;
  }[];
  cookingSafety: {
    exhaustTiming: string;
    panLidTechnique: string;
    tadkaMitigation: string;
    fuelNotice: string;
  };
  cleaningAdvice: {
    wetMoppingVsSweeping: {
      recommendation: string;
      whySweepingIsHarmful: string;
      wetMoppingMethod: string;
    };
    dustingTips: string[];
    vacuumGuidance: string;
  };
  purifierGuidance: {
    cadrRecommendation: string;
    recommendedAirChangesPerHour: number;
    filterMaintenance: string[];
    ozoneWarning: string;
    diyOption: {
      name: string;
      description: string;
      materials: string[];
      estimatedCostInr: number;
    };
  };
  lowCostSolutions: {
    tier: "free" | "under_500" | "under_1500";
    title: string;
    costEstimate: string;
    impact: string;
    description: string;
  }[];
  plantMythBuster: {
    myth: string;
    scientificTruth: string;
    nasaStudyClarification: string;
    verdict: string;
  };
  checklist: IndoorChecklistItem[];
  homeMissions: HomeHealthMission[];
  personalizedContext: {
    homeType: string;
    ventilationType: string;
    cookingFuel: string;
    hasPurifier: boolean;
    budgetRange: string;
  };
}

// In-memory persistent states for checklist and missions when offline/testing
const inMemoryCompletedChecklist = new Set<string>();
const inMemoryCompletedMissions = new Map<string, { completedAt: string; xpEarned: number }>();
let dbUnavailableUntil = 0;

async function safeDbConnect(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;
  if (Date.now() < dbUnavailableUntil) return false;
  try {
    await connectToDatabase();
    return true;
  } catch {
    dbUnavailableUntil = Date.now() + 30000; // back off for 30s
    return false;
  }
}

export class IndoorService {
  private static defaultChecklist: IndoorChecklistItem[] = [
    {
      id: "chk_incense",
      title: "Avoid incense, dhoop & indoor smoke",
      description: "Burning a single agarbatti or dhoop releases heavy ultrafine soot, polycyclic aromatics, and benzene into closed rooms.",
      category: "habits",
      impact: "high",
      completed: false,
    },
    {
      id: "chk_exhaust",
      title: "Use kitchen exhaust & cover pans while cooking",
      description: "Operate kitchen chimney or exhaust fan 2 mins before cooking and 5 mins after; keep lids on during boiling and frying.",
      category: "cooking",
      impact: "high",
      completed: false,
    },
    {
      id: "chk_wet_mop",
      title: "Wet mop floors instead of dry sweeping",
      description: "Dry sweeping with a broom resuspends settled hazardous PM2.5/PM10 into your breathing zone for hours. Damp mopping captures it.",
      category: "cleaning",
      impact: "high",
      completed: false,
    },
    {
      id: "chk_seal_windows",
      title: "Keep windows closed during high outdoor pollution",
      description: "Seal exterior windows and balcony doors firmly, especially during morning and evening rush smog inversions.",
      category: "ventilation",
      impact: "high",
      completed: false,
    },
    {
      id: "chk_diurnal_vent",
      title: "Ventilate briefly when outdoor air improves (1:00 PM – 3:30 PM)",
      description: "Open cross-windows for only 10–15 minutes during the afternoon thermal expansion window to flush CO2, if outdoor AQI is moderate.",
      category: "ventilation",
      impact: "medium",
      completed: false,
    },
    {
      id: "chk_sanctuary_room",
      title: "Maintain a dedicated cleaner-air room",
      description: "Keep bedroom doors shut with rolled towel/draft stopper at the door bottom; run purifier in the central zone.",
      category: "sanctuary",
      impact: "high",
      completed: false,
    },
    {
      id: "chk_damp_dust",
      title: "Reduce dust accumulation with damp microfiber",
      description: "Wipe furniture, ceiling fan blades, and electronics with damp microfiber cloth instead of dry dusting cloths or feather dusters.",
      category: "cleaning",
      impact: "medium",
      completed: false,
    },
  ];

  private static defaultMissions: HomeHealthMission[] = [
    {
      id: "mis_door_sweep",
      title: "Draft-Proof Main Entry Door",
      description: "Place a rolled damp towel or stick-on rubber seal at the door gap to stop outdoor street smog infiltration.",
      xpReward: 30,
      duration: "10 mins",
      category: "sanctuary",
      completed: false,
    },
    {
      id: "mis_wet_mop_routine",
      title: "Complete Morning Damp Mop",
      description: "Execute a thorough wet mop in bedrooms and living rooms without dry sweeping first.",
      xpReward: 25,
      duration: "15 mins",
      category: "cleaning",
      completed: false,
    },
    {
      id: "mis_clean_sanctuary",
      title: "Designate Sanctuary Bedroom",
      description: "Seal all exterior gaps in one sleeping room, close interior door, and position airflow away from walls.",
      xpReward: 40,
      duration: "20 mins",
      category: "sanctuary",
      completed: false,
    },
    {
      id: "mis_prefilter_check",
      title: "Inspect & Vacuum Air Purifier Pre-Filter",
      description: "Remove the outer mesh pre-filter and gently vacuum accumulated pet hair and coarse lint (do NOT wash HEPA).",
      xpReward: 35,
      duration: "15 mins",
      category: "maintenance",
      completed: false,
    },
  ];

  /**
   * Generates a complete indoor air quality overview.
   * Personalizes advice according to home environment, cooking fuel, purifier setup, and budget.
   * Never claims to measure indoor AQI without hardware sensors.
   * Clarifies that houseplants do not clean room air at human scale.
   */
  async getIndoorOverview(userId?: string): Promise<IndoorAirOverview> {
    const isDbConnected = await safeDbConnect();
    let hp: any = null;
    let latestReading: any = null;

    if (isDbConnected && userId) {
      try {
        [hp, latestReading] = await Promise.all([
          HouseholdProfile.findOne({ userId }).lean().exec(),
          AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec(),
        ]);
      } catch {
        // Fallback
      }
    } else if (isDbConnected) {
      try {
        latestReading = await AQIReading.findOne().sort({ recordedAt: -1 }).lean().exec();
      } catch {
        // Fallback
      }
    }

    const outdoorAqi = latestReading?.aqi?.indianAqi || 185;
    const outdoorCategory = latestReading?.aqi?.indianCategory || (outdoorAqi > 200 ? "Very Poor" : outdoorAqi > 100 ? "Poor" : "Moderate");

    // Home Profile Personalization
    const homeType = hp?.homeEnvironment?.homeType || "apartment";
    const ventilationType = hp?.homeEnvironment?.ventilationType || "natural";
    const cookingFuel = hp?.homeEnvironment?.cookingFuel || "lpg";
    const hasPurifier = hp?.purifierAvailability?.hasPurifier ?? false;
    const budgetRange = hp?.budgetPreferences?.budgetRange || "minimal";

    // Sanctuary Score Calculation
    // Base score starts at 50, modified by active measures, purifiers, sealing, and outdoor penalty
    let baseScore = 60;
    if (hasPurifier) baseScore += 20;
    if (cookingFuel === "induction_electric") baseScore += 10;
    else if (cookingFuel === "biomass") baseScore -= 20;

    if (ventilationType === "split_ac") baseScore += 10;
    else if (ventilationType === "natural" && outdoorAqi > 200) baseScore -= 10;

    const completedChecklistCount = inMemoryCompletedChecklist.size;
    baseScore += Math.min(15, completedChecklistCount * 2.5);

    // Score cap
    const sanctuaryScore = Math.max(25, Math.min(95, Math.round(baseScore)));
    const sanctuaryRating: IndoorAirOverview["sanctuaryRating"] =
      sanctuaryScore >= 80 ? "Excellent" : sanctuaryScore >= 65 ? "Good" : sanctuaryScore >= 45 ? "Moderate" : "Vulnerable";

    // Estimated Infiltration & Modeled PM2.5 calculation
    // Indoor/Outdoor (I/O) ratio typically ranges from 0.20 (sealed with HEPA) to 0.75 (unsealed leaky natural)
    let ioRatio = 0.65;
    if (hasPurifier) ioRatio -= 0.30;
    if (ventilationType === "split_ac") ioRatio -= 0.10;
    if (completedChecklistCount >= 4) ioRatio -= 0.10;
    ioRatio = Math.max(0.15, Math.min(0.85, ioRatio));

    const estMinPm25 = Math.round(outdoorAqi * 0.6 * ioRatio * 0.8);
    const estMaxPm25 = Math.round(outdoorAqi * 0.6 * ioRatio * 1.25);

    // Window Ventilation Status based on time of day and outdoor AQI
    const currentHour = new Date().getHours();
    const isDiurnalWindow = currentHour >= 13 && currentHour <= 15; // 1:00 PM to 3:30 PM

    let ventilationStatus: IndoorAirOverview["ventilationStatus"];
    if (outdoorAqi > 250) {
      ventilationStatus = {
        state: "keep_closed",
        title: "Keep All Windows Firmly Sealed",
        description: "Outdoor AQI is in the hazardous range. Outdoor particulate penetration will rapidly compromise indoor breathing air.",
        bestDiurnalWindow: "1:00 PM – 3:30 PM (Only if outdoor AQI drops below 150)",
        reason: "Boundary layer inversion and high ambient PM2.5 make any natural window opening dangerous.",
      };
    } else if (isDiurnalWindow && outdoorAqi <= 150) {
      ventilationStatus = {
        state: "ventilate_recommended",
        title: "Clean Air Ventilation Window Active",
        description: "Diurnal surface warming has temporarily lifted ground smog. Open opposing windows for 10–15 minutes to exhaust accumulated CO2 and indoor moisture.",
        bestDiurnalWindow: "Now Active (1:00 PM – 3:30 PM)",
        reason: "Diurnal atmospheric boundary layer expansion dilutes ground-level emissions.",
      };
    } else {
      ventilationStatus = {
        state: "caution",
        title: "Keep Windows Closed (Smog Inversion Risk)",
        description: "Outdoor pollution is elevated. Keep windows sealed to maintain clean indoor air. Wait for the afternoon thermal window for controlled flushing.",
        bestDiurnalWindow: "1:00 PM – 3:30 PM",
        reason: "Morning/evening traffic emissions and cool ground inversion concentrate fine particulates near living levels.",
      };
    }

    // Prepare checklist with live completion state
    const checklist: IndoorChecklistItem[] = IndoorService.defaultChecklist.map((item) => ({
      ...item,
      completed: inMemoryCompletedChecklist.has(item.id),
    }));

    // Prepare home missions with live completion state
    const homeMissions: HomeHealthMission[] = IndoorService.defaultMissions.map((m) => {
      const record = inMemoryCompletedMissions.get(m.id);
      return {
        ...m,
        completed: !!record,
        completedAt: record?.completedAt,
      };
    });

    return {
      hasHardwareSensor: false,
      statusType: "modeled_estimate",
      measurementNotice:
        "No paired hardware indoor air monitor detected. Indoor air quality, PM2.5 levels, and infiltration rates shown on this screen are modeled physics estimates derived from outdoor ground stations, your building profile, and recorded home precautions. They do not constitute certified sensor measurements.",
      sanctuaryScore,
      sanctuaryRating,
      outdoorAqi,
      outdoorCategory,
      estimatedIndoorPm25: {
        min: estMinPm25,
        max: estMaxPm25,
        unit: "µg/m³",
        explanation: `Estimated at ${(ioRatio * 100).toFixed(0)}% outdoor infiltration ratio based on ${homeType} structure, ${ventilationType} ventilation, and active home defense measures.`,
      },
      estimatedInfiltrationRatePercent: Math.round(ioRatio * 100),
      ventilationStatus,
      cleanerRoomGuidance: {
        designatedRoom: "Master Bedroom or Nursery (furthest from kitchen)",
        steps: [
          {
            title: "1. Select the Best Room",
            instruction: "Pick the room where sensitive household members spend the most time (usually the bedroom), preferably with only one exterior window and away from kitchen fumes.",
          },
          {
            title: "2. Seal Perimeter Gaps",
            instruction: "Block the gap under the door using a rolled damp towel or silicon door sweep. Check window frames for whistling air drafts and seal with masking/foam tape.",
          },
          {
            title: "3. Centralize Filtration",
            instruction: hasPurifier
              ? "Place your air purifier in the center of the room at least 2 feet away from walls and curtains to ensure 360-degree intake circulation."
              : "Set up a DIY fan filter or ceiling fan on low speed with perimeter door sealed to minimize turbulent infiltration.",
          },
          {
            title: "4. Strictly Guard Room Entry",
            instruction: "Keep the sanctuary room door shut at all times. Leave outdoor footwear, jackets, and sweeping brooms outside.",
          },
        ],
      },
      pollutionSources: [
        {
          name: "Agarbatti & Dhoop (Incense)",
          severity: "critical",
          pm25Contribution: "100 – 400 µg/m³ peak spike",
          riskDetails: "Incense sticks release particulate soot, carbon monoxide, polycyclic aromatic hydrocarbons (PAHs), and benzene at concentrations exceeding industrial safety limits in closed rooms.",
          saferAlternative: "Electric LED diyas or closed essential oil reed diffusers (avoid any open combustion).",
        },
        {
          name: "Mosquito Coils",
          severity: "critical",
          pm25Contribution: "Equivalent to 75–100 cigarettes",
          riskDetails: "Burning one mosquito coil in a closed room releases fine particulate matter equivalent to smoking 75 to 100 commercial cigarettes, containing pyrethroid derivatives.",
          saferAlternative: "Window mosquito wire mesh, bed netting, and plug-in electric liquid vaporizers used in pre-ventilated rooms.",
        },
        {
          name: "Cooking Fumes & Gas Combustion",
          severity: "high",
          pm25Contribution: "50 – 250 µg/m³",
          riskDetails: "LPG/PNG gas burners emit nitrogen dioxide (NO2) and carbon monoxide. Frying with mustard/seed oils releases acrolein and ultrafine oil droplets.",
          saferAlternative: "Always run the exhaust fan 2 mins before lighting the burner; cook with lids on; switch to induction where feasible.",
        },
        {
          name: "Dry Sweeping with Brooms",
          severity: "high",
          pm25Contribution: "Resuspends settled PM10/PM2.5",
          riskDetails: "Traditional grass brooms violently resuspend heavy street dust and fine particulate toxins from the floor into chest height for 2 to 4 hours.",
          saferAlternative: "Wet mopping with damp microfiber or warm water.",
        },
        {
          name: "Aerosol Room Fresheners & Cleaning Sprays",
          severity: "medium",
          pm25Contribution: "VOCs & synthetic terpenes",
          riskDetails: "Aerosol sprays emit volatile organic compounds (VOCs) and limonene which react with ambient ozone to form secondary ultrafine organic aerosols.",
          saferAlternative: "Simmering sliced citrus/cinnamon in water, or natural baking soda odor absorbers.",
        },
      ],
      cookingSafety: {
        exhaustTiming: "Power on kitchen exhaust fan or chimney 2 minutes before igniting burners to establish airflow draft; leave running 5 minutes post-cooking.",
        panLidTechnique: "Keep lids firmly on pans and kadhais while simmering, boiling, and deep-frying to trap volatile oil aerosols and steam within cookware.",
        tadkaMitigation: "During high-smoke seasoning (tadka / tempering), turn exhaust to maximum speed, slightly crack the pan lid, and keep interior kitchen door firmly shut to prevent smoke entering bedrooms.",
        fuelNotice:
          cookingFuel === "lpg"
            ? "Your kitchen uses LPG. Ensure yellow burner flames are tuned to blue to minimize unburnt carbon monoxide and soot emissions."
            : cookingFuel === "induction_electric"
            ? "Your kitchen uses clean electric induction. You produce zero combustion gases (NO2/CO); focus only on oil spatter mitigation."
            : "Ensure maximum exterior cross-ventilation in kitchen during all cooking sessions.",
      },
      cleaningAdvice: {
        wetMoppingVsSweeping: {
          recommendation: "Always Wet Mop. Discontinue Dry Sweeping During High Smog Periods.",
          whySweepingIsHarmful: "Dry sweeping acts like a particle blower. It does not eliminate dust; it aerates settled PM2.5 and allergen particles into the air you inhale for hours.",
          wetMoppingMethod: "Use a damp flat microfiber mop or traditional damp cotton pocha with warm water. Rinse the mop frequently in a bucket to trap particles permanently.",
        },
        dustingTips: [
          "Never use dry duster cloths or feather dusters. Use slightly damp microfiber cloths to capture dust magnetically.",
          "Wipe top-to-bottom: Clean ceiling fan blades and high shelves first, followed by tabletops and finally the floor.",
          "Wash dust cloths immediately after use; do not shake them out indoors or through windows.",
        ],
        vacuumGuidance: "Only use vacuum cleaners equipped with a sealed HEPA filter exhaust. Standard bagless vacuums blow ultrafine PM2.5 straight back out through the motor exhaust vents.",
      },
      purifierGuidance: {
        cadrRecommendation: "Aim for a Clean Air Delivery Rate (CADR) of at least 300 m³/h per 250 sq ft to achieve 4.8 Air Changes per Hour (ACH).",
        recommendedAirChangesPerHour: 4.8,
        filterMaintenance: [
          "Vacuum the mesh pre-filter every 3 to 4 weeks to remove coarse hair and lint.",
          "NEVER wash the True HEPA pleated filter with water, as moisture collapses the dense micro-glass fiber electrostatic matrix.",
          "Replace the H13 True HEPA filter every 6 to 9 months in high pollution urban centers (like Delhi NCR).",
        ],
        ozoneWarning: "Strictly avoid purifiers advertising 'Ionizers', 'Plasma generators', or 'Ozone cleaning'. Ozone is a toxic lung irritant that worsens asthma and reacts with indoor terpenes to create secondary chemical smog.",
        diyOption: {
          name: "Corsi-Rosenthal Box / DIY Fan Filter",
          description: "A scientifically validated low-cost filtration setup built by taping a MERV 13 or HEPA furnace filter to the back of a standard household box fan.",
          materials: ["20x20 inch Box Fan", "MERV 13 furnace filter (or H13 sheet)", "Duct tape", "Cardboard shroud"],
          estimatedCostInr: 1200,
        },
      },
      lowCostSolutions: [
        {
          tier: "free",
          title: "Rolled Damp Towel Door Draft Stopper",
          costEstimate: "₹0 (Free)",
          impact: "Reduces hallway smog infiltration by 30-40%",
          description: "Roll a damp bath towel and place it snugly against the bottom gap of your main exterior entry door and bedroom sanctuary doors.",
        },
        {
          tier: "free",
          title: "Timed Afternoon Air Flush",
          costEstimate: "₹0 (Free)",
          impact: "Flushes indoor CO2 buildup without adding soot",
          description: "If outdoor AQI drops between 1:00 PM and 3:30 PM, open opposing windows for 10 minutes to vent carbon dioxide, then re-seal before evening cooling.",
        },
        {
          tier: "under_500",
          title: "Adhesive Foam Window Weatherstripping",
          costEstimate: "₹150 – ₹300",
          impact: "Blocks whistling air leaks around old sliding windows",
          description: "Self-adhesive high-density EVA foam tape applied along the window sash prevents outdoor smog from being sucked through gaps by air pressure.",
        },
        {
          tier: "under_500",
          title: "Silicon Door Bottom Sweep Strip",
          costEstimate: "₹250 – ₹450",
          impact: "Permanent barrier against floor draft pollution & dust",
          description: "Clear flexible silicone strip stuck to the bottom of your front door creates a tight seal against hallway pollution and street dust.",
        },
        {
          tier: "under_1500",
          title: "DIY MERV-13 Box Fan Filter",
          costEstimate: "₹800 – ₹1,400",
          impact: "Delivers ~200 CFM of particulate-cleaned air",
          description: "Tape a 20x20 inch MERV-13 furnace filter to the intake side of an existing box fan. Tests demonstrate it removes 75%+ of PM2.5 in a bedroom.",
        },
      ],
      plantMythBuster: {
        myth: "Myth: Indoor plants significantly purify and filter indoor air from smog and PM2.5.",
        scientificTruth: "Plants do NOT meaningfully clean indoor room air at human ventilation rates. While houseplants offer great psychological and aesthetic benefits, rigorous atmospheric chemistry studies (including re-analysis of the 1989 NASA study by Drexel University) confirm that natural air exchange in real rooms completely overwhelms plant absorption.",
        nasaStudyClarification: "The famous 1989 NASA Clean Air Study was conducted in sealed, airtight 1-cubic-meter Plexiglas chambers with circulating root soil and no fresh air exchange. In a real home, natural room infiltration exchanges air every 1 to 2 hours.",
        verdict: "To achieve the cleaning capacity of a single basic entry-level HEPA purifier, you would need between 10 and 100 plants PER SQUARE METER of floor space. Enjoy houseplants for biophilic beauty, but rely on source control, sealing, and mechanical HEPA filtration for respiratory protection.",
      },
      checklist,
      homeMissions,
      personalizedContext: {
        homeType,
        ventilationType,
        cookingFuel,
        hasPurifier,
        budgetRange,
      },
    };
  }

  /**
   * Toggles an item in the daily indoor checklist.
   */
  async toggleChecklistItem(itemId: string, completed: boolean): Promise<IndoorChecklistItem[]> {
    if (completed) {
      inMemoryCompletedChecklist.add(itemId);
    } else {
      inMemoryCompletedChecklist.delete(itemId);
    }

    return IndoorService.defaultChecklist.map((item) => ({
      ...item,
      completed: inMemoryCompletedChecklist.has(item.id),
    }));
  }

  /**
   * Completes a home health mission and awards XP (with anti-exploit guard).
   */
  async completeHomeMission(userId: string | undefined, missionId: string) {
    const isDbConnected = await safeDbConnect();
    const mission = IndoorService.defaultMissions.find((m) => m.id === missionId);
    if (!mission) {
      throw new Error(`Mission with id "${missionId}" not found.`);
    }

    // Critical Anti-Exploit Guard: Cannot award XP multiple times!
    if (inMemoryCompletedMissions.has(missionId)) {
      return {
        missionId,
        alreadyCompleted: true,
        xpEarned: 0,
        message: "Mission was already completed previously. No duplicate XP awarded.",
      };
    }

    const completedAt = new Date().toISOString();
    inMemoryCompletedMissions.set(missionId, {
      completedAt,
      xpEarned: mission.xpReward,
    });

    let totalXp = mission.xpReward;
    let level = 1;

    if (isDbConnected && userId) {
      try {
        const profile = await GamificationProfile.findOneAndUpdate(
          { userId },
          {
            $inc: {
              totalXp: mission.xpReward,
              completedMissionsCount: 1,
              weeklyXp: mission.xpReward,
            },
          },
          { new: true, upsert: true }
        ).exec();

        if (profile) {
          totalXp = profile.totalXp;
          level = Math.floor(totalXp / 100) + 1;
        }

        await UserAction.create({
          userId,
          actionType: mission.category === "cleaning" ? "window_sealed" : "air_purifier_optimized",
          completedAt: new Date(),
          xpEarned: mission.xpReward,
          associatedMissionId: mission.id,
          metadata: {
            source: "indoor_sanctuary_screen",
            missionTitle: mission.title,
          },
        });
      } catch (err) {
        console.warn("[IndoorService.completeHomeMission] DB error:", err);
      }
    }

    return {
      missionId,
      alreadyCompleted: false,
      xpEarned: mission.xpReward,
      totalXp,
      level,
      message: `Mission completed! +${mission.xpReward} XP awarded for home health.`,
    };
  }

  // Legacy compatibility for room sensors
  private static legacyRooms: IndoorRoomSensor[] = [
    {
      roomId: "living_room",
      name: "Living Room (Estimated Model)",
      pm25: 28,
      co2: 680,
      humidity: 45,
      temperature: 23.5,
      purifierActive: true,
      purifierSpeed: "medium",
      filterLifeRemainingPercent: 78,
      isSimulated: true,
    },
    {
      roomId: "kids_bedroom",
      name: "Sanctuary Bedroom (Estimated Model)",
      pm25: 18,
      co2: 740,
      humidity: 48,
      temperature: 22.0,
      purifierActive: true,
      purifierSpeed: "low",
      filterLifeRemainingPercent: 91,
      isSimulated: true,
    },
  ];

  async getRooms(): Promise<IndoorRoomSensor[]> {
    return [...IndoorService.legacyRooms];
  }

  async setPurifierState(
    roomId: string,
    active: boolean,
    speed?: "low" | "medium" | "high" | "turbo" | "off"
  ): Promise<IndoorRoomSensor> {
    const room = IndoorService.legacyRooms.find((r) => r.roomId === roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found.`);
    }

    room.purifierActive = active;
    if (speed) {
      room.purifierSpeed = speed;
    } else {
      room.purifierSpeed = active ? "medium" : "off";
    }

    return { ...room };
  }
}

export const indoorService = new IndoorService();
