import React, { useEffect, useRef } from 'react';
import './ScrollBook.css';

const ScrollBook = ({ isOpen, children }) => {
  // Target rotation (where the mouse wants the book to be)
  const targetTilt = useRef({ x: 0, y: 0 });
  // Current rotation (where the book actually is, for smoothing)
  const currentTilt = useRef({ x: 0, y: 0 });
  // Ref to trigger re-renders only when needed (optional, but we need to update style)
  const bookRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isOpen) return;

      const { clientX, clientY, innerWidth, innerHeight } = e;
      
      // Calculate normalized position (-1 to 1)
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      // Set target tilt:
      targetTilt.current = { 
        x: y * 20,   // Increased to 20deg for stronger effect
        y: x * -20   // Increased to 20deg
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation Loop for Smoothness (Lerp)
    let animationFrameId;
    
    const animate = () => {
      if (!isOpen && bookRef.current) {
        // Linear Interpolation (Lerp) for smooth "weight"
        currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.05;
        currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.05;

        // Base rotation
        const baseX = 10;
        const baseY = -25;

        const rotX = baseX - currentTilt.current.x;
        const rotY = baseY + currentTilt.current.y;

        // Parallax Translation (Move book slightly opposite to mouse)
        const transX = currentTilt.current.y * 2.5; // Increased translation
        const transY = currentTilt.current.x * 2.5; 

        // Apply transforms to Book Container
        bookRef.current.style.transform = 
          `translateX(${transX}px) translateY(${transY}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        // Apply Internal Parallax to Book Skin (Form) for depth
        const skin = bookRef.current.querySelector('.book-skin');
        if (skin) {
          // Move skin slightly to simulate it being "above" the cover
          skin.style.transform = `translateZ(2px) translateX(${-transX * 0.3}px) translateY(${-transY * 0.3}px)`;
        }

      } else if (isOpen && bookRef.current) {
        // Clear inline style to let CSS handle the open transition/state
        bookRef.current.style.transform = '';
        const skin = bookRef.current.querySelector('.book-skin');
        if (skin) skin.style.transform = ''; // Reset skin
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  return (
    <div className={`book-container ${isOpen ? 'open' : 'closed'}`}>
      <div 
        className="book"
        ref={bookRef}
        // Initial style to prevent flash
        style={{ transform: 'rotateX(10deg) rotateY(-25deg)' }}
      >
        {/* Front Cover (Form Container) */}
        <div className="book-cover">
          <div className="cover-front">
            <div className="book-skin">
              {!isOpen && children}
            </div>
          </div>
          <div className="cover-back"></div>
        </div>
        
        <div className="book-spine"></div>
        
        {/* Pages (Story Container) */}
        <div className="book-pages">
          {isOpen && children}
        </div>
        
        <div className="book-back"></div>
      </div>
    </div>
  );
};

export default ScrollBook;
