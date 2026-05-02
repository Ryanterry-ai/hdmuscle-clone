import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface WholesaleInquiry {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  submittedAt: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone);
}

export async function POST(request: NextRequest) {
  try {
    let body: any;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = {
        businessName: formData.get('businessName') as string,
        contactPerson: formData.get('contactPerson') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        businessType: formData.get('businessType') as string,
        message: formData.get('message') as string,
      };
    }

    const { businessName, contactPerson, email, phone, businessType, message } = body;

    if (!businessName || !contactPerson || !email || !phone || !businessType) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    const inquiry: WholesaleInquiry = {
      businessName,
      contactPerson,
      email,
      phone,
      businessType,
      message: message || '',
      submittedAt: new Date().toISOString(),
    };

    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'wholesale-inquiries.json');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let inquiries: WholesaleInquiry[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      inquiries = JSON.parse(fileContent || '[]');
    }

    inquiries.push(inquiry);
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully. Our team will contact you within 24 hours.',
    });
  } catch (error) {
    console.error('Wholesale inquiry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
