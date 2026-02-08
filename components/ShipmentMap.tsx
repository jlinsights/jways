import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Navigation } from 'lucide-react';
import { ShipmentData } from '../types';

interface ShipmentMapProps {
  shipment: ShipmentData;
}

const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment }) => {
  return (
    <div className="bg-slate-900 relative min-h-[400px] lg:min-h-[500px] h-full overflow-hidden group rounded-tl-3xl lg:rounded-bl-3xl">
        {/* Map Background Image */}
        <div 
            className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center"
            style={{ filter: 'invert(1) grayscale(1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/80" />
        
        {/* Map Elements */}
        <div className="absolute inset-0 p-8 md:p-12">
                {/* Connection Line SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {/* Curved path approximation for demo */}
                <motion.path 
                    d={`M ${shipment.origin.x}% ${shipment.origin.y}% Q 50% 20% ${shipment.destination.x}% ${shipment.destination.y}%`}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                </svg>

                {/* Origin Dot */}
                <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_#3b82f6]"
                style={{ left: `${shipment.origin.x}%`, top: `${shipment.origin.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-blue-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                    {shipment.origin.code}
                </div>
                </div>

                {/* Destination Dot */}
                <div 
                className="absolute w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"
                style={{ left: `${shipment.destination.x}%`, top: `${shipment.destination.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                    {shipment.destination.code}
                </div>
                </div>

                {/* Current Location Beacon (Animated) */}
                <motion.div 
                className="absolute z-10"
                style={{ left: `${shipment.current.x}%`, top: `${shipment.current.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, type: 'spring' }}
                >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    {/* Pulse Rings */}
                    <motion.div 
                        animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-jways-accent rounded-full opacity-50 w-full h-full"
                    />
                    <motion.div 
                        animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 bg-jways-accent rounded-full opacity-50 w-full h-full"
                    />
                    
                    {/* Core Icon */}
                    <div className="w-8 h-8 bg-jways-accent rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 border-2 border-white">
                        <Truck size={14} className="text-white" />
                    </div>

                    {/* Tooltip */}
                    <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white text-slate-900 px-3 py-2 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap flex flex-col items-center gap-1"
                    >
                        <div className="flex items-center gap-1.5 text-jways-accent uppercase tracking-wider text-[10px]">
                            <Navigation size={10} />
                            In Transit
                        </div>
                        <span>{shipment.current.city}</span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-white" />
                    </motion.div>
                </div>
                </motion.div>
        </div>

        {/* Map Overlay Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent flex justify-between items-end">
            <div className="text-white">
                <p className="text-sm text-slate-400 mb-1">Estimated Arrival</p>
                <p className="text-2xl font-bold">{shipment.estimatedDelivery}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Distance Remaining</p>
                <p className="text-xl font-bold text-white">4,230 km</p>
            </div>
        </div>
    </div>
  );
};

export default ShipmentMap;