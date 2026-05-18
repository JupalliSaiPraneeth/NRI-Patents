import { useState } from 'react';
import { Code, ArrowUp, Mail, Phone, MapPin, Globe, ChevronRight } from 'lucide-react';
import DeveloperModal from './DeveloperModal';

const Footer = () => {
  const [isDevOpen, setIsDevOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-[#111111] text-white pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20 pb-16 border-b border-white/10">

            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-[#b20e0e]/10">
                  <img src="/NRI-logo.png" alt="NRI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight leading-tight text-white">
                    Dr. RVR NRI INSTITUTE<span className="text-[#b20e0e]">.</span>
                  </h3>
                  <p className="text-[10px] font-bold text-[#b20e0e] uppercase tracking-[0.2em] mt-0.5">
                    Institution of Excellence
                  </p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
                Developing Excellence, Innovating the Future. An Autonomous Institution
                dedicated to academic brilliance, research breakthroughs, and holistic student growth.
              </p>
              <div className="flex gap-4">
                <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                  <Globe size={16} className="text-zinc-400" />
                </button>
                <button className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                  <Mail size={16} className="text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-white/90">University Innovation Cells</h4>
              <ul className="grid grid-cols-1 gap-4">
                {[
                  'AI Research Center',
                  'Quantum Computing Lab',
                  'Startup Incubation Hub',
                  'Patent Publications',
                  'Industry Collaborations'
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold">
                      <ChevronRight size={14} className="text-[#b20e0e] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-white/90">Get In Touch</h4>
              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#b20e0e]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b20e0e] transition-colors duration-300">
                    <MapPin size={18} className="text-[#b20e0e] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-bold mb-1">Our Location</p>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Agiripalli, Vijayawada Rural,<br />Andhra Pradesh, India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#b20e0e]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b20e0e] transition-colors duration-300">
                    <Mail size={18} className="text-[#b20e0e] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-bold mb-1">Email Support</p>
                    <a href="mailto:info@nriit.edu.in" className="text-xs text-[#b20e0e] hover:text-[#ff4d4d] font-black transition-colors">
                      info@nriit.edu.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#b20e0e]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#b20e0e] transition-colors duration-300">
                    <Phone size={18} className="text-[#b20e0e] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-bold mb-1">Call Us</p>
                    <p className="text-xs text-zinc-500 font-medium">+91 866 2469666</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 font-medium">&copy; {currentYear} NRI Institute of Technology. All Rights Reserved.</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDevOpen(true)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Code size={14} className="text-[#b20e0e]" />
                <span>Developers</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#b20e0e]/10 hover:bg-[#b20e0e] text-[#b20e0e] hover:text-white transition-all duration-500 border border-[#b20e0e]/20"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>

        </div>
      </footer>

      <DeveloperModal isOpen={isDevOpen} onClose={() => setIsDevOpen(false)} />
    </>
  );
};

export default Footer;