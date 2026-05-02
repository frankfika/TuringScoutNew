import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/session";
export async function POST(request: Request) { await clearUserCookie(); return NextResponse.redirect(new URL("/", request.url), { status: 303 }); }
