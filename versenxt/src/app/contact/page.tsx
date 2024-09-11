import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      
      <div className="max-w-2xl mx-auto text-center">
        <p className="mb-8 text-lg">
          You can send us a message or ask a general question about Versetta
        </p>

        <div className="bg-purple-100 rounded-lg p-6 inline-block">
          <h2 className="text-2xl font-semibold mb-4">Email</h2>
          <a href="mailto:versatter@gmail.com" className="text-blue-600 hover:underline text-xl">
            versatter@gmail.com
          Add: 34, Nankari,IIT,Kanpur,India
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;