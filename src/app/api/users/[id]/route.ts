import { NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest, context: any) {
  const id = context.params.id;
  return NextResponse.json({ id });
}
