import { NextRequest, NextResponse } from "next/server";

interface NewsletterEntry {
  email: string;
  subscribedAt: string;
  source: string;
}

const subscribers: NewsletterEntry[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const existingSubscriber = subscribers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );

    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: "This email is already subscribed." },
        { status: 409 }
      );
    }

    subscribers.push({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      source: "website",
    });

    console.log(`[Newsletter] New subscriber: ${email}`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for subscribing! You'll receive our latest updates and exclusive offers."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Newsletter] Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: true, 
      count: subscribers.length,
      message: "Newsletter subscription service is running." 
    }
  );
}