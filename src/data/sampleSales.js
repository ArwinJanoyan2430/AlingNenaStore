const dateTime = (daysAgo, hour, minute) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const sampleSales = [
  {
    id: 1,
    total: 260,
    payment: 300,
    change: 40,
    created_at: dateTime(9, 10, 15),
  },
  {
    id: 2,
    total: 180,
    payment: 200,
    change: 20,
    created_at: dateTime(8, 16, 20),
  },
  {
    id: 3,
    total: 520,
    payment: 600,
    change: 80,
    created_at: dateTime(7, 13, 5),
  },
  {
    id: 4,
    total: 340,
    payment: 500,
    change: 160,
    created_at: dateTime(6, 9, 45),
  },
  {
    id: 5,
    total: 410,
    payment: 500,
    change: 90,
    created_at: dateTime(5, 11, 30),
  },
  {
    id: 6,
    total: 275,
    payment: 300,
    change: 25,
    created_at: dateTime(4, 14, 20),
  },
  {
    id: 7,
    total: 690,
    payment: 700,
    change: 10,
    created_at: dateTime(3, 15, 50),
  },
  {
    id: 8,
    total: 155,
    payment: 200,
    change: 45,
    created_at: dateTime(2, 8, 40),
  },
  {
    id: 9,
    total: 480,
    payment: 500,
    change: 20,
    created_at: dateTime(1, 17, 10), // Yesterday
  },
  {
    id: 10,
    total: 395,
    payment: 500,
    change: 105,
    created_at: dateTime(0, 12, 25), // Today
  },
];