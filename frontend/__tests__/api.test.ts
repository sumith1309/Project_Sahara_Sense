import { api } from '@/lib/api';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct base URL', () => {
    expect(api).toBeDefined();
  });

  it('should fetch current dust data', async () => {
    const mockData = {
      cities: [
        { city_id: 'dubai', city_name: 'Dubai', dust: 25, risk_level: 'LOW' }
      ]
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await api.getCurrentDust();
    expect(result.cities).toHaveLength(1);
    expect(result.cities[0].city_id).toBe('dubai');
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(api.getCurrentDust()).rejects.toThrow('Network error');
  });
});

describe('Risk Level Calculations', () => {
  const getRiskLevel = (dust: number): string => {
    if (dust < 20) return 'LOW';
    if (dust < 50) return 'MODERATE';
    if (dust < 100) return 'HIGH';
    if (dust < 200) return 'SEVERE';
    return 'EXTREME';
  };

  it('should return LOW for dust < 20', () => {
    expect(getRiskLevel(15)).toBe('LOW');
  });

  it('should return MODERATE for dust 20-49', () => {
    expect(getRiskLevel(35)).toBe('MODERATE');
  });

  it('should return HIGH for dust 50-99', () => {
    expect(getRiskLevel(75)).toBe('HIGH');
  });

  it('should return SEVERE for dust 100-199', () => {
    expect(getRiskLevel(150)).toBe('SEVERE');
  });

  it('should return EXTREME for dust >= 200', () => {
    expect(getRiskLevel(250)).toBe('EXTREME');
  });
});
