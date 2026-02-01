import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const LIMITS = {
  gemini: 20,      
  cloudconvert: 10, 
};

type ServiceType = keyof typeof LIMITS;

export async function checkSystemAvailability(service: ServiceType): Promise<boolean> {
  const usage = await redis.get<number>(`global:${service}:usage`);
  const currentCount = usage ? Number(usage) : 0;
  
  return currentCount < LIMITS[service];
}

export async function incrementSystemUsage(service: ServiceType) {
  const key = `global:${service}:usage`;
  
  const newCount = await redis.incr(key);

  if (newCount === 1) {
    await redis.expire(key, 86400); 
  }
  
  return newCount;
}