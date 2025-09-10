export const refreshTokenExample = {
  status: 200,
  success: true,
  message: 'Token refreshed successfully',
  data: {
    user: {
      sub: 'cmfdxq3n30000w4s57mxj3587',
      username: 'participant42',
      email: 'participant42@example.com',
      role: 'PARTICIPANT',
    },
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZkeHEzbjMwMDAwdzRzNTdteGozNTg3IiwidXNlcm5hbWUiOiJwYXJ0aWNpcGFudDQyIiwiZW1haWwiOiJwYXJ0aWNpcGFudDQyQGV4YW1wbGUuY29tIiwicm9sZSI6IlBBUlRJQ0lQQU5UIiwiaWF0IjoxNzU3NTIzNDM3LCJleHAiOjE3NTg0MjM0Mzd9.ap3j6auhTUhxpzo18rBq2Ff2ndZwJ3-xtZ2RXbgeefA',
  },
  timestamp: '2025-09-10T16:57:17.806Z',
} as const;
