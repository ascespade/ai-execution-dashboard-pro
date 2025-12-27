import { NextResponse } from 'next/server';

// Health check endpoint for Railway deployment
// Used by Railway's health checks and Docker HEALTHCHECK
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(health, { status: 200 });
}
