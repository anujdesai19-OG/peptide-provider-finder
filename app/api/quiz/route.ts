import { NextRequest, NextResponse } from 'next/server';
import { generateGuidance } from '@/lib/quiz';
import { QuizAnswers } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.json() as QuizAnswers;
  const result = generateGuidance(body);
  return NextResponse.json(result);
}
