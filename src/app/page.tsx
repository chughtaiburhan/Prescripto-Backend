export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Prescripto Backend API
        </h1>
        <p className="text-gray-600 mb-6">
          Next.js Backend for Doctor Appointment Booking System
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ MongoDB Atlas Connected</p>
          <p>✅ JWT Authentication Ready</p>
          <p>✅ Cloudinary Integration</p>
          <p>✅ API Routes Configured</p>
        </div>
        <div className="mt-6">
          <a 
            href="/api/test" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Test API
          </a>
        </div>
      </div>
    </div>
  );
} 