import React from 'react';

// About page component
const About = () => {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-[#1A1A2E] mb-4">About Elevate Fitness</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We are dedicated to helping you achieve your fitness goals through community, expertise, and innovation.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div>
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=80" 
                alt="Gym Interior" 
                className="rounded-lg shadow-lg"
              />
            </div>
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, Elevate Fitness began with a simple mission: to create a fitness environment that is inclusive, motivating, and effective for everyone, regardless of their fitness level.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that fitness is not just about physical strength, but also about mental well-being and community support. Our state-of-the-art facility is designed to provide you with the best possible experience.
              </p>
              <p className="text-gray-600">
                Today, we are proud to serve thousands of members who are transforming their lives one workout at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-[#FF6B35] mb-4">Community</h3>
              <p className="text-gray-600">
                We foster a supportive environment where members encourage and uplift each other.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-[#FF6B35] mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in our equipment, classes, and instruction.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-[#FF6B35] mb-4">Growth</h3>
              <p className="text-gray-600">
                We are committed to helping our members grow stronger, healthier, and more confident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Meet Our Trainers</h2>
            <p className="text-gray-600">The experts behind your transformation.</p>
          </div>
          {/* Trainer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'Yoga Instructor', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=60' },
              { name: 'Mike Tyson', role: 'HIIT Coach', img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=60' },
              { name: 'Emily Blunt', role: 'Pilates Specialist', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60' },
              { name: 'John Doe', role: 'Strength Trainer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60' },
            ].map((member, idx) => (
              <div key={idx} className="text-center">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-[#1A1A2E]">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;