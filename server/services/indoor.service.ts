import "server-only";

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
}

export class IndoorService {
  private static rooms: IndoorRoomSensor[] = [
    {
      roomId: "living_room",
      name: "Living Room",
      pm25: 28,
      co2: 680,
      humidity: 45,
      temperature: 23.5,
      purifierActive: true,
      purifierSpeed: "medium",
      filterLifeRemainingPercent: 78,
    },
    {
      roomId: "kids_bedroom",
      name: "Kids Bedroom",
      pm25: 18,
      co2: 740,
      humidity: 48,
      temperature: 22.0,
      purifierActive: true,
      purifierSpeed: "low",
      filterLifeRemainingPercent: 91,
    },
    {
      roomId: "master_bedroom",
      name: "Master Bedroom",
      pm25: 22,
      co2: 620,
      humidity: 46,
      temperature: 22.5,
      purifierActive: true,
      purifierSpeed: "medium",
      filterLifeRemainingPercent: 64,
    },
    {
      roomId: "kitchen",
      name: "Kitchen",
      pm25: 44,
      co2: 890,
      humidity: 52,
      temperature: 25.0,
      purifierActive: false,
      purifierSpeed: "off",
      filterLifeRemainingPercent: 55,
    },
  ];

  async getRooms(): Promise<IndoorRoomSensor[]> {
    return [...IndoorService.rooms];
  }

  async getRoomById(roomId: string): Promise<IndoorRoomSensor | null> {
    const room = IndoorService.rooms.find((r) => r.roomId === roomId);
    return room ? { ...room } : null;
  }

  async setPurifierState(
    roomId: string,
    active: boolean,
    speed?: "low" | "medium" | "high" | "turbo" | "off"
  ): Promise<IndoorRoomSensor> {
    const room = IndoorService.rooms.find((r) => r.roomId === roomId);
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
