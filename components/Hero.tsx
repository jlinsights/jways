import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight, Box, Calculator, Plane, Ship, Globe, Search, Loader2, Wand2, Truck, Container } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import QuoteModal from './QuoteModal';

const Hero: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const { scrollY } = useScroll();
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const yCard1 = useTransform(scrollY, [0, 500], [0, -40]); // Tracking card moves differently
  const yCard2 = useTransform(scrollY, [0, 500], [0, -80]); // Stats card moves differently

  // Mouse move effect logic for framer motion
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse values
  const springConfig = { damping: 25, stiffness: 70 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Calculate movements for different background layers (parallax effect)
  const moveX1 = useTransform(mouseXSpring, [-0.5, 0.5], [-30, 30]);
  const moveY1 = useTransform(mouseYSpring, [-0.5, 0.5], [-30, 30]);
  
  const moveX2 = useTransform(mouseXSpring, [-0.5, 0.5], [20, -20]); // Moves opposite
  const moveY2 = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20]);

  // Canvas Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3; // Gentle drift
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, 0.4)`; // Subtle slate color
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(window.innerWidth / 15, 80); // Responsive count
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();

        // Interaction: Connect to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          // Fade line based on distance
          const opacity = (1 - distance / maxDistance) * 0.5;
          ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`; // Cyan-400
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Optional: Connect particles to each other if very close (Mesh effect)
        particles.forEach(otherParticle => {
            const pdx = otherParticle.x - particle.x;
            const pdy = otherParticle.y - particle.y;
            const pDistance = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pDistance < 80) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(148, 163, 184, ${0.05})`; // Very faint slate
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { innerWidth, innerHeight } = window;
    
    // Framer motion values
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);

    // Update canvas mouse ref relative to component
    const rect = currentTarget.getBoundingClientRect();
    mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  };

  const generateBackgroundVideo = async () => {
    if (isGeneratingVideo) return;

    try {
        if (typeof window !== 'undefined' && (window as any).aistudio) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                 await (window as any).aistudio.openSelectKey();
             }
        }

        setIsGeneratingVideo(true);
        setGenerationStatus('AI initializing...');

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        setGenerationStatus('Generating logistics visuals...');
        // Using Veo model to generate background video
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'Cinematic wide shot montage of global logistics. Container ship on dark blue ocean, cargo plane flying above clouds, and trucks on highway. Night time, sleek, professional, corporate dark blue aesthetic, slow motion, photorealistic 4k.',
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        setGenerationStatus('Rendering video (this takes a moment)...');
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
            setGenerationStatus('Downloading...');
            // Fetch the video blob to play it
            const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);
            setVideoUri(videoUrl);
        }

    } catch (error: any) {
        console.error("Video generation failed", error);
        if (error.message?.includes('Requested entity was not found') && (window as any).aistudio) {
             await (window as any).aistudio.openSelectKey();
        }
        setGenerationStatus('Failed. Try again.');
        setTimeout(() => setGenerationStatus(''), 3000);
    } finally {
        setIsGeneratingVideo(false);
        setGenerationStatus('');
    }
  };

  const handleQuoteClick = async () => {
    setIsQuoteLoading(true);
    // Simulate data preparation
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsQuoteLoading(false);
    setIsQuoteModalOpen(true);
  };

  const handleTrackClick = async () => {
    setIsTrackLoading(true);
    // Simulate system check
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTrackLoading(false);

    const element = document.getElementById('track');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-jways-navy pt-20"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        
        {/* Render Video if generated */}
        <AnimatePresence>
            {videoUri ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-0"
                >
                    <video 
                        src={videoUri} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover opacity-50 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-jways-navy/60" /> {/* Overlay to ensure text readability */}
                </motion.div>
            ) : (
                <>
                    {/* Particle Canvas Fallback */}
                    <canvas 
                        ref={canvasRef}
                        className="absolute inset-0 z-0"
                    />
                    {/* Animated Gradient Orbs - Only show if no video to save performance */}
                    <motion.div 
                      style={{ x: moveX1, y: moveY1 }}
                      className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-jways-blue/20 rounded-full blur-[120px] mix-blend-screen" 
                    />
                    <motion.div 
                      style={{ x: moveX2, y: moveY2 }}
                      className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-jways-accent/15 rounded-full blur-[100px] mix-blend-screen" 
                    />
                    <motion.div 
                      style={{ x: moveX1, y: moveY2 }}
                      className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[90px] mix-blend-screen opacity-60" 
                    />
                </>
            )}
        </AnimatePresence>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03] z-0" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', 
               backgroundSize: '50px 50px' 
             }}>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-24">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-jways-blue mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Next-Gen Logistics Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Moving the World <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-jways-blue to-cyan-400">
                Beyond Limits.
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              제이웨이즈는 첨단 기술과 글로벌 네트워크를 통해 가장 빠르고 안전한 물류 경험을 제공합니다. 
              비즈니스의 경계를 확장하세요.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start mb-6">
              <motion.button 
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "#1e40af", // blue-800
                  boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-full sm:w-auto px-8 py-4 bg-jways-blue text-white rounded-full font-semibold flex items-center justify-center gap-2 group transition-all"
              >
                서비스 시작하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold transition-all backdrop-blur-sm"
              >
                상담 문의
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <motion.button 
                onClick={handleQuoteClick}
                disabled={isQuoteLoading}
                className={`w-full sm:w-auto px-10 py-4 bg-jways-accent text-white rounded-full font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 text-lg z-10 ${isQuoteLoading ? 'cursor-not-allowed opacity-90' : ''}`}
                whileHover={!isQuoteLoading ? { 
                  scale: 1.08, 
                  y: -4,
                  backgroundColor: '#c2410c', // orange-700
                  boxShadow: "0 20px 25px -5px rgba(234, 88, 12, 0.5)"
                } : {}}
                whileTap={!isQuoteLoading ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isQuoteLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <Calculator className="w-6 h-6" />
                        Request a Quote
                    </>
                )}
              </motion.button>
              
              <motion.button 
                onClick={handleTrackClick}
                disabled={isTrackLoading}
                className={`w-full sm:w-auto px-10 py-4 border border-white/20 text-white rounded-full font-bold flex items-center justify-center gap-2 text-lg transition-colors ${isTrackLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                whileHover={!isTrackLoading ? { 
                  scale: 1.05, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  y: -2
                } : {}}
                whileTap={!isTrackLoading ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {isTrackLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Search className="w-5 h-5" />
                        Track Shipment
                    </>
                )}
              </motion.button>

              <motion.button 
                className="w-full sm:w-auto px-10 py-4 border border-white/20 text-white rounded-full font-bold flex items-center justify-center gap-2 text-lg transition-colors"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Visual (3D Logistics Graphic) */}
        <motion.div 
          className="flex-1 w-full max-w-md md:max-w-full relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ y }}
        >
          <div className="relative aspect-square">
            {/* Abstract Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-tr from-jways-blue/20 to-transparent rounded-3xl rotate-6 border border-white/10 backdrop-blur-sm" />
            
            {/* Main Container */}
            <div className="absolute inset-0 bg-slate-900 rounded-3xl -rotate-3 border border-white/10 shadow-2xl overflow-hidden relative">
               
               {/* 1. Technical Grid Background */}
               <div className="absolute inset-0 opacity-20" 
                    style={{ 
                      backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', 
                      backgroundSize: '24px 24px' 
                    }} 
               />
               <div className="absolute inset-0 bg-gradient-to-br from-jways-navy/80 via-transparent to-black/60 pointer-events-none" />

               {/* 2. Central 3D Globe Visualization - ENHANCED */}
               <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
                  <div className="relative w-64 h-64 md:w-80 md:h-80" style={{ transformStyle: 'preserve-3d' }}>
                     
                     {/* Core Sphere Construct */}
                     <motion.div 
                        animate={{ rotateY: 360, rotateX: 10 }} 
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        {/* Wireframe Longitudes */}
                        {[0, 45, 90, 135].map((deg) => (
                           <div key={deg} 
                                className="absolute inset-0 rounded-full border border-blue-500/20"
                                style={{ transform: `rotateY(${deg}deg)` }} 
                           />
                        ))}
                        {/* Wireframe Latitudes */}
                        <div className="absolute inset-0 rounded-full border border-blue-500/30 border-dashed" style={{ transform: 'rotateX(90deg)' }} />
                        <div className="absolute inset-0 rounded-full border border-blue-500/10" style={{ transform: 'rotateX(45deg)' }} />
                        <div className="absolute inset-0 rounded-full border border-blue-500/10" style={{ transform: 'rotateX(-45deg)' }} />
                        
                        {/* Inner Core Glow */}
                        <div className="absolute inset-[20%] rounded-full bg-blue-600/20 blur-2xl" />
                        
                        {/* Center Globe Icon (Floating) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translateZ(20px)' }}>
                             <Globe className="w-12 h-12 text-white/90 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" strokeWidth={1} />
                        </div>
                     </motion.div>

                     {/* Orbit Ring 1 - Plane */}
                     <motion.div
                        animate={{ rotateZ: 360, rotateX: 65 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-15%]"
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        <div className="absolute inset-0 rounded-full border border-white/5 border-dashed" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'rotateX(-90deg)' }}>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.4)] backdrop-blur-md">
                                <Plane className="w-5 h-5 text-cyan-400" />
                            </div>
                        </div>
                     </motion.div>

                     {/* Orbit Ring 2 - Ship */}
                     <motion.div
                        animate={{ rotateZ: -360, rotateX: -60 }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-30%]"
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        <div className="absolute inset-0 rounded-full border border-white/5 border-dashed" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" style={{ transform: 'rotateX(90deg)' }}>
                             <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)] backdrop-blur-md">
                                <Ship className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                     </motion.div>

                     {/* Orbit Ring 3 - Truck */}
                     <motion.div
                        animate={{ rotateY: 360, rotateZ: 15 }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[10%]"
                        style={{ transformStyle: 'preserve-3d' }}
                     >
                        <div className="absolute inset-0 rounded-full border border-jways-accent/20 border-dotted" />
                        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2" style={{ transform: 'rotateY(-90deg)' }}>
                             <div className="bg-slate-900/80 p-1.5 rounded-lg border border-jways-accent/50 shadow-[0_0_15px_rgba(249,115,22,0.4)] backdrop-blur-md">
                                <Truck className="w-4 h-4 text-jways-accent" />
                            </div>
                        </div>
                     </motion.div>

                  </div>
               </div>

               {/* 3. Floating UI Overlays */}
               <div className="absolute bottom-0 left-0 right-0 p-8 w-full z-20 pointer-events-none">
                  <div className="relative w-full h-full">
                      {/* Tracking Card */}
                      <motion.div 
                        style={{ y: yCard1 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="absolute bottom-20 left-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl max-w-[200px]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-jways-accent rounded-lg shrink-0">
                            <Box size={16} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-300 uppercase tracking-wider">Tracking ID</div>
                            <div className="text-xs font-mono font-bold text-white truncate">JW-8839-KR</div>
                          </div>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: "70%" }}
                             transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                             className="h-full bg-jways-accent rounded-full" 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-300">
                          <span>Incheon</span>
                          <span className="text-white">Transit</span>
                        </div>
                      </motion.div>

                      {/* Stats Card */}
                      <motion.div 
                        style={{ y: yCard2 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="absolute bottom-0 right-0 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl w-48"
                      >
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-white">Delivered</span>
                            <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-1.5 py-0.5 rounded-full">+24%</span>
                         </div>
                         <div className="text-2xl font-bold text-white">1,240</div>
                         <div className="text-[10px] text-slate-500">Last 30 days</div>
                      </motion.div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Video Generation Control - Subtle placement */}
      <motion.button
        onClick={generateBackgroundVideo}
        disabled={isGeneratingVideo}
        initial={{ opacity: 0.5 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-6 right-6 z-20 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/70 hover:text-white border border-white/10 transition-all flex items-center gap-2 group"
        title="Generate AI Background Video"
      >
        {isGeneratingVideo ? (
           <Loader2 size={18} className="animate-spin text-jways-blue" />
        ) : (
           <Wand2 size={18} />
        )}
        <span className="text-xs font-medium max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            {generationStatus || 'AI Background'}
        </span>
      </motion.button>

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </section>
  );
};

export default Hero;