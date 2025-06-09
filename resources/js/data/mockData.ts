// resources/js/data/mockData.ts

export type BusinessCard = {
  id: string;
  name: string;
  status: 'pending' | 'activated';
  activationCode: string;
  clickCount: number;
};

export const mockCards: BusinessCard[] = [
  {
    id: 'abc123',
    name: 'John Doe',
    status: 'activated',
    activationCode: 'XYZ789',
    clickCount: 12,
  },
  {
    id: 'def456',
    name: 'Jane Smith',
    status: 'pending',
    activationCode: 'LMN456',
    clickCount: 5,
  },
];
export const colorThemes = [
  { name: 'Ocean Blue', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Purple Sky', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Sunset', gradient: 'from-orange-400 to-pink-500' },
  { name: 'Emerald Glow', gradient: 'from-green-400 to-teal-500' },
];