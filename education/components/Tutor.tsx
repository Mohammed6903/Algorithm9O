"use client"
import React, { useEffect } from 'react';

const Tutor = () => {
  useEffect(() => {
    // Dynamically create the script tag
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v1/index.js';
    script.dataset.name = 'did-agent';
    script.dataset.mode = 'fabio';
    script.dataset.clientKey =
      'Z29vZ2xlLW9hdXRoMnwxMDM1ODUwMDA5NTQwNjMxOTIwNjA6VVpBTS1iT011RXluUnB1a3ZLNnhE';
    script.dataset.agentId = 'agt_HEzr5fZK';
    script.dataset.monitor = 'true';
    
    // Append the script to the document body
    document.body.appendChild(script);

    // Clean up by removing the script when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array means it runs once when the component mounts

  return <div>page</div>;
};

export default Tutor;
