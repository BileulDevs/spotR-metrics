const httpMocks = require('node-mocks-http');
const axios = require('axios');
const serviceController = require('../controllers/metrics.controller');

jest.mock('axios');

const services = [
  { name: 'service1', url: 'http://service1/api/metrics' },
  { name: 'service2', url: 'http://service2/api/metrics' }
];

// Mock process.env.SERVICESLIST (important !)
beforeAll(() => {
  process.env.SERVICESLIST = JSON.stringify(services);
});

describe('Service Controller', () => {
  describe('getServices', () => {
    it('should return the list of services', () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      serviceController.getServices(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(services));
    });
  });

  describe('getMetricsForOneService', () => {
    it('should return metrics for a valid service', async () => {
      const req = httpMocks.createRequest({ params: { name: 'service1' } });
      const res = httpMocks.createResponse();

      const mockData = [{ level: 'info' }, { level: 'warn' }];
      axios.get.mockResolvedValue({ data: mockData });

      await serviceController.getMetricsForOneService(req, res);

      expect(axios.get).toHaveBeenCalledWith('http://service1/api/metrics');
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockData);
    });

    it('should return 404 if service not found', async () => {
      const req = httpMocks.createRequest({ params: { name: 'notfound' } });
      const res = httpMocks.createResponse();

      await serviceController.getMetricsForOneService(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Service not found' });
    });

    it('should return 500 on axios error', async () => {
      const req = httpMocks.createRequest({ params: { name: 'service1' } });
      const res = httpMocks.createResponse();

      axios.get.mockRejectedValue(new Error('Network error'));

      await serviceController.getMetricsForOneService(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: expect.stringContaining('Could not fetch metrics') });
    });
  });

  describe('getMetricsForOneServiceWithStatus', () => {
    it('should return filtered metrics by status', async () => {
      const req = httpMocks.createRequest({ params: { name: 'service1', status: 'info' } });
      const res = httpMocks.createResponse();

      const mockData = [
        { level: 'info' },
        { level: 'warn' },
        { level: 'info' },
        { level: 'error' }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      await serviceController.getMetricsForOneServiceWithStatus(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual([
        { level: 'info' },
        { level: 'info' }
      ]);
    });

    it('should return 404 if service not found', async () => {
      const req = httpMocks.createRequest({ params: { name: 'notfound', status: 'info' } });
      const res = httpMocks.createResponse();

      await serviceController.getMetricsForOneServiceWithStatus(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Service not found' });
    });

    it('should return 400 if invalid status param', async () => {
      const req = httpMocks.createRequest({ params: { name: 'service1', status: 'badstatus' } });
      const res = httpMocks.createResponse();

      await serviceController.getMetricsForOneServiceWithStatus(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: 'Invalid status parameter. Must be one of: info, warning, error' });
    });

    it('should return 500 on axios error', async () => {
      const req = httpMocks.createRequest({ params: { name: 'service1', status: 'info' } });
      const res = httpMocks.createResponse();

      axios.get.mockRejectedValue(new Error('Network failure'));

      await serviceController.getMetricsForOneServiceWithStatus(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: expect.stringContaining('Could not fetch metrics') });
    });
  });

  describe('getAllMetrics', () => {
    it('should return metrics summary for all services', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock axios responses per service
      axios.get.mockImplementation(url => {
        if (url === 'http://service1/api/metrics') {
          return Promise.resolve({ data: [
            { level: 'info' },
            { level: 'warn' },
            { level: 'error' },
            { level: 'info' }
          ]});
        }
        if (url === 'http://service2/api/metrics') {
          return Promise.resolve({ data: [
            { level: 'info' },
            { level: 'error' },
            { level: 'error' }
          ]});
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      await serviceController.getAllMetrics(req, res);

      expect(res.statusCode).toBe(200);

      const data = res._getJSONData();

      expect(data).toEqual([
        {
          name: 'service1',
          stats: {
            success: 2,
            warn: 1,
            error: 1
          }
        },
        {
          name: 'service2',
          stats: {
            success: 1,
            warn: 0,
            error: 2
          }
        }
      ]);
    });

    it('should handle axios errors gracefully', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      axios.get.mockImplementation(url => {
        if (url === 'http://service1/api/metrics') {
          return Promise.reject(new Error('Network fail'));
        }
        if (url === 'http://service2/api/metrics') {
          return Promise.resolve({ data: [{ level: 'info' }] });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      await serviceController.getAllMetrics(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data).toEqual([
        {
          name: 'service1',
          error: expect.stringContaining('Error fetching metrics')
        },
        {
          name: 'service2',
          stats: {
            success: 1,
            warn: 0,
            error: 0
          }
        }
      ]);
    });

    it('should return 500 if promise.all fails', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      // Mock Promise.all to reject
      jest.spyOn(Promise, 'all').mockRejectedValueOnce(new Error('Failed'));

      await serviceController.getAllMetrics(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: 'Failed to fetch metrics from services' });

      // Restore Promise.all
      Promise.all.mockRestore();
    });
  });
});
