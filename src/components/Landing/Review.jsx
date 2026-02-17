import React, { useEffect, useRef, useState } from "react";
import "./Review.css";

import vid1 from "../../Assests/images/Rect.mp4";
import vid2 from "../../Assests/images/Rect2.mp4";
import vid3 from "../../Assests/images/Rect3.mp4";

const videos = [vid1, vid2, vid3];
const texts = [
  '"They made managing my products so simple and stress-free"',
  '"The customer service is absolutely amazing."',
  '"Super intuitive interface – love using it every day!"'
];

const Review = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const videoRefs = useRef([]);

  useEffect(() => {
    const switchInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);

    return () => clearInterval(switchInterval);
  }, []);

  useEffect(() => {
    let index = 0;
    setTypedText("");
    const fullText = texts[currentIndex];

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText((prev) => prev + fullText[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });

    return () => clearInterval(typingInterval);
  }, [currentIndex]);

  return (
    <div className="review-wrapper">
      <div className="review-background">
        <div className="review-carousel">
          {[0, 1, 2].map((offset, idx) => {
            const videoIdx = (currentIndex + offset) % videos.length;
            return (
              <video
                key={videoIdx}
                ref={el => (videoRefs.current[offset] = el)}
                src={videos[videoIdx]}
                className={`review-video${offset === 0 ? " active" : ""}`}
                muted
                loop
              />
            );
          })}
        </div>
        <div className="text-container">
          <p className="typing-text">{typedText}</p>
        </div>
      </div>
    </div>
  );
};

export default Review;