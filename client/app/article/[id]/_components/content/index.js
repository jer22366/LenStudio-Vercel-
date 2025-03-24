'use client';

import { useEffect, useRef } from 'react';
import styles from './index.module.scss';
import gsap from 'gsap';

// Import the TextPlugin plugin directly from the GSAP library
import { TextPlugin } from 'gsap/TextPlugin';
gsap.registerPlugin(TextPlugin);

export default function Content({ content, fontSize }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // First, update innerHTML
      contentRef.current.innerHTML = content;

      // Animate the entire content area
      gsap.fromTo(
        contentRef.current,
        {
          y: 25,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        }
      );

      // Get all images from the content
      const images = contentRef.current.getElementsByTagName('img');

      // Create IntersectionObserver to trigger animation when the image is half in view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              // If the animation class hasn't been added, add it
              if (!img.classList.contains(styles['article-image-fade'])) {
                img.classList.add(styles['article-image-fade']);
                if (img.complete) {
                  setTimeout(() => {
                    img.classList.add(styles['loaded']);
                  }, 100); // Delay 800ms and then add the loaded class
                } else {
                  const handleLoad = () => {
                    setTimeout(() => {
                      img.classList.add(styles['loaded']);
                    }, 100); // Delay 800ms and then add the loaded class
                    img.removeEventListener('load', handleLoad);
                  };
                  img.addEventListener('load', handleLoad);
                }
              }
              // Stop monitoring the image after triggering the animation
              observer.unobserve(img);
            }
          });
        },
        {
          threshold: 0.5, // Trigger when 50% of the image is in view
          rootMargin: '50px'
        }
      );

      Array.from(images).forEach((img) => {
        observer.observe(img);
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [content]);

  return (
    <div ref={contentRef} className={styles.content} style={{ fontSize }} />
  );
}