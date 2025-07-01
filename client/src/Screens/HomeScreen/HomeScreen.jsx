import React, { useState, useEffect } from 'react';
import { Calendar, Target, BookOpen, BarChart3, Bell, FileText, Trophy, Users, Brain, RotateCcw, Download, TrendingUp, Timer, CheckCircle, Star, ArrowRight, Play, Menu, X, Zap, Shield, Sparkles, Flame, Clock, Award, TrendingDown, Eye, Headphones, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GateTrackerLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const features = [
    { icon: Brain, title: "AI Study Buddy", description: "Personal AI tutor that learns your weak spots and adapts questions in real-time.", color: "#B6B09F" },
    { icon: Zap, title: "Lightning Reviews", description: "30-second flashcards with spaced repetition algorithm for maximum retention.", color: "#000000" },
    { icon: Flame, title: "Streak Challenges", description: "Gamified daily goals with rewards and peer competitions to maintain momentum.", color: "#B6B09F" },
    { icon: Eye, title: "Focus Mode", description: "Distraction-free environment with Pomodoro timer and website blocking.", color: "#000000" },
    { icon: Headphones, title: "Audio Summaries", description: "AI-generated podcasts of complex topics for learning on-the-go.", color: "#B6B09F" },
    { icon: Gamepad2, title: "Quiz Battles", description: "Real-time multiplayer quiz competitions with friends and study groups.", color: "#000000" }
  ];

  const stats = [
    { number: "15K+", label: "Active Learners", icon: Users },
    { number: "98%", label: "Success Rate", icon: Trophy },
    { number: "2.3M+", label: "Questions Solved", icon: Target },
    { number: "24/7", label: "AI Support", icon: Clock }
  ];

  const testimonials = [
    { name: "Arjun Mehta", role: "GATE CS 2024 - AIR 12", content: "The AI tutor feature is incredible! It knew exactly what I was struggling with.", rating: 5, improvement: "+180 points" },
    { name: "Sneha Reddy", role: "GATE CS 2024 - AIR 34", content: "Lightning reviews saved me 3 hours daily. Perfect for busy schedules!", rating: 5, improvement: "+145 points" },
    { name: "Karthik Singh", role: "GATE CS 2024 - AIR 67", content: "Quiz battles made studying fun. My friends and I competed daily!", rating: 5, improvement: "+125 points" }
  ];

  const liveFeatures = [
    { title: "Smart Notifications", desc: "Get reminded 15 mins before your optimal learning window", active: true },
    { title: "Weakness Predictor", desc: "AI predicts your next mistake before you make it", active: timeSpent > 3 },
    { title: "Energy Tracker", desc: "Monitors your focus levels and suggests break times", active: timeSpent > 6 },
    { title: "Dream Analyzer", desc: "Upload sleep data to optimize study schedules", active: timeSpent > 9 }
  ];

  return (
    <>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.9; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(182, 176, 159, 0.3); } 50% { box-shadow: 0 0 30px rgba(182, 176, 159, 0.6); } }
        .live-indicator { animation: pulse 2s infinite; }
        .floating { animation: float 3s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.6s ease-out forwards; }
        .glow-effect { animation: glow 3s ease-in-out infinite; }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F2F2F2 0%, #EAE4D5 50%, #F2F2F2 100%)', color: '#000000', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* Live Status Bar */}
        <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 60, background: '#000000', color: '#F2F2F2', padding: '0.5rem 0', textAlign: 'center', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div className="live-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4444' }}></div>
            <span>🔥 {Math.floor(Math.random() * 50) + 150} students studying right now • {timeSpent}s on page</span>
            <Sparkles size={16} color="#B6B09F" />
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ position: 'fixed', top: '2.5rem', width: '100%', zIndex: 50, background: 'rgba(242, 242, 242, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #B6B09F' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="glow-effect" style={{ width: '2.5rem', height: '2.5rem', background: '#000000', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={24} color="#F2F2F2" />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000' }}>TrackToCrack</span>
              </div>
              
              <div style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="nav-links">
                {['Features', 'Live Demo', 'Success Stories'].map(item => 
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} style={{ color: '#000000', textDecoration: 'none', fontWeight: '500', transition: 'color 0.3s ease' }}>{item}</a>
                )}
                <button style={{ background: '#000000', color: '#F2F2F2', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>Start Free</button>
              </div>

              <button style={{ display: 'block', background: 'none', border: 'none', color: '#000000', cursor: 'pointer' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div style={{ background: 'rgba(0, 0, 0, 0.95)', color: '#F2F2F2', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                {['Features', 'Live Demo', 'Success Stories'].map(item => 
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} style={{ color: '#F2F2F2', textDecoration: 'none' }}>{item}</a>
                )}
                <button style={{ background: '#B6B09F', color: '#000000', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', width: '100%' }}>Start Free</button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section style={{ paddingTop: '10rem', paddingBottom: '4rem', padding: '10rem 1rem 4rem 1rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div className="floating" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', background: '#EAE4D5', borderRadius: '9999px', border: '2px solid #B6B09F', marginBottom: '2rem' }}>
              <Sparkles size={16} color="#000000" style={{ marginRight: '0.5rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>AI-Powered • Zero Effort Setup</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.1' }}>
              Stop Studying Hard,<br />
              <span style={{ color: '#B6B09F' }}>Start Studying Smart</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#000000', opacity: 0.8, marginBottom: '2.5rem', maxWidth: '48rem', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
              Our AI learns how you learn, then builds a personalized path that adapts every day. No more guesswork, just results.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => navigate('/login')} className="glow-effect" style={{ background: '#000000', color: '#F2F2F2', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: '600', fontSize: '1.125rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} /> Start Free
                </button>
                {/* <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', border: '2px solid #B6B09F', borderRadius: '0.75rem', fontWeight: '600', fontSize: '1.125rem', background: 'transparent', color: '#000000', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  <Play size={20} /> 2min Demo
                </button> */}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#000000', opacity: 0.7 }}>
                <Shield size={16} />
                <span>No credit card • 14-day free trial • Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section style={{ padding: '2rem 1rem', background: '#EAE4D5' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="slide-in" style={{ textAlign: 'center', background: '#F2F2F2', border: '1px solid #B6B09F', borderRadius: '1rem', padding: '1.5rem', transition: 'all 0.3s ease', animationDelay: `${index * 0.2}s` }}>
                    <Icon size={24} color="#B6B09F" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000000', marginBottom: '0.5rem' }}>
                      {stat.number}
                    </div>
                    <div style={{ color: '#000000', opacity: 0.8, fontWeight: '500' }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live Features Demo */}
        <section style={{ padding: '4rem 1rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000000' }}>
                Features That <span style={{ color: '#B6B09F' }}>Activate</span> As You Use
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#000000', opacity: 0.8 }}>
                Watch new capabilities unlock based on your usage patterns
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {liveFeatures.map((feature, index) => (
                <div key={index} style={{ 
                  background: feature.active ? '#000000' : '#EAE4D5', 
                  color: feature.active ? '#F2F2F2' : '#000000', 
                  padding: '1.5rem', 
                  borderRadius: '1rem', 
                  border: `2px solid ${feature.active ? '#B6B09F' : 'transparent'}`,
                  transition: 'all 0.5s ease',
                  opacity: feature.active ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: feature.active ? '#00FF00' : '#666666',
                      animation: feature.active ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    <span style={{ fontWeight: '600' }}>{feature.active ? 'ACTIVE' : 'LOCKED'}</span>
                  </div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Revolutionary Features */}
        <section id="features" style={{ padding: '4rem 1rem', background: '#EAE4D5' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000000' }}>
                Features That <span style={{ color: '#B6B09F' }}>Actually Work</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="floating" style={{ 
                    background: '#F2F2F2', 
                    border: '2px solid #B6B09F', 
                    borderRadius: '1rem', 
                    padding: '2rem', 
                    transition: 'all 0.5s ease',
                    animationDelay: `${index * 0.5}s`
                  }}>
                    <div style={{ 
                      width: '3rem', 
                      height: '3rem', 
                      borderRadius: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: '1.5rem', 
                      background: feature.color 
                    }}>
                      <Icon size={24} color={feature.color === '#000000' ? '#F2F2F2' : '#000000'} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000000' }}>{feature.title}</h3>
                    <p style={{ color: '#000000', opacity: 0.8, lineHeight: '1.6' }}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section id="success-stories" style={{ padding: '4rem 1rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000000' }}>
                Real Results, <span style={{ color: '#B6B09F' }}>Real People</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} style={{ 
                  background: '#F2F2F2', 
                  border: '2px solid #B6B09F', 
                  borderRadius: '1rem', 
                  padding: '1.5rem', 
                  transition: 'all 0.3s ease' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                      ))}
                    </div>
                    <div style={{ 
                      background: '#000000', 
                      color: '#F2F2F2', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.875rem', 
                      fontWeight: '600' 
                    }}>
                      {testimonial.improvement}
                    </div>
                  </div>
                  <p style={{ color: '#000000', marginBottom: '1.5rem', fontStyle: 'italic' }}>"{testimonial.content}"</p>
                  <div>
                    <div style={{ fontWeight: '600', color: '#000000' }}>{testimonial.name}</div>
                    <div style={{ color: '#B6B09F', fontSize: '0.875rem' }}>{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: '4rem 1rem', background: '#000000', color: '#F2F2F2' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Your AI Tutor is <span style={{ color: '#B6B09F' }}>Ready</span>
            </h2>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
              Join the smartest GATE prep community. Setup takes under 60 seconds.
            </p>
            <button className="glow-effect" style={{ 
              background: '#B6B09F', 
              color: '#000000', 
              fontSize: '1.25rem', 
              padding: '1.25rem 3rem', 
              borderRadius: '0.75rem', 
              fontWeight: '700', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              margin: '0 auto' 
            }}>
              <Zap size={24} /> Start Learning Smarter Today
            </button>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '1rem' }}>
              ✓ No setup fees ✓ Cancel anytime ✓ Results in 7 days or money back
            </p>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer style={{ background: '#EAE4D5', padding: '2rem 1rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Target size={20} color="#000000" />
              <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#000000' }}>TrackToCrack</span>
            </div>
            <p style={{ color: '#000000', opacity: 0.8, fontSize: '0.875rem' }}>
              © 2025 TrackToCrack. Empowering 15,000+ GATE aspirants worldwide.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default GateTrackerLanding;