import React from 'react';
import { 
  Hand, 
  Mic, 
  Volume2, 
  BookOpen, 
  ArrowRight,
  Shield,
  Zap,
  Heart,
  CheckCircle2,
  Sparkles,
  Accessibility as AccessibilityIcon,
  MessageSquare,
  Cpu,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard: React.FC<{
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}> = ({ to, title, description, icon: Icon, color, delay }) => (
  <div>
    <Link to={to} className="block h-full">
      <div className="glass-panel p-8 rounded-3xl h-full flex flex-col group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} text-white shadow-lg`}>
          <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center text-blue-600 font-semibold gap-2">
          Try it now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  </div>
);

const Step: React.FC<{ number: string; title: string; description: string; delay: number }> = ({ number, title, description, delay }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-blue-500/30">
      {number}
    </div>
    <div className="space-y-2">
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const Home: React.FC = () => {
  return (
    <div className="space-y-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full -z-10" />
        
        <div className="text-center space-y-10 max-w-5xl mx-auto px-4">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-800"
          >
            <Sparkles size={14} /> Next-Gen Accessibility
          </div>
          
          <h1 
            className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-950 dark:text-white"
          >
            SPEAK <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500">WITHOUT</span> <br />
            LIMITS.
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The world's most advanced AI platform for communication accessibility. 
            Translate signs, transcribe speech, and read with confidence.
          </p>

          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            <Link 
              to="/sign-to-speech" 
              className="group relative px-12 py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full font-black text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10">GET STARTED</span>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-6 bg-transparent text-slate-950 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-full font-black text-xl hover:border-indigo-500 transition-all"
            >
              OUR STORY
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <div className="text-indigo-600 font-black tracking-widest uppercase text-sm">Our Story</div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Empowering Voices.
          </h2>
        </div>
        
        <div className="space-y-6 text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            SpeakEasy was born from a simple observation: technology often moves faster than accessibility. 
            We set out to bridge that gap by applying state-of-the-art machine learning to real-world communication challenges.
          </p>
          <p>
            Whether it's translating complex sign language in real-time or making reading accessible for those with dyslexia, 
            our tools are designed to be invisible—letting the human connection shine through.
          </p>
          <div className="pt-8 space-y-4">
            <p className="font-bold text-indigo-600">Part of HexnicAI Ecosystem</p>
            <p className="text-base">
              Developed by Students of Vidya Academy of Science and Technology, SpeakEasy is a flagship project under the HexnicAI initiative, dedicated to creating ethical and accessible AI solutions.
            </p>
            <a 
              href="https://hexnicai.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Visit HexnicAI <ArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8">
          <div className="glass-panel p-6 rounded-3xl">
            <div className="text-4xl font-black text-indigo-600 mb-1">99%</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accuracy</div>
          </div>
          <div className="glass-panel p-6 rounded-3xl">
            <div className="text-4xl font-black text-rose-500 mb-1">AI</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Powered</div>
          </div>
          <div className="glass-panel p-6 rounded-3xl col-span-2 md:col-span-1">
            <div className="text-4xl font-black text-amber-500 mb-1">Free</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">For All</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="text-rose-500 font-black tracking-widest uppercase text-sm">Capabilities</div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">The Toolkit.</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xl max-w-md leading-relaxed">
            A comprehensive suite of tools designed to remove barriers and enhance communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FeatureCard
            to="/sign-to-speech"
            title="Sign Language"
            description="Real-time translation of hand gestures into spoken words using advanced computer vision."
            icon={Hand}
            color="bg-indigo-600"
            delay={0.1}
          />
          <FeatureCard
            to="/speech-to-text"
            title="Speech to Text"
            description="High-fidelity live transcription with multi-language support and instant export options."
            icon={Mic}
            color="bg-rose-500"
            delay={0.2}
          />
          <FeatureCard
            to="/text-to-speech"
            title="Text to Speech"
            description="Natural-sounding voice synthesis with customizable parameters for a personal touch."
            icon={Volume2}
            color="bg-amber-500"
            delay={0.3}
          />
          <FeatureCard
            to="/dyslexia-reader"
            title="Dyslexia Reader"
            description="Specialized reading environment with highlighting and fonts designed for neurodiversity."
            icon={BookOpen}
            color="bg-emerald-500"
            delay={0.4}
          />
          <FeatureCard
            to="/ai-chat"
            title="AI Chat Assistant"
            description="Smart communication helper that polishes short phrases into complete, polite sentences."
            icon={MessageSquare}
            color="bg-blue-600"
            delay={0.5}
          />
          <FeatureCard
            to="/vision-assistance"
            title="Vision Assistance"
            description="AI-powered scene description to help visually impaired users navigate their surroundings."
            icon={Eye}
            color="bg-purple-600"
            delay={0.6}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              SpeakEasy simplifies complex AI processing into three easy steps.
            </p>
          </div>

          <div className="space-y-8">
            <Step 
              number="1" 
              title="Input Your Content" 
              description="Use your webcam for signs, microphone for speech, or paste text into our reader." 
              delay={0.1}
            />
            <Step 
              number="2" 
              title="AI Processing" 
              description="Our advanced neural networks process the input in real-time, ensuring high accuracy and low latency." 
              delay={0.2}
            />
            <Step 
              number="3" 
              title="Instant Output" 
              description="Receive your translation as clear speech or readable text, ready to be shared or saved." 
              delay={0.3}
            />
          </div>
        </div>

        <div className="relative">
          <div className="glass-panel p-10 rounded-[40px] bg-gradient-to-br from-indigo-600 to-rose-700 text-white border-none shadow-2xl">
            <div className="space-y-8">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <MessageSquare className="text-indigo-200" />
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="w-1/2 h-full bg-white/40 animate-pulse"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Cpu size={48} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">Processing...</div>
                <div className="text-indigo-200 text-sm">Neural engines active</div>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Accessibility Highlight */}
      <section className="p-12 md:p-20 rounded-[40px] bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 blur-[100px] rounded-full" />
        
        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-400 font-medium text-sm uppercase tracking-widest">
              <AccessibilityIcon size={16} /> Inclusivity First
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-white">Designed for <br />Every Ability.</h2>
            <p className="text-slate-200 text-xl leading-relaxed max-w-lg">
              We believe communication is a fundamental human right. SpeakEasy is built 
              from the ground up to be accessible, intuitive, and empowering for everyone.
            </p>
            <ul className="space-y-5">
              {[
                "Screen reader optimized layout",
                "Dyslexia-friendly typography",
                "High contrast visual modes",
                "Keyboard-only navigation support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">20+</div>
                <div className="text-slate-400 text-sm">Languages Supported</div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-slate-400 text-sm">Privacy Focused</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">Real-time</div>
                <div className="text-slate-400 text-sm">Processing Speed</div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">Free</div>
                <div className="text-slate-400 text-sm">For Everyone</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-10 py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">Ready to break <br />the silence?</h2>
        <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Join thousands of users who are already using SpeakEasy to communicate more effectively every day.
        </p>
        <div className="pt-4">
          <Link 
            to="/sign-to-speech" 
            className="inline-block px-16 py-8 bg-indigo-600 text-white rounded-full font-black text-2xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all uppercase tracking-widest"
          >
            Start Communicating
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                <AccessibilityIcon size={24} />
              </div>
              <span className="font-bold text-3xl tracking-tighter">SpeakEasy</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg leading-relaxed">
              Making the world more accessible through AI-powered communication tools. 
              Designed for inclusivity, built for everyone.
            </p>
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Developed by Students of <span className="text-indigo-600">Vidya Academy of Science and Technology</span>
              </div>
              <div className="text-xs font-medium text-slate-500">
                © 2026 HexnicAI || Part of ATS_PDZ || ALL RIGHTS RESERVED
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="font-black text-xl uppercase tracking-tighter">Features</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
              <li><Link to="/sign-to-speech" className="hover:text-indigo-600 transition-colors">Sign to Speech</Link></li>
              <li><Link to="/speech-to-text" className="hover:text-indigo-600 transition-colors">Speech to Text</Link></li>
              <li><Link to="/text-to-speech" className="hover:text-indigo-600 transition-colors">Text to Speech</Link></li>
              <li><Link to="/dyslexia-reader" className="hover:text-indigo-600 transition-colors">Dyslexia Reader</Link></li>
              <li><Link to="/ai-chat" className="hover:text-indigo-600 transition-colors">AI Chat Assistant</Link></li>
              <li><Link to="/vision-assistance" className="hover:text-indigo-600 transition-colors">Vision Assistance</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-xl uppercase tracking-tighter">Company</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
              <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 transition-colors">About Us</button></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="py-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2026 SpeakEasy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a>
            <a href="https://github.com/abhinavnixabvv-hue" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

