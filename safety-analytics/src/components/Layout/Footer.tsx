import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-amazon-dark text-white py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <p>
          Safety Analytics Platform v2.0 | Amazon WHS Austria | 
          Developed by <a href="mailto:erwin.esener@amazon.com" className="text-amazon-orange hover:underline"> Erwin Esener</a> | 
          © 2024 Amazon.com, Inc.
        </p>
      </div>
    </footer>
  );
}
