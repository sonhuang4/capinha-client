// tailwind.config.js
module.exports = {
    content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out both',
                'fade-in-slow': 'fadeIn 1.4s ease-in-out both',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: 0, transform: 'translateY(30px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            },
        },
    },
    plugins: [],
};
