import mongoose from "mongoose";
import {
  User,
  HouseholdProfile,
  AQIReading,
  DailyPlan,
  UserAction,
  GamificationProfile,
  ChatSession,
  CommunityReport,
  Notification,
} from "../models/index.ts";

async function main() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/airaware";
  console.log("🔗 Connecting to MongoDB Atlas:", mongoUri.split("@")[1] || "localhost");

  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });

  console.log("✅ Connected to MongoDB. Commencing AirAware collection seeding...");

  // 1. Clear existing demo users and data
  await Promise.all([
    User.deleteMany({
      email: {
        $in: [
          "priya.sharma@example.com",
          "rajesh.patel@example.com",
          "ananya.verma@example.com",
        ],
      },
    }),
    AQIReading.deleteMany({ source: "AirAware-Demo-Seed" }),
    CommunityReport.deleteMany({ description: { $regex: /AirAware Seed/i } }),
  ]);

  // 2. Insert Users
  const users = await User.create([
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      authProvider: "credentials",
      avatar: "aero-avatar-priya",
      location: {
        city: "New Delhi",
        area: "Greater Kailash I",
        state: "Delhi",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [77.2345, 28.5482],
        },
        latitude: 28.5482,
        longitude: 77.2345,
        timezone: "Asia/Kolkata",
      },
      familyMembers: [
        {
          name: "Aarav",
          ageGroup: "child",
          healthConditions: ["mild_asthma"],
          vulnerabilityLevel: "high",
          notes: "Sensitive to morning particulate spikes",
        },
        {
          name: "Diya",
          ageGroup: "child",
          healthConditions: ["none"],
          vulnerabilityLevel: "medium",
        },
      ],
      preferences: {
        theme: "light",
        language: "en",
        notificationsEnabled: true,
        aqiThresholdAlert: 150,
        temperatureUnit: "celsius",
        aqiStandard: "CPCB_NAQI",
      },
    },
    {
      name: "Rajesh Patel",
      email: "rajesh.patel@example.com",
      authProvider: "credentials",
      avatar: "aero-avatar-rajesh",
      location: {
        city: "Noida",
        area: "Sector 62",
        state: "Uttar Pradesh",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [77.3639, 28.628],
        },
        latitude: 28.628,
        longitude: 77.3639,
        timezone: "Asia/Kolkata",
      },
      familyMembers: [
        {
          name: "Kanta Patel",
          ageGroup: "senior",
          healthConditions: ["hypertension"],
          vulnerabilityLevel: "high",
          notes: "Advised to avoid morning walks when AQI > 150",
        },
      ],
      preferences: {
        theme: "light",
        language: "hi",
        notificationsEnabled: true,
        aqiThresholdAlert: 120,
        temperatureUnit: "celsius",
        aqiStandard: "CPCB_NAQI",
      },
    },
    {
      name: "Ananya Verma",
      email: "ananya.verma@example.com",
      authProvider: "credentials",
      avatar: "aero-avatar-ananya",
      location: {
        city: "Gurugram",
        area: "Cyber City",
        state: "Haryana",
        country: "India",
        coordinates: {
          type: "Point",
          coordinates: [77.0878, 28.4952],
        },
        latitude: 28.4952,
        longitude: 77.0878,
        timezone: "Asia/Kolkata",
      },
      familyMembers: [
        {
          name: "Kabir",
          ageGroup: "infant",
          healthConditions: ["none"],
          vulnerabilityLevel: "critical",
          notes: "Infant lungs require continuous nursery HEPA filtration",
        },
      ],
      preferences: {
        theme: "system",
        language: "en",
        notificationsEnabled: true,
        aqiThresholdAlert: 100,
        temperatureUnit: "celsius",
        aqiStandard: "CPCB_NAQI",
      },
    },
  ]);

  const [priya, rajesh, ananya] = users;
  const userIds = [priya._id, rajesh._id, ananya._id];

  // 3. Clear related child records
  await Promise.all([
    HouseholdProfile.deleteMany({ userId: { $in: userIds } }),
    GamificationProfile.deleteMany({ userId: { $in: userIds } }),
    DailyPlan.deleteMany({ userId: { $in: userIds } }),
    UserAction.deleteMany({ userId: { $in: userIds } }),
    ChatSession.deleteMany({ userId: { $in: userIds } }),
    Notification.deleteMany({ userId: { $in: userIds } }),
  ]);

  // 4. Seed Household Profiles
  await HouseholdProfile.create([
    {
      userId: priya._id,
      householdSize: { adults: 2, children: 2, elderly: 0, total: 4 },
      sensitiveGroupPreferences: {
        hasRespiratorySensitivity: true,
        hasCardiovascularSensitivity: false,
        isPregnant: false,
        hasInfant: false,
        notes: "Child with mild allergic bronchitis; monitors outdoor particulate exposure.",
      },
      lifestyle: {
        workSchedule: "hybrid",
        exerciseHabits: "outdoor_evening",
        outdoorActivityFrequency: "daily",
      },
      commute: {
        commuteType: "metro",
        durationMinutes: 35,
        travelWindow: "morning_rush",
      },
      homeEnvironment: {
        homeType: "apartment",
        floorLevel: 3,
        ventilationType: "split_ac",
        cookingFuel: "piped_gas",
        hasBalconyOrGarden: true,
      },
      purifierAvailability: {
        hasPurifier: true,
        purifierCount: 2,
        roomsWithPurifiers: ["master_bedroom", "children_room"],
        purifierType: "carbon_hepa",
        lastFilterChangeDate: new Date(Date.now() - 45 * 24 * 3600 * 1000),
      },
      budgetPreferences: {
        budgetRange: "moderate",
        improvementPriorities: ["air_purifier", "plants", "weather_stripping"],
      },
    },
    {
      userId: rajesh._id,
      householdSize: { adults: 2, children: 0, elderly: 2, total: 4 },
      sensitiveGroupPreferences: {
        hasRespiratorySensitivity: false,
        hasCardiovascularSensitivity: true,
        isPregnant: false,
        hasInfant: false,
        notes: "Elderly family member manages cardiovascular wellness; prefers early morning rest.",
      },
      lifestyle: {
        workSchedule: "fixed_office",
        exerciseHabits: "outdoor_morning",
        outdoorActivityFrequency: "weekends_only",
      },
      commute: {
        commuteType: "car",
        durationMinutes: 45,
        travelWindow: "morning_rush",
      },
      homeEnvironment: {
        homeType: "independent_house",
        floorLevel: 1,
        ventilationType: "mixed",
        cookingFuel: "lpg",
        hasBalconyOrGarden: true,
      },
      purifierAvailability: {
        hasPurifier: true,
        purifierCount: 1,
        roomsWithPurifiers: ["elderly_bedroom"],
        purifierType: "hepa",
        lastFilterChangeDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      },
      budgetPreferences: {
        budgetRange: "comprehensive",
        improvementPriorities: ["central_air_filter", "exhaust_upgrade"],
      },
    },
    {
      userId: ananya._id,
      householdSize: { adults: 2, children: 1, elderly: 0, total: 3 },
      sensitiveGroupPreferences: {
        hasRespiratorySensitivity: false,
        hasCardiovascularSensitivity: false,
        isPregnant: false,
        hasInfant: true,
        notes: "4-month infant at home. High attention to PM2.5 infiltration.",
      },
      lifestyle: {
        workSchedule: "work_from_home",
        exerciseHabits: "indoor_gym",
        outdoorActivityFrequency: "occasional",
      },
      commute: {
        commuteType: "walking",
        durationMinutes: 10,
        travelWindow: "midday",
      },
      homeEnvironment: {
        homeType: "apartment",
        floorLevel: 12,
        ventilationType: "central_ac",
        cookingFuel: "induction_electric",
        hasBalconyOrGarden: false,
      },
      purifierAvailability: {
        hasPurifier: true,
        purifierCount: 3,
        roomsWithPurifiers: ["nursery", "living_room", "master_bedroom"],
        purifierType: "carbon_hepa",
        lastFilterChangeDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      },
      budgetPreferences: {
        budgetRange: "comprehensive",
        improvementPriorities: ["diy_purifier", "plants", "aqi_monitors"],
      },
    },
  ]);

  // 5. Seed Gamification Profiles
  await GamificationProfile.create([
    {
      userId: priya._id,
      totalXp: 340,
      level: 4,
      streak: {
        currentStreak: 7,
        longestStreak: 14,
        lastActiveDate: new Date(),
        streakFreezesAvailable: 2,
      },
      badges: [
        {
          badgeId: "clean-air-pioneer",
          name: "Clean Air Pioneer",
          category: "milestone",
          icon: "award",
          tier: "silver",
          earnedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
          description: "Completed full household onboarding and set personalized safe thresholds.",
        },
        {
          badgeId: "streak-master-7",
          name: "7-Day Streak Master",
          category: "streak",
          icon: "flame",
          tier: "gold",
          earnedAt: new Date(),
          description: "Logged daily air protection habits for 7 consecutive days.",
        },
        {
          badgeId: "hepa-guardian",
          name: "HEPA Guardian",
          category: "indoor",
          icon: "shield-check",
          tier: "silver",
          earnedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          description: "Maintained optimal indoor nursery PM2.5 levels below 25 µg/m³ for 3 days.",
        },
      ],
      achievements: [
        {
          achievementId: "air-checker-100",
          title: "Daily Air Sentinel",
          progress: 85,
          unlocked: false,
        },
        {
          achievementId: "mask-champion",
          title: "Commute Shield",
          progress: 100,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        },
      ],
      completedMissionsCount: 24,
      weeklyXp: 180,
    },
    {
      userId: rajesh._id,
      totalXp: 160,
      level: 2,
      streak: {
        currentStreak: 3,
        longestStreak: 5,
        lastActiveDate: new Date(),
        streakFreezesAvailable: 1,
      },
      badges: [
        {
          badgeId: "clean-air-pioneer",
          name: "Clean Air Pioneer",
          category: "milestone",
          icon: "award",
          tier: "bronze",
          earnedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
          description: "Completed profile setup and verified vehicle air recirculation.",
        },
      ],
      achievements: [
        {
          achievementId: "transit-protector",
          title: "Filtered Commuter",
          progress: 60,
          unlocked: false,
        },
      ],
      completedMissionsCount: 11,
      weeklyXp: 90,
    },
    {
      userId: ananya._id,
      totalXp: 280,
      level: 3,
      streak: {
        currentStreak: 5,
        longestStreak: 9,
        lastActiveDate: new Date(),
        streakFreezesAvailable: 2,
      },
      badges: [
        {
          badgeId: "nursery-shield",
          name: "Nursery Protector",
          category: "protection",
          icon: "baby",
          tier: "gold",
          earnedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          description: "Configured multi-room purifiers with zero outdoor smog leakage.",
        },
      ],
      achievements: [
        {
          achievementId: "indoor-sanctuary",
          title: "Clean Room Architect",
          progress: 90,
          unlocked: false,
        },
      ],
      completedMissionsCount: 18,
      weeklyXp: 140,
    },
  ]);

  // 6. Seed AQI Readings
  const now = new Date();
  await AQIReading.create([
    {
      location: {
        city: "New Delhi",
        area: "Connaught Place",
        state: "Delhi",
        country: "India",
        stationName: "Mandir Marg Ground Station",
      },
      coordinates: {
        type: "Point",
        coordinates: [77.209, 28.6139],
      },
      pollutantMeasurements: {
        pm25: 95.0,
        pm10: 185.0,
        no2: 48.0,
        so2: 16.0,
        co: 1.1,
        o3: 42.0,
      },
      aqi: {
        indianAqi: 185,
        indianCategory: "moderate",
        usAqi: 168,
        usCategory: "Unhealthy",
        dominantPollutant: "pm25",
      },
      aqiStandard: "CPCB_NAQI",
      source: "AirAware-Demo-Seed",
      sourceType: "ground_station",
      recordedAt: now,
      weather: {
        temperature: 24,
        humidity: 62,
        windSpeed: 8,
        windDirection: 290,
        dispersionIndex: "moderate",
      },
    },
    {
      location: {
        city: "New Delhi",
        area: "Anand Vihar",
        state: "Delhi",
        country: "India",
        stationName: "Anand Vihar CPCB Real-Time Monitor",
      },
      coordinates: {
        type: "Point",
        coordinates: [77.3153, 28.6469],
      },
      pollutantMeasurements: {
        pm25: 220.0,
        pm10: 385.0,
        no2: 86.0,
        so2: 32.0,
        co: 2.3,
        o3: 58.0,
      },
      aqi: {
        indianAqi: 360,
        indianCategory: "very_poor",
        usAqi: 285,
        usCategory: "Very Unhealthy",
        dominantPollutant: "pm25",
      },
      aqiStandard: "CPCB_NAQI",
      source: "AirAware-Demo-Seed",
      sourceType: "ground_station",
      recordedAt: now,
      weather: {
        temperature: 23,
        humidity: 68,
        windSpeed: 4,
        windDirection: 310,
        dispersionIndex: "poor",
      },
    },
    {
      location: {
        city: "New Delhi",
        area: "Lodhi Road",
        state: "Delhi",
        country: "India",
        stationName: "Lodhi Garden Eco Observatory",
      },
      coordinates: {
        type: "Point",
        coordinates: [77.2215, 28.5893],
      },
      pollutantMeasurements: {
        pm25: 32.0,
        pm10: 72.0,
        no2: 24.0,
        so2: 9.0,
        co: 0.6,
        o3: 28.0,
      },
      aqi: {
        indianAqi: 82,
        indianCategory: "satisfactory",
        usAqi: 75,
        usCategory: "Moderate",
        dominantPollutant: "pm10",
      },
      aqiStandard: "CPCB_NAQI",
      source: "AirAware-Demo-Seed",
      sourceType: "ground_station",
      recordedAt: now,
      weather: {
        temperature: 25,
        humidity: 55,
        windSpeed: 11,
        windDirection: 270,
        dispersionIndex: "good",
      },
    },
  ]);

  // 7. Seed Daily Plan
  const todayStr = now.toISOString().split("T")[0];
  await DailyPlan.create({
    userId: priya._id,
    date: todayStr,
    aqiContext: {
      expectedAqi: 185,
      category: "Moderate",
      safestWindow: {
        start: "12:30 PM",
        end: "03:30 PM",
        reason: "Solar warmth elevates the thermal mixing layer, dissipating heavy ground smog.",
      },
      peakSmogWindow: {
        start: "07:30 AM",
        end: "09:45 AM",
        reason: "Morning thermal inversion traps vehicular exhaust close to ground level.",
      },
      dominantRisk: "pm25",
    },
    missions: [
      {
        missionId: "m_mask_commute",
        title: "Wear N95 Mask on Morning Commute",
        description: "Protect lungs during peak ground morning smog before 9:30 AM.",
        category: "protection",
        xpReward: 30,
        completed: true,
        completedAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        missionId: "m_indoor_purifier",
        title: "Verify Bedroom HEPA Purifier",
        description: "Inspect pre-filter dust load and ensure night mode fan speed is set to medium.",
        category: "indoor",
        xpReward: 20,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ],
    recommendations: {
      general: [
        "AQI is in the Moderate category (185). Sensitive family members should limit heavy outdoor exertion.",
        "Keep prescribed inhalers and medications readily accessible.",
      ],
      outdoorActivity: [
        "Schedule unavoidable outdoor errands between 12:30 PM and 3:30 PM.",
      ],
      indoorEnvironment: [
        "Run HEPA air purifiers continuously on medium fan speed.",
      ],
      commute: [
        "Wear a well-fitted KF94 or N95 mask while walking between transit connections.",
      ],
      exercise: [
        "Replace vigorous outdoor morning jogging with indoor yoga or bodyweight training.",
      ],
    },
    planVersion: 1,
    aiModelMetadata: {
      modelName: "deterministic-safety-engine",
      generatedAt: now,
      latencyMs: 12,
      deterministicSafetyApplied: true,
    },
  });

  // 8. Seed Actions, Chat, Reports, Notifications
  await Promise.all([
    UserAction.create({
      userId: priya._id,
      actionType: "air_check",
      completedAt: new Date(Date.now() - 5 * 3600 * 1000),
      xpEarned: 10,
      metadata: { aqi: 185, city: "New Delhi" },
    }),
    ChatSession.create({
      userId: priya._id,
      title: "Outdoor Playtime Advisory for Aarav",
      persona: "pediatric_advisor",
      messages: [
        {
          messageId: "msg_1",
          role: "user",
          content: "Is it safe for Aarav (age 6, mild asthma) to play football outside today at 4:30 PM?",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          messageId: "msg_2",
          role: "assistant",
          content:
            "Hi Priya! Aero here. Ambient AQI is currently 185 (Moderate). Between 4:00 PM and 5:00 PM, evening rush hour exhaust accumulates. We recommend keeping outdoor play light and brief (under 20 minutes) with a pediatric KF94 mask.",
          timestamp: new Date(Date.now() - 59 * 60 * 1000),
          aqiContext: { aqi: 185, category: "Moderate", city: "New Delhi" },
        },
      ],
      sessionMetadata: {
        initialAqi: 185,
        city: "New Delhi",
        clientPlatform: "web",
        messageCount: 2,
      },
    }),
    CommunityReport.create({
      userId: priya._id,
      location: {
        city: "New Delhi",
        area: "Ring Road Lajpat Nagar",
        coordinates: {
          type: "Point",
          coordinates: [77.2415, 28.5684],
        },
        landmark: "Near Metro Pillar 42",
      },
      reportType: "construction_dust",
      description: "AirAware Seed: Heavy uncovered sand and demolition dust billowing across traffic corridor without water sprinkling.",
      severity: "high",
      moderationStatus: "approved",
      upvotes: 18,
      reportedAt: new Date(Date.now() - 6 * 3600 * 1000),
    }),
    Notification.create({
      userId: priya._id,
      type: "aqi_alert",
      title: "Morning Smog Advisory",
      message: "NAQI is 185 in Greater Kailash. Ensure children wear KF94 masks for school transit.",
      priority: "high",
      isRead: true,
      readAt: new Date(Date.now() - 4 * 3600 * 1000),
      metadata: { aqi: 185, category: "Moderate" },
    }),
  ]);

  console.log("🎉 Seeding completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
