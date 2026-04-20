import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Layout, 
  MousePointer2,
  Mail,
  ChevronRight,
  Star,
  Twitter,
  Github,
  Linkedin,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass-card rounded-full px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight font-display">WaitlistFast</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Problem</a>
          <a href="#solution" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Solution</a>
          <a href="#features" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4">Login</button>
          <button className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
            Get Started
          </button>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl md:hidden"
          >
            <a href="#problem" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-600">Problem</a>
            <a href="#solution" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-600">Solution</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-600">Features</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="text-lg font-medium text-zinc-600">Pricing</a>
            <button className="bg-zinc-900 text-white px-5 py-3 rounded-2xl text-lg font-medium">
              Create Your Waitlist
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden grid-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Join 2,000+ founders validating ideas
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 leading-[0.95] mb-8 text-balance">
              Launch a Startup Waitlist in <span className="text-zinc-400">30 Seconds</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-500 mb-10 leading-relaxed max-w-2xl mx-auto text-balance">
              Validate your startup idea before writing a single line of code. Create a beautiful waitlist page and collect early users instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-zinc-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-300 flex items-center justify-center gap-2 group">
                Create Your Waitlist
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-zinc-900 border border-zinc-200 px-10 py-5 rounded-full text-lg font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                See Example Page
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 rounded-[2.5rem] blur-sm"></div>
          <div className="relative bg-white rounded-[2.2rem] border border-zinc-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="bg-zinc-50/50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-200"></div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-full py-1.5 px-6 text-[11px] text-zinc-400 font-medium">
                waitlistfast.com/study-ai
              </div>
              <div className="w-12"></div>
            </div>
            <div className="p-12 sm:p-24 text-center">
              <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-zinc-200">
                <Zap className="text-white w-10 h-10 fill-current" />
              </div>
              <h3 className="text-4xl font-bold mb-4">StudyAI</h3>
              <p className="text-zinc-500 text-xl mb-12 max-w-md mx-auto text-balance">AI that summarizes university lectures in real-time. Join the waitlist for early access.</p>
              
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full pl-14 pr-6 py-5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all text-lg"
                    disabled
                  />
                </div>
                <button className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all">
                  Join the waitlist
                </button>
                <div className="flex items-center justify-center gap-3 text-zinc-400 font-medium">
                  <Users className="w-5 h-5" />
                  <span>1,248 people ahead of you</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Problem = () => {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-zinc-900" />,
      title: "Weeks of wasted time",
      description: "Spending months building a product before knowing if anyone actually wants it."
    },
    {
      icon: <Layout className="w-6 h-6 text-zinc-900" />,
      title: "No landing page",
      description: "Having a great idea but no professional way to showcase it or test demand."
    },
    {
      icon: <Users className="w-6 h-6 text-zinc-900" />,
      title: "Lost early adopters",
      description: "Missing out on potential customers who would have joined if you had a signup form."
    },
    {
      icon: <Shield className="w-6 h-6 text-zinc-900" />,
      title: "Building in the dark",
      description: "Investing thousands of dollars into features that nobody ends up using."
    }
  ];

  return (
    <section id="problem" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6 text-balance">
            Most startups fail before they even start.
          </h2>
          <p className="text-xl text-zinc-500 leading-relaxed text-balance">
            Founders often fall into the trap of building first and validating later. It's the #1 reason why startups fail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {problems.map((p, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bento-card p-10"
            >
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-100">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{p.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{p.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-[3rem] p-12 sm:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                Relatable Scenario
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold mb-8 leading-[1.1] text-balance">“I spent 4 months building my SaaS, only to launch and get 0 signups on day one.”</h3>
              <p className="text-zinc-400 text-xl leading-relaxed text-balance">
                This is the nightmare of every founder. A great idea, months of hard work, but no market demand. WaitlistFast was built to make sure this never happens to you again.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-5 mb-8">
                <img src="https://picsum.photos/seed/founder/100/100" className="w-16 h-16 rounded-2xl grayscale" alt="Founder" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-xl font-bold">Alex Rivera</p>
                  <p className="text-zinc-500">Serial Entrepreneur</p>
                </div>
              </div>
              <p className="text-zinc-300 text-lg italic leading-relaxed">"I used to waste weeks on custom landing pages. Now I launch a waitlist in seconds, run some ads, and know within 24 hours if the idea is worth pursuing. It's a game changer."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Solution = () => {
  return (
    <section id="solution" className="py-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-20 bg-indigo-500/5 blur-[120px] rounded-full"></div>
            <div className="relative grid grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bento-card p-8 mt-12"
              >
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-zinc-200">
                  <Zap className="text-white w-6 h-6 fill-current" />
                </div>
                <h4 className="text-lg font-bold mb-3">Instant Setup</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">Zero code required. Just enter your idea and go.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bento-card p-8"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="text-white w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-3">High Conversion</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">Optimized layouts designed to capture emails.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bento-card p-8"
              >
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-3">Real-time Data</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">Watch your waitlist grow with live analytics.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bento-card p-8 -mt-12"
              >
                <div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-100">
                  <Users className="text-white w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-3">Early Community</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">Build a list of people who actually want to buy.</p>
              </motion.div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-8 leading-[1.1] text-balance">
              Validate your idea in minutes, not months.
            </h2>
            <p className="text-xl text-zinc-500 mb-10 leading-relaxed text-balance">
              With WaitlistFast you can create a landing page, collect emails, and validate your idea before investing time and money. Stop guessing and start knowing.
            </p>
            <ul className="space-y-6 mb-12">
              {[
                "Launch a professional page in under 30 seconds",
                "Collect unlimited emails from interested users",
                "Built-in analytics to track conversion rates",
                "Export your list to any CRM or email tool"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-zinc-700 font-medium">
                  <div className="flex-shrink-0 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-white w-3.5 h-3.5" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="bg-zinc-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-2">
              Start Validating Now
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <MousePointer2 className="w-8 h-8" />,
      title: "Enter your startup idea",
      description: "Just add your product name and a short description of what you're building."
    },
    {
      number: "02",
      icon: <Zap className="w-8 h-8" />,
      title: "Instantly generate a page",
      description: "Our platform creates a clean, high-converting landing page with an email signup form."
    },
    {
      number: "03",
      icon: <Users className="w-8 h-8" />,
      title: "Share and collect users",
      description: "Share your unique link on social media and watch your waitlist grow in real-time."
    }
  ];

  return (
    <section className="py-32 bg-zinc-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-zinc-800 via-transparent to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-[1.1] text-balance">Three steps to validation</h2>
          <p className="text-zinc-400 text-xl leading-relaxed text-balance">We've removed all the friction so you can focus on what matters: finding your first customers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] hover:bg-white/10 transition-all group">
              <div className="w-20 h-20 bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-zinc-700 transition-all">
                {step.icon}
              </div>
              <div className="mb-6">
                <span className="text-zinc-500 font-mono font-bold text-xl tracking-tighter">{step.number}</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">{step.title}</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-zinc-900" />,
      title: "Instant Generator",
      description: "No drag and drop, no complex builders. Just text to page in seconds."
    },
    {
      icon: <Mail className="w-6 h-6 text-zinc-900" />,
      title: "Email Collection",
      description: "Securely collect and store emails. We handle all the backend for you."
    },
    {
      icon: <Users className="w-6 h-6 text-zinc-900" />,
      title: "Signup Counter",
      description: "Build social proof with a live counter showing how many people joined."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-zinc-900" />,
      title: "Simple Analytics",
      description: "See your page views, conversion rates, and growth over time."
    },
    {
      icon: <Layout className="w-6 h-6 text-zinc-900" />,
      title: "Custom Branding",
      description: "Choose your colors, upload your logo, and make it feel like your brand."
    },
    {
      icon: <Shield className="w-6 h-6 text-zinc-900" />,
      title: "Shareable Link",
      description: "Get a clean, short URL that looks professional when shared on social media."
    }
  ];

  return (
    <section id="features" className="py-32 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1] text-balance">
            Everything you need to validate.
          </h2>
          <p className="text-xl text-zinc-500 leading-relaxed text-balance">
            We've built the essential toolkit for early-stage founders. No fluff, just the features that help you ship and learn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bento-card p-12">
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center mb-8 shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => {
  const testimonials = [
    {
      quote: "WaitlistFast helped me validate my startup idea in one day. I collected 200 emails before writing any code.",
      author: "Sarah Chen",
      role: "Founder of StudyAI",
      avatar: "https://picsum.photos/seed/sarah/100/100"
    },
    {
      quote: "The easiest way to test demand. I've used it for 3 different projects now. It saves me weeks of work every time.",
      author: "James Wilson",
      role: "Indie Hacker",
      avatar: "https://picsum.photos/seed/james/100/100"
    },
    {
      quote: "I was skeptical, but the conversion rate on these pages is insane. It looks professional and trustworthy out of the box.",
      author: "Elena Rodriguez",
      role: "Product Designer",
      avatar: "https://picsum.photos/seed/elena/100/100"
    }
  ];

  return (
    <section className="py-32 bg-zinc-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_var(--tw-gradient-stops))] from-zinc-800 via-transparent to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-[1.1] text-balance">Trusted by 2,000+ founders worldwide</h2>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-current text-white" />)}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] flex flex-col justify-between">
              <p className="text-xl mb-12 italic leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-5">
                <img src={t.avatar} className="w-14 h-14 rounded-2xl grayscale" alt={t.author} referrerPolicy="no-referrer" />
                <div>
                  <p className="text-lg font-bold">{t.author}</p>
                  <p className="text-zinc-500 text-sm">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1] text-balance">
            Simple, transparent pricing.
          </h2>
          <p className="text-xl text-zinc-500 leading-relaxed text-balance">
            Start for free and upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
          <div className="bento-card p-12">
            <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">$0</span>
              <span className="text-zinc-400 font-medium">/forever</span>
            </div>
            <p className="text-zinc-500 text-lg mb-10 leading-relaxed">Perfect for testing a single idea.</p>
            <ul className="space-y-6 mb-12">
              {[
                "1 waitlist page",
                "Up to 100 email signups",
                "Basic analytics",
                "WaitlistFast branding",
                "Standard support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-zinc-700 font-medium">
                  <CheckCircle2 className="text-zinc-900 w-5 h-5" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-5 rounded-2xl border border-zinc-200 font-bold text-lg hover:bg-zinc-50 transition-all">
              Get Started for Free
            </button>
          </div>

          <div className="bento-card p-12 bg-zinc-900 text-white border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-bl-2xl">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold tracking-tighter">$19</span>
              <span className="text-zinc-500 font-medium">/month</span>
            </div>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed">For serious founders building multiple ideas.</p>
            <ul className="space-y-6 mb-12">
              {[
                "Unlimited waitlists",
                "Unlimited email signups",
                "Advanced analytics",
                "Custom domains",
                "Export email list (CSV)",
                "Remove branding",
                "Priority support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-zinc-300 font-medium">
                  <CheckCircle2 className="text-white w-5 h-5" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-5 rounded-2xl bg-white text-zinc-900 font-bold text-lg shadow-2xl shadow-zinc-900/20 hover:bg-zinc-100 transition-all">
              Go Pro Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900 rounded-[4rem] p-12 sm:p-32 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent opacity-50"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl sm:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-[0.95] text-balance">Don't build in the dark.</h2>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-12 leading-relaxed text-balance">
              Validate your startup idea before you build it. Join 5,000+ founders who use WaitlistFast to ship smarter.
            </p>
            <button className="bg-white text-zinc-900 px-12 py-6 rounded-full text-xl font-bold hover:bg-zinc-100 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 mx-auto group">
              Create Your Waitlist Now
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-8 text-zinc-500 font-medium">No credit card required. Start for free.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-32">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight font-display">WaitlistFast</span>
            </div>
            <p className="text-zinc-500 text-lg max-w-xs mb-10 leading-relaxed">
              Helping founders validate ideas and build early communities in seconds.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8">Product</h4>
            <ul className="space-y-5 text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Examples</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8">Resources</h4>
            <ul className="space-y-5 text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-8">Legal</h4>
            <ul className="space-y-5 text-zinc-500 font-medium">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-400 font-medium">
          <p>© 2026 WaitlistFast Inc. All rights reserved.</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-zinc-900 transition-colors">Status</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Features />
        <SocialProof />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
