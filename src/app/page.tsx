import React from 'react'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">LUX market</h1>
      <p className="text-lg text-gray-400 mb-8">Coming soon</p>
      <a 
        href="https://lux.network" 
        className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition"
      >
        Learn More
      </a>
    </div>
  )
}
