'use client'

import { useRef, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';

const BlurText = ({
    text = '',
    delay = 200,
    className = '',
    animateBy = 'words', // 'words' or 'letters'
    direction = 'top', // 'top' or 'bottom'
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing = 'easeOutCubic',
    onAnimationComplete,
}) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef();
    const animatedCount = useRef(0);
    const [animationKey, setAnimationKey] = useState(0);
    

    const defaultFrom =
        direction === 'top'
            ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
            : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

    const defaultTo = [
        {
            filter: 'blur(5px)',
            opacity: 0.5,
            transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
        },
        { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
    ];

    useEffect(() => {
        setInView(true); // 預設進入畫面時播放動畫

        const interval = setInterval(() => {
            setInView(false); // 先關閉動畫
            setTimeout(() => {
                setInView(true);
                setAnimationKey(prevKey => prevKey + 1); // 🚀 更新 key，強制 React 重新渲染
                animatedCount.current = 0; // 🔥 重置計數，確保每次動畫從頭開始
            }, 100);
        }, 5000); // 每 5 秒重播

        return () => clearInterval(interval); // 清除 interval，避免記憶體洩漏
    }, []);


     const springs = useSprings(
        elements.length,
        elements.map((_, i) => ({
            from: inView ? animationFrom || defaultFrom : defaultFrom,
            to: inView
                ? async (next) => {
                    for (const step of (animationTo || defaultTo)) {
                        await next(step);
                    }
                    animatedCount.current += 1;
                    if (animatedCount.current === elements.length && onAnimationComplete) {
                        onAnimationComplete();
                    }
                }
                : defaultFrom,
            delay: i * delay,
            config: { easing },
            reset: true, // 🔥 確保每次動畫都從頭開始
        }))
    );

    return (
        <p key={animationKey} ref={ref} className={`blur-text ${className}`}>
            {springs.map((props, index) => (
                <animated.span
                    key={index}
                    style={{
                        ...props,
                        display: 'inline-block',
                        willChange: 'transform, filter, opacity',
                    }}
                >
                    {elements[index] === ' ' ? '\u00A0' : elements[index]}
                    {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                </animated.span>
            ))}
        </p>
    );
};

export default BlurText;
