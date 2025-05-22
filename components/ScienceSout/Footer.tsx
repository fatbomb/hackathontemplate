import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} Science Scout - Citizen Science Project</p>
      </div>
    </footer>
  );
};

export default Footer;