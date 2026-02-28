import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Star } from 'lucide-react';

// Home page component
const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - The main banner area */}
      <section className="relative bg-[#1A1A2E] text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80" 
            alt="Gym Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Transform Your Body,<br />
            <span className="text-[#FF6B35]">Transform Your Life</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join our community of fitness enthusiasts and achieve your goals with expert guidance and state-of-the-art facilities.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/classes" 
              className="px-8 py-3 rounded-md bg-[#FF6B35] text-white font-bold text-lg hover:bg-[#e55a2b] transition-colors flex items-center justify-center"
            >
              View Classes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-3 rounded-md bg-white text-[#1A1A2E] font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Highlighting key benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Why Choose Elevate Fitness?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer more than just a gym. We offer a supportive community and a holistic approach to fitness.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Schedule */}
            <div className="p-6 bg-gray-50 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">
                Classes available throughout the day to fit your busy lifestyle. Early morning to late evening options.
              </p>
            </div>
            
            {/* Feature 2: Instructors */}
            <div className="p-6 bg-gray-50 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from certified professionals who are passionate about helping you succeed.
              </p>
            </div>
            
            {/* Feature 3: Facilities */}
            <div className="p-6 bg-gray-50 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Top Facilities</h3>
              <p className="text-gray-600">
                Train with modern equipment in a clean, spacious, and motivating environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Class Highlights Preview - Showing a few popular classes */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2">Popular Classes</h2>
              <p className="text-gray-600">Discover our most sought-after sessions.</p>
            </div>
            <Link to="/classes" className="text-[#FF6B35] font-semibold hover:text-[#e55a2b] hidden md:flex items-center">
              View All Classes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mock Data for Preview Cards */}
            {[
              {
                title: 'Yoga Flow',
                image: 'https://www.uclahealth.org/sites/default/files/styles/landscape_3x2_032000_1280x853/public/images/c7/yoga-beginners.jpg?f=c187f846&itok=7y2J-0yg$0',
                desc: 'Find your balance and improve flexibility.',
              },
              {
                title: 'HIIT Blast',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60',
                desc: 'High intensity interval training for maximum burn.',
              },
              {
                title: 'Reformer Pilates',
                image: 'https://cdn.mos.cms.futurecdn.net/59UQV9ZCoSsdDz4zWQVn3D.jpg',
                desc: 'Strengthen and tone your core muscles.',
              }
            ].map((cls, idx) => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img src={cls.image} alt={cls.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">{cls.title}</h3>
                  <p className="text-gray-600 mb-4">{cls.desc}</p>
                  <Link to="/classes" className="text-[#FF6B35] font-medium hover:underline">
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile "View All" Link */}
          <div className="mt-8 text-center md:hidden">
            <Link to="/classes" className="text-[#FF6B35] font-semibold hover:text-[#e55a2b] flex items-center justify-center">
              View All Classes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Final Call to Action Section */}
      <section className="py-20 bg-[#FF6B35]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-10 opacity-90">
            Sign up today and get access to all our classes and facilities. First class is on us!
          </p>
          <Link 
            to="/register" 
            className="px-8 py-3 rounded-md bg-white text-[#FF6B35] font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
