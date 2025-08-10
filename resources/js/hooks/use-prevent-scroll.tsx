import { useEffect } from 'react';

const getScrollbarWidth = () => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.overflow = 'scroll';
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

export const usePreventScroll = (isActive: boolean) => {
    useEffect(() => {
        if (isActive) {
            const scrollY = window.scrollY;
            const scrollbarWidth = getScrollbarWidth();

            document.body.setAttribute('data-scroll-y', scrollY.toString());
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.paddingRight = `${scrollbarWidth}px`;

            const fixedElements = document.querySelectorAll('[data-fixed-compensate]');
            fixedElements.forEach((element) => {
                const el = element as HTMLElement;
                const currentPaddingRight = parseInt(getComputedStyle(el).paddingRight) || 0;
                el.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
                el.setAttribute('data-original-padding-right', currentPaddingRight.toString());
            });
        } else {
            const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0');

            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.paddingRight = '';

            const fixedElements = document.querySelectorAll('[data-original-padding-right]');
            fixedElements.forEach((element) => {
                const el = element as HTMLElement;
                const originalPadding = el.getAttribute('data-original-padding-right') || '0';
                el.style.paddingRight = `${originalPadding}px`;
                el.removeAttribute('data-original-padding-right');
            });

            document.body.removeAttribute('data-scroll-y');
            window.scrollTo(0, scrollY);
        }

        return () => {
            if (document.body.getAttribute('data-scroll-y')) {
                const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.width = '';
                document.body.style.paddingRight = '';

                const fixedElements = document.querySelectorAll('[data-original-padding-right]');
                fixedElements.forEach((element) => {
                    const el = element as HTMLElement;
                    const originalPadding = el.getAttribute('data-original-padding-right') || '0';
                    el.style.paddingRight = `${originalPadding}px`;
                    el.removeAttribute('data-original-padding-right');
                });

                document.body.removeAttribute('data-scroll-y');
                window.scrollTo(0, scrollY);
            }
        };
    }, [isActive]);
};
