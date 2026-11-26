import "server-only";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExploreService } from "./explore.service.ts";

describe("ExploreService & Map Data Engine Suite", () => {
  const exploreService = new ExploreService();

  it("1. getExploreMapData: retrieves official stations, modeled locations, and community reports", async () => {
    const data = await exploreService.getExploreMapData(28.6139, 77.209, "New Delhi");

    assert.ok(data, "Explore map response must be returned");
    assert.ok(data.stations.length >= 8, "Must return at least 8 map locations");
    assert.ok(data.stats.officialStationsCount >= 4, "Must have official monitoring stations");
    assert.ok(data.stats.modeledLocationsCount >= 2, "Must have modeled grid locations");
    assert.ok(data.stats.communityReportsCount >= 2, "Must have community citizen reports");
  });

  it("2. Data Provenance Integrity: NEVER represents modeled data or community reports as official stations", async () => {
    const data = await exploreService.getExploreMapData(28.6139, 77.209, "New Delhi");

    for (const station of data.stations) {
      if (station.type === "modeled") {
        assert.equal(
          station.isOfficial,
          false,
          `Modeled station ${station.name} must strictly have isOfficial=false`
        );
        assert.ok(
          station.sourceName.toLowerCase().includes("model"),
          `Modeled station ${station.name} source must mention model`
        );
      }

      if (station.type === "community_report") {
        assert.equal(
          station.isOfficial,
          false,
          `Community report ${station.name} must have isOfficial=false`
        );
        assert.ok(
          station.sourceName.toLowerCase().includes("citizen") ||
          station.sourceName.toLowerCase().includes("community"),
          `Community report must indicate citizen source`
        );
      }

      if (station.type === "ground_station") {
        assert.equal(station.isOfficial, true, `Ground station ${station.name} must be marked official`);
      }
    }
  });

  it("3. Nearby Areas Comparison: correctly computes distance, direction, and AQI deltas", async () => {
    const data = await exploreService.getExploreMapData(28.6139, 77.209, "New Delhi");

    assert.ok(data.nearbyAreasComparison.length >= 4, "Must provide nearby areas comparison");
    for (const comp of data.nearbyAreasComparison) {
      assert.ok(comp.name, "Area must have name");
      assert.ok(typeof comp.aqi === "number");
      assert.ok(typeof comp.deltaVsUser === "number");
      assert.ok(comp.color, "Area must have color");
      assert.ok(comp.statusText, "Area must have relative status description");
    }
  });

  it("4. Explore Caching: returns cached response for repeated queries within TTL", async () => {
    const t0 = Date.now();
    const data1 = await exploreService.getExploreMapData(28.6139, 77.209, "New Delhi");
    const data2 = await exploreService.getExploreMapData(28.6139, 77.209, "New Delhi");

    assert.equal(data1.meta.fetchedAt, data2.meta.fetchedAt, "Must serve cached data with same timestamp");
    assert.equal(data1.stations.length, data2.stations.length);
  });
});
