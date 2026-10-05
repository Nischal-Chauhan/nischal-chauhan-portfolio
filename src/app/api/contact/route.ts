import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required." },
                { status: 400 }
            );
        }

        // Web3Forms requires a valid access key configured in WEB3FORMS_KEY.
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_KEY || "",
                subject: `New inquiry from ${name} — Nischal Chauhan portfolio`,
                from_name: name,
                email: email,
                message: message,
                to: "chauhannischal311@gmail.com",
            }),
        });

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: data.message || "Failed to send message." },
                { status: 500 }
            );
        }
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
