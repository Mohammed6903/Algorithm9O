import React from "react";
import { BookOpen, Users } from "lucide-react";

export default function Info() {
  return (
    <div className="py-12 bg-black/[0.96]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Designed for Everyone
          </h2>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {/* Student Section */}
            <div className="bg-black p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <h3 className="ml-3 text-xl font-medium text-white">
                  For Students
                </h3>
              </div>
              <ul className="mt-4 space-y-3 text-zinc-400">
                <li>• Personalized learning recommendations</li>
                <li>• Interactive live and recorded classes</li>
                <li>• AI-powered study guidance</li>
                <li>• Smart content summarization</li>
              </ul>
            </div>

            {/* Teacher Section */}
            <div className="bg-black p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
                <h3 className="ml-3 text-xl font-medium text-white">
                  For Teachers
                </h3>
              </div>
              <ul className="mt-4 space-y-3 text-zinc-400">
                <li>• Comprehensive analytics dashboard</li>
                <li>• AI-assisted quiz generation</li>
                <li>• Automated content management</li>
                <li>• Student progress tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
