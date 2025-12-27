// Mappers Unit Tests
// Tests for platform API response transformation functions

import {
  mapHealthResponse,
  mapReadinessResponse,
  mapOrchestrationsResponse,
  mapOrchestration,
  mapTelemetryResponse,
  mapSchemaMismatch,
} from '../adapter/mappers';

describe('Mappers', () => {
  describe('mapHealthResponse', () => {
    it('should transform healthy status correctly', () => {
      const input = {
        status: 'ok',
        latency: 45,
        timestamp: '2025-12-27T10:00:00Z',
        version: '1.0.0',
        uptime: 3600,
      };

      const result = mapHealthResponse(input);

      expect(result.status).toBe('healthy');
      expect(result.latency).toBe(45);
      expect(result.timestamp).toBe('2025-12-27T10:00:00Z');
      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toBe(3600);
      expect(result.checks.api).toBe(true);
      expect(result.checks.database).toBe(true);
      expect(result.checks.cache).toBe(true);
    });

    it('should transform unhealthy status correctly', () => {
      const input = {
        status: 'error',
        latency: 120,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapHealthResponse(input);

      expect(result.status).toBe('unhealthy');
      expect(result.latency).toBe(120);
      expect(result.checks.api).toBe(false);
    });

    it('should handle unknown status as unhealthy', () => {
      const input = {
        status: 'unknown',
        latency: 50,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapHealthResponse(input);

      expect(result.status).toBe('unhealthy');
    });
  });

  describe('mapReadinessResponse', () => {
    it('should transform ready status correctly', () => {
      const input = {
        isReady: true,
        pendingDependencies: [],
      };

      const result = mapReadinessResponse(input);

      expect(result.isReady).toBe(true);
      expect(result.pendingDependencies).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle pending dependencies', () => {
      const input = {
        isReady: false,
        pendingDependencies: ['database', 'cache'],
      };

      const result = mapReadinessResponse(input);

      expect(result.isReady).toBe(false);
      expect(result.pendingDependencies).toEqual(['database', 'cache']);
    });
  });

  describe('mapOrchestrationStatus', () => {
    it('should handle all valid statuses', () => {
      const orchestrations = [
        { id: '1', name: 'Test 1', status: 'PENDING', progress: 0, repository_url: '', created_at: '', updated_at: '' },
        { id: '2', name: 'Test 2', status: 'RUNNING', progress: 50, repository_url: '', created_at: '', updated_at: '' },
        { id: '3', name: 'Test 3', status: 'COMPLETED', progress: 100, repository_url: '', created_at: '', updated_at: '' },
        { id: '4', name: 'Test 4', status: 'FAILED', progress: 75, repository_url: '', created_at: '', updated_at: '' },
        { id: '5', name: 'Test 5', status: 'PAUSED', progress: 30, repository_url: '', created_at: '', updated_at: '' },
      ];

      const results = orchestrations.map(orch => mapOrchestration(orch));

      expect(results[0].status).toBe('pending');
      expect(results[1].status).toBe('running');
      expect(results[2].status).toBe('completed');
      expect(results[3].status).toBe('failed');
      expect(results[4].status).toBe('paused');
    });

    it('should default unknown status to pending', () => {
      const input = {
        id: '1',
        name: 'Unknown',
        status: 'UNKNOWN_STATUS',
        progress: 0,
        repository_url: '',
        created_at: '',
        updated_at: '',
      };

      const result = mapOrchestration(input);

      expect(result.status).toBe('pending');
    });
  });

  describe('mapOrchestrationsResponse', () => {
    it('should transform orchestration list correctly', () => {
      const input = {
        data: [
          {
            id: 'orch-1',
            name: 'Test Orchestration',
            status: 'RUNNING',
            progress: 50,
            repository_url: 'https://github.com/test/repo',
            created_at: '2025-12-27T09:00:00Z',
            updated_at: '2025-12-27T10:00:00Z',
            model: 'gpt-4',
            duration_seconds: 3600,
          },
        ],
        total: 1,
        page: 1,
        page_size: 10,
      };

      const result = mapOrchestrationsResponse(input);

      expect(result.orchestrations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);

      const orch = result.orchestrations[0];
      expect(orch.id).toBe('orch-1');
      expect(orch.name).toBe('Test Orchestration');
      expect(orch.status).toBe('running');
      expect(orch.progress).toBe(50);
      expect(orch.repositoryUrl).toBe('https://github.com/test/repo');
      expect(orch.model).toBe('gpt-4');
      expect(orch.duration).toBe(3600);
      expect(orch.durationDisplay).toBe('1h 0m');
    });

    it('should calculate total pages correctly', () => {
      const input = {
        data: [],
        total: 25,
        page: 1,
        page_size: 10,
      };

      const result = mapOrchestrationsResponse(input);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('mapOrchestration', () => {
    it('should transform single orchestration correctly', () => {
      const input = {
        id: 'orch-1',
        name: 'Test',
        status: 'COMPLETED',
        progress: 100,
        repository_url: 'https://github.com/test/repo',
        created_at: '2025-12-27T09:00:00Z',
        updated_at: '2025-12-27T10:00:00Z',
        started_at: '2025-12-27T09:01:00Z',
        completed_at: '2025-12-27T10:00:00Z',
        model: 'claude-3',
        duration_seconds: 3540,
        error_message: undefined,
      };

      const result = mapOrchestration(input);

      expect(result.id).toBe('orch-1');
      expect(result.status).toBe('completed');
      expect(result.startedAt).toBe('2025-12-27T09:01:00Z');
      expect(result.completedAt).toBe('2025-12-27T10:00:00Z');
      expect(result.durationDisplay).toBe('59m 0s');
      expect(result.errorMessage).toBeUndefined();
    });
  });

  describe('mapTelemetryResponse', () => {
    it('should transform normal telemetry correctly', () => {
      const input = {
        cpuUsage: 50,
        memoryUsage: 60,
        activeRequests: 10,
        queueDepth: 5,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapTelemetryResponse(input);

      expect(result.status).toBe('normal');
      expect(result.cpuUsage).toBe(50);
      expect(result.memoryUsage).toBe(60);
    });

    it('should detect warning status', () => {
      const input = {
        cpuUsage: 75,
        memoryUsage: 50,
        activeRequests: 10,
        queueDepth: 5,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapTelemetryResponse(input);

      expect(result.status).toBe('warning');
    });

    it('should detect critical status', () => {
      const input = {
        cpuUsage: 95,
        memoryUsage: 50,
        activeRequests: 100,
        queueDepth: 50,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapTelemetryResponse(input);

      expect(result.status).toBe('critical');
    });

    it('should prioritize critical over warning', () => {
      const input = {
        cpuUsage: 80,
        memoryUsage: 95,
        activeRequests: 10,
        queueDepth: 5,
        timestamp: '2025-12-27T10:00:00Z',
      };

      const result = mapTelemetryResponse(input);

      expect(result.status).toBe('critical');
    });
  });

  describe('mapSchemaMismatch', () => {
    it('should detect missing fields correctly', () => {
      const endpoint = '/api/v1/health';
      const expected = ['status', 'latency', 'timestamp', 'version'];
      const received = { status: 'ok', latency: 50 };

      const result = mapSchemaMismatch(endpoint, expected, received);

      expect(result.endpoint).toBe('/api/v1/health');
      expect(result.expectedFields).toEqual(expected);
      expect(result.missingFields).toEqual(['timestamp', 'version']);
      expect(result.receivedFields).toEqual(['status', 'latency']);
    });

    it('should handle no missing fields', () => {
      const endpoint = '/api/v1/health';
      const expected = ['status', 'latency'];
      const received = { status: 'ok', latency: 50 };

      const result = mapSchemaMismatch(endpoint, expected, received);

      expect(result.missingFields).toEqual([]);
    });
  });
});
