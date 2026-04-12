export default function ContactPage() {
  return (
    <main className="min-h-screen pt-[120px] pb-16">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="font-oswald text-4xl font-bold text-[#1d1d1d] text-center mb-4">
          Contact Us
        </h1>
        <p className="text-[#737373] text-center mb-12">
          We'd love to hear from you! Get in touch with our team.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#fafafa] p-6 rounded-lg">
            <h3 className="font-oswald text-lg font-bold text-[#1d1d1d] mb-4">Email</h3>
            <p className="text-[#737373]">info@hdmuscle.com</p>
            <p className="text-[#737373]">support@hdmuscle.com</p>
          </div>
          
          <div className="bg-[#fafafa] p-6 rounded-lg">
            <h3 className="font-oswald text-lg font-bold text-[#1d1d1d] mb-4">Phone</h3>
            <p className="text-[#737373]">+1 (555) 123-4567</p>
            <p className="text-[#737373] text-sm mt-2">Mon-Fri: 9AM - 5PM EST</p>
          </div>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1d1d1d] mb-2">Name</label>
              <input 
                type="text" 
                className="w-full border border-[#e5e5e5] rounded px-4 py-3 focus:outline-none focus:border-[#1d1d1d]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1d1d1d] mb-2">Email</label>
              <input 
                type="email" 
                className="w-full border border-[#e5e5e5] rounded px-4 py-3 focus:outline-none focus:border-[#1d1d1d]"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1d1d1d] mb-2">Subject</label>
            <input 
              type="text" 
              className="w-full border border-[#e5e5e5] rounded px-4 py-3 focus:outline-none focus:border-[#1d1d1d]"
              placeholder="How can we help?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1d1d1d] mb-2">Message</label>
            <textarea 
              rows={6}
              className="w-full border border-[#e5e5e5] rounded px-4 py-3 focus:outline-none focus:border-[#1d1d1d]"
              placeholder="Your message..."
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#1d1d1d] text-white py-4 font-oswald font-bold uppercase hover:bg-[#ffcc00] hover:text-[#1d1d1d] transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}