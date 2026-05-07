import { useState, useEffect } from 'react';

export default function NotificationSettings() {
  const [emails, setEmails] = useState(['']);
  const [whatsappNumbers, setWhatsappNumbers] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/get-notification-settings');
      const data = await response.json();
      if (data.success) {
        if (data.settings.emails?.length > 0) {
          setEmails(data.settings.emails);
        }
        if (data.settings.whatsappNumbers?.length > 0) {
          setWhatsappNumbers(data.settings.whatsappNumbers);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Email handlers
  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length ? newEmails : ['']);
  };

  // WhatsApp handlers
  const handleWhatsappChange = (index, value) => {
    const newWhatsapp = [...whatsappNumbers];
    newWhatsapp[index] = value;
    setWhatsappNumbers(newWhatsapp);
  };

  const addWhatsapp = () => {
    setWhatsappNumbers([...whatsappNumbers, '']);
  };

  const removeWhatsapp = (index) => {
    const newWhatsapp = whatsappNumbers.filter((_, i) => i !== index);
    setWhatsappNumbers(newWhatsapp.length ? newWhatsapp : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validEmails = emails.filter(email => email.trim() !== '');
    const validWhatsapp = whatsappNumbers.filter(num => num.trim() !== '');
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/update-notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          whatsappNumbers: validWhatsapp
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving settings');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">Notification Settings</h2>
      <p className="text-slate-500 text-sm mb-6">
        Configure email addresses and WhatsApp numbers to receive inquiry notifications
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email Section */}
        <div className="mb-8">
          <label className="block text-slate-700 font-medium mb-2">
            Email +add
          </label>
          
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="admin@company.com"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addEmail}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            +add
          </button>
        </div>

        {/* WhatsApp Section */}
        <div className="mb-8">
          <label className="block text-slate-700 font-medium mb-2">
            WhatsApp number +add
          </label>
          
          {whatsappNumbers.map((number, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="tel"
                value={number}
                onChange={(e) => handleWhatsappChange(index, e.target.value)}
                placeholder="+91 9876543210"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeWhatsapp(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addWhatsapp}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            +add
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {loading ? 'Saving...' : 'Set'}
        </button>
      </form>
    </div>
  );
}