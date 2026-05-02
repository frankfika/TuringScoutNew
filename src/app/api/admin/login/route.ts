import { NextResponse } from "next/server";
import { adminPassword, setAdminCookie } from "@/lib/admin";

export async function POST(request: Request) {
  const form = await request.formData();
  if (String(form.get("password") ?? "") !== adminPassword()) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }
  await setAdminCookie();
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
