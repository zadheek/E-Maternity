// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <Icons.Baby className="w-16 h-16 text-[#E91E63]" />
        </div>
        <h1 className="text-5xl font-bold text-[#212121] mb-4">
          E-Maternity
        </h1>
        <p className="text-xl text-[#757575] mb-8 max-w-2xl mx-auto">
          Smart Maternal Health Management System for Sri Lanka
        </p>
        <p className="text-lg text-[#757575] mb-12 max-w-3xl mx-auto">
          Comprehensive digital health platform providing continuous health monitoring, 
          emergency response coordination, and data-driven insights for expectant mothers 
          and healthcare providers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-[#E91E63] hover:bg-[#C2185B]">
              Register as Mother
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#212121]">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Icons.Activity className="w-10 h-10 text-[#E91E63] mb-2" />
              <CardTitle>Health Tracking</CardTitle>
              <CardDescription>
                Monitor weight, blood pressure, glucose, and fetal health metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Icons.Calendar className="w-10 h-10 text-[#00BCD4] mb-2" />
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                Schedule and manage appointments with automated reminders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Icons.Ambulance className="w-10 h-10 text-[#F44336] mb-2" />
              <CardTitle>Emergency SOS</CardTitle>
              <CardDescription>
                Instant emergency alerts with GPS location to providers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Icons.Video className="w-10 h-10 text-[#4CAF50] mb-2" />
              <CardTitle>Telemedicine</CardTitle>
              <CardDescription>
                Video consultations with doctors and midwives
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="container mx-auto px-4 py-16 bg-[#FAFAFA]">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#212121]">
          For Everyone in Maternal Healthcare
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Icons.User className="w-10 h-10 text-[#E91E63] mb-2" />
              <CardTitle>For Mothers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#757575]">
                <li>• Personal health dashboard</li>
                <li>• Educational resources</li>
                <li>• Medication reminders</li>
                <li>• Emergency access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Icons.Stethoscope className="w-10 h-10 text-[#00BCD4] mb-2" />
              <CardTitle>For Healthcare Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#757575]">
                <li>• Patient management</li>
                <li>• Prescription system</li>
                <li>• High-risk alerts</li>
                <li>• Telemedicine tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Icons.BarChart className="w-10 h-10 text-[#FF9800] mb-2" />
              <CardTitle>For Public Health Officials</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#757575]">
                <li>• Real-time statistics</li>
                <li>• Geographic insights</li>
                <li>• Resource planning</li>
                <li>• Policy support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-[#757575]">
        <p>© 2025 E-Maternity. Smart Maternal Health Management System.</p>
        <p className="mt-2 text-sm">Ministry of Health, Sri Lanka</p>
      </footer>
    </div>
  );
}

