'use strict';

const transformLogsToChartData = (logs) => {
  const dayCounts = {};

  logs.forEach(log => {
    const date = new Date(log.createdAt);
    const iso  = date.toISOString().split('T')[0];
    dayCounts[iso] = (dayCounts[iso] || 0) + 1;
  });

  let sortedIso = Object.keys(dayCounts).sort();

  if (sortedIso.length > 14) {
    sortedIso = sortedIso.slice(-14);
  }

  const labels = sortedIso.map(iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  });

  return {
    labels,
    datasets: [
      {
        label:           'AI Interactions',
        data:            sortedIso.map(iso => dayCounts[iso]),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor:     'rgba(54, 162, 235, 1)',
        borderWidth:     1,
      },
    ],
  };
};

describe('transformLogsToChartData()', () => {

  test('returns empty labels and data for empty array', () => {
    const result = transformLogsToChartData([]);
    expect(result.labels).toEqual([]);
    expect(result.datasets[0].data).toEqual([]);
  });

  test('always returns exactly one dataset', () => {
    expect(transformLogsToChartData([]).datasets).toHaveLength(1);
  });

  test('dataset label is "AI Interactions"', () => {
    expect(transformLogsToChartData([]).datasets[0].label).toBe('AI Interactions');
  });

  test('labels and data arrays have the same length', () => {
    const logs = [
      { createdAt: '2026-01-03T10:00:00Z' },
      { createdAt: '2026-01-03T12:00:00Z' },
      { createdAt: '2026-01-05T09:00:00Z' },
    ];
    const result = transformLogsToChartData(logs);
    expect(result.labels).toHaveLength(result.datasets[0].data.length);
  });

  test('multiple logs on same day counted as one entry', () => {
    const logs = [
      { createdAt: '2026-01-10T08:00:00Z' },
      { createdAt: '2026-01-10T14:00:00Z' },
      { createdAt: '2026-01-10T22:00:00Z' },
    ];
    const result = transformLogsToChartData(logs);
    expect(result.labels).toHaveLength(1);
    expect(result.datasets[0].data[0]).toBe(3);
  });

  test('logs on different days kept as separate entries', () => {
    const logs = [
      { createdAt: '2026-01-10T08:00:00Z' },
      { createdAt: '2026-01-11T08:00:00Z' },
      { createdAt: '2026-01-12T08:00:00Z' },
    ];
    const result = transformLogsToChartData(logs);
    expect(result.labels).toHaveLength(3);
    expect(result.datasets[0].data).toEqual([1, 1, 1]);
  });

  test('counts correct when days are interleaved in input', () => {
    const logs = [
      { createdAt: '2026-02-01T00:00:00Z' },
      { createdAt: '2026-01-31T00:00:00Z' },
      { createdAt: '2026-02-01T10:00:00Z' },
    ];
    const result = transformLogsToChartData(logs);
    expect(result.datasets[0].data).toEqual([1, 2]);
  });

  test('dates sorted in ascending chronological order', () => {
    const logs = [
      { createdAt: '2026-03-05T00:00:00Z' },
      { createdAt: '2026-01-01T00:00:00Z' },
      { createdAt: '2026-02-15T00:00:00Z' },
    ];
    const result = transformLogsToChartData(logs);
    expect(result.labels[0]).toMatch(/Jan/);
    expect(result.labels[1]).toMatch(/Feb/);
    expect(result.labels[2]).toMatch(/Mar/);
  });

  test('caps at 14 entries when more than 14 distinct days', () => {
    const logs = Array.from({ length: 20 }, (_, i) => ({
      createdAt: new Date(2026, 0, i + 1).toISOString(),
    }));
    const result = transformLogsToChartData(logs);
    expect(result.labels).toHaveLength(14);
    expect(result.datasets[0].data).toHaveLength(14);
  });

  test('keeps the 14 most recent days when capped', () => {
    const logs = Array.from({ length: 20 }, (_, i) => ({
      createdAt: new Date(2026, 0, i + 1).toISOString(),
    }));
    const result = transformLogsToChartData(logs);
    expect(result.labels[result.labels.length - 1]).toMatch(/Jan/);
  });

  test('does not cap when exactly 14 distinct days', () => {
    const logs = Array.from({ length: 14 }, (_, i) => ({
      createdAt: new Date(2026, 0, i + 1).toISOString(),
    }));
    expect(transformLogsToChartData(logs).labels).toHaveLength(14);
  });

  test('does not cap when fewer than 14 distinct days', () => {
    const logs = Array.from({ length: 5 }, (_, i) => ({
      createdAt: new Date(2026, 0, i + 1).toISOString(),
    }));
    expect(transformLogsToChartData(logs).labels).toHaveLength(5);
  });

  test('single log produces one label and data point of 1', () => {
    const result = transformLogsToChartData([{ createdAt: '2026-04-01T15:00:00Z' }]);
    expect(result.labels).toHaveLength(1);
    expect(result.datasets[0].data[0]).toBe(1);
	});
});
