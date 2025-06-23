
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-700 py-12 lg:py-16 mt-8 lg:mt-16 w-full overflow-hidden relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 left-16 text-6xl text-cyan-400 transform rotate-12">+</div>
        <div className="absolute top-32 right-24 text-4xl text-cyan-400 transform -rotate-12">×</div>
        <div className="absolute bottom-16 left-24 text-5xl text-cyan-400 transform rotate-45">+</div>
        <div className="absolute bottom-32 right-16 text-3xl text-cyan-400 transform -rotate-45">×</div>
        <div className="absolute top-1/2 left-1/4 text-4xl text-cyan-400 transform rotate-12">+</div>
        <div className="absolute top-1/3 right-1/3 text-3xl text-cyan-400 transform -rotate-12">×</div>
        <div className="absolute top-20 right-1/4 text-5xl text-cyan-400 transform rotate-12">+</div>
        <div className="absolute bottom-20 left-1/3 text-4xl text-cyan-400 transform -rotate-12">×</div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Email Subscription Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-light mb-8 text-cyan-400">
            Get Your Order Now
          </h2>
          <div className="flex justify-center">
            <div className="relative max-w-lg w-full">
              <div className="border-4 border-cyan-400 rounded-full overflow-hidden bg-white flex">
                <Input
                  type="email"
                  placeholder="Type your email here"
                  className="flex-1 border-0 bg-transparent px-6 py-4 focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-400 rounded-none"
                />
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-4 rounded-none border-0 font-medium">
                  →
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Meem Home Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-4xl lg:text-5xl font-light mb-8 text-cyan-400">
              Meem<br />Home
            </h3>
            <div className="flex space-x-3 mb-8">
              <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">in</span>
              </div>
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors cursor-pointer">
                <span className="text-sm font-bold">@</span>
              </div>
            </div>
            
            {/* Cyan decorative bars */}
            <div className="flex space-x-2 mb-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-2 bg-cyan-400 rounded-full"
                  style={{ width: `${[20, 35, 25, 40, 30, 45, 25, 35, 20][i]}px` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg text-cyan-400">Quick Links</h4>
            <ul className="space-y-3 text-gray-600">
              <li><Link to="/store" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><button className="hover:text-cyan-400 transition-colors">About</button></li>
              <li><button className="hover:text-cyan-400 transition-colors">Contact</button></li>
              <li><button className="hover:text-cyan-400 transition-colors">Terms & Conditions</button></li>
              <li><button className="hover:text-cyan-400 transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-6 text-lg text-cyan-400">Have a Questions?</h4>
            <div className="space-y-3 text-gray-600">
              <p>mejdiaya-tripoli-lebanon</p>
              <p className="font-semibold text-gray-800">+961 76 591 765</p>
              <p>info@email</p>
            </div>
          </div>
        </div>

        {/* Bottom decorative bars */}
        <div className="flex justify-center space-x-3 my-12">
          {Array.from({ length: 9 }).map((_, i) => (
            <div 
              key={i} 
              className="h-2 bg-cyan-400 rounded-full"
              style={{ width: `${[30, 50, 40, 60, 45, 70, 40, 50, 35][i]}px` }}
            ></div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center space-y-4">
          <p className="text-sm text-cyan-400">
            This site is protected by recaptcha and the Google Privacy Policy and Terms Service apply.
          </p>
          <p className="text-sm text-gray-500">
            Meemhome 2025 Copyright
          </p>
        </div>
      </div>
    </footer>
  );
}
